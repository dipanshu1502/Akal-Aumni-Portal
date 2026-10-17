<?php

namespace App\Controllers\Api;

use App\Controllers\BaseController;
use App\Libraries\JwtService;
use App\Traits\ApiResponseTrait;

class AuthController extends BaseController
{
    use ApiResponseTrait;

    protected $db;

    public function __construct()
    {
        $this->db = \Config\Database::connect();
    }

    /**
     * User Login (Supports Public, Student, Alumni, Admin, Super Admin)
     */
    public function login()
    {
        $json = $this->request->getJSON(true);
        $email = trim($json['email'] ?? '');
        $password = $json['password'] ?? '';

        if (empty($email) || empty($password)) {
            return $this->respondValidationError(['email' => 'Email is required', 'password' => 'Password is required']);
        }

        $user = $this->db->table('users')->where('email', $email)->get()->getRowArray();

        if (!$user || !password_verify($password, $user['password_hash'])) {
            return $this->respondError('Invalid email or password credentials', 401);
        }

        if ($user['status'] === 'suspended') {
            return $this->respondError('Account has been suspended. Please contact the Alumni Office.', 403);
        }

        // Fetch profile details
        $profile = null;
        $permissions = [];
        if ($user['role'] === 'alumni') {
            $profile = $this->db->table('alumni_profiles')->where('user_id', $user['id'])->get()->getRowArray();
        } elseif ($user['role'] === 'student') {
            $profile = $this->db->table('student_profiles')->where('user_id', $user['id'])->get()->getRowArray();
        } elseif ($user['role'] === 'admin' || $user['role'] === 'superadmin') {
            $profile = $this->db->table('admin_profiles')->where('user_id', $user['id'])->get()->getRowArray();
            if ($user['role'] === 'superadmin') {
                $permissions = ['all' => true];
            } elseif ($profile && !empty($profile['permissions'])) {
                $permissions = \App\Filters\PermissionFilter::normalize($profile['permissions']);
            }
        }

        $tokenPayload = [
            'id'                  => (int)$user['id'],
            'email'               => $user['email'],
            'role'                => $user['role'],
            'verification_status' => $user['verification_status']
        ];

        $token = JwtService::generateToken($tokenPayload);

        // Academic history at Akal University (UG / PG / PhD ...)
        $educations = $this->db->table('user_educations')
            ->where('user_id', $user['id'])
            ->orderBy('id', 'ASC')
            ->get()->getResultArray();

        // Audit Log
        $this->db->table('audit_logs')->insert([
            'user_id'       => $user['id'],
            'user_role'     => $user['role'],
            'action'        => 'user_login',
            'target_module' => 'auth',
            'target_id'     => (string)$user['id'],
            'ip_address'    => $this->request->getIPAddress(),
            'user_agent'    => $this->request->getUserAgent()->getAgentString(),
            'details'       => 'User logged in successfully',
            'created_at'    => date('Y-m-d H:i:s'),
        ]);

        return $this->respondSuccess([
            'token'   => $token,
            'user'    => [
                'id'                  => (int)$user['id'],
                'email'               => $user['email'],
                'role'                => $user['role'],
                'status'              => $user['status'],
                'verification_status' => $user['verification_status'],
            ],
            'profile' => $profile,
            'educations' => $educations,
            'permissions' => $permissions
        ], 'Login successful');
    }

