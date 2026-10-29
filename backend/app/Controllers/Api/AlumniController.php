<?php

namespace App\Controllers\Api;

use App\Controllers\BaseController;
use App\Traits\ApiResponseTrait;

class AlumniController extends BaseController
{
    use ApiResponseTrait;

    protected $db;

    public function __construct()
    {
        $this->db = \Config\Database::connect();
    }

    /**
     * Get Alumni Own Profile
     */
    public function getProfile()
    {
        $authUser = $this->request->authUser;
        $profile = $this->db->table('alumni_profiles')
            ->select('alumni_profiles.*, users.email, users.verification_status, users.status')
            ->join('users', 'users.id = alumni_profiles.user_id')
            ->where('alumni_profiles.user_id', $authUser['id'])
            ->get()->getRowArray();

        if (!$profile) {
            return $this->respondError('Profile not found', 404);
        }

        $profile['educations'] = $this->db->table('user_educations')
            ->where('user_id', $authUser['id'])
            ->orderBy('id', 'ASC')
            ->get()->getResultArray();

        return $this->respondSuccess($profile, 'Profile retrieved');
    }

    /**
     * Update Alumni Profile
     */
    public function updateProfile()
    {
        $authUser = $this->request->authUser;
        $json = $this->request->getJSON(true);

        $allowedFields = [
            'first_name', 'last_name', 'phone', 'alt_email', 'current_company',
            'current_designation', 'industry', 'experience_years', 'location_city',
            'location_country', 'bio', 'skills', 'linkedin_url', 'github_url',
            'twitter_url', 'website_url', 'profile_photo', 'is_mentor',
            'mentorship_topics', 'is_public_profile', 'show_email_public', 'show_phone_public',
            // current status (higher study / job) + conditional details
            'current_status', 'study_institution', 'study_course', 'study_location',
            'job_type', 'job_organization', 'job_designation', 'job_location',
            // academic record (verified by admin, lekin alumni edit request bhej sakta hai)
            'enrollment_no', 'degree', 'department', 'batch_year', 'graduation_year',
            'date_of_birth',
        ];

        $updateData = [];
        foreach ($allowedFields as $field) {
            if (isset($json[$field])) {
                $updateData[$field] = $json[$field];
            }
        }
        if (isset($updateData['department']) && !in_array($updateData['department'], \App\Libraries\DepartmentCatalog::ALL, true)) {
            return $this->respondValidationError(['department' => 'Please select a department from the department list']);
        }

        // DP photo validation (base64 data-url ya https URL, max ~2MB for base64)
        if (isset($updateData['profile_photo']) && is_string($updateData['profile_photo']) && $updateData['profile_photo'] !== '') {
            $isDataUrl = (bool)preg_match('#^data:image/(jpeg|jpg|png|webp);base64,#i', $updateData['profile_photo']);
            $isUrl = (bool)preg_match('#^https?://#i', $updateData['profile_photo']);
            if (!$isDataUrl && !$isUrl) {
                return $this->respondValidationError(['profile_photo' => 'Profile photo must be a JPG/PNG/WEBP image']);
            }
            if ($isDataUrl && strlen($updateData['profile_photo']) > 2800000) {
                return $this->respondValidationError(['profile_photo' => 'Profile photo is too large (max ~2MB). Please choose a smaller image.']);
            }
        }

        // current_status normalise + job_type check
        if (isset($updateData['current_status']) && !in_array($updateData['current_status'], ['higher_study', 'job', 'other'], true)) {
            return $this->respondValidationError(['current_status' => 'Invalid current status']);
        }
        if (isset($updateData['job_type']) && $updateData['job_type'] !== null && $updateData['job_type'] !== '' && !in_array($updateData['job_type'], ['private', 'government'], true)) {
            return $this->respondValidationError(['job_type' => 'Job type must be Private or Government']);
        }

        $updateData['updated_at'] = date('Y-m-d H:i:s');

        $this->db->table('alumni_profiles')->where('user_id', $authUser['id'])->update($updateData);

        // Audit Log
        $this->db->table('audit_logs')->insert([
            'user_id'       => $authUser['id'],
            'user_role'     => 'alumni',
            'action'        => 'profile_update',
            'target_module' => 'alumni_profile',
            'target_id'     => (string)$authUser['id'],
            'ip_address'    => $this->request->getIPAddress(),
            'user_agent'    => $this->request->getUserAgent()->getAgentString(),
            'details'       => 'Alumni updated their profile information',
            'created_at'    => date('Y-m-d H:i:s'),
        ]);

        return $this->respondSuccess($updateData, 'Profile updated successfully');
    }

