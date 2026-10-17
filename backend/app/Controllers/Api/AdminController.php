<?php

namespace App\Controllers\Api;

use App\Controllers\BaseController;
use App\Traits\ApiResponseTrait;

class AdminController extends BaseController
{
    use ApiResponseTrait;

    protected $db;

    public function __construct()
    {
        $this->db = \Config\Database::connect();
    }

    /**
     * Admin & Super Admin KPI Dashboard Metrics
     */
    public function getDashboard()
    {
        $totalAlumni = $this->db->table('users')->where('role', 'alumni')->countAllResults();
        $pendingVerifications = $this->db->table('users')->where('role', 'alumni')->where('verification_status', 'pending')->countAllResults();
        $verifiedAlumni = $this->db->table('users')->where('role', 'alumni')->where('verification_status', 'verified')->countAllResults();
        $totalStudents = $this->db->table('users')->where('role', 'student')->countAllResults();
        $totalEvents = $this->db->table('events')->where('is_published', 1)->countAllResults();
        $totalJobs = $this->db->table('jobs')->where('status', 'approved')->countAllResults();
        $totalMentors = $this->db->table('alumni_profiles')->where('is_mentor', 1)->countAllResults();

        // Recent Registrations
        $recentUsers = $this->db->table('users')
            ->select('users.id, users.email, users.role, users.status, users.verification_status, users.created_at, alumni_profiles.first_name as a_fname, alumni_profiles.last_name as a_lname, alumni_profiles.degree as a_degree, alumni_profiles.batch_year as a_batch, student_profiles.first_name as s_fname, student_profiles.last_name as s_lname')
            ->join('alumni_profiles', 'alumni_profiles.user_id = users.id', 'left')
            ->join('student_profiles', 'student_profiles.user_id = users.id', 'left')
            ->orderBy('users.created_at', 'DESC')
            ->limit(10)
            ->get()->getResultArray();

        // Department breakdown for chart
        $deptDistribution = $this->db->table('alumni_profiles')
            ->select('department, COUNT(*) as count')
            ->where('department IS NOT NULL')
            ->groupBy('department')
            ->get()->getResultArray();

        // Batch breakdown for chart
        $batchDistribution = $this->db->table('alumni_profiles')
            ->select('batch_year, COUNT(*) as count')
            ->where('batch_year IS NOT NULL')
            ->groupBy('batch_year')
            ->orderBy('batch_year', 'ASC')
            ->get()->getResultArray();

        return $this->respondSuccess([
            'metrics' => [
                'total_alumni'          => $totalAlumni,
                'pending_verifications' => $pendingVerifications,
                'verified_alumni'       => $verifiedAlumni,
                'total_students'        => $totalStudents,
                'total_events'          => $totalEvents,
                'total_jobs'            => $totalJobs,
                'total_mentors'         => $totalMentors,
            ],
            'recent_users'       => $recentUsers,
            'dept_distribution'  => $deptDistribution,
            'batch_distribution' => $batchDistribution,
        ], 'Dashboard metrics retrieved');
    }

    /**
     * Get Pending Alumni Verifications Queue
     */
    public function getPendingVerifications()
    {
        $queue = $this->db->table('users')
            ->select('users.id, users.email, users.role, users.verification_status, users.created_at, alumni_profiles.*')
            ->join('alumni_profiles', 'alumni_profiles.user_id = users.id')
            ->where('users.verification_status', 'pending')
            ->orderBy('users.created_at', 'ASC')
            ->get()->getResultArray();

        return $this->respondSuccess($queue, 'Pending verifications retrieved');
    }