    /**
     * User Registration (Alumni or Student)
     */
    public function register()
    {
        $json = $this->request->getJSON(true);
        if (!is_array($json)) {
            $json = [];
        }

        $email = trim($json['email'] ?? '');
        $password = $json['password'] ?? '';
        $role = $json['role'] ?? 'alumni';
        $firstName = trim($json['first_name'] ?? '');
        $lastName = trim($json['last_name'] ?? '');

        if (empty($email) || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
            return $this->respondValidationError(['email' => 'A valid email address is required']);
        }
        if (strlen($password) < 6) {
            return $this->respondValidationError(['password' => 'Password must be at least 6 characters']);
        }
        if (empty($firstName)) {
            return $this->respondValidationError(['first_name' => 'First name is required']);
        }

        // --- AUID: exactly 9 digits, unique (mandatory for alumni) ---
        $auid = trim((string)($json['auid'] ?? ''));
        if ($role !== 'student') {
            if ($auid === '' || !preg_match('/^[0-9]{9}$/', $auid)) {
                return $this->respondValidationError(['auid' => 'AUID must be exactly 9 digits (e.g. 202401234)']);
            }
            $auidExists = $this->db->table('alumni_profiles')->where('auid', $auid)->get()->getRow();
            if ($auidExists) {
                return $this->respondValidationError(['auid' => 'This AUID is already registered']);
            }
        } elseif ($auid !== '' && !preg_match('/^[0-9]{9}$/', $auid)) {
            return $this->respondValidationError(['auid' => 'AUID must be exactly 9 digits']);
        }

        // --- Current status: higher_study / job / other + conditional details ---
        $currentStatus = trim((string)($json['current_status'] ?? ''));
        if ($role !== 'student' && !in_array($currentStatus, ['higher_study', 'job', 'other'], true)) {
            return $this->respondValidationError(['current_status' => 'Please select what you are currently doing (Higher Study / Job / Other)']);
        }
        // job_type: private / government (sirf job walo ke liye mandatory)
        $jobType = trim((string)($json['job_type'] ?? ''));
        if ($role !== 'student' && $currentStatus === 'job' && !in_array($jobType, ['private', 'government'], true)) {
            return $this->respondValidationError(['job_type' => 'Please select Private or Government job']);
        }
        // higher study details mandatory
        if ($role !== 'student' && $currentStatus === 'higher_study' && trim((string)($json['study_institution'] ?? '')) === '') {
            return $this->respondValidationError(['study_institution' => 'Please enter where you are doing higher studies (institution name)']);
        }

        // --- Profile photo (DP): base64 data-url ya https URL, max ~2MB for base64 ---
        $profilePhoto = $json['profile_photo'] ?? null;
        if (is_string($profilePhoto) && $profilePhoto !== '') {
            $isDataUrl = (bool)preg_match('#^data:image/(jpeg|jpg|png|webp);base64,#i', $profilePhoto);
            $isUrl = (bool)preg_match('#^https?://#i', $profilePhoto);
            if (!$isDataUrl && !$isUrl) {
                return $this->respondValidationError(['profile_photo' => 'Profile photo must be a JPG/PNG/WEBP image']);
            }
            if ($isDataUrl && strlen($profilePhoto) > 2800000) {
                return $this->respondValidationError(['profile_photo' => 'Profile photo is too large (max ~2MB). Please choose a smaller image.']);
            }
        } else {
            $profilePhoto = null;
        }

        // Validate every degree/programme (UG / PG / PhD ...) done at Akal University
        [$educations, $educationErrors] = $this->sanitizeEducations($json['educations'] ?? []);
        if (!empty($educationErrors)) {
            return $this->respondValidationError(
                $educationErrors,
                'Please complete all your Akal University education details (UG / PG / PhD)'
            );
        }

        // Highest degree (PhD > PG > UG > Diploma > Other) drives the legacy profile columns
        $primary = $this->primaryEducation($educations);
        $batchYear = $this->buildBatchYear($primary);

        // Check if email already registered
        $existing = $this->db->table('users')->where('email', $email)->get()->getRow();
        if ($existing) {
            return $this->respondError('Email is already registered. Please login instead.', 409);
        }

        // Auto-require verification for alumni based on settings
        $settingsCheck = $this->db->table('system_settings')->where('setting_key', 'require_alumni_verification')->get()->getRow();
        $requireVerification = $settingsCheck ? ($settingsCheck->setting_value === '1') : true;

        $verificationStatus = ($role === 'alumni' && $requireVerification) ? 'pending' : 'verified';
        $userStatus = 'active';

        $this->db->transBegin();

        $this->db->table('users')->insert([
            'email'               => $email,
            'password_hash'       => password_hash($password, PASSWORD_BCRYPT),
            'role'                => $role === 'student' ? 'student' : 'alumni',
            'status'              => $userStatus,
            'verification_status' => $verificationStatus,
            'created_at'          => date('Y-m-d H:i:s'),
            'updated_at'          => date('Y-m-d H:i:s'),
        ]);

        $userId = $this->db->insertID();

        if ($role === 'alumni') {
            // Alumni ID = AUAA + AUID (e.g. AUAA202401234)
            $alumniId = 'AUAA' . $auid;
            $strOrNull = static function ($v) {
                $v = is_string($v) ? trim($v) : $v;
                return ($v === '' || $v === null) ? null : $v;
            };
            $this->db->table('alumni_profiles')->insert([
                'user_id'             => $userId,
                'first_name'          => $firstName,
                'last_name'           => $lastName,
                'auid'                => $auid,
                'alumni_id'           => $alumniId,
                'enrollment_no'       => $primary['enrollment_no'] !== '' ? $primary['enrollment_no'] : ($json['enrollment_no'] ?? null),
                'degree'              => $primary['degree_name'],
                'department'          => $primary['department'],
                'batch_year'          => $batchYear,
                'graduation_year'     => $primary['end_year'] ?: null,
                'phone'               => $strOrNull($json['phone'] ?? null),
                'current_company'     => $currentStatus === 'job' ? $strOrNull(($json['job_organization'] ?? '') !== '' ? $json['job_organization'] : ($json['current_company'] ?? null)) : $strOrNull($json['current_company'] ?? null),
                'current_designation' => $currentStatus === 'job' ? $strOrNull(($json['job_designation'] ?? '') !== '' ? $json['job_designation'] : ($json['current_designation'] ?? null)) : $strOrNull($json['current_designation'] ?? null),
                'current_status'      => $currentStatus !== '' ? $currentStatus : null,
                'study_institution'   => $strOrNull($json['study_institution'] ?? null),
                'study_course'        => $strOrNull($json['study_course'] ?? null),
                'study_location'      => $strOrNull($json['study_location'] ?? null),
                'job_type'            => $jobType !== '' ? $jobType : null,
                'job_organization'    => $strOrNull($json['job_organization'] ?? null),
                'job_designation'     => $strOrNull($json['job_designation'] ?? null),
                'job_location'        => $strOrNull($json['job_location'] ?? null),
                'location_city'       => $strOrNull($json['location_city'] ?? null),
                'location_country'    => $strOrNull($json['location_country'] ?? null) ?? 'India',
                'bio'                 => $strOrNull($json['bio'] ?? null),
                'skills'              => $strOrNull($json['skills'] ?? null),
                'linkedin_url'        => $strOrNull($json['linkedin_url'] ?? null),
                'profile_photo'       => $profilePhoto,
                'is_mentor'           => !empty($json['is_mentor']) ? 1 : 0,
                'mentorship_topics'   => $strOrNull($json['mentorship_topics'] ?? null),
                'is_public_profile'   => 1,
                'created_at'          => date('Y-m-d H:i:s'),
                'updated_at'          => date('Y-m-d H:i:s'),
            ]);

            // If verified immediately, generate card (card_number = Alumni ID = AUAA + AUID)
            if ($verificationStatus === 'verified') {
                $baseUrl = rtrim((string)($_ENV['FRONTEND_URL'] ?? getenv('FRONTEND_URL') ?: 'http://localhost:5173'), '/');
                $this->db->table('alumni_id_cards')->insert([
                    'user_id'     => $userId,
                    'card_number' => $alumniId,
                    'issue_date'  => date('Y-m-d'),
                    'expiry_date' => date('Y-m-d', strtotime('+5 years')),
                    'qr_payload'  => json_encode([
                        'alumni_id'   => $alumniId,
                        'auid'        => $auid,
                        'name'        => "$firstName $lastName",
                        'status'      => 'VERIFIED',
                        // QR scan -> public profile page
                        'profile_url' => $baseUrl . '/alumni/' . $alumniId,
                    ]),
                    'status'      => 'active',
                    'created_at'  => date('Y-m-d H:i:s'),
                    'updated_at'  => date('Y-m-d H:i:s'),
                ]);
            }
        } else {
            $this->db->table('student_profiles')->insert([
                'user_id'          => $userId,
                'first_name'       => $firstName,
                'last_name'        => $lastName,
                'enrollment_no'    => $primary['enrollment_no'] !== '' ? $primary['enrollment_no'] : ($json['enrollment_no'] ?? null),
                'degree'           => $primary['degree_name'],
                'department'       => $primary['department'],
                'current_year'     => !empty($json['current_year']) ? (int)$json['current_year'] : 1,
                'semester'         => !empty($json['semester']) ? (int)$json['semester'] : 1,
                'phone'            => $json['phone'] ?? null,
                'bio'              => $json['bio'] ?? null,
                'career_interests' => $json['career_interests'] ?? null,
                'linkedin_url'     => $json['linkedin_url'] ?? null,
                'created_at'       => date('Y-m-d H:i:s'),
                'updated_at'       => date('Y-m-d H:i:s'),
            ]);
        }

        // Store every education detail (UG / PG / PhD / Diploma) at Akal University
        foreach ($educations as $education) {
            $this->db->table('user_educations')->insert([
                'user_id'         => $userId,
                'education_level' => $education['education_level'],
                'degree_name'     => $education['degree_name'],
                'department'      => $education['department'],
                'specialization'  => $education['specialization'],
                'enrollment_no'   => $education['enrollment_no'],
                'start_year'      => $education['start_year'],
                'end_year'        => $education['end_year'],
                'status'          => $education['status'],
                'grade'           => $education['grade'],
                'research_title'  => $education['research_title'],
                'created_at'      => date('Y-m-d H:i:s'),
                'updated_at'      => date('Y-m-d H:i:s'),
            ]);
        }

        if ($this->db->transStatus() === false) {
            $this->db->transRollback();
            return $this->respondError('Registration failed. Please try again.', 500);
        }
        $this->db->transCommit();

        $tokenPayload = [
            'id'                  => (int)$userId,
            'email'               => $email,
            'role'                => $role === 'student' ? 'student' : 'alumni',
            'verification_status' => $verificationStatus
        ];

        $token = JwtService::generateToken($tokenPayload);

        return $this->respondSuccess([
            'token'               => $token,
            'user'                => [
                'id'                  => (int)$userId,
                'email'               => $email,
                'role'                => $role === 'student' ? 'student' : 'alumni',
                'status'              => $userStatus,
                'verification_status' => $verificationStatus,
            ],
            'educations'          => $educations,
            'verification_status' => $verificationStatus
        ], 'Registration completed successfully' . ($verificationStatus === 'pending' ? ' (Pending verification by admin)' : ''));
    }