    /**
     * Get Digital Alumni ID Card
     */
    public function getIdCard()
    {
        $authUser = $this->request->authUser;
        $card = $this->db->table('alumni_id_cards')->where('user_id', $authUser['id'])->get()->getRowArray();
        $profile = $this->db->table('alumni_profiles')->where('user_id', $authUser['id'])->get()->getRowArray();
        $user = $this->db->table('users')->where('id', $authUser['id'])->get()->getRowArray();

        if (!$card) {
            // Auto generate card — card_number hamesha Alumni ID (AUAA + AUID) hota hai
            $alumniId = $profile['alumni_id'] ?? null;
            if (empty($alumniId)) {
                $auid = $profile['auid'] ?? null;
                if (empty($auid)) {
                    $auid = str_pad((string)random_int(0, 999999999), 9, '0', STR_PAD_LEFT);
                    $this->db->table('alumni_profiles')->where('user_id', $authUser['id'])->update([
                        'auid'       => $auid,
                        'updated_at' => date('Y-m-d H:i:s'),
                    ]);
                    $profile['auid'] = $auid;
                }
                $alumniId = 'AUAA' . $auid;
                $this->db->table('alumni_profiles')->where('user_id', $authUser['id'])->update([
                    'alumni_id'  => $alumniId,
                    'updated_at' => date('Y-m-d H:i:s'),
                ]);
                $profile['alumni_id'] = $alumniId;
            }
            $baseUrl = rtrim((string)($_ENV['FRONTEND_URL'] ?? getenv('FRONTEND_URL') ?: 'http://localhost:5173'), '/');
            $card = [
                'user_id'     => $authUser['id'],
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
            ];
            $this->db->table('alumni_id_cards')->insert($card);
        }

        return $this->respondSuccess([
            'card'    => $card,
            'profile' => $profile,
            'user'    => [
                'email'               => $user['email'],
                'verification_status' => $user['verification_status']
            ]
        ], 'Alumni ID card retrieved');
    }

    /**
     * Post a New Job by Alumni
     */
    public function postJob()
    {
        $authUser = $this->request->authUser;
        $json = $this->request->getJSON(true);

        if (empty($json['title']) || empty($json['company_name'])) {
            return $this->respondValidationError(['title' => 'Title and company name are required']);
        }

        $alumniProfile = $this->db->table('alumni_profiles')
            ->select('department')
            ->where('user_id', (int) $authUser['id'])
            ->get()->getRowArray();

        $data = [
            'title'               => $json['title'],
            'company_name'        => $json['company_name'],
            'company_logo'        => $json['company_logo'] ?? null,
            'job_type'            => $json['job_type'] ?? 'full_time',
            'location'            => $json['location'] ?? 'Remote / Hybrid',
            'experience_required' => $json['experience_required'] ?? null,
            'salary_range'        => $json['salary_range'] ?? null,
            'description'         => $json['description'] ?? '',
            'requirements'        => $json['requirements'] ?? '',
            'apply_link'          => $json['apply_link'] ?? null,
            'contact_email'       => $json['contact_email'] ?? $authUser['email'],
            'deadline'            => $json['deadline'] ?? date('Y-m-d', strtotime('+30 days')),
            'posted_by_user_id'   => $authUser['id'],
            'department'          => $alumniProfile['department'] ?? null,
            'status'              => 'pending',
            'created_at'          => date('Y-m-d H:i:s'),
            'updated_at'          => date('Y-m-d H:i:s'),
        ];

        $saved = $this->db->table('jobs')->insert($data);
        if (!$saved) {
            return $this->respondError('Job could not be submitted for review. Please try again.', 500);
        }
        $jobId = $this->db->insertID();

        return $this->respondSuccess(['id' => $jobId, 'status' => 'pending'], 'Job submitted for admin approval');
    }