    /**
     * Approve Alumni Verification
     */
    public function approveVerification($userId)
    {
        $authUser = $this->request->authUser;

        $this->db->table('users')
            ->where('id', $userId)
            ->update([
                'verification_status' => 'verified',
                'status'              => 'active',
                'updated_at'          => date('Y-m-d H:i:s'),
            ]);

        $this->db->table('alumni_profiles')
            ->where('user_id', $userId)
            ->update([
                'verified_at' => date('Y-m-d H:i:s'),
                'verified_by' => $authUser['id'],
                'updated_at'  => date('Y-m-d H:i:s'),
            ]);

        // Generate or ensure ID card
        $existingCard = $this->db->table('alumni_id_cards')->where('user_id', $userId)->get()->getRow();
        if (!$existingCard) {
            $profile = $this->db->table('alumni_profiles')->where('user_id', $userId)->get()->getRowArray();
            $this->db->table('alumni_id_cards')->insert([
                'user_id'     => $userId,
                'card_number' => 'AU-AID-' . ($profile['graduation_year'] ?? date('Y')) . '-00' . $userId,
                'issue_date'  => date('Y-m-d'),
                'expiry_date' => date('Y-m-d', strtotime('+5 years')),
                'qr_payload'  => json_encode([
                    'card_number' => 'AU-AID-' . ($profile['graduation_year'] ?? date('Y')) . '-00' . $userId,
                    'name'        => ($profile['first_name'] ?? '') . ' ' . ($profile['last_name'] ?? ''),
                    'degree'      => $profile['degree'] ?? '',
                    'status'      => 'OFFICIAL_VERIFIED'
                ]),
                'status'      => 'active',
                'created_at'  => date('Y-m-d H:i:s'),
                'updated_at'  => date('Y-m-d H:i:s'),
            ]);
        }

        // Notification for Alumni
        $this->db->table('notifications')->insert([
            'user_id'    => $userId,
            'title'      => 'Alumni Verification Approved!',
            'message'    => 'Congratulations! Your official alumni profile has been verified. Your digital alumni ID card is now active.',
            'type'       => 'success',
            'link_url'   => '/alumni/id-card',
            'created_at' => date('Y-m-d H:i:s'),
        ]);

        // Audit Log
        $this->db->table('audit_logs')->insert([
            'user_id'       => $authUser['id'],
            'user_role'     => $authUser['role'],
            'action'        => 'verify_alumni_approve',
            'target_module' => 'alumni_verification',
            'target_id'     => (string)$userId,
            'ip_address'    => $this->request->getIPAddress(),
            'user_agent'    => $this->request->getUserAgent()->getAgentString(),
            'details'       => 'Admin approved alumni verification',
            'created_at'    => date('Y-m-d H:i:s'),
        ]);

        return $this->respondSuccess([], 'Alumni account verified successfully');
    }

    /**
     * Reject Alumni Verification
     */
    public function rejectVerification($userId)
    {
        $authUser = $this->request->authUser;
        $json = $this->request->getJSON(true);
        $reason = $json['reason'] ?? 'Provided graduation or enrollment details could not be matched.';

        $this->db->table('users')
            ->where('id', $userId)
            ->update([
                'verification_status' => 'rejected',
                'updated_at'          => date('Y-m-d H:i:s'),
            ]);

        $this->db->table('alumni_profiles')
            ->where('user_id', $userId)
            ->update([
                'admin_notes' => $reason,
                'updated_at'  => date('Y-m-d H:i:s'),
            ]);

        // Audit Log
        $this->db->table('audit_logs')->insert([
            'user_id'       => $authUser['id'],
            'user_role'     => $authUser['role'],
            'action'        => 'verify_alumni_reject',
            'target_module' => 'alumni_verification',
            'target_id'     => (string)$userId,
            'ip_address'    => $this->request->getIPAddress(),
            'user_agent'    => $this->request->getUserAgent()->getAgentString(),
            'details'       => "Admin rejected verification. Reason: $reason",
            'created_at'    => date('Y-m-d H:i:s'),
        ]);

        return $this->respondSuccess([], 'Alumni verification marked rejected');
    }

    /**
     * Get All Users List (with role and search filter)
     * Includes admin profile designation + decoded granular permissions.
     */
    public function getAllUsers()
    {
        $role = $this->request->getGet('role');
        $search = $this->request->getGet('search');

        $builder = $this->db->table('users')
            ->select('users.id, users.email, users.role, users.status, users.verification_status, users.created_at, alumni_profiles.first_name as a_fname, alumni_profiles.last_name as a_lname, alumni_profiles.degree as a_degree, alumni_profiles.batch_year as a_batch, student_profiles.first_name as s_fname, student_profiles.last_name as s_lname, admin_profiles.full_name as adm_name, admin_profiles.designation as adm_designation, admin_profiles.permissions as adm_permissions')
            ->join('alumni_profiles', 'alumni_profiles.user_id = users.id', 'left')
            ->join('student_profiles', 'student_profiles.user_id = users.id', 'left')
            ->join('admin_profiles', 'admin_profiles.user_id = users.id', 'left');

        if (!empty($role)) {
            $builder->where('users.role', $role);
        }

        if (!empty($search)) {
            $builder->groupStart()
                ->like('users.email', $search)
                ->orLike('alumni_profiles.first_name', $search)
                ->orLike('alumni_profiles.last_name', $search)
                ->orLike('student_profiles.first_name', $search)
                ->orLike('admin_profiles.full_name', $search)
                ->groupEnd();
        }

        $users = $builder->orderBy('users.id', 'DESC')->get()->getResultArray();

        // Decode admin permissions JSON into a clean map for the frontend
        foreach ($users as &$u) {
            $raw = $u['adm_permissions'] ?? null;
            unset($u['adm_permissions']);
            if (($u['role'] ?? '') === 'superadmin') {
                $u['permissions'] = ['all' => true];
            } elseif (($u['role'] ?? '') === 'admin') {
                $u['permissions'] = \App\Filters\PermissionFilter::normalize($raw ?? '');
            } else {
                $u['permissions'] = [];
            }
        }
        unset($u);

        return $this->respondSuccess($users, 'Users retrieved');
    }