    /**
     * Validate & normalise every Akal University education entry (UG / PG / PhD ...)
     *
     * @return array{0: array, 1: array} [clean educations, validation errors]
     */
    private function sanitizeEducations($raw): array
    {
        if (!is_array($raw) || count($raw) === 0) {
            return [[], ['educations' => 'Please add at least one education detail (UG / PG / PhD) from Akal University']];
        }

        $levelAliases = [
            'UG'             => 'UG',
            'UNDERGRADUATE'  => 'UG',
            'BACHELOR'       => 'UG',
            'BACHELORS'      => 'UG',
            'PG'             => 'PG',
            'POSTGRADUATE'   => 'PG',
            'POST GRADUATE'  => 'PG',
            'MASTER'         => 'PG',
            'MASTERS'        => 'PG',
            'PHD'            => 'PhD',
            'PH.D'           => 'PhD',
            'DOCTORATE'      => 'PhD',
            'DOCTORAL'       => 'PhD',
            'DIPLOMA'        => 'Diploma',
            'CERTIFICATE'    => 'Diploma',
            'OTHER'          => 'Other',
        ];

        $errors = [];
        $clean  = [];

        foreach (array_values($raw) as $index => $entry) {
            $ref = 'educations.' . ($index + 1);

            if (!is_array($entry)) {
                $errors[$ref] = 'Invalid education entry';
                continue;
            }

            $level = $levelAliases[strtoupper(trim((string) ($entry['education_level'] ?? '')))] ?? null;
            if ($level === null) {
                $errors[$ref . '.education_level'] = 'Education level (UG / PG / PhD) is required';
                continue;
            }

            $degreeName    = trim(strip_tags((string) ($entry['degree_name'] ?? $entry['degree'] ?? '')));
            $department    = trim(strip_tags((string) ($entry['department'] ?? '')));
            $specialization = trim(strip_tags((string) ($entry['specialization'] ?? '')));
            $enrollmentNo  = trim(strip_tags((string) ($entry['enrollment_no'] ?? '')));
            $grade         = trim(strip_tags((string) ($entry['grade'] ?? '')));
            $researchTitle = trim(strip_tags((string) ($entry['research_title'] ?? '')));

            $status = strtolower(trim((string) ($entry['status'] ?? 'completed')));
            if ($status === 'pursuing') {
                $status = 'ongoing';
            }
            if (!in_array($status, ['completed', 'ongoing'], true)) {
                $errors[$ref . '.status'] = 'Status must be Completed or Pursuing';
                continue;
            }

            $startYear = (int) ($entry['start_year'] ?? 0);
            $endYear   = (int) ($entry['end_year'] ?? 0);

            if ($degreeName === '') {
                $errors[$ref . '.degree_name'] = 'Degree / programme name is required';
            } elseif (mb_strlen($degreeName) > 150) {
                $errors[$ref . '.degree_name'] = 'Degree / programme name is too long';
            }
            if ($department === '') {
                $errors[$ref . '.department'] = 'Department / discipline is required';
            } elseif (mb_strlen($department) > 100) {
                $errors[$ref . '.department'] = 'Department name is too long';
            }
            if ($startYear < 1950 || $startYear > 2100) {
                $errors[$ref . '.start_year'] = 'Starting year is required';
            }
            if ($status === 'completed' && ($endYear < 1950 || $endYear > 2100)) {
                $errors[$ref . '.end_year'] = 'Completion year is required for completed courses';
            }
            if ($startYear && $endYear && $endYear < $startYear) {
                $errors[$ref . '.end_year'] = 'Completion year cannot be before the starting year';
            }

            $clean[] = [
                'education_level' => $level,
                'degree_name'     => mb_substr($degreeName, 0, 150),
                'department'      => mb_substr($department, 0, 100),
                'specialization'  => mb_substr($specialization, 0, 150),
                'enrollment_no'   => mb_substr($enrollmentNo, 0, 50),
                'start_year'      => $startYear,
                'end_year'        => ($endYear >= 1950 && $endYear <= 2100) ? $endYear : null,
                'status'          => $status,
                'grade'           => mb_substr($grade, 0, 30),
                'research_title'  => mb_substr($researchTitle, 0, 255),
            ];
        }

        return [$clean, $errors];
    }