    /** Jobs posted by the signed-in alumni, with their application totals. */
    public function getMyJobs()
    {
        $authUser = $this->request->authUser ?? [];
        $jobs = $this->db->table('jobs')
            ->select('jobs.*, (SELECT COUNT(*) FROM job_applications WHERE job_applications.job_id = jobs.id) AS application_count', false)
            ->where('jobs.posted_by_user_id', (int) ($authUser['id'] ?? 0))
            ->where('jobs.deleted_at IS NULL', null, false)
            ->orderBy('jobs.created_at', 'DESC')
            ->get()->getResultArray();
        return $this->respondSuccess($jobs, 'Your job postings retrieved');
    }

    /** Alumni may view applicants only for a job they personally posted. */
    public function getMyJobApplications($jobId)
    {
        $authUser = $this->request->authUser ?? [];
        $job = $this->db->table('jobs')->select('id, title, company_name, status, posted_by_user_id')
            ->where('id', (int) $jobId)->where('deleted_at IS NULL', null, false)->get()->getRowArray();
        if (!$job) return $this->respondError('Job posting not found.', 404);
        if ((int) ($job['posted_by_user_id'] ?? 0) !== (int) ($authUser['id'] ?? 0)) {
            return $this->respondError('You can only view applicants for jobs you posted.', 403);
        }
        $applicants = $this->jobApplicantRows((int) $jobId);
        return $this->respondSuccess(['job' => $job, 'applicants' => $applicants], 'Job applicants retrieved');
    }

    private function jobApplicantRows(int $jobId): array
    {
        $rows = $this->db->table('job_applications')
            ->select("job_applications.id, job_applications.created_at AS applied_at, users.id AS user_id, users.email, users.role,
                COALESCE(NULLIF(CONCAT(alumni_profiles.first_name, ' ', alumni_profiles.last_name), ' '), NULLIF(CONCAT(student_profiles.first_name, ' ', student_profiles.last_name), ' '), users.email) AS name,
                COALESCE(alumni_profiles.phone, student_profiles.phone) AS contact_number,
                CASE WHEN users.role = 'alumni' THEN COALESCE(alumni_profiles.auid, alumni_profiles.alumni_id) ELSE student_profiles.enrollment_no END AS uid", false)
            ->join('users', 'users.id = job_applications.user_id')
            ->join('alumni_profiles', 'alumni_profiles.user_id = users.id', 'left')
            ->join('student_profiles', 'student_profiles.user_id = users.id', 'left')
            ->where('job_applications.job_id', $jobId)
            ->orderBy('job_applications.created_at', 'ASC')
            ->get()->getResultArray();
        return array_map(static function (array $row): array {
            $row['member_type'] = ucfirst((string) $row['role']);
            return $row;
        }, $rows);
    }

    /**
     * Get Mentorship Requests for Alumni Mentor
     */
    public function getMentorshipRequests()
    {
        $authUser = $this->request->authUser;
        $requests = $this->db->table('mentorship_programs')
            ->select('mentorship_programs.*, student_profiles.first_name as mentee_first_name, student_profiles.last_name as mentee_last_name,
                student_profiles.degree, student_profiles.department, student_profiles.current_year, student_profiles.semester,
                student_profiles.enrollment_no, student_profiles.phone as mentee_phone, users.email as mentee_email')
            ->join('student_profiles', 'student_profiles.user_id = mentorship_programs.mentee_user_id')
            ->join('users', 'users.id = mentorship_programs.mentee_user_id')
            ->where('mentorship_programs.mentor_user_id', $authUser['id'])
            ->orderBy('mentorship_programs.created_at', 'DESC')
            ->get()->getResultArray();

        return $this->respondSuccess($requests, 'Mentorship requests retrieved');
    }

    /**
     * Respond to Mentorship Request (Accept / Complete / Reject)
     */
    public function updateMentorshipStatus($id)
    {
        $authUser = $this->request->authUser;
        $json = $this->request->getJSON(true);
        $status = $json['status'] ?? 'accepted';

        $data = [
            'status'     => $status,
            'notes'      => $json['notes'] ?? null,
            'updated_at' => date('Y-m-d H:i:s'),
        ];

        if ($status === 'accepted') {
            $data['accepted_at'] = date('Y-m-d H:i:s');
        } elseif ($status === 'completed') {
            $data['completed_at'] = date('Y-m-d H:i:s');
        }

        $this->db->table('mentorship_programs')
            ->where('id', $id)
            ->where('mentor_user_id', $authUser['id'])
            ->update($data);

        return $this->respondSuccess([], 'Mentorship status updated');
    }
}