    /**
     * Create / Update Event
     */
    public function saveEvent()
    {
        $json = $this->request->getJSON(true);
        $id = $json['id'] ?? null;

        $data = [
            'title'                 => $json['title'],
            'slug'                  => url_title($json['title'], '-', true) . '-' . rand(100, 999),
            'event_type'            => $json['event_type'] ?? 'general',
            'description'           => $json['description'] ?? '',
            'venue'                 => $json['venue'] ?? '',
            'is_virtual'            => !empty($json['is_virtual']) ? 1 : 0,
            'virtual_link'          => $json['virtual_link'] ?? null,
            'start_datetime'        => $json['start_datetime'] ?? date('Y-m-d H:i:s'),
            'end_datetime'          => $json['end_datetime'] ?? null,
            'registration_deadline' => $json['registration_deadline'] ?? null,
            'max_capacity'          => (int)($json['max_capacity'] ?? 0),
            'is_published'          => isset($json['is_published']) ? (int)$json['is_published'] : 1,
            'updated_at'            => date('Y-m-d H:i:s'),
        ];

        if ($id) {
            unset($data['slug']); // keep original slug
            $this->db->table('events')->where('id', $id)->update($data);
        } else {
            $data['created_at'] = date('Y-m-d H:i:s');
            $this->db->table('events')->insert($data);
            $id = $this->db->insertID();
        }

        return $this->respondSuccess(['id' => $id], 'Event saved successfully');
    }

    /**
     * Delete Event
     */
    public function deleteEvent($id)
    {
        $this->db->table('events')->where('id', $id)->delete();
        return $this->respondSuccess([], 'Event deleted');
    }

    /**
     * Get / Update System Settings (Super Admin)
     */
    public function getSettings()
    {
        $settings = $this->db->table('system_settings')->orderBy('setting_group', 'ASC')->orderBy('setting_key', 'ASC')->get()->getResultArray();
        return $this->respondSuccess($settings, 'Settings retrieved');
    }

    public function saveSettings()
    {
        $authUser = $this->request->authUser;
        $json = $this->request->getJSON(true);

        if (is_array($json)) {
            foreach ($json as $key => $value) {
                // If setting exists, update it. If not, insert it!
                $existing = $this->db->table('system_settings')->where('setting_key', $key)->get()->getRow();
                if ($existing) {
                    $this->db->table('system_settings')
                        ->where('setting_key', $key)
                        ->update([
                            'setting_value' => (string)$value,
                            'updated_by'    => $authUser['id'] ?? 1,
                            'updated_at'    => date('Y-m-d H:i:s'),
                        ]);
                } else {
                    $this->db->table('system_settings')->insert([
                        'setting_key'   => $key,
                        'setting_value' => (string)$value,
                        'setting_group' => 'custom',
                        'description'   => 'Custom configured site parameter',
                        'updated_by'    => $authUser['id'] ?? 1,
                        'updated_at'    => date('Y-m-d H:i:s'),
                    ]);
                }
            }
        }

        // Audit Log
        $this->db->table('audit_logs')->insert([
            'user_id'       => $authUser['id'] ?? 1,
            'user_role'     => $authUser['role'] ?? 'superadmin',
            'action'        => 'update_system_settings',
            'target_module' => 'system_settings',
            'target_id'     => 'all',
            'ip_address'    => $this->request->getIPAddress(),
            'user_agent'    => $this->request->getUserAgent()->getAgentString(),
            'details'       => 'Super Admin updated portal configuration and CMS details',
            'created_at'    => date('Y-m-d H:i:s'),
        ]);

        return $this->respondSuccess([], 'System settings updated successfully');
    }