    /**
     * Return the highest degree (PhD > PG > UG > Diploma > Other) from the list
     */
    private function primaryEducation(array $educations): array
    {
        $priority = ['PhD' => 4, 'PG' => 3, 'UG' => 2, 'Diploma' => 1, 'Other' => 0];

        $primary = $educations[0];
        foreach ($educations as $education) {
            if (($priority[$education['education_level']] ?? 0) > ($priority[$primary['education_level']] ?? 0)) {
                $primary = $education;
            }
        }

        return $primary;
    }

    /**
     * Build the legacy batch label, e.g. "2020-2024" or "2023-Pursuing"
     */
    private function buildBatchYear(array $education): string
    {
        $start = $education['start_year'] ?: '';

        if (!empty($education['end_year'])) {
            return $start . '-' . $education['end_year'];
        }

        if ($education['status'] === 'ongoing') {
            return $start !== '' ? $start . '-Pursuing' : 'Pursuing';
        }

        return (string) $start;
    }

    /**
     * Get Current Authenticated User & Profile
     */
    public function me()
    {
        $authUser = $this->request->authUser ?? null;
        if (!$authUser) {
            return $this->respondError('Not authenticated', 401);
        }

        $user = $this->db->table('users')->where('id', $authUser['id'])->get()->getRowArray();
        if (!$user) {
            return $this->respondError('User not found', 404);
        }

        unset($user['password_hash']);

        $profile = null;
        $permissions = [];
        if ($user['role'] === 'alumni') {
            $profile = $this->db->table('alumni_profiles')->where('user_id', $user['id'])->get()->getRowArray();
        } elseif ($user['role'] === 'student') {
            $profile = $this->db->table('student_profiles')->where('user_id', $user['id'])->get()->getRowArray();
        } elseif ($user['role'] === 'admin' || $user['role'] === 'superadmin') {
            $profile = $this->db->table('admin_profiles')->where('user_id', $user['id'])->get()->getRowArray();
            if ($user['role'] === 'superadmin') {
                $permissions = ['all' => true];
            } elseif ($profile && !empty($profile['permissions'])) {
                $permissions = \App\Filters\PermissionFilter::normalize($profile['permissions']);
            }
        }

        $educations = $this->db->table('user_educations')
            ->where('user_id', $user['id'])
            ->orderBy('id', 'ASC')
            ->get()->getResultArray();

        return $this->respondSuccess([
            'user'    => $user,
            'profile' => $profile,
            'educations' => $educations,
            'permissions' => $permissions
        ]);
    }
}
