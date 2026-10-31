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

    /** Return null for Super Admin, otherwise the admin's assigned department. */
    private function getDepartmentScope(array $authUser): ?string
    {
        if (($authUser['role'] ?? '') === 'superadmin') {
            return null;
        }
        $profile = $this->db->table('admin_profiles')
            ->select('department')
            ->where('user_id', (int) ($authUser['id'] ?? 0))
            ->get()->getRowArray();
        return trim((string) ($profile['department'] ?? ''));
    }

    private function grantableAdminPermissions($input): array
    {
        $permissions = is_array($input)
            ? \App\Filters\PermissionFilter::sanitize($input)
            : \App\Filters\PermissionFilter::normalize($input);
        $grantablePermissions = array_merge(
            \App\Filters\PermissionFilter::DEPARTMENT_ADMIN_PERMISSIONS,
            \App\Filters\PermissionFilter::GLOBAL_ADMIN_PERMISSIONS,
        );
        return array_intersect_key($permissions, array_flip($grantablePermissions));
    }

    private function isAllowedAdminDepartment(string $department): bool
    {
        return in_array($department, \App\Libraries\DepartmentCatalog::ALL, true);
    }

    private function canAccessDepartmentUser(array $authUser, int $userId): bool
    {
        if (($authUser['role'] ?? '') === 'superadmin') {
            return true;
        }
        $department = $this->getDepartmentScope($authUser);
        if ($department === '') {
            return false;
        }
        $target = $this->db->table('users')
            ->select('users.role, alumni_profiles.department as alumni_department, student_profiles.department as student_department')
            ->join('alumni_profiles', 'alumni_profiles.user_id = users.id', 'left')
            ->join('student_profiles', 'student_profiles.user_id = users.id', 'left')
            ->where('users.id', $userId)->get()->getRowArray();
        if (!$target) {
            return false;
        }
        if (($target['role'] ?? '') === 'alumni') {
            return trim((string) ($target['alumni_department'] ?? '')) === $department;
        }
        if (($target['role'] ?? '') === 'student') {
            return trim((string) ($target['student_department'] ?? '')) === $department;
        }
        return false;
    }

    /**
     * Admin & Super Admin KPI Dashboard Metrics
     */
    public function getDashboard()
    {
        $authUser = $this->request->authUser ?? [];
        $department = $this->getDepartmentScope($authUser);
        if (($authUser['role'] ?? '') === 'superadmin') {
            $department = trim((string) ($this->request->getGet('department') ?? '')) ?: null;
        }
        if ($department === '') {
            return $this->respondError('Your admin account needs a department assignment. Contact Super Admin.', 403);
        }

        $alumniCount = $this->db->table('alumni_profiles')->join('users', 'users.id = alumni_profiles.user_id')->where('users.role', 'alumni');
        $pendingCount = $this->db->table('alumni_profiles')->join('users', 'users.id = alumni_profiles.user_id')->where('users.role', 'alumni')->where('users.verification_status', 'pending');
        $verifiedCount = $this->db->table('alumni_profiles')->join('users', 'users.id = alumni_profiles.user_id')->where('users.role', 'alumni')->where('users.verification_status', 'verified');
        $studentCount = $this->db->table('student_profiles')->join('users', 'users.id = student_profiles.user_id')->where('users.role', 'student');
        $mentorCount = $this->db->table('alumni_profiles')->join('users', 'users.id = alumni_profiles.user_id')->where('users.role', 'alumni')->where('alumni_profiles.is_mentor', 1);
        if ($department !== null) {
            $alumniCount->where('alumni_profiles.department', $department);
            $pendingCount->where('alumni_profiles.department', $department);
            $verifiedCount->where('alumni_profiles.department', $department);
            $studentCount->where('student_profiles.department', $department);
            $mentorCount->where('alumni_profiles.department', $department);
        }
        $totalAlumni = $alumniCount->countAllResults();
        $pendingVerifications = $pendingCount->countAllResults();
        $verifiedAlumni = $verifiedCount->countAllResults();
        $totalStudents = $studentCount->countAllResults();
        $totalMentors = $mentorCount->countAllResults();
        $eventCount = $this->db->table('events')->where('is_published', 1);
        if ($department !== null) $eventCount->where('department', $department);
        $totalEvents = $eventCount->countAllResults();
        $totalJobs = $department === null ? $this->db->table('jobs')->where('status', 'approved')->countAllResults() : 0;

        // Recent Registrations
        $recentUsers = $this->db->table('users')
            ->select('users.id, users.email, users.role, users.status, users.verification_status, users.created_at, alumni_profiles.first_name as a_fname, alumni_profiles.last_name as a_lname, alumni_profiles.degree as a_degree, alumni_profiles.batch_year as a_batch, student_profiles.first_name as s_fname, student_profiles.last_name as s_lname')
            ->join('alumni_profiles', 'alumni_profiles.user_id = users.id', 'left')
            ->join('student_profiles', 'student_profiles.user_id = users.id', 'left')
            ->orderBy('users.created_at', 'DESC')
            ->limit(10);
        if ($department !== null) {
            $recentUsers->groupStart()->where('alumni_profiles.department', $department)->orWhere('student_profiles.department', $department)->groupEnd();
        }
        $recentUsers = $recentUsers->get()->getResultArray();

        // Department breakdown for chart
        $deptDistribution = $this->db->table('alumni_profiles')
            ->select('department, COUNT(*) as count')
            ->where('department IS NOT NULL')
            ->groupBy('department');
        if ($department !== null) $deptDistribution->where('department', $department);
        $deptDistribution = $deptDistribution->get()->getResultArray();

        // Batch breakdown for chart
        $batchDistribution = $this->db->table('alumni_profiles')
            ->select('batch_year, COUNT(*) as count')
            ->where('batch_year IS NOT NULL')
            ->groupBy('batch_year')
            ->orderBy('batch_year', 'ASC');
        if ($department !== null) $batchDistribution->where('department', $department);
        $batchDistribution = $batchDistribution->get()->getResultArray();

        $departments = [];
        $departmentComparison = [];
        if (($authUser['role'] ?? '') === 'superadmin') {
            $actualDepartmentRows = $this->db->table('alumni_profiles')
                ->select('department')->distinct()->where('department IS NOT NULL', null, false)->where('department !=', '')->get()->getResultArray();
            $actualStudentDepartmentRows = $this->db->table('student_profiles')
                ->select('department')->distinct()->where('department IS NOT NULL', null, false)->where('department !=', '')->get()->getResultArray();
            $actualDepartments = array_merge(
                array_column($actualDepartmentRows, 'department'),
                array_column($actualStudentDepartmentRows, 'department')
            );
            $departments = array_values(array_unique(array_merge(\App\Libraries\DepartmentCatalog::ALL, $actualDepartments)));
            foreach ($departments as $departmentName) {
                $departmentComparison[] = [
                    'department' => $departmentName,
                    'alumni' => $this->db->table('alumni_profiles')->join('users', 'users.id = alumni_profiles.user_id')
                        ->where('users.role', 'alumni')->where('alumni_profiles.department', $departmentName)->countAllResults(),
                    'students' => $this->db->table('student_profiles')->join('users', 'users.id = student_profiles.user_id')
                        ->where('users.role', 'student')->where('student_profiles.department', $departmentName)->countAllResults(),
                    'mentors' => $this->db->table('alumni_profiles')->join('users', 'users.id = alumni_profiles.user_id')
                        ->where('users.role', 'alumni')->where('alumni_profiles.department', $departmentName)->where('alumni_profiles.is_mentor', 1)->countAllResults(),
                    'verified' => $this->db->table('alumni_profiles')->join('users', 'users.id = alumni_profiles.user_id')
                        ->where('users.role', 'alumni')->where('alumni_profiles.department', $departmentName)->where('users.verification_status', 'verified')->countAllResults(),
                    'pending' => $this->db->table('alumni_profiles')->join('users', 'users.id = alumni_profiles.user_id')
                        ->where('users.role', 'alumni')->where('alumni_profiles.department', $departmentName)->where('users.verification_status', 'pending')->countAllResults(),
                    'higher_studies' => $this->db->table('alumni_profiles')->join('users', 'users.id = alumni_profiles.user_id')
                        ->where('users.role', 'alumni')->where('alumni_profiles.department', $departmentName)->where('alumni_profiles.current_status', 'higher_study')->countAllResults(),
                    'government_jobs' => $this->db->table('alumni_profiles')->join('users', 'users.id = alumni_profiles.user_id')
                        ->where('users.role', 'alumni')->where('alumni_profiles.department', $departmentName)->where('alumni_profiles.current_status', 'job')->where('alumni_profiles.job_type', 'government')->countAllResults(),
                    'private_jobs' => $this->db->table('alumni_profiles')->join('users', 'users.id = alumni_profiles.user_id')
                        ->where('users.role', 'alumni')->where('alumni_profiles.department', $departmentName)->where('alumni_profiles.current_status', 'job')->where('alumni_profiles.job_type', 'private')->countAllResults(),
                    'distinguished' => $this->db->table('alumni_profiles')->join('users', 'users.id = alumni_profiles.user_id')
                        ->where('users.role', 'alumni')->where('alumni_profiles.department', $departmentName)->where('alumni_profiles.is_distinguished', 1)->countAllResults(),
                    'events' => $this->db->table('events')->where('department', $departmentName)->where('is_published', 1)->countAllResults(),
                ];
            }
        }

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
            'department'         => $department,
            'departments'        => $departments,
            'department_comparison' => $departmentComparison,
        ], 'Dashboard metrics retrieved');
    }

    /** Super Admin oversight of mentorship requests, optionally filtered by the mentee's department. */
    public function getMentorshipRequests()
    {
        $authUser = $this->request->authUser ?? [];
        if (($authUser['role'] ?? '') !== 'superadmin') {
            return $this->respondError('Only Super Admin can view university-wide mentorship requests.', 403);
        }

        $department = trim((string) ($this->request->getGet('department') ?? ''));
        if ($department !== '' && !$this->isAllowedAdminDepartment($department)) {
            return $this->respondValidationError(['department' => 'Select a department from the approved department list']);
        }

        $builder = $this->db->table('mentorship_programs')
            ->select('mentorship_programs.id, mentorship_programs.topic, mentorship_programs.message, mentorship_programs.notes,
                mentorship_programs.status, mentorship_programs.requested_at, mentorship_programs.accepted_at, mentorship_programs.completed_at,
                student_profiles.user_id AS student_user_id, student_profiles.first_name AS student_first_name,
                student_profiles.last_name AS student_last_name, student_profiles.phone AS student_phone,
                student_profiles.enrollment_no, student_profiles.department AS student_department, student_profiles.degree,
                student_profiles.current_year, student_profiles.semester, student_users.email AS student_email,
                alumni_profiles.user_id AS mentor_user_id, alumni_profiles.first_name AS mentor_first_name,
                alumni_profiles.last_name AS mentor_last_name, alumni_profiles.phone AS mentor_phone,
                alumni_profiles.auid AS mentor_auid, alumni_profiles.alumni_id, alumni_profiles.department AS mentor_department,
                alumni_profiles.current_company, alumni_profiles.current_designation, mentor_users.email AS mentor_email')
            ->join('student_profiles', 'student_profiles.user_id = mentorship_programs.mentee_user_id')
            ->join('users AS student_users', 'student_users.id = mentorship_programs.mentee_user_id')
            ->join('alumni_profiles', 'alumni_profiles.user_id = mentorship_programs.mentor_user_id')
            ->join('users AS mentor_users', 'mentor_users.id = mentorship_programs.mentor_user_id')
            ->orderBy('mentorship_programs.requested_at', 'DESC');
        if ($department !== '') {
            $builder->where('student_profiles.department', $department);
        }
        $requests = $builder->get()->getResultArray();

        return $this->respondSuccess($requests, 'Mentorship requests retrieved');
    }

    /** Super Admin list of all alumni, including mentors with zero mentees. */
    public function getAlumniMentorRoster()
    {
        $authUser = $this->request->authUser ?? [];
        if (($authUser['role'] ?? '') !== 'superadmin') {
            return $this->respondError('Only Super Admin can view the university-wide alumni mentor roster.', 403);
        }
        $department = trim((string) ($this->request->getGet('department') ?? ''));
        if ($department !== '' && !$this->isAllowedAdminDepartment($department)) {
            return $this->respondValidationError(['department' => 'Select a department from the approved department list']);
        }

        $builder = $this->db->table('alumni_profiles')
            ->select("alumni_profiles.user_id, alumni_profiles.auid, alumni_profiles.alumni_id, alumni_profiles.first_name,
                alumni_profiles.last_name, alumni_profiles.phone, alumni_profiles.department, alumni_profiles.degree,
                alumni_profiles.batch_year, alumni_profiles.graduation_year, alumni_profiles.is_mentor,
                alumni_profiles.current_company, alumni_profiles.current_designation, users.email, users.status AS account_status,
                users.verification_status,
                (SELECT COUNT(*) FROM mentorship_programs
                    WHERE mentorship_programs.mentor_user_id = alumni_profiles.user_id
                    AND mentorship_programs.status IN ('requested', 'accepted', 'completed')) AS student_count", false)
            ->join('users', 'users.id = alumni_profiles.user_id')
            ->where('users.role', 'alumni')
            ->orderBy('student_count', 'DESC')
            ->orderBy('alumni_profiles.first_name', 'ASC');
        if ($department !== '') {
            $builder->where('alumni_profiles.department', $department);
        }
        return $this->respondSuccess($builder->get()->getResultArray(), 'Alumni mentor roster retrieved');
    }

    /** Click-through detail list for one alumni mentor. */
    public function getMentorStudents($mentorUserId)
    {
        $authUser = $this->request->authUser ?? [];
        if (($authUser['role'] ?? '') !== 'superadmin') {
            return $this->respondError('Only Super Admin can view university-wide mentor details.', 403);
        }
        $mentor = $this->db->table('alumni_profiles')
            ->select('alumni_profiles.user_id, alumni_profiles.auid, alumni_profiles.alumni_id, alumni_profiles.first_name,
                alumni_profiles.last_name, alumni_profiles.department, alumni_profiles.phone, alumni_profiles.current_company,
                alumni_profiles.current_designation, users.email')
            ->join('users', 'users.id = alumni_profiles.user_id')
            ->where('users.role', 'alumni')->where('alumni_profiles.user_id', (int) $mentorUserId)
            ->get()->getRowArray();
        if (!$mentor) return $this->respondError('Alumni mentor not found.', 404);

        $students = $this->db->table('mentorship_programs')
            ->select('mentorship_programs.id AS request_id, mentorship_programs.topic, mentorship_programs.message,
                mentorship_programs.status, mentorship_programs.requested_at, mentorship_programs.accepted_at,
                mentorship_programs.completed_at, student_profiles.user_id AS student_user_id,
                student_profiles.first_name AS student_first_name, student_profiles.last_name AS student_last_name,
                student_profiles.enrollment_no, student_profiles.phone AS student_phone,
                student_profiles.department AS student_department, student_profiles.degree,
                student_profiles.current_year, student_profiles.semester, student_users.email AS student_email')
            ->join('student_profiles', 'student_profiles.user_id = mentorship_programs.mentee_user_id')
            ->join('users AS student_users', 'student_users.id = mentorship_programs.mentee_user_id')
            ->where('mentorship_programs.mentor_user_id', (int) $mentorUserId)
            ->whereIn('mentorship_programs.status', ['requested', 'accepted', 'completed'])
            ->orderBy('mentorship_programs.requested_at', 'DESC')
            ->get()->getResultArray();

        return $this->respondSuccess(['mentor' => $mentor, 'students' => $students], 'Mentor students retrieved');
    }

    /**
     * Get Pending Alumni Verifications Queue
     */
    public function getPendingVerifications()
    {
        $authUser = $this->request->authUser ?? [];
        $department = $this->getDepartmentScope($authUser);
        if (($authUser['role'] ?? '') === 'superadmin') {
            $department = trim((string) ($this->request->getGet('department') ?? '')) ?: null;
        }
        if ($department === '') {
            return $this->respondError('Your admin account needs a department assignment. Contact Super Admin.', 403);
        }
        // NOTE: select explicit columns — `alumni_profiles.*` must NOT be selected together
        // with `users.id` (both are named `id`, the profile id would overwrite the user id
        // and Approve/Reject would then act on the WRONG account).
        $builder = $this->db->table('users')
            ->select('users.id, users.email, users.role, users.verification_status, users.created_at,
                      alumni_profiles.first_name, alumni_profiles.last_name, alumni_profiles.auid,
                      alumni_profiles.alumni_id, alumni_profiles.phone, alumni_profiles.degree,
                      alumni_profiles.department, alumni_profiles.batch_year, alumni_profiles.graduation_year,
                      alumni_profiles.current_company, alumni_profiles.current_designation,
                      alumni_profiles.profile_photo, alumni_profiles.admin_notes')
            ->join('alumni_profiles', 'alumni_profiles.user_id = users.id')
            ->where('users.role', 'alumni')
            ->where('users.verification_status', 'pending')
            ->orderBy('users.created_at', 'ASC');
        if ($department !== null) $builder->where('alumni_profiles.department', $department);
        $queue = $builder->get()->getResultArray();

        return $this->respondSuccess($queue, 'Pending verifications retrieved');
    }

    /**
     * Approve Alumni Verification
     */
    public function approveVerification($userId)
    {
        $authUser = $this->request->authUser ?? [];
        $targetRole = $this->db->table('users')->select('role')->where('id', $userId)->get()->getRowArray()['role'] ?? null;
        if ($targetRole !== 'alumni') {
            return $this->respondError('Only alumni accounts can be verified.', 400);
        }
        if (!$this->canAccessDepartmentUser($authUser, (int) $userId)) {
            return $this->respondError('This alumni account is outside your assigned department.', 403);
        }

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

        // Generate or ensure ID card (card_number = Alumni ID = AUAA + AUID, same as register path)
        $existingCard = $this->db->table('alumni_id_cards')->where('user_id', $userId)->get()->getRow();
        if (!$existingCard) {
            $profile  = $this->db->table('alumni_profiles')->where('user_id', $userId)->get()->getRowArray();
            $alumniId = $profile['alumni_id'] ?? null;

            if (empty($alumniId) && !empty($profile['auid'])) {
                $alumniId = 'AUAA' . $profile['auid'];
                $this->db->table('alumni_profiles')->where('user_id', $userId)->update([
                    'alumni_id'  => $alumniId,
                    'updated_at' => date('Y-m-d H:i:s'),
                ]);
            }
            if (empty($alumniId)) {
                $alumniId = 'AU-AID-' . ($profile['graduation_year'] ?? date('Y')) . '-00' . $userId;
            }

            $baseUrl   = rtrim((string)($_ENV['FRONTEND_URL'] ?? getenv('FRONTEND_URL') ?: 'http://localhost:5173'), '/');
            $this->db->table('alumni_id_cards')->insert([
                'user_id'     => $userId,
                'card_number' => $alumniId,
                'issue_date'  => date('Y-m-d'),
                'expiry_date' => date('Y-m-d', strtotime('+5 years')),
                'qr_payload'  => json_encode([
                    'alumni_id'   => $alumniId,
                    'auid'        => $profile['auid'] ?? '',
                    'card_number' => $alumniId,
                    'name'        => ($profile['first_name'] ?? '') . ' ' . ($profile['last_name'] ?? ''),
                    'degree'      => $profile['degree'] ?? '',
                    'batch'       => $profile['batch_year'] ?? '',
                    'status'      => 'OFFICIAL_VERIFIED',
                    // QR scan -> public profile page
                    'profile_url' => $baseUrl . '/alumni/' . $alumniId,
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
        $authUser = $this->request->authUser ?? [];
        $targetRole = $this->db->table('users')->select('role')->where('id', $userId)->get()->getRowArray()['role'] ?? null;
        if ($targetRole !== 'alumni') {
            return $this->respondError('Only alumni accounts can be rejected from this queue.', 400);
        }
        if (!$this->canAccessDepartmentUser($authUser, (int) $userId)) {
            return $this->respondError('This alumni account is outside your assigned department.', 403);
        }
        $json = $this->request->getJSON(true);
        $reason = $json['reason'] ?? 'Provided graduation or enrollment details could not be matched.';

        $this->db->table('users')
            ->where('id', $userId)
            ->update([
                'verification_status' => 'rejected',
                'status'              => 'rejected',
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
     * Get All Users List (role / status / search filter).
     * Used by User Management + Manage Alumni / Manage Students tabs.
     * NOTE: profile columns are aliased (a_*, s_*, adm_*) — never select two tables'
     * same-named columns together, later ones would silently overwrite earlier ones.
     */
    public function getAllUsers()
    {
        $authUser = $this->request->authUser ?? null;
        $actorRole = $authUser['role'] ?? '';
        $perms = ($actorRole === 'admin') ? \App\Filters\PermissionFilter::getPermissionsForUser((int) ($authUser['id'] ?? 0)) : [];
        $department = $this->getDepartmentScope($authUser ?? []);
        if ($actorRole === 'superadmin') {
            $department = trim((string) ($this->request->getGet('department') ?? '')) ?: null;
        }
        if ($department === '') {
            return $this->respondError('Your admin account needs a department assignment. Contact Super Admin.', 403);
        }

        $role = $this->request->getGet('role');
        $status = $this->request->getGet('status');
        $search = $this->request->getGet('search');

        $builder = $this->db->table('users')
            ->select('users.id, users.email, users.role, users.status, users.verification_status, users.created_at,
                      alumni_profiles.first_name as a_fname, alumni_profiles.last_name as a_lname,
                      alumni_profiles.auid as a_auid, alumni_profiles.alumni_id as a_alumni_id,
                      alumni_profiles.degree as a_degree, alumni_profiles.department as a_department,
                      alumni_profiles.batch_year as a_batch, alumni_profiles.phone as a_phone,
                      alumni_profiles.current_company as a_company, alumni_profiles.current_designation as a_designation,
                      alumni_profiles.graduation_year as a_graduation_year, alumni_profiles.industry as a_industry,
                      alumni_profiles.location_city as a_city, alumni_profiles.location_country as a_country,
                      alumni_profiles.is_mentor as a_is_mentor, alumni_profiles.is_distinguished as a_is_distinguished,
                      alumni_profiles.distinguished_title as a_distinguished_title,
                      alumni_profiles.current_status as a_current_status, alumni_profiles.job_type as a_job_type,
                      alumni_profiles.job_organization as a_job_org, alumni_profiles.job_designation as a_job_desig,
                      alumni_profiles.job_location as a_job_loc, alumni_profiles.gender as a_gender,
                      alumni_profiles.study_institution as a_study_institution, alumni_profiles.study_course as a_study_course,
                      alumni_profiles.study_location as a_study_location,
                      alumni_profiles.admin_notes as a_admin_notes,
                      student_profiles.first_name as s_fname, student_profiles.last_name as s_lname,
                      student_profiles.enrollment_no as s_enrollment, student_profiles.degree as s_degree,
                      student_profiles.department as s_department, student_profiles.phone as s_phone,
                      admin_profiles.full_name as adm_name, admin_profiles.designation as adm_designation,
                      admin_profiles.permissions as adm_permissions')
            ->join('alumni_profiles', 'alumni_profiles.user_id = users.id', 'left')
            ->join('student_profiles', 'student_profiles.user_id = users.id', 'left')
            ->join('admin_profiles', 'admin_profiles.user_id = users.id', 'left');

        // Role-based scoping for admins without full `manage_users` permission:
        if ($actorRole === 'admin' && empty($perms['manage_users'])) {
            $allowedRoles = [];
            if (!empty($perms['manage_alumni']) || !empty($perms['verify_alumni'])) {
                $allowedRoles[] = 'alumni';
            }
            if (!empty($perms['manage_students'])) {
                $allowedRoles[] = 'student';
            }
            if (empty($allowedRoles)) {
                return $this->respondError('Forbidden: missing user management permission', 403);
            }
            if (!empty($role)) {
                if (!in_array($role, $allowedRoles, true)) {
                    return $this->respondError('Forbidden: not permitted to view ' . $role . ' accounts', 403);
                }
                $builder->where('users.role', $role);
            } else {
                $builder->whereIn('users.role', $allowedRoles);
            }
        } elseif (!empty($role)) {
            $builder->where('users.role', $role);
        }

        if ($department !== null) {
            $builder->groupStart()
                ->where('alumni_profiles.department', $department)
                ->orWhere('student_profiles.department', $department)
                ->groupEnd();
            $builder->whereIn('users.role', ['alumni', 'student']);
        }

        if (!empty($status) && in_array($status, ['active', 'pending', 'rejected', 'suspended'], true)) {
            $builder->where('users.status', $status);
        }

        if (!empty($search)) {
            $builder->groupStart()
                ->like('users.email', $search)
                ->orLike('alumni_profiles.first_name', $search)
                ->orLike('alumni_profiles.last_name', $search)
                ->orLike('alumni_profiles.auid', $search)
                ->orLike('alumni_profiles.alumni_id', $search)
                ->orLike('student_profiles.first_name', $search)
                ->orLike('student_profiles.last_name', $search)
                ->orLike('student_profiles.enrollment_no', $search)
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
     * Alumni Report with comprehensive filtering and export
     * Format matches NAAC / NIRF / University Alumni accreditation reports
     * Columns: Pass-Out Batch, Sr. No., Department, AUID, Name of Student, UG/PG/PhD, Gender, Mobile Student, Email Address, Current Status, Details of the Current JOB/Institute Details
     */
    public function getAlumniReport()
    {
        $authUser = $this->request->authUser ?? null;
        $actorRole = $authUser['role'] ?? '';
        $perms = ($actorRole === 'admin') ? \App\Filters\PermissionFilter::getPermissionsForUser((int) ($authUser['id'] ?? 0)) : [];

        $department = $this->getDepartmentScope($authUser ?? []);
        if ($actorRole === 'superadmin') {
            $reqDept = trim((string) ($this->request->getGet('department') ?? ''));
            $department = $reqDept !== '' ? $reqDept : null;
        }

        // Check permission if admin
        if ($actorRole === 'admin' && empty($perms['view_reports']) && empty($perms['manage_alumni']) && empty($perms['manage_users']) && empty($perms['verify_alumni']) && $department === '') {
            return $this->respondError('Forbidden: missing report viewing permission', 403);
        }

        $batch = trim((string) ($this->request->getGet('batch') ?? ''));
        $level = trim((string) ($this->request->getGet('education_level') ?? ''));
        $status = trim((string) ($this->request->getGet('current_status') ?? ''));
        $jobType = trim((string) ($this->request->getGet('job_type') ?? ''));
        $gender = trim((string) ($this->request->getGet('gender') ?? ''));
        $search = trim((string) ($this->request->getGet('search') ?? ''));
        $userStatus = trim((string) ($this->request->getGet('user_status') ?? ''));

        $builder = $this->db->table('alumni_profiles')
            ->select('alumni_profiles.*, users.email, users.status as user_status, users.verification_status')
            ->join('users', 'users.id = alumni_profiles.user_id')
            ->where('users.role', 'alumni');

        if ($department !== null) {
            $builder->where('alumni_profiles.department', $department);
        }

        if ($batch !== '') {
            $builder->groupStart()
                ->where('alumni_profiles.batch_year', $batch)
                ->orWhere('alumni_profiles.graduation_year', $batch)
                ->groupEnd();
        }

        if ($status !== '') {
            $builder->where('alumni_profiles.current_status', $status);
        }

        if ($jobType !== '') {
            $builder->where('alumni_profiles.job_type', $jobType);
        }

        if ($gender !== '') {
            $builder->where('alumni_profiles.gender', $gender);
        }

        if ($userStatus !== '') {
            $builder->where('users.status', $userStatus);
        }

        if ($search !== '') {
            $builder->groupStart()
                ->like('users.email', $search)
                ->orLike('alumni_profiles.first_name', $search)
                ->orLike('alumni_profiles.last_name', $search)
                ->orLike('alumni_profiles.auid', $search)
                ->orLike('alumni_profiles.enrollment_no', $search)
                ->orLike('alumni_profiles.phone', $search)
                ->orLike('alumni_profiles.department', $search)
                ->orLike('alumni_profiles.current_company', $search)
                ->orLike('alumni_profiles.job_organization', $search)
                ->orLike('alumni_profiles.study_institution', $search)
                ->groupEnd();
        }

        $records = $builder->orderBy('alumni_profiles.id', 'ASC')->get()->getResultArray();

        // Load educations for level resolution
        $educationsMap = [];
        if ($this->db->tableExists('user_educations') && !empty($records)) {
            $userIds = array_unique(array_filter(array_column($records, 'user_id')));
            if (!empty($userIds)) {
                $edRows = $this->db->table('user_educations')
                    ->whereIn('user_id', $userIds)
                    ->orderBy('id', 'ASC')
                    ->get()->getResultArray();
                foreach ($edRows as $er) {
                    $uId = (int) $er['user_id'];
                    $educationsMap[$uId][] = $er;
                }
            }
        }

        $levelPriority = ['PhD' => 4, 'PG' => 3, 'UG' => 2, 'Diploma' => 1, 'Other' => 0];

        $report = [];
        $srNo = 1;

        foreach ($records as $row) {
            $userId = (int) ($row['user_id'] ?? 0);

            // Determine UG/PG/PhD
            $resolvedLevel = 'UG';
            if (!empty($educationsMap[$userId])) {
                $bestLevel = 'UG';
                $bestScore = -1;
                foreach ($educationsMap[$userId] as $edu) {
                    $lvl = strtoupper(trim((string) ($edu['education_level'] ?? '')));
                    $score = $levelPriority[$lvl] ?? 1;
                    if ($score > $bestScore) {
                        $bestScore = $score;
                        $bestLevel = in_array($lvl, ['UG', 'PG', 'PHD'], true) ? ($lvl === 'PHD' ? 'PhD' : $lvl) : $lvl;
                    }
                }
                $resolvedLevel = $bestLevel;
            } else {
                $deg = strtoupper((string) ($row['degree'] ?? ''));
                if (strpos($deg, 'PHD') !== false || strpos($deg, 'PH.D') !== false || strpos($deg, 'DOCTOR') !== false) {
                    $resolvedLevel = 'PhD';
                } elseif (strpos($deg, 'M.') !== false || strpos($deg, 'MASTER') !== false || strpos($deg, 'MBA') !== false || strpos($deg, 'MCA') !== false || strpos($deg, 'MTECH') !== false || strpos($deg, 'MSC') !== false) {
                    $resolvedLevel = 'PG';
                } else {
                    $resolvedLevel = 'UG';
                }
            }

            // Filter by education level if requested
            if ($level !== '' && strtoupper($resolvedLevel) !== strtoupper($level)) {
                continue;
            }

            // Resolve gender
            $g = trim((string) ($row['gender'] ?? ''));
            if ($g === '') {
                $fullName = trim(($row['first_name'] ?? '') . ' ' . ($row['last_name'] ?? ''));
                if (stripos($fullName, 'Kaur') !== false) {
                    $g = 'Female';
                } elseif (stripos($fullName, 'Singh') !== false) {
                    $g = 'Male';
                } else {
                    $g = 'Other';
                }
            }

            // AUID
            $auid = trim((string) ($row['auid'] ?? ''));
            if ($auid === '') {
                $auid = trim((string) ($row['enrollment_no'] ?? '')) ?: (trim((string) ($row['alumni_id'] ?? '')) ?: ('AU-' . str_pad((string) $row['id'], 5, '0', STR_PAD_LEFT)));
            }

            // Pass-out batch
            $batchYear = trim((string) ($row['batch_year'] ?? ''));
            if ($batchYear === '') {
                $gradYear = trim((string) ($row['graduation_year'] ?? ''));
                $batchYear = $gradYear !== '' ? (($gradYear - 4) . '-' . $gradYear) : 'N/A';
            }

            // Full Name
            $studentName = trim(($row['first_name'] ?? '') . ' ' . ($row['last_name'] ?? ''));

            // Current Status & Current Details
            $rawStatus = trim((string) ($row['current_status'] ?? ''));
            $statusLabel = 'Employed';
            $details = '';

            if ($rawStatus === 'job' || ($rawStatus === '' && (!empty($row['current_company']) || !empty($row['job_organization'])))) {
                $statusLabel = 'Job';
                $org = trim((string) ($row['job_organization'] ?: ($row['current_company'] ?: '')));
                $desig = trim((string) ($row['job_designation'] ?: ($row['current_designation'] ?: '')));
                $loc = trim((string) ($row['job_location'] ?: ($row['location_city'] ?: '')));
                $jType = trim((string) ($row['job_type'] ?? ''));
                $parts = [];
                if ($desig !== '') $parts[] = $desig;
                if ($org !== '') $parts[] = 'at ' . $org;
                if ($loc !== '') $parts[] = '(' . $loc . ')';
                if ($jType !== '') $parts[] = '[' . ucfirst($jType) . ' Job]';
                $details = implode(' ', $parts);
            } elseif ($rawStatus === 'higher_study') {
                $statusLabel = 'Higher Studies';
                $inst = trim((string) ($row['study_institution'] ?? ''));
                $course = trim((string) ($row['study_course'] ?? ''));
                $loc = trim((string) ($row['study_location'] ?? ''));
                $parts = [];
                if ($course !== '') $parts[] = 'Course: ' . $course;
                if ($inst !== '') $parts[] = 'at ' . $inst;
                if ($loc !== '') $parts[] = '(' . $loc . ')';
                $details = implode(' ', $parts);
            } elseif ($rawStatus === 'other') {
                $statusLabel = 'Other';
                $details = trim((string) ($row['industry'] ?: ($row['admin_notes'] ?: 'Self-Employed / Other')));
            } else {
                $statusLabel = 'Alumni';
                $details = trim((string) ($row['current_company'] ?: ($row['admin_notes'] ?: '-')));
            }

            if ($details === '') {
                $details = '-';
            }

            $report[] = [
                'sr_no'               => $srNo++,
                'pass_out_batch'      => $batchYear,
                'department'          => trim((string) ($row['department'] ?? 'General')),
                'auid'                => $auid,
                'name_of_student'     => $studentName,
                'degree_level'        => $resolvedLevel,
                'degree'              => trim((string) ($row['degree'] ?? '')),
                'gender'              => $g,
                'mobile_student'      => trim((string) ($row['phone'] ?? '')),
                'email_address'       => trim((string) ($row['email'] ?? '')),
                'current_status'      => $statusLabel,
                'current_details'     => $details,
                'raw_status'          => $rawStatus,
                'user_id'             => $userId,
            ];
        }

        // CSV export stream if requested
        if ($this->request->getGet('format') === 'csv') {
            $filename = 'Akal_Alumni_Report_' . date('Ymd_His') . '.csv';
            header('Content-Type: text/csv; charset=utf-8');
            header('Content-Disposition: attachment; filename="' . $filename . '"');

            $output = fopen('php://output', 'w');
            fprintf($output, chr(0xEF) . chr(0xBB) . chr(0xBF)); // UTF-8 BOM

            fputcsv($output, [
                'Pass-Out Batch',
                'Sr. No.',
                'Department',
                'AUID',
                'Name of Student',
                'UG/PG/PhD',
                'Gender',
                'Mobile Student',
                'Email Address',
                'Current Status',
                'Details of the Current JOB/Institute Details',
            ]);

            foreach ($report as $r) {
                fputcsv($output, [
                    $r['pass_out_batch'],
                    $r['sr_no'],
                    $r['department'],
                    $r['auid'],
                    $r['name_of_student'],
                    $r['degree_level'],
                    $r['gender'],
                    $r['mobile_student'],
                    $r['email_address'],
                    $r['current_status'],
                    $r['current_details'],
                ]);
            }
            fclose($output);
            exit;
        }

        return $this->respondSuccess([
            'report'            => $report,
            'total'             => count($report),
            'scoped_department' => $department,
        ], 'Alumni report generated');
    }

    /**
     * Full profile of any user account (alumni / student / admin) for the admin
     * "Full Info" modal — profile + academic history + ID card + recent activity.
     */
    public function getUserDetail($userId)
    {
        $authUser = $this->request->authUser ?? null;
        $actorRole = $authUser['role'] ?? '';

        $user = $this->db->table('users')->where('id', $userId)->get()->getRowArray();
        if (!$user) {
            return $this->respondError('User not found', 404);
        }
        unset($user['password_hash'], $user['remember_token']);

        $role = $user['role'] ?? '';

        if ($actorRole === 'admin' && !$this->canAccessDepartmentUser($authUser, (int) $userId)) {
            return $this->respondError('This account is outside your assigned department.', 403);
        }

        // Role-based permission check for admins without manage_users:
        if ($actorRole === 'admin') {
            $perms = \App\Filters\PermissionFilter::getPermissionsForUser((int) ($authUser['id'] ?? 0));
            if (empty($perms['manage_users'])) {
                if ($role === 'alumni' && empty($perms['manage_alumni']) && empty($perms['verify_alumni'])) {
                    return $this->respondError('Forbidden: missing permission to view alumni details', 403);
                }
                if ($role === 'student' && empty($perms['manage_students'])) {
                    return $this->respondError('Forbidden: missing permission to view student details', 403);
                }
                if (in_array($role, ['admin', 'superadmin'], true)) {
                    return $this->respondError('Forbidden: only Super Admin can view admin details', 403);
                }
            }
        }

        $alumni = null;
        $student = null;
        $adminProfile = null;
        $educations = [];
        $idCard = null;

        if ($role === 'alumni') {
            $alumni = $this->db->table('alumni_profiles')->where('user_id', $userId)->get()->getRowArray();
            $idCard = $this->db->table('alumni_id_cards')->where('user_id', $userId)->get()->getRowArray();
            if (isset($idCard['qr_payload'])) {
                $idCard['qr_payload'] = json_decode($idCard['qr_payload'], true);
            }
        } elseif ($role === 'student') {
            $student = $this->db->table('student_profiles')->where('user_id', $userId)->get()->getRowArray();
        } elseif (in_array($role, ['admin', 'superadmin'], true)) {
            $adminProfile = $this->db->table('admin_profiles')->where('user_id', $userId)->get()->getRowArray();
            if ($adminProfile) {
                $adminProfile['permissions'] = $role === 'superadmin'
                    ? ['all' => true]
                    : \App\Filters\PermissionFilter::normalize($adminProfile['permissions'] ?? '');
            }
        }

        if ($this->db->tableExists('user_educations')) {
            $educations = $this->db->table('user_educations')
                ->where('user_id', $userId)
                ->orderBy('id', 'ASC')
                ->get()->getResultArray();
        }

        $recentActivity = $this->db->table('audit_logs')
            ->where('target_id', (string) $userId)
            ->orderBy('id', 'DESC')
            ->limit(10)
            ->get()->getResultArray();

        return $this->respondSuccess([
            'user'            => $user,
            'alumni'          => $alumni,
            'student'         => $student,
            'admin_profile'   => $adminProfile,
            'educations'      => $educations,
            'id_card'         => $idCard,
            'recent_activity' => $recentActivity,
        ], 'User detail retrieved');
    }

    /**
     * Create / Update Event
     */
    public function saveEvent()
    {
        $json = $this->request->getJSON(true);
        $id = $json['id'] ?? null;
        $eventDepartment = trim((string) ($json['department'] ?? ''));
        if ($eventDepartment !== '' && !$this->isAllowedAdminDepartment($eventDepartment)) {
            return $this->respondValidationError(['department' => 'Select a department from the approved department list']);
        }

        $data = [
            'title'                 => $json['title'],
            'slug'                  => url_title($json['title'], '-', true) . '-' . rand(100, 999),
            'event_type'            => $json['event_type'] ?? 'general',
            'department'            => $eventDepartment !== '' ? $eventDepartment : null,
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

    /** List registrations only for an event in the caller's permitted scope. */
    public function getEventRegistrations($eventId)
    {
        $authUser = $this->request->authUser ?? [];
        $event = $this->db->table('events')
            ->select('id, title, department')
            ->where('id', (int) $eventId)
            ->get()->getRowArray();
        if (!$event) {
            return $this->respondError('Event not found.', 404);
        }

        if (($authUser['role'] ?? '') !== 'superadmin') {
            $department = $this->getDepartmentScope($authUser);
            if ($department === '' || $event['department'] !== $department) {
                return $this->respondError('You can only view registrations for events in your department.', 403);
            }
        }

        $registrations = $this->db->table('event_registrations')
            ->select('event_registrations.id, event_registrations.attendee_name, event_registrations.attendee_email,
                event_registrations.attendee_phone, event_registrations.created_at, users.id as matched_user_id,
                users.role as registrant_role, alumni_profiles.auid, alumni_profiles.alumni_id,
                alumni_profiles.phone as alumni_phone, student_profiles.enrollment_no,
                student_profiles.phone as student_phone')
            ->join('users', 'users.id = event_registrations.user_id OR users.email = event_registrations.attendee_email', 'left', false)
            ->join('alumni_profiles', 'alumni_profiles.user_id = users.id', 'left')
            ->join('student_profiles', 'student_profiles.user_id = users.id', 'left')
            ->where('event_registrations.event_id', (int) $eventId)
            ->orderBy('event_registrations.created_at', 'DESC')
            ->get()->getResultArray();
        $registrations = array_map(static function (array $registration): array {
            $role = $registration['registrant_role'] ?? '';
            return [
                'id' => $registration['id'],
                'uid' => $registration['auid'] ?: ($registration['alumni_id'] ?: ($registration['enrollment_no'] ?: ($registration['matched_user_id'] ?? ''))),
                'name' => $registration['attendee_name'],
                'contact_number' => $registration['attendee_phone'] ?: ($registration['alumni_phone'] ?: ($registration['student_phone'] ?? '')),
                'member_type' => in_array($role, ['alumni', 'student'], true) ? ucfirst($role) : 'Guest',
                'email' => $registration['attendee_email'],
                'registered_at' => $registration['created_at'],
            ];
        }, $registrations);

        return $this->respondSuccess([
            'event' => $event,
            'registrations' => $registrations,
            'registration_count' => count($registrations),
        ], 'Event registrations retrieved');
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

        // Group mapping for CMS-managed pages so bulk save keeps the right tab.
        $groupMap = [
            'about_' => 'about',
            'auaa_'  => 'auaa',
            'hero_'  => 'hero',
            'stat_'  => 'stats',
            'total_alumni_count'   => 'stats',
            'global_chapters_count' => 'stats',
            'career_mentors_count' => 'stats',
            'top_banner_'   => 'banner',
            'enable_top_banner' => 'banner',
            'contact_'      => 'contact',
            'campus_address' => 'contact',
            'office_hours'  => 'contact',
            'social_'       => 'social',
            'copyright_text' => 'footer',
            'footer_description' => 'footer',
            'accreditation_line1' => 'footer',
            'university_website' => 'social',
            'site_title'    => 'general',
            'university_name' => 'general',
            'tagline'       => 'general',
            'logo_'         => 'general',
            'primary_color' => 'general',
            'accent_color'  => 'general',
        ];
        $guessGroup = function ($key) use ($groupMap) {
            foreach ($groupMap as $prefix => $grp) {
                if (strpos($key, $prefix) === 0) return $grp;
            }
            if (strpos($key, 'enable_') === 0 || strpos($key, 'allow_') === 0 || strpos($key, 'require_') === 0) return 'features';
            return 'custom';
        };

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
                        'setting_group' => $guessGroup($key),
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
        if ($newRole === 'admin' && !in_array($target['role'], ['admin', 'superadmin'], true)) {
            return $this->respondError('Create department admins through Admins & Permissions and assign a department.', 400);
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

    /**
     * User Status Management (active / deactivate).
     * - Super Admin: any status.
     * - Admin with `manage_users` permission: only active / suspended (cannot touch
     *   Super Admin accounts).
     */
    public function updateUserStatus($userId)
    {
        $authUser = $this->request->authUser ?? null;
        if (!$authUser) {
            return $this->respondError('Unauthorized', 401);
        }
        $actorRole = $authUser['role'] ?? '';

        $json = $this->request->getJSON(true);
        $newStatus = $json['status'] ?? 'active';

        if (!in_array($newStatus, ['active', 'pending', 'rejected', 'suspended'])) {
            return $this->respondError('Invalid status specified', 400);
        }

        $target = $this->db->table('users')->where('id', $userId)->get()->getRowArray();
        if (!$target) {
            return $this->respondError('User not found', 404);
        }

        // --- Authorization ---
        if ($actorRole === 'superadmin') {
            // full access
        } elseif ($actorRole === 'admin') {
            if (!$this->canAccessDepartmentUser($authUser, (int) $userId)) {
                return $this->respondError('This account is outside your assigned department.', 403);
            }
            $perms = \App\Filters\PermissionFilter::getPermissionsForUser((int) $authUser['id']);
            $targetRole = $target['role'] ?? '';

            $allowed = false;
            if (!empty($perms['manage_users'])) {
                $allowed = true; // manage_users has broad permission
            } elseif ($targetRole === 'alumni' && (!empty($perms['manage_alumni']) || !empty($perms['verify_alumni']))) {
                $allowed = true; // manage_alumni can activate/deactivate alumni
            } elseif ($targetRole === 'student' && !empty($perms['manage_students'])) {
                $allowed = true; // manage_students can activate/deactivate students
            }

            if (!$allowed) {
                return $this->respondError('Forbidden: missing permission to manage ' . $targetRole . ' account status', 403);
            }
            if (!in_array($newStatus, ['active', 'suspended'], true)) {
                return $this->respondError('Admins can only activate or deactivate accounts (active / suspended)', 400);
            }
            if (($target['role'] ?? '') === 'superadmin') {
                return $this->respondError('Forbidden: only Super Admin can change a Super Admin account status', 403);
            }
        } else {
            return $this->respondError('Forbidden: admin access required', 403);
        }

        if ((int) $userId === (int) ($authUser['id'] ?? 0) && $newStatus !== 'active') {
            return $this->respondError('You cannot deactivate your own account', 403);
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
        $grantablePermissions = array_merge(
            \App\Filters\PermissionFilter::DEPARTMENT_ADMIN_PERMISSIONS,
            \App\Filters\PermissionFilter::GLOBAL_ADMIN_PERMISSIONS,
        );
        return $this->respondSuccess(array_intersect_key(\App\Filters\PermissionFilter::AVAILABLE, array_flip($grantablePermissions)), 'Admin permissions catalogue');
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
            $r['permissions'] = ($r['role'] === 'superadmin') ? ['all' => true] : $this->grantableAdminPermissions($raw ?? '');
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
        $department = mb_substr(trim((string) ($json['department'] ?? '')), 0, 100);
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
        if ($department === '') {
            $errors['department'] = 'A department assignment is required for every admin';
        } elseif (!$this->isAllowedAdminDepartment($department)) {
            $errors['department'] = 'Select a department from the approved department list';
        }
        if (!empty($errors)) {
            return $this->respondValidationError($errors);
        }
        $exists = $this->db->table('users')->where('email', $email)->get()->getRowArray();
        if ($exists) {
            return $this->respondError('An account with this email already exists', 409);
        }
        $permissions = $this->grantableAdminPermissions($json['permissions'] ?? []);
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
            'department' => $department,
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
        $permissions = $this->grantableAdminPermissions($json['permissions'] ?? []);
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
            if ($d === '') {
                return $this->respondValidationError(['department' => 'Admin department cannot be blank']);
            }
            if (!$this->isAllowedAdminDepartment($d)) {
                return $this->respondValidationError(['department' => 'Select a department from the approved department list']);
            }
            $profileData['department'] = $d;
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
        $authUser = $this->request->authUser ?? [];
        $builder = $this->db->table('jobs')
            ->select('jobs.*, (SELECT COUNT(*) FROM job_applications WHERE job_applications.job_id = jobs.id) AS application_count', false)
            ->orderBy('jobs.id', 'DESC');
        if (($authUser['role'] ?? '') !== 'superadmin') {
            $department = $this->getDepartmentScope($authUser);
            if ($department === '') {
                return $this->respondError('Your admin account needs a department assignment.', 403);
            }
            $builder->where('department', $department);
        }
        $jobs = $builder->get()->getResultArray();
        return $this->respondSuccess($jobs, 'Jobs retrieved');
    }

    /** Admins see applicants for jobs in their department; Super Admin sees any job. */
    public function getJobApplications($jobId)
    {
        $authUser = $this->request->authUser ?? [];
        $job = $this->db->table('jobs')->select('id, title, company_name, department, status, posted_by_user_id')
            ->where('id', (int) $jobId)->where('deleted_at IS NULL', null, false)->get()->getRowArray();
        if (!$job) return $this->respondError('Job posting not found.', 404);

        if (($authUser['role'] ?? '') !== 'superadmin') {
            $department = $this->getDepartmentScope($authUser);
            if ($department === '' || ($job['department'] ?? '') !== $department) {
                return $this->respondError('You can only view applicants for jobs in your department.', 403);
            }
        }

        $applicants = $this->db->table('job_applications')
            ->select("job_applications.id, job_applications.created_at AS applied_at, users.id AS user_id, users.email, users.role,
                COALESCE(NULLIF(CONCAT(alumni_profiles.first_name, ' ', alumni_profiles.last_name), ' '), NULLIF(CONCAT(student_profiles.first_name, ' ', student_profiles.last_name), ' '), users.email) AS name,
                COALESCE(alumni_profiles.phone, student_profiles.phone) AS contact_number,
                CASE WHEN users.role = 'alumni' THEN COALESCE(alumni_profiles.auid, alumni_profiles.alumni_id) ELSE student_profiles.enrollment_no END AS uid", false)
            ->join('users', 'users.id = job_applications.user_id')
            ->join('alumni_profiles', 'alumni_profiles.user_id = users.id', 'left')
            ->join('student_profiles', 'student_profiles.user_id = users.id', 'left')
            ->where('job_applications.job_id', (int) $jobId)
            ->orderBy('job_applications.created_at', 'ASC')
            ->get()->getResultArray();
        $applicants = array_map(static function (array $row): array {
            $row['member_type'] = ucfirst((string) $row['role']);
            return $row;
        }, $applicants);

        return $this->respondSuccess(['job' => $job, 'applicants' => $applicants], 'Job applicants retrieved');
    }

    public function saveJob()
    {
        $authUser = $this->request->authUser ?? [];
        $json = $this->request->getJSON(true) ?? [];
        $id = $json['id'] ?? null;
        $isSuperAdmin = ($authUser['role'] ?? '') === 'superadmin';
        $department = $isSuperAdmin ? trim((string) ($json['department'] ?? '')) : $this->getDepartmentScope($authUser);
        if (!$isSuperAdmin && $department === '') {
            return $this->respondError('Your admin account needs a department assignment.', 403);
        }
        if ($isSuperAdmin && $department !== '' && !$this->isAllowedAdminDepartment($department)) {
            return $this->respondValidationError(['department' => 'Select a department from the approved department list']);
        }
        if ($id) {
            $existingJob = $this->db->table('jobs')->where('id', (int) $id)->get()->getRowArray();
            if (!$existingJob) return $this->respondError('Job opportunity not found.', 404);
            if (!$isSuperAdmin && ($existingJob['department'] ?? '') !== $department) {
                return $this->respondError('You can only manage jobs from your assigned department.', 403);
            }
        }
        $status = $json['status'] ?? 'approved';
        if (!in_array($status, ['pending', 'approved', 'closed', 'rejected'], true)) {
            return $this->respondValidationError(['status' => 'Invalid job status']);
        }

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
            'department'          => $department !== '' ? $department : null,
            'status'              => $status,
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
        $authUser = $this->request->authUser ?? [];
        if (($authUser['role'] ?? '') !== 'superadmin') {
            $department = $this->getDepartmentScope($authUser);
            $job = $this->db->table('jobs')->select('department')->where('id', (int) $id)->get()->getRowArray();
            if ($department === '' || !$job || ($job['department'] ?? '') !== $department) {
                return $this->respondError('You can only manage jobs from your assigned department.', 403);
            }
        }
        $this->db->table('jobs')->where('id', $id)->delete();
        return $this->respondSuccess([], 'Job deleted');
    }

    /** Retrieve the submitted report for an event. */
    public function getEventReport($eventId)
    {
        $event = $this->db->table('events')->select('id, title, department, event_type, start_datetime')->where('id', (int) $eventId)->get()->getRowArray();
        if (!$event) return $this->respondError('Event not found.', 404);
        $report = $this->db->table('event_reports')->where('event_id', (int) $eventId)->get()->getRowArray();
        return $this->respondSuccess(['event' => $event, 'report' => $report], 'Event report retrieved');
    }

    /** Publicly readable event report photo stored under writable/uploads. */
    public function getEventReportPhoto($filename)
    {
        $filename = basename((string) $filename);
        $path = WRITEPATH . 'uploads/event-reports/' . $filename;
        if (!is_file($path)) return $this->respondError('Photo not found.', 404);
        return $this->response->setHeader('Content-Type', mime_content_type($path) ?: 'application/octet-stream')
            ->setHeader('Cache-Control', 'public, max-age=86400')->setBody(file_get_contents($path));
    }

    /** Save report metadata and photos, then publish the matching gallery album. */
    public function saveEventReport($eventId)
    {
        $event = $this->db->table('events')->where('id', (int) $eventId)->get()->getRowArray();
        if (!$event) return $this->respondError('Event not found.', 404);
        $authUser = $this->request->authUser ?? [];
        if (($authUser['role'] ?? '') !== 'superadmin') {
            $department = $this->getDepartmentScope($authUser);
            if ($department === '' || ($event['department'] ?? '') !== $department) return $this->respondError('You can only manage reports for events in your department.', 403);
        }
        $fields = $this->request->getPost();
        if (empty($fields) && $this->request->getJSON(true)) $fields = $this->request->getJSON(true);
        $fields['email_address'] = trim((string) ($fields['email_address'] ?? ''));
        $fields['coordinators'] = trim((string) ($fields['coordinators'] ?? ''));
        $fields['department'] = trim((string) ($fields['department'] ?? $event['department'] ?? ''));
        $fields['event_type'] = trim((string) ($fields['event_type'] ?? $event['event_type'] ?? ''));
        $fields['event_date'] = trim((string) ($fields['event_date'] ?? substr((string) $event['start_datetime'], 0, 10)));
        $fields['speaker_name'] = trim((string) ($fields['speaker_name'] ?? ''));
        $fields['speaker_uid'] = trim((string) ($fields['speaker_uid'] ?? ''));
        $fields['batch'] = trim((string) ($fields['batch'] ?? ''));
        $fields['participants_count'] = max(0, (int) ($fields['participants_count'] ?? 0));
        $fields['detailed_report'] = trim((string) ($fields['detailed_report'] ?? ''));
        $fields['learning_outcomes'] = trim((string) ($fields['learning_outcomes'] ?? ''));
        $words = preg_split('/\s+/', $fields['detailed_report'], -1, PREG_SPLIT_NO_EMPTY);
        if (!$fields['email_address'] || !$fields['coordinators'] || !$fields['department'] || !$fields['event_type'] || !$fields['event_date'] || !$fields['batch'] || !$fields['participants_count'] || !$fields['learning_outcomes'] || count($words) < 300 || count($words) > 400) return $this->respondValidationError(['report' => 'Complete all required fields, including Learning Outcomes, and keep the detailed report between 300 and 400 words.']);
        $photoPaths = [];
        for ($i = 1; $i <= 4; $i++) {
            $photoPaths[$i] = $fields['photo' . $i . '_path'] ?? null;
            $file = $this->request->getFile('photo' . $i);
            if ($file && $file->isValid() && !$file->hasMoved()) {
                if (!in_array($file->getMimeType(), ['image/jpeg', 'image/png', 'image/webp'], true) || $file->getSizeByUnit('mb') > 8) return $this->respondValidationError(['photo' . $i => 'Photos must be JPG, PNG, or WebP and no larger than 8 MB.']);
                $directory = WRITEPATH . 'uploads/event-reports';
                if (!is_dir($directory)) mkdir($directory, 0755, true);
                $safeName = bin2hex(random_bytes(12)) . '.' . strtolower($file->getExtension());
                $file->move($directory, $safeName);
                $photoPaths[$i] = rtrim(base_url(), '/') . '/api/event-report-photo/' . rawurlencode($safeName);
            }
        }
        $photos = [];
        for ($i = 1; $i <= 4; $i++) $photos[] = ['path' => $photoPaths[$i], 'caption' => trim((string) ($fields['caption' . $i] ?? ''))];
        $data = ['event_id' => (int) $eventId, 'email_address' => $fields['email_address'], 'coordinators' => $fields['coordinators'], 'department' => $fields['department'], 'event_type' => $fields['event_type'], 'event_date' => $fields['event_date'], 'speaker_name' => $fields['speaker_name'], 'speaker_uid' => $fields['speaker_uid'], 'batch' => $fields['batch'], 'participants_count' => $fields['participants_count'], 'detailed_report' => $fields['detailed_report'], 'learning_outcomes' => $fields['learning_outcomes'], 'photos_json' => json_encode($photos), 'updated_at' => date('Y-m-d H:i:s')];
        $existing = $this->db->table('event_reports')->where('event_id', (int) $eventId)->get()->getRowArray();
        if ($existing) $this->db->table('event_reports')->where('event_id', (int) $eventId)->update($data);
        else { $data['created_at'] = date('Y-m-d H:i:s'); $this->db->table('event_reports')->insert($data); }
        $album = $this->db->table('gallery_albums')->where('event_id', (int) $eventId)->get()->getRowArray();
        $albumData = ['title' => $event['title'], 'category' => $fields['event_type'], 'description' => $fields['detailed_report'], 'event_date' => $fields['event_date'], 'cover_image' => $photoPaths[1], 'photos_json' => json_encode($photos), 'event_id' => (int) $eventId, 'is_published' => 1, 'updated_at' => date('Y-m-d H:i:s')];
        if ($album) $this->db->table('gallery_albums')->where('id', $album['id'])->update($albumData);
        else { $albumData['created_at'] = date('Y-m-d H:i:s'); $this->db->table('gallery_albums')->insert($albumData); }
        return $this->respondSuccess([], 'Event report saved and gallery album created');
    }

    /**
     * CMS: Gallery Albums Management
     */
    public function getGallery()
    {
        $gallery = $this->db->table('gallery_albums')->select('id, title, category, cover_image, description, event_date, is_published, created_at, updated_at, photos_json')->orderBy('id', 'DESC')->get()->getResultArray();
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

    // ── Donation Campaigns CMS ────────────────────────────────────────────

    /**
     * Get all donation campaigns (admin view — includes unpublished)
     */
    public function getDonationCampaigns()
    {
        $campaigns = $this->db->table('donation_campaigns')
            ->orderBy('created_at', 'DESC')
            ->get()->getResultArray();

        // Attach donation count + total raised for each campaign
        foreach ($campaigns as &$c) {
            $stats = $this->db->table('donations')
                ->select('COUNT(*) as total_donors, COALESCE(SUM(amount), 0) as total_raised')
                ->where('campaign_id', $c['id'])
                ->where('status', 'completed')
                ->get()->getRowArray();
            $c['total_donors'] = (int) ($stats['total_donors'] ?? 0);
            $c['raised_amount'] = (float) ($stats['total_raised'] ?? 0);
        }

        return $this->respondSuccess($campaigns, 'Donation campaigns retrieved');
    }

    /**
     * Create or update a donation campaign
     */
    public function saveDonationCampaign()
    {
        $json = $this->request->getJSON(true);
        $id = $json['id'] ?? null;

        $data = [
            'title'         => $json['title'] ?? '',
            'description'   => $json['description'] ?? '',
            'target_amount' => (float) ($json['target_amount'] ?? 0),
            'cover_image'   => $json['cover_image'] ?? null,
            'category'      => $json['category'] ?? 'General',
            'start_date'    => !empty($json['start_date']) ? $json['start_date'] : date('Y-m-d'),
            'end_date'      => !empty($json['end_date']) ? $json['end_date'] : null,
            'is_published'  => isset($json['is_published']) ? (int) $json['is_published'] : 1,
            'is_featured'   => !empty($json['is_featured']) ? 1 : 0,
            'updated_at'    => date('Y-m-d H:i:s'),
        ];

        if ($id) {
            $this->db->table('donation_campaigns')->where('id', $id)->update($data);
        } else {
            $authUser = $this->request->authUser ?? [];
            $data['created_by'] = $authUser['id'] ?? null;
            $data['created_at'] = date('Y-m-d H:i:s');
            $this->db->table('donation_campaigns')->insert($data);
            $id = $this->db->insertID();
        }

        $authUser = $this->request->authUser ?? [];
        $this->audit((int) ($authUser['id'] ?? 0), $authUser['role'] ?? 'admin', 'donation_campaign_saved', 'donation_campaigns', (string) $id, "Campaign saved: " . ($data['title'] ?? ''));

        return $this->respondSuccess(['id' => $id], 'Donation campaign saved');
    }

    /**
     * Delete a donation campaign
     */
    public function deleteDonationCampaign($id)
    {
        $this->db->table('donation_campaigns')->where('id', $id)->delete();
        $authUser = $this->request->authUser ?? [];
        $this->audit((int) ($authUser['id'] ?? 0), $authUser['role'] ?? 'admin', 'donation_campaign_deleted', 'donation_campaigns', (string) $id, "Campaign deleted");
        return $this->respondSuccess([], 'Donation campaign deleted');
    }

    /**
     * Get all donations for admin (optionally filtered by campaign_id)
     */
    public function getDonations()
    {
        $builder = $this->db->table('donations')
            ->select('donations.*, donation_campaigns.title as campaign_title')
            ->join('donation_campaigns', 'donation_campaigns.id = donations.campaign_id', 'left')
            ->orderBy('donations.created_at', 'DESC');

        $campaignId = $this->request->getGet('campaign_id');
        if (!empty($campaignId)) {
            $builder->where('donations.campaign_id', $campaignId);
        }

        $donations = $builder->get()->getResultArray();
        return $this->respondSuccess($donations, 'Donations retrieved');
    }
}