    public function addCustomSetting()
    {
        $authUser = $this->request->authUser;
        $json = $this->request->getJSON(true);

        $key = trim($json['setting_key'] ?? '');
        $value = $json['setting_value'] ?? '';
        $group = $json['setting_group'] ?? 'custom';
        $desc = $json['description'] ?? 'Custom detail';

        if (empty($key)) {
            return $this->respondError('Setting key is required', 400);
        }

        $existing = $this->db->table('system_settings')->where('setting_key', $key)->get()->getRow();
        if ($existing) {
            $this->db->table('system_settings')->where('setting_key', $key)->update([
                'setting_value' => (string)$value,
                'setting_group' => $group,
                'description'   => $desc,
                'updated_by'    => $authUser['id'] ?? 1,
                'updated_at'    => date('Y-m-d H:i:s'),
            ]);
        } else {
            $this->db->table('system_settings')->insert([
                'setting_key'   => $key,
                'setting_value' => (string)$value,
                'setting_group' => $group,
                'description'   => $desc,
                'updated_by'    => $authUser['id'] ?? 1,
                'updated_at'    => date('Y-m-d H:i:s'),
            ]);
        }

        return $this->respondSuccess([], 'Custom detail saved successfully');
    }

    public function deleteSetting($key)
    {
        $this->db->table('system_settings')->where('setting_key', $key)->delete();
        return $this->respondSuccess([], 'Setting removed successfully');
    }

    /**
     * User Role & Status Management (Super Admin only).
     */
    public function updateUserRole($userId)
    {
        $authUser = $this->request->authUser ?? null;
        if (!$authUser || ($authUser['role'] ?? '') !== 'superadmin') {
            return $this->respondError('Forbidden: only Super Admin can change roles', 403);
        }
        $json = $this->request->getJSON(true);
        $newRole = $json['role'] ?? 'alumni';

        if (!in_array($newRole, ['superadmin', 'admin', 'alumni', 'student', 'public_visitor'])) {
            return $this->respondError('Invalid role specified', 400);
        }

        $target = $this->db->table('users')->where('id', $userId)->get()->getRowArray();
        if (!$target) {
            return $this->respondError('User not found', 404);
        }
        if ((int) $userId === (int) ($authUser['id'] ?? 0) && $target['role'] === 'superadmin' && $newRole !== 'superadmin') {
            return $this->respondError('You cannot remove your own Super Admin access', 403);
        }

        $this->db->table('users')->where('id', $userId)->update([
            'role'       => $newRole,
            'updated_at' => date('Y-m-d H:i:s'),
        ]);

        if (in_array($newRole, ['admin', 'superadmin']) && !in_array($target['role'], ['admin', 'superadmin'])) {
            $exists = $this->db->table('admin_profiles')->where('user_id', $userId)->get()->getRowArray();
            if (!$exists) {
                $this->db->table('admin_profiles')->insert([
                    'user_id'     => $userId,
                    'full_name'   => explode('@', $target['email'])[0],
                    'permissions' => json_encode($newRole === 'superadmin' ? ['all' => true] : []),
                    'created_at'  => date('Y-m-d H:i:s'),
                    'updated_at'  => date('Y-m-d H:i:s'),
                ]);
            }
        }

        $this->audit((int) $authUser['id'], $authUser['role'], 'role_changed', 'users', (string) $userId, "Role {$target['role']} to {$newRole} for {$target['email']}");

        return $this->respondSuccess([], 'User role updated to ' . $newRole);
    }

    public function updateUserStatus($userId)
    {
        $authUser = $this->request->authUser ?? null;
        if (!$authUser || ($authUser['role'] ?? '') !== 'superadmin') {
            return $this->respondError('Forbidden: only Super Admin can change account status', 403);
        }
        $json = $this->request->getJSON(true);
        $newStatus = $json['status'] ?? 'active';

        if (!in_array($newStatus, ['active', 'pending', 'rejected', 'suspended'])) {
            return $this->respondError('Invalid status specified', 400);
        }
        if ((int) $userId === (int) ($authUser['id'] ?? 0) && $newStatus !== 'active') {
            return $this->respondError('You cannot suspend your own Super Admin account', 403);
        }

        $this->db->table('users')->where('id', $userId)->update([
            'status'     => $newStatus,
            'updated_at' => date('Y-m-d H:i:s'),
        ]);

        $this->audit((int) $authUser['id'], $authUser['role'], 'status_changed', 'users', (string) $userId, "Status to {$newStatus}");

        return $this->respondSuccess([], 'User status updated');
    }

