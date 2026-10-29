<?php

namespace App\Database\Seeds;

use App\Libraries\DepartmentCatalog;
use CodeIgniter\Database\Seeder;

class DepartmentDemoSeeder extends Seeder
{
    private const DEMO_PASSWORD = 'Demo@12345';

    public function run()
    {
        $db = \Config\Database::connect();
        $now = date('Y-m-d H:i:s');
        $permissions = json_encode([
            'verify_alumni' => true,
            'manage_alumni' => true,
            'manage_students' => true,
            'view_reports' => true,
            'manage_jobs' => true,
        ]);
        $totals = ['admins' => 0, 'alumni' => 0, 'students' => 0, 'events' => 0, 'registrations' => 0, 'mentorships' => 0];

        $db->transBegin();
        try {
            foreach (DepartmentCatalog::ALL as $departmentIndex => $department) {
                $slug = strtolower(trim(preg_replace('/[^A-Za-z0-9]+/', '-', $department), '-'));

                $admin = $db->table('users')
                    ->select('users.id, users.email')
                    ->join('admin_profiles', 'admin_profiles.user_id = users.id')
                    ->where('users.role', 'admin')
                    ->where('admin_profiles.department', $department)
                    ->orderBy('users.id', 'ASC')
                    ->get()->getRowArray();
                if (!$admin) {
                    $email = $this->availableEmail($db, 'demo.admin.' . $slug);
                    $db->table('users')->insert([
                        'email' => $email,
                        'password_hash' => password_hash(self::DEMO_PASSWORD, PASSWORD_BCRYPT),
                        'role' => 'admin',
                        'status' => 'active',
                        'verification_status' => 'verified',
                        'created_at' => $now,
                        'updated_at' => $now,
                    ]);
                    $adminId = (int) $db->insertID();
                    $db->table('admin_profiles')->insert([
                        'user_id' => $adminId,
                        'full_name' => 'Demo ' . $department . ' Admin',
                        'department' => $department,
                        'designation' => 'Department Admin',
                        'permissions' => $permissions,
                        'created_at' => $now,
                        'updated_at' => $now,
                    ]);
                    $admin = ['id' => $adminId, 'email' => $email];
                    $totals['admins']++;
                }
                $adminId = (int) $admin['id'];

                $student = $this->findProfileUser($db, 'student', 'demo.student.' . $slug . '@akaluniversity.ac.in', 'student_profiles', $department);
                if (!$student) {
                    $email = $this->availableEmail($db, 'demo.student.' . $slug);
                    $db->table('users')->insert([
                        'email' => $email,
                        'password_hash' => password_hash(self::DEMO_PASSWORD, PASSWORD_BCRYPT),
                        'role' => 'student',
                        'status' => 'active',
                        'verification_status' => 'verified',
                        'created_at' => $now,
                        'updated_at' => $now,
                    ]);
                    $studentId = (int) $db->insertID();
                    $studentName = 'Demo Student ' . str_pad((string) ($departmentIndex + 1), 2, '0', STR_PAD_LEFT);
                    $studentPhone = $this->phoneNumber($departmentIndex, 0);
                    $db->table('student_profiles')->insert([
                        'user_id' => $studentId,
                        'first_name' => $studentName,
                        'last_name' => 'Akal',
                        'enrollment_no' => 'DEMO-STU-' . str_pad((string) ($departmentIndex + 1), 3, '0', STR_PAD_LEFT),
                        'degree' => 'Undergraduate Programme in ' . $department,
                        'department' => $department,
                        'current_year' => 2,
                        'semester' => 4,
                        'phone' => $studentPhone,
                        'bio' => '[DEMO] Student profile for department dashboard preview.',
                        'career_interests' => 'Mentorship, internships, and career development',
                        'created_at' => $now,
                        'updated_at' => $now,
                    ]);
                    $student = ['id' => $studentId, 'email' => $email, 'first_name' => $studentName, 'last_name' => 'Akal', 'phone' => $studentPhone];
                    $totals['students']++;
                }
                $studentId = (int) $student['id'];
                if ($db->table('user_educations')->where('user_id', $studentId)->countAllResults() === 0) {
                    $db->table('user_educations')->insert([
                        'user_id' => $studentId,
                        'education_level' => 'UG',
                        'degree_name' => 'Undergraduate Programme in ' . $department,
                        'department' => $department,
                        'specialization' => 'Department demo profile',
                        'enrollment_no' => 'DEMO-STU-' . str_pad((string) ($departmentIndex + 1), 3, '0', STR_PAD_LEFT),
                        'start_year' => 2024,
                        'end_year' => 2028,
                        'status' => 'ongoing',
                        'created_at' => $now,
                        'updated_at' => $now,
                    ]);
                }

                $alumniUsers = [];
                $firstNames = ['Demo Amandeep', 'Demo Simran', 'Demo Gurpreet'];
                $lastNames = ['Kaur', 'Singh', 'Kaur'];
                for ($member = 1; $member <= 3; $member++) {
                    $auid = (string) (980000000 + (($departmentIndex + 1) * 10) + $member);
                    $profile = $db->table('alumni_profiles')->where('auid', $auid)->get()->getRowArray();
                    if ($profile) {
                        $existingUser = $db->table('users')->where('id', $profile['user_id'])->get()->getRowArray();
                        $alumni = $existingUser ? ['id' => (int) $existingUser['id'], 'email' => $existingUser['email']] : null;
                    } else {
                        $email = $this->availableEmail($db, 'demo.alumni.' . $slug . '.' . $member);
                        $isPending = $member === 3;
                        $db->table('users')->insert([
                            'email' => $email,
                            'password_hash' => password_hash(self::DEMO_PASSWORD, PASSWORD_BCRYPT),
                            'role' => 'alumni',
                            'status' => $isPending ? 'pending' : 'active',
                            'verification_status' => $isPending ? 'pending' : 'verified',
                            'created_at' => $now,
                            'updated_at' => $now,
                        ]);
                        $alumniId = (int) $db->insertID();
                        $name = $firstNames[$member - 1];
                        $phone = $this->phoneNumber($departmentIndex, $member);
                        $gradYear = 2018 + ($member * 2);
                        $currentStatus = $member === 2 ? 'higher_study' : 'job';
                        $jobType = $member === 1 ? 'private' : ($member === 3 ? 'government' : null);
                        $isMentor = $member === 1 ? 1 : 0;
                        $db->table('alumni_profiles')->insert([
                            'user_id' => $alumniId,
                            'first_name' => $name,
                            'last_name' => $lastNames[$member - 1],
                            'enrollment_no' => 'DEMO-ALM-' . str_pad((string) ($departmentIndex + 1), 3, '0', STR_PAD_LEFT) . '-' . $member,
                            'registration_no' => 'DEMO-REG-' . str_pad((string) ($departmentIndex + 1), 3, '0', STR_PAD_LEFT) . '-' . $member,
                            'auid' => $auid,
                            'alumni_id' => 'AUAA' . $auid,
                            'degree' => 'Degree in ' . $department,
                            'department' => $department,
                            'batch_year' => ($gradYear - 4) . '-' . $gradYear,
                            'graduation_year' => $gradYear,
                            'phone' => $phone,
                            'current_company' => $currentStatus === 'job' ? 'Demo ' . $department . ' Employer' : null,
                            'current_designation' => $currentStatus === 'job' ? ($jobType === 'government' ? 'Public Sector Officer' : 'Industry Professional') : null,
                            'current_status' => $currentStatus,
                            'study_institution' => $currentStatus === 'higher_study' ? 'Demo Graduate Research Institute' : null,
                            'study_course' => $currentStatus === 'higher_study' ? 'Advanced Studies in ' . $department : null,
                            'study_location' => $currentStatus === 'higher_study' ? 'Bathinda, India' : null,
                            'job_type' => $jobType,
                            'job_organization' => $currentStatus === 'job' ? 'Demo ' . $department . ' Employer' : null,
                            'job_designation' => $currentStatus === 'job' ? ($jobType === 'government' ? 'Public Sector Officer' : 'Industry Professional') : null,
                            'job_location' => $currentStatus === 'job' ? 'Punjab, India' : null,
                            'industry' => 'Education & ' . $department,
                            'experience_years' => max(1, 2026 - $gradYear),
                            'location_city' => 'Bathinda',
                            'location_country' => 'India',
                            'bio' => '[DEMO] Alumni profile used for department dashboard and directory previews.',
                            'skills' => 'Leadership, communication, ' . $department,
                            'is_distinguished' => $member === 2 ? 1 : 0,
                            'distinguished_title' => $member === 2 ? 'Demo Department Achievement' : null,
                            'is_mentor' => $isMentor,
                            'mentorship_topics' => $isMentor ? 'Career planning, industry guidance, ' . $department : null,
                            'is_public_profile' => 1,
                            'show_email_public' => 0,
                            'show_phone_public' => 0,
                            'verified_at' => $isPending ? null : $now,
                            'verified_by' => $isPending ? null : $adminId,
                            'created_at' => $now,
                            'updated_at' => $now,
                        ]);
                        if (!$isPending) {
                            $db->table('alumni_id_cards')->insert([
                                'user_id' => $alumniId,
                                'card_number' => 'AUAA' . $auid,
                                'issue_date' => date('Y-m-d'),
                                'expiry_date' => date('Y-m-d', strtotime('+5 years')),
                                'qr_payload' => json_encode([
                                    'alumni_id' => 'AUAA' . $auid,
                                    'auid' => $auid,
                                    'name' => $name . ' ' . $lastNames[$member - 1],
                                    'degree' => 'Degree in ' . $department,
                                    'department' => $department,
                                    'status' => 'OFFICIAL_VERIFIED',
                                ]),
                                'status' => 'active',
                                'created_at' => $now,
                                'updated_at' => $now,
                            ]);
                        }
                        $totals['alumni']++;
                        $alumni = ['id' => $alumniId, 'email' => $email];
                    }

                    if (!$alumni) {
                        continue;
                    }
                    $alumniUsers[] = $alumni;
                    if ($db->table('user_educations')->where('user_id', $alumni['id'])->countAllResults() === 0) {
                        $gradYear = 2018 + ($member * 2);
                        $db->table('user_educations')->insert([
                            'user_id' => $alumni['id'],
                            'education_level' => 'UG',
                            'degree_name' => 'Degree in ' . $department,
                            'department' => $department,
                            'specialization' => 'Department demo profile',
                            'enrollment_no' => 'DEMO-ALM-' . str_pad((string) ($departmentIndex + 1), 3, '0', STR_PAD_LEFT) . '-' . $member,
                            'start_year' => $gradYear - 4,
                            'end_year' => $gradYear,
                            'status' => 'completed',
                            'created_at' => $now,
                            'updated_at' => $now,
                        ]);
                    }
                }

                $eventSlug = 'demo-' . $slug . '-networking';
                $event = $db->table('events')->where('slug', $eventSlug)->get()->getRowArray();
                if (!$event) {
                    $eventDate = date('Y-m-d', strtotime('+' . (7 + $departmentIndex) . ' days'));
                    $db->table('events')->insert([
                        'title' => $department . ' Alumni Networking Day (Demo)',
                        'slug' => $eventSlug,
                        'event_type' => 'meetup',
                        'department' => $department,
                        'description' => '[DEMO] Sample department event for portal preview.',
                        'venue' => 'Akal University Campus',
                        'is_virtual' => 0,
                        'start_datetime' => $eventDate . ' 10:00:00',
                        'end_datetime' => $eventDate . ' 13:00:00',
                        'max_capacity' => 100,
                        'is_published' => 1,
                        'created_by' => $adminId,
                        'created_at' => $now,
                        'updated_at' => $now,
                    ]);
                    $eventId = (int) $db->insertID();
                    $totals['events']++;
                } else {
                    $eventId = (int) $event['id'];
                }

                $registered = $db->table('event_registrations')->where('event_id', $eventId)->where('user_id', $studentId)->countAllResults();
                if (!$registered) {
                    $db->table('event_registrations')->insert([
                        'event_id' => $eventId,
                        'user_id' => $studentId,
                        'attendee_name' => trim(($student['first_name'] ?? '') . ' ' . ($student['last_name'] ?? '')),
                        'attendee_email' => $student['email'],
                        'attendee_phone' => $student['phone'] ?? null,
                        'tickets_count' => 1,
                        'qr_code' => 'DEMO-EVENT-' . $eventId . '-' . $studentId,
                        'checkin_status' => 0,
                        'created_at' => $now,
                        'updated_at' => $now,
                    ]);
                    $totals['registrations']++;
                }

                if (!empty($alumniUsers)) {
                    $mentorId = (int) $alumniUsers[0]['id'];
                    $topic = 'Demo career mentorship — ' . $department;
                    $mentorship = $db->table('mentorship_programs')->where('mentor_user_id', $mentorId)
                        ->where('mentee_user_id', $studentId)->where('topic', $topic)->countAllResults();
                    if (!$mentorship) {
                        $status = $departmentIndex % 2 === 0 ? 'accepted' : 'requested';
                        $db->table('mentorship_programs')->insert([
                            'mentor_user_id' => $mentorId,
                            'mentee_user_id' => $studentId,
                            'topic' => $topic,
                            'status' => $status,
                            'message' => '[DEMO] Sample mentorship activity for department preview.',
                            'notes' => $status === 'accepted' ? '[DEMO] Accepted sample session.' : null,
                            'requested_at' => $now,
                            'accepted_at' => $status === 'accepted' ? $now : null,
                            'created_at' => $now,
                            'updated_at' => $now,
                        ]);
                        $totals['mentorships']++;
                    }
                }
            }

            if ($db->transStatus() === false) {
                $db->transRollback();
                throw new \RuntimeException('Database rejected one or more department demo records.');
            }
            $db->transCommit();
            echo 'Department demo data complete. Newly added: ' . json_encode($totals) . "\n";
            echo 'Demo account password: ' . self::DEMO_PASSWORD . "\n";
        } catch (\Throwable $error) {
            $db->transRollback();
            throw $error;
        }
    }

    private function findProfileUser($db, string $role, string $email, string $profileTable, string $department): ?array
    {
        $row = $db->table('users')
            ->select('users.id, users.email, ' . $profileTable . '.first_name, ' . $profileTable . '.last_name, ' . $profileTable . '.phone')
            ->join($profileTable, $profileTable . '.user_id = users.id')
            ->where('users.role', $role)
            ->where('users.email', $email)
            ->where($profileTable . '.department', $department)
            ->get()->getRowArray();
        return $row ?: null;
    }

    private function availableEmail($db, string $localPart): string
    {
        $email = $localPart . '@akaluniversity.ac.in';
        $suffix = 2;
        while ($db->table('users')->where('email', $email)->countAllResults() > 0) {
            $email = $localPart . '.' . $suffix . '@akaluniversity.ac.in';
            $suffix++;
        }
        return $email;
    }

    private function phoneNumber(int $departmentIndex, int $member): string
    {
        return '+91 90000' . str_pad((string) ($departmentIndex + 1), 2, '0', STR_PAD_LEFT) . str_pad((string) ($member + 1), 3, '0', STR_PAD_LEFT);
    }
}