    /**
     * Catalogue of grantable permissions (superadmin only).
     */
    public function getAdminPermissionsCatalogue()
    {
        $authUser = $this->request->authUser ?? null;
        if (!$authUser || ($authUser['role'] ?? '') !== 'superadmin') {
            return $this->respondError('Forbidden: only Super Admin can view permissions', 403);
        }
        return $this->respondSuccess(\App\Filters\PermissionFilter::AVAILABLE, 'Permissions catalogue');
    }

    /**
     * List admin + superadmin accounts with decoded permissions (superadmin only).
     */
    public function getAdmins()
    {
        $authUser = $this->request->authUser ?? null;
        if (!$authUser || ($authUser['role'] ?? '') !== 'superadmin') {
            return $this->respondError('Forbidden: only Super Admin can view admins', 403);
        }
        $rows = $this->db->table('users')
            ->select('users.id, users.email, users.role, users.status, users.verification_status, users.created_at, admin_profiles.full_name, admin_profiles.designation, admin_profiles.department, admin_profiles.phone, admin_profiles.permissions')
            ->join('admin_profiles', 'admin_profiles.user_id = users.id', 'left')
            ->whereIn('users.role', ['admin', 'superadmin'])
            ->orderBy('users.id', 'DESC')
            ->get()->getResultArray();
        foreach ($rows as &$r) {
            $raw = $r['permissions'] ?? null;
            unset($r['permissions']);
            $r['permissions'] = ($r['role'] === 'superadmin') ? ['all' => true] : \App\Filters\PermissionFilter::normalize($raw ?? '');
        }
        unset($r);
        return $this->respondSuccess($rows, 'Admins retrieved');
    }

    /**
     * Create a new admin account (superadmin only).
     */
    public function createAdmin()
    {
        $authUser = $this->request->authUser ?? null;
        if (!$authUser || ($authUser['role'] ?? '') !== 'superadmin') {
            return $this->respondError('Forbidden: only Super Admin can add admins', 403);
        }
        $json = $this->request->getJSON(true) ?? [];
        $email = strtolower(trim($json['email'] ?? ''));
        $password = $json['password'] ?? '';
        $fullName = trim($json['full_name'] ?? '');
        $errors = [];
        if ($email === '' || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
            $errors['email'] = 'A valid email address is required';
        }
        if (strlen($password) < 8) {
            $errors['password'] = 'Password must be at least 8 characters';
        }
        if ($fullName === '') {
            $errors['full_name'] = 'Full name is required';
        }
        if (!empty($errors)) {
            return $this->respondValidationError($errors);
        }
        $exists = $this->db->table('users')->where('email', $email)->get()->getRowArray();
        if ($exists) {
            return $this->respondError('An account with this email already exists', 409);
        }
        $permissions = \App\Filters\PermissionFilter::sanitize($json['permissions'] ?? []);
        $now = date('Y-m-d H:i:s');
        $this->db->table('users')->insert([
            'email' => $email, 'password_hash' => password_hash($password, PASSWORD_BCRYPT),
            'role' => 'admin', 'status' => 'active', 'verification_status' => 'verified',
            'created_at' => $now, 'updated_at' => $now,
        ]);
        $newId = $this->db->insertID();
        $desig = isset($json['designation']) ? trim((string) $json['designation']) : '';
        $this->db->table('admin_profiles')->insert([
            'user_id' => $newId, 'full_name' => mb_substr($fullName, 0, 150),
            'department' => isset($json['department']) ? mb_substr(trim((string) $json['department']), 0, 100) : null,
            'designation' => $desig !== '' ? mb_substr($desig, 0, 100) : 'Alumni Admin',
            'phone' => isset($json['phone']) ? mb_substr(trim((string) $json['phone']), 0, 30) : null,
            'permissions' => json_encode($permissions),
            'created_at' => $now, 'updated_at' => $now,
        ]);
        $this->audit((int) $authUser['id'], $authUser['role'], 'admin_created', 'users', (string) $newId, "Admin {$email} created");
        return $this->respondSuccess(['id' => $newId], 'Admin account created', 201);
    }

    // MARKER2

    /**
     * Update admin profile + permissions (superadmin only).
     */
    public function updateAdminPermissions($userId)
    {
        $authUser = $this->request->authUser ?? null;
        if (!$authUser || ($authUser['role'] ?? '') !== 'superadmin') {
            return $this->respondError('Forbidden: only Super Admin can edit permissions', 403);
        }
        $target = $this->db->table('users')->where('id', $userId)->get()->getRowArray();
        if (!$target) {
            return $this->respondError('User not found', 404);
        }
        if ($target['role'] === 'superadmin') {
            return $this->respondError('Super Admin always has full access', 400);
        }
        if ($target['role'] !== 'admin') {
            return $this->respondError('Permissions can only be edited for admin accounts', 400);
        }
        $json = $this->request->getJSON(true) ?? [];
        $permissions = \App\Filters\PermissionFilter::sanitize($json['permissions'] ?? []);
        $profileData = ['updated_at' => date('Y-m-d H:i:s'), 'permissions' => json_encode($permissions)];
        if (isset($json['full_name']) && trim((string) $json['full_name']) !== '') {
            $profileData['full_name'] = mb_substr(trim((string) $json['full_name']), 0, 150);
        }
        if (array_key_exists('designation', $json)) {
            $d = mb_substr(trim((string) $json['designation']), 0, 100);
            $profileData['designation'] = $d !== '' ? $d : null;
        }
        if (array_key_exists('department', $json)) {
            $d = mb_substr(trim((string) $json['department']), 0, 100);
            $profileData['department'] = $d !== '' ? $d : null;
        }
        if (array_key_exists('phone', $json)) {
            $d = mb_substr(trim((string) $json['phone']), 0, 30);
            $profileData['phone'] = $d !== '' ? $d : null;
        }
        $profile = $this->db->table('admin_profiles')->where('user_id', $userId)->get()->getRowArray();
        if ($profile) {
            $this->db->table('admin_profiles')->where('user_id', $userId)->update($profileData);
        } else {
            $profileData['user_id'] = (int) $userId;
            $nm = explode('@', $target['email']);
            $profileData['full_name'] = $profileData['full_name'] ?? $nm[0];
            $profileData['created_at'] = date('Y-m-d H:i:s');
            $this->db->table('admin_profiles')->insert($profileData);
        }
        $this->audit((int) $authUser['id'], $authUser['role'], 'admin_permissions_updated', 'users', (string) $userId, 'Permissions updated');
        return $this->respondSuccess(['permissions' => $permissions], 'Admin permissions updated');
    }

    /**
     * Remove admin (superadmin only). Demotes to alumni; ?hard=1 deletes row.
     */
    public function deleteAdmin($userId)
    {
        $authUser = $this->request->authUser ?? null;
        if (!$authUser || ($authUser['role'] ?? '') !== 'superadmin') {
            return $this->respondError('Forbidden: only Super Admin can remove admins', 403);
        }
        $target = $this->db->table('users')->where('id', $userId)->get()->getRowArray();
        if (!$target) {
            return $this->respondError('User not found', 404);
        }
        if ($target['role'] === 'superadmin') {
            return $this->respondError('Super Admin accounts cannot be removed', 403);
        }
        if ($target['role'] !== 'admin') {
            return $this->respondError('Only admin accounts can be removed here', 400);
        }
        if ((int) $userId === (int) ($authUser['id'] ?? 0)) {
            return $this->respondError('You cannot remove your own account', 403);
        }
        $hard = (string) ($this->request->getGet('hard') ?? '') === '1';
        if ($hard) {
            $this->db->table('admin_profiles')->where('user_id', $userId)->delete();
            $this->db->table('users')->where('id', $userId)->delete();
            $this->audit((int) $authUser['id'], $authUser['role'], 'admin_deleted_hard', 'users', (string) $userId, "Admin deleted");
            return $this->respondSuccess([], 'Admin permanently deleted');
        }
        $this->db->table('users')->where('id', $userId)->update(['role' => 'alumni', 'updated_at' => date('Y-m-d H:i:s')]);
        $this->db->table('admin_profiles')->where('user_id', $userId)->update(['permissions' => json_encode([]), 'updated_at' => date('Y-m-d H:i:s')]);
        $this->audit((int) $authUser['id'], $authUser['role'], 'admin_removed', 'users', (string) $userId, "Admin demoted to alumni");
        return $this->respondSuccess([], 'Admin removed (demoted to alumni)');
    }

    private function audit(int $userId, string $userRole, string $action, string $module, string $targetId, string $details): void
    {
        try {
            $this->db->table('audit_logs')->insert([
                'user_id' => $userId, 'user_role' => $userRole, 'action' => $action,
                'target_module' => $module, 'target_id' => $targetId,
                'ip_address' => $this->request->getIPAddress(),
                'user_agent' => $this->request->getUserAgent()->getAgentString(),
                'details' => mb_substr($details, 0, 1000),
                'created_at' => date('Y-m-d H:i:s'),
            ]);
        } catch (\Throwable $e) {
        }
    }

    /**
     * CMS: Success Stories Management
     */
    public function getStories()
    {
        $stories = $this->db->table('success_stories')->orderBy('created_at', 'DESC')->get()->getResultArray();
        return $this->respondSuccess($stories, 'Stories retrieved');
    }

    public function saveStory()
    {
        $json = $this->request->getJSON(true);
        $id = $json['id'] ?? null;

        $data = [
            'title'        => $json['title'] ?? '',
            'slug'         => !empty($json['slug']) ? $json['slug'] : (url_title($json['title'] ?? 'story', '-', true) . '-' . rand(100, 999)),
            'summary'      => $json['summary'] ?? '',
            'content'      => $json['content'] ?? '',
            'batch_year'   => $json['batch_year'] ?? '',
            'company'      => $json['company'] ?? '',
            'designation'  => $json['designation'] ?? '',
            'photo_url'    => $json['photo_url'] ?? null,
            'is_featured'  => !empty($json['is_featured']) ? 1 : 0,
            'is_published' => isset($json['is_published']) ? (int)$json['is_published'] : 1,
            'updated_at'   => date('Y-m-d H:i:s'),
        ];

        if ($id) {
            $this->db->table('success_stories')->where('id', $id)->update($data);
        } else {
            $data['created_at'] = date('Y-m-d H:i:s');
            $this->db->table('success_stories')->insert($data);
            $id = $this->db->insertID();
        }

        return $this->respondSuccess(['id' => $id], 'Success story saved');
    }

    public function deleteStory($id)
    {
        $this->db->table('success_stories')->where('id', $id)->delete();
        return $this->respondSuccess([], 'Story deleted');
    }

    /**
     * CMS: News & Announcements Management
     */
    public function getNews()
    {
        $news = $this->db->table('news_announcements')->orderBy('created_at', 'DESC')->get()->getResultArray();
        return $this->respondSuccess($news, 'News retrieved');
    }

    public function saveNews()
    {
        $json = $this->request->getJSON(true);
        $id = $json['id'] ?? null;

        $data = [
            'title'          => $json['title'] ?? '',
            'slug'           => !empty($json['slug']) ? $json['slug'] : (url_title($json['title'] ?? 'news', '-', true) . '-' . rand(100, 999)),
            'category'       => $json['category'] ?? 'General',
            'content'        => $json['content'] ?? '',
            'featured_image' => $json['featured_image'] ?? null,
            'is_pinned'      => !empty($json['is_pinned']) ? 1 : 0,
            'is_published'   => isset($json['is_published']) ? (int)$json['is_published'] : 1,
            'published_at'   => $json['published_at'] ?? date('Y-m-d H:i:s'),
            'updated_at'     => date('Y-m-d H:i:s'),
        ];

        if ($id) {
            $this->db->table('news_announcements')->where('id', $id)->update($data);
        } else {
            $data['created_at'] = date('Y-m-d H:i:s');
            $this->db->table('news_announcements')->insert($data);
            $id = $this->db->insertID();
        }

        return $this->respondSuccess(['id' => $id], 'News announcement saved');
    }

    public function deleteNews($id)
    {
        $this->db->table('news_announcements')->where('id', $id)->delete();
        return $this->respondSuccess([], 'News deleted');
    }

    /**
     * CMS: Regional Chapters Management
     */
    public function getChapters()
    {
        $chapters = $this->db->table('chapters')->orderBy('id', 'DESC')->get()->getResultArray();
        return $this->respondSuccess($chapters, 'Chapters retrieved');
    }

    public function saveChapter()
    {
        $json = $this->request->getJSON(true);
        $id = $json['id'] ?? null;

        $data = [
            'name'         => $json['name'] ?? '',
            'city'         => $json['city'] ?? '',
            'state'        => $json['state'] ?? '',
            'country'      => $json['country'] ?? 'India',
            'description'  => $json['description'] ?? '',
            'lead_name'    => $json['lead_name'] ?? null,
            'lead_email'   => $json['lead_email'] ?? null,
            'member_count' => (int)($json['member_count'] ?? 0),
            'banner_image' => $json['banner_image'] ?? null,
            'is_active'    => isset($json['is_active']) ? (int)$json['is_active'] : 1,
            'updated_at'   => date('Y-m-d H:i:s'),
        ];

        if ($id) {
            $this->db->table('chapters')->where('id', $id)->update($data);
        } else {
            $data['created_at'] = date('Y-m-d H:i:s');
            $this->db->table('chapters')->insert($data);
            $id = $this->db->insertID();
        }

        return $this->respondSuccess(['id' => $id], 'Chapter saved');
    }

    public function deleteChapter($id)
    {
        $this->db->table('chapters')->where('id', $id)->delete();
        return $this->respondSuccess([], 'Chapter deleted');
    }

    /**
     * CMS: Jobs Management
     */
    public function getJobs()
    {
        $jobs = $this->db->table('jobs')->orderBy('id', 'DESC')->get()->getResultArray();
        return $this->respondSuccess($jobs, 'Jobs retrieved');
    }

    public function saveJob()
    {
        $json = $this->request->getJSON(true);
        $id = $json['id'] ?? null;

        $data = [
            'title'               => $json['title'] ?? '',
            'company_name'        => $json['company_name'] ?? '',
            'job_type'            => $json['job_type'] ?? 'full_time',
            'location'            => $json['location'] ?? '',
            'experience_required' => $json['experience_required'] ?? '',
            'salary_range'        => $json['salary_range'] ?? '',
            'description'         => $json['description'] ?? '',
            'requirements'        => $json['requirements'] ?? '',
            'apply_link'          => $json['apply_link'] ?? '',
            'contact_email'       => $json['contact_email'] ?? '',
            'deadline'            => !empty($json['deadline']) ? $json['deadline'] : null,
            'status'              => $json['status'] ?? 'approved',
            'updated_at'          => date('Y-m-d H:i:s'),
        ];

        if ($id) {
            $this->db->table('jobs')->where('id', $id)->update($data);
        } else {
            $data['created_at'] = date('Y-m-d H:i:s');
            $this->db->table('jobs')->insert($data);
            $id = $this->db->insertID();
        }

        return $this->respondSuccess(['id' => $id], 'Job opportunity saved');
    }

    public function deleteJob($id)
    {
        $this->db->table('jobs')->where('id', $id)->delete();
        return $this->respondSuccess([], 'Job deleted');
    }

    /**
     * CMS: Gallery Albums Management
     */
    public function getGallery()
    {
        $gallery = $this->db->table('gallery_albums')->orderBy('id', 'DESC')->get()->getResultArray();
        return $this->respondSuccess($gallery, 'Gallery albums retrieved');
    }

    public function saveGallery()
    {
        $json = $this->request->getJSON(true);
        $id = $json['id'] ?? null;

        $data = [
            'title'        => $json['title'] ?? '',
            'category'     => $json['category'] ?? 'Campus',
            'cover_image'  => $json['cover_image'] ?? null,
            'description'  => $json['description'] ?? '',
            'event_date'   => !empty($json['event_date']) ? $json['event_date'] : date('Y-m-d'),
            'is_published' => isset($json['is_published']) ? (int)$json['is_published'] : 1,
            'updated_at'   => date('Y-m-d H:i:s'),
        ];

        if ($id) {
            $this->db->table('gallery_albums')->where('id', $id)->update($data);
        } else {
            $data['created_at'] = date('Y-m-d H:i:s');
            $this->db->table('gallery_albums')->insert($data);
            $id = $this->db->insertID();
        }

        return $this->respondSuccess(['id' => $id], 'Gallery album saved');
    }

    public function deleteGallery($id)
    {
        $this->db->table('gallery_albums')->where('id', $id)->delete();
        return $this->respondSuccess([], 'Album deleted');
    }

    /**
     * Get Audit Logs
     */
    public function getAuditLogs()
    {
        $logs = $this->db->table('audit_logs')
            ->select('audit_logs.*, users.email')
            ->join('users', 'users.id = audit_logs.user_id', 'left')
            ->orderBy('audit_logs.created_at', 'DESC')
            ->limit(100)
            ->get()->getResultArray();

        return $this->respondSuccess($logs, 'Audit logs retrieved');
    }
}
