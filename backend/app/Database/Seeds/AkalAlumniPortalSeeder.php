<?php

namespace App\Database\Seeds;

use CodeIgniter\Database\Seeder;

class AkalAlumniPortalSeeder extends Seeder
{
    public function run()
    {
        $db = \Config\Database::connect();

        // 1. System Settings
        $settings = [
            // General Branding & Identity
            ['setting_key' => 'site_title', 'setting_value' => 'Akal University Alumni Portal', 'setting_group' => 'general', 'description' => 'Platform display title'],
            ['setting_key' => 'university_name', 'setting_value' => 'Akal University', 'setting_group' => 'general', 'description' => 'Official University Name'],
            ['setting_key' => 'tagline', 'setting_value' => 'Connecting Our Past. Inspiring Our Future.', 'setting_group' => 'general', 'description' => 'Portal Tagline / Subtitle'],
            ['setting_key' => 'logo_text', 'setting_value' => 'AKAL UNIVERSITY', 'setting_group' => 'general', 'description' => 'Navbar Brand Title'],
            ['setting_key' => 'logo_subtext', 'setting_value' => 'Alumni Portal', 'setting_group' => 'general', 'description' => 'Navbar Brand Subtitle'],
            ['setting_key' => 'primary_color', 'setting_value' => '#087BB5', 'setting_group' => 'general', 'description' => 'Primary Brand Color (Hex)'],
            ['setting_key' => 'accent_color', 'setting_value' => '#F9B900', 'setting_group' => 'general', 'description' => 'Accent Yellow Color (Hex)'],
            
            // Top Announcement Bar
            ['setting_key' => 'enable_top_banner', 'setting_value' => '1', 'setting_group' => 'banner', 'description' => 'Show Top Notification Bar'],
            ['setting_key' => 'top_banner_badge', 'setting_value' => 'OFFICIAL PORTAL', 'setting_group' => 'banner', 'description' => 'Top Banner Pill Badge'],
            ['setting_key' => 'top_banner_text', 'setting_value' => 'Akal University Alumni Network — Connecting Past, Inspiring Future', 'setting_group' => 'banner', 'description' => 'Top Banner Announcement Text'],

            // Hero Section Customizer
            ['setting_key' => 'hero_badge_text', 'setting_value' => 'OFFICIAL ALUMNI & ENGAGEMENT PLATFORM', 'setting_group' => 'hero', 'description' => 'Hero Pill Badge Text'],
            ['setting_key' => 'hero_headline_line1', 'setting_value' => 'Connecting Our Past.', 'setting_group' => 'hero', 'description' => 'Hero Main Title First Line'],
            ['setting_key' => 'hero_headline_highlight', 'setting_value' => 'Inspiring Our Future.', 'setting_group' => 'hero', 'description' => 'Hero Main Title Highlighted Text'],
            ['setting_key' => 'hero_description', 'setting_value' => 'Welcome to the digital gateway of Akal University\'s global alumni community. Reconnect with batchmates, guide ambitious students, discover career milestones, and celebrate institutional pride.', 'setting_group' => 'hero', 'description' => 'Hero Descriptive Paragraph'],
            ['setting_key' => 'hero_cta_primary_text', 'setting_value' => 'Explore Alumni Directory', 'setting_group' => 'hero', 'description' => 'Hero Primary Button Label'],
            ['setting_key' => 'hero_cta_primary_link', 'setting_value' => '/directory', 'setting_group' => 'hero', 'description' => 'Hero Primary Button Destination'],
            ['setting_key' => 'hero_cta_secondary_text', 'setting_value' => 'Join Alumni Network', 'setting_group' => 'hero', 'description' => 'Hero Secondary Button Label'],
            ['setting_key' => 'hero_cta_secondary_link', 'setting_value' => '/register', 'setting_group' => 'hero', 'description' => 'Hero Secondary Button Destination'],

            // Homepage Key Counters & Stats
            ['setting_key' => 'stat_alumni_count', 'setting_value' => '3,500+', 'setting_group' => 'stats', 'description' => 'Global Alumni Count Stat'],
            ['setting_key' => 'stat_alumni_label', 'setting_value' => 'Global Alumni Members', 'setting_group' => 'stats', 'description' => 'Global Alumni Stat Label'],
            ['setting_key' => 'stat_chapters_count', 'setting_value' => '12+', 'setting_group' => 'stats', 'description' => 'Active Regional Chapters Stat'],
            ['setting_key' => 'stat_chapters_label', 'setting_value' => 'Active Regional Chapters', 'setting_group' => 'stats', 'description' => 'Regional Chapters Stat Label'],
            ['setting_key' => 'stat_mentors_count', 'setting_value' => '250+', 'setting_group' => 'stats', 'description' => 'Verified Mentors Stat'],
            ['setting_key' => 'stat_mentors_label', 'setting_value' => 'Industry Career Mentors', 'setting_group' => 'stats', 'description' => 'Verified Mentors Stat Label'],
            ['setting_key' => 'stat_success_rate', 'setting_value' => '94%', 'setting_group' => 'stats', 'description' => 'Career Success Rate Stat'],
            ['setting_key' => 'stat_success_label', 'setting_value' => 'Career Placement & Higher Ed', 'setting_group' => 'stats', 'description' => 'Career Success Stat Label'],

            // Contact & Helpline Details
            ['setting_key' => 'contact_email', 'setting_value' => 'alumni@akaluniversity.ac.in', 'setting_group' => 'contact', 'description' => 'Official Alumni Office Email'],
            ['setting_key' => 'contact_phone', 'setting_value' => '+91 1800-180-1234', 'setting_group' => 'contact', 'description' => 'Official Alumni Helpline Phone'],
            ['setting_key' => 'contact_phone_alt', 'setting_value' => '+91 98765-43210', 'setting_group' => 'contact', 'description' => 'Alternate Office Phone'],
            ['setting_key' => 'campus_address', 'setting_value' => 'Talwandi Sabo, Bathinda, Punjab 151302, India', 'setting_group' => 'contact', 'description' => 'Physical Campus Address'],
            ['setting_key' => 'office_hours', 'setting_value' => 'Mon - Fri: 9:00 AM - 5:00 PM IST', 'setting_group' => 'contact', 'description' => 'Alumni Office Working Hours'],

            // Social & External Links
            ['setting_key' => 'social_linkedin', 'setting_value' => 'https://www.linkedin.com/school/akal-university', 'setting_group' => 'social', 'description' => 'Official LinkedIn Page URL'],
            ['setting_key' => 'social_youtube', 'setting_value' => 'https://www.youtube.com/@AkalUniversityOfficial', 'setting_group' => 'social', 'description' => 'Official YouTube Channel URL'],
            ['setting_key' => 'social_twitter', 'setting_value' => 'https://twitter.com/AkalUniversity', 'setting_group' => 'social', 'description' => 'Official Twitter/X Handle URL'],
            ['setting_key' => 'social_instagram', 'setting_value' => 'https://instagram.com/akaluniversity', 'setting_group' => 'social', 'description' => 'Official Instagram Handle URL'],
            ['setting_key' => 'social_facebook', 'setting_value' => 'https://facebook.com/AkalUniversityOfficial', 'setting_group' => 'social', 'description' => 'Official Facebook Page URL'],
            ['setting_key' => 'university_website', 'setting_value' => 'https://akaluniversity.ac.in', 'setting_group' => 'social', 'description' => 'Main University Website URL'],

            // Footer & Accreditation Details
            ['setting_key' => 'footer_description', 'setting_value' => 'Akal University Alumni Portal is dedicated to building lifelong connections between graduates, current scholars, faculty, and industry leaders.', 'setting_group' => 'footer', 'description' => 'Footer Descriptive Text'],
            ['setting_key' => 'accreditation_line1', 'setting_value' => 'Akal University • NAAC Accredited Grade "A" • Established under Punjab Act No. 25 of 2015', 'setting_group' => 'footer', 'description' => 'Accreditation Line 1'],
            ['setting_key' => 'accreditation_line2', 'setting_value' => 'Approved by UGC under Section 2(f) and 12(B) of the UGC Act, 1956', 'setting_group' => 'footer', 'description' => 'Accreditation Line 2'],
            ['setting_key' => 'copyright_text', 'setting_value' => '© 2026 Akal University Alumni Association. All rights reserved.', 'setting_group' => 'footer', 'description' => 'Footer Copyright Notice'],

            // Feature & Module Access Toggles
            ['setting_key' => 'enable_public_directory', 'setting_value' => '1', 'setting_group' => 'features', 'description' => 'Allow public visitors to browse alumni directory'],
            ['setting_key' => 'enable_public_jobs', 'setting_value' => '1', 'setting_group' => 'features', 'description' => 'Allow visitors to view career job board'],
            ['setting_key' => 'enable_public_events', 'setting_value' => '1', 'setting_group' => 'features', 'description' => 'Allow visitors to view events & reunions'],
            ['setting_key' => 'enable_public_stories', 'setting_value' => '1', 'setting_group' => 'features', 'description' => 'Allow visitors to read success stories'],
            ['setting_key' => 'enable_public_mentorship', 'setting_value' => '1', 'setting_group' => 'features', 'description' => 'Enable mentorship hub browsing'],
            ['setting_key' => 'enable_public_chapters', 'setting_value' => '1', 'setting_group' => 'features', 'description' => 'Enable regional chapters section'],
            ['setting_key' => 'enable_public_gallery', 'setting_value' => '1', 'setting_group' => 'features', 'description' => 'Enable news & gallery albums section'],
            ['setting_key' => 'require_alumni_verification', 'setting_value' => '1', 'setting_group' => 'features', 'description' => 'Require administrative verification for new alumni accounts'],
            ['setting_key' => 'allow_alumni_job_post', 'setting_value' => '1', 'setting_group' => 'features', 'description' => 'Allow verified alumni to post job openings'],
            ['setting_key' => 'allow_student_mentorship', 'setting_value' => '1', 'setting_group' => 'features', 'description' => 'Allow enrolled students to request 1-on-1 mentorship'],
        ];

        foreach ($settings as $s) {
            $existing = $db->table('system_settings')->where('setting_key', $s['setting_key'])->get()->getRow();
            if (!$existing) {
                $db->table('system_settings')->insert($s);
            } else {
                $db->table('system_settings')->where('setting_key', $s['setting_key'])->update([
                    'setting_group' => $s['setting_group'],
                    'description'   => $s['description'],
                ]);
            }
        }

        // Password hash for all default users: Admin@12345
        $defaultPasswordHash = password_hash('Admin@12345', PASSWORD_BCRYPT);
        $studentPasswordHash = password_hash('Student@12345', PASSWORD_BCRYPT);
        $alumniPasswordHash = password_hash('Alumni@12345', PASSWORD_BCRYPT);

        // 2. Super Admin User
        $superAdminUser = $db->table('users')->where('email', 'superadmin@akaluniversity.ac.in')->get()->getRow();
        if (!$superAdminUser) {
            $db->table('users')->insert([
                'email'               => 'superadmin@akaluniversity.ac.in',
                'password_hash'       => $defaultPasswordHash,
                'role'                => 'superadmin',
                'status'              => 'active',
                'verification_status' => 'verified',
                'created_at'          => date('Y-m-d H:i:s'),
                'updated_at'          => date('Y-m-d H:i:s'),
            ]);
            $superAdminId = $db->insertID();

            $db->table('admin_profiles')->insert([
                'user_id'     => $superAdminId,
                'full_name'   => 'Dr. Gurpreet Singh (Super Admin)',
                'department'  => 'Alumni Relations & IT Cell',
                'designation' => 'Director & Super Administrator',
                'phone'       => '+91 9876543210',
                'permissions' => json_encode(['all' => true, 'manage_users' => true, 'manage_settings' => true, 'manage_content' => true]),
                'created_at'  => date('Y-m-d H:i:s'),
                'updated_at'  => date('Y-m-d H:i:s'),
            ]);
        }

        // 3. Admin User
        $adminUser = $db->table('users')->where('email', 'admin@akaluniversity.ac.in')->get()->getRow();
        if (!$adminUser) {
            $db->table('users')->insert([
                'email'               => 'admin@akaluniversity.ac.in',
                'password_hash'       => $defaultPasswordHash,
                'role'                => 'admin',
                'status'              => 'active',
                'verification_status' => 'verified',
                'created_at'          => date('Y-m-d H:i:s'),
                'updated_at'          => date('Y-m-d H:i:s'),
            ]);
            $adminId = $db->insertID();

            $db->table('admin_profiles')->insert([
                'user_id'     => $adminId,
                'full_name'   => 'Prof. Simran Kaur',
                'department'  => 'Dean of Alumni Affairs',
                'designation' => 'Alumni Affairs Officer',
                'phone'       => '+91 9876543211',
                'permissions' => json_encode(['manage_users' => true, 'verify_alumni' => true, 'manage_events' => true, 'manage_jobs' => true]),
                'created_at'  => date('Y-m-d H:i:s'),
                'updated_at'  => date('Y-m-d H:i:s'),
            ]);
        }

        // 4. Sample Alumni Users & Profiles
        $alumniData = [
            [
                'email' => 'harpreet.tech@gmail.com',
                'name' => ['Harpreet', 'Singh'],
                'degree' => 'B.Tech in Computer Science & Engineering',
                'department' => 'CSE',
                'batch' => '2016-2020',
                'grad_year' => 2020,
                'company' => 'Google Cloud',
                'designation' => 'Senior Cloud Solutions Architect',
                'city' => 'Bengaluru',
                'country' => 'India',
                'experience' => 5,
                'is_distinguished' => 1,
                'dist_title' => 'Alumni Excellence in Cloud Engineering 2024',
                'is_mentor' => 1,
                'mentorship' => 'Cloud Architecture, Distributed Systems, Tech Interviews',
                'bio' => 'Passionate about distributed computing and large-scale cloud applications. Mentoring students for software development careers.',
                'skills' => 'Kubernetes, Go, GCP, Distributed Systems, Python, Microservices',
                'educations' => [
                    ['level' => 'UG', 'degree' => 'B.Tech in Computer Science & Engineering', 'department' => 'CSE', 'specialization' => 'Cloud Computing', 'enrollment_no' => 'AU-2016-0042', 'start' => 2016, 'end' => 2020, 'status' => 'completed', 'grade' => '8.7 CGPA'],
                ]
            ],
            [
                'email' => 'aman.kaur.data@outlook.com',
                'name' => ['Amanpreet', 'Kaur'],
                'degree' => 'M.Sc. Data Science & Mathematics',
                'department' => 'Mathematics',
                'batch' => '2018-2020',
                'grad_year' => 2020,
                'company' => 'Microsoft',
                'designation' => 'Lead AI/ML Research Engineer',
                'city' => 'Seattle / Hyderabad',
                'country' => 'India',
                'experience' => 5,
                'is_distinguished' => 1,
                'dist_title' => 'Innovator in Natural Language Processing',
                'is_mentor' => 1,
                'mentorship' => 'AI/ML Career Paths, Deep Learning Research, Higher Studies Abroad',
                'bio' => 'Working at the frontier of Generative AI and multilingual language modeling. Proud alumna of Akal University.',
                'skills' => 'PyTorch, LLMs, Transformer Models, Python, Computer Vision, MLOps',
                'educations' => [
                    ['level' => 'UG', 'degree' => 'B.Sc. Mathematics', 'department' => 'Mathematics', 'enrollment_no' => 'AU-2015-0117', 'start' => 2015, 'end' => 2018, 'status' => 'completed', 'grade' => '8.9 CGPA'],
                    ['level' => 'PG', 'degree' => 'M.Sc. Data Science & Mathematics', 'department' => 'Mathematics', 'specialization' => 'Data Science', 'enrollment_no' => 'AU-2018-0117', 'start' => 2018, 'end' => 2020, 'status' => 'completed', 'grade' => '9.1 CGPA'],
                ]
            ],
            [
                'email' => 'jasleen.biotech@gmail.com',
                'name' => ['Jasleen', 'Kaur'],
                'degree' => 'B.Sc. (Hons) Biotechnology',
                'department' => 'Life Sciences',
                'batch' => '2017-2020',
                'grad_year' => 2020,
                'company' => 'Biocon Research',
                'designation' => 'Senior Research Scientist',
                'city' => 'Bengaluru',
                'country' => 'India',
                'experience' => 4,
                'is_distinguished' => 0,
                'dist_title' => null,
                'is_mentor' => 1,
                'mentorship' => 'Biotechnology research, Scientific Publications, PhD Guidance',
                'bio' => 'Biotech innovator exploring therapeutic enzymes and molecular biology advancements.',
                'skills' => 'Molecular Biology, CRISPR, HPLC, Genetic Engineering, Data Analysis',
                'educations' => [
                    ['level' => 'UG', 'degree' => 'B.Sc. (Hons) Biotechnology', 'department' => 'Life Sciences', 'enrollment_no' => 'AU-2017-0233', 'start' => 2017, 'end' => 2020, 'status' => 'completed', 'grade' => '8.4 CGPA'],
                ]
            ],
            [
                'email' => 'navjot.finance@gmail.com',
                'name' => ['Navjot', 'Singh'],
                'degree' => 'B.Com (Hons) with Finance',
                'department' => 'Commerce',
                'batch' => '2019-2022',
                'grad_year' => 2022,
                'company' => 'Deloitte Advisory',
                'designation' => 'Financial Risk Analyst',
                'city' => 'Gurugram',
                'country' => 'India',
                'experience' => 3,
                'is_distinguished' => 0,
                'dist_title' => null,
                'is_mentor' => 1,
                'mentorship' => 'Chartered Accountancy, Big 4 Consulting, Financial Modeling',
                'bio' => 'Consulting professional aiding multinational clients with risk assurance and valuation strategies.',
                'skills' => 'Financial Modeling, Valuation, PowerBI, Risk Consulting, Excel Automation',
                'educations' => [
                    ['level' => 'UG', 'degree' => 'B.Com (Hons) with Finance', 'department' => 'Commerce', 'enrollment_no' => 'AU-2019-0358', 'start' => 2019, 'end' => 2022, 'status' => 'completed', 'grade' => '8.2 CGPA'],
                ]
            ],
            [
                'email' => 'manpreet.physics@gmail.com',
                'name' => ['Manpreet', 'Singh'],
                'degree' => 'B.Sc. (Hons) Physics',
                'department' => 'Physics',
                'batch' => '2018-2021',
                'grad_year' => 2021,
                'company' => 'University of Toronto',
                'designation' => 'Doctoral Researcher in Quantum Optics',
                'city' => 'Toronto',
                'country' => 'Canada',
                'experience' => 3,
                'is_distinguished' => 1,
                'dist_title' => 'International Research Scholar Award',
                'is_mentor' => 1,
                'mentorship' => 'International Masters/PhD Applications, GRE/IELTS, Research Fellowships',
                'bio' => 'Pursuing PhD in Quantum Photonics. Happy to advise students aiming for higher education in North America.',
                'skills' => 'Quantum Optics, MATLAB, Experimental Physics, Scientific Computing',
                'educations' => [
                    ['level' => 'UG', 'degree' => 'B.Sc. (Hons) Physics', 'department' => 'Physics', 'specialization' => 'Quantum Optics', 'enrollment_no' => 'AU-2018-0471', 'start' => 2018, 'end' => 2021, 'status' => 'completed', 'grade' => '9.0 CGPA'],
                ]
            ]
        ];

        foreach ($alumniData as $idx => $alm) {
            $userCheck = $db->table('users')->where('email', $alm['email'])->get()->getRow();
            if (!$userCheck) {
                $db->table('users')->insert([
                    'email'               => $alm['email'],
                    'password_hash'       => $alumniPasswordHash,
                    'role'                => 'alumni',
                    'status'              => 'active',
                    'verification_status' => 'verified',
                    'created_at'          => date('Y-m-d H:i:s'),
                    'updated_at'          => date('Y-m-d H:i:s'),
                ]);
                $uId = $db->insertID();

                $db->table('alumni_profiles')->insert([
                    'user_id'             => $uId,
                    'first_name'          => $alm['name'][0],
                    'last_name'           => $alm['name'][1],
                    'enrollment_no'       => 'AU-ALM-' . (2016 + $idx) . '-00' . ($idx + 10),
                    'registration_no'     => 'REG' . (88000 + $idx),
                    'degree'              => $alm['degree'],
                    'department'          => $alm['department'],
                    'batch_year'          => $alm['batch'],
                    'graduation_year'     => $alm['grad_year'],
                    'phone'               => '+91 98' . rand(10000000, 99999999),
                    'current_company'     => $alm['company'],
                    'current_designation' => $alm['designation'],
                    'industry'            => 'Technology & Sciences',
                    'experience_years'    => $alm['experience'],
                    'location_city'       => $alm['city'],
                    'location_country'    => $alm['country'],
                    'bio'                 => $alm['bio'],
                    'skills'              => $alm['skills'],
                    'linkedin_url'        => 'https://linkedin.com/in/' . strtolower($alm['name'][0] . $alm['name'][1]),
                    'is_distinguished'    => $alm['is_distinguished'],
                    'distinguished_title' => $alm['dist_title'],
                    'is_mentor'           => $alm['is_mentor'],
                    'mentorship_topics'   => $alm['mentorship'],
                    'is_public_profile'   => 1,
                    'show_email_public'   => 1,
                    'show_phone_public'   => 0,
                    'verified_at'         => date('Y-m-d H:i:s'),
                    'created_at'          => date('Y-m-d H:i:s'),
                    'updated_at'          => date('Y-m-d H:i:s'),
                ]);

                // Generate Digital Alumni ID Card
                $db->table('alumni_id_cards')->insert([
                    'user_id'     => $uId,
                    'card_number' => 'AU-AID-' . ($alm['grad_year']) . '-00' . ($idx + 1),
                    'issue_date'  => date('Y-m-d'),
                    'expiry_date' => date('Y-m-d', strtotime('+5 years')),
                    'qr_payload'  => json_encode([
                        'alumni_id'   => 'AU-AID-' . ($alm['grad_year']) . '-00' . ($idx + 1),
                        'name'        => $alm['name'][0] . ' ' . $alm['name'][1],
                        'degree'      => $alm['degree'],
                        'batch'       => $alm['batch'],
                        'status'      => 'VERIFIED_OFFICIAL'
                    ]),
                    'status'      => 'active',
                    'created_at'  => date('Y-m-d H:i:s'),
                    'updated_at'  => date('Y-m-d H:i:s'),
                ]);
            }

            // Academic history at Akal University (UG / PG / PhD ...) — also backfills existing demo accounts
            if ($db->tableExists('user_educations')) {
                $eduUser    = $db->table('users')->where('email', $alm['email'])->get()->getRow();
                $eduUserId  = $eduUser ? $eduUser->id : null;
                $eduCount   = $eduUserId ? $db->table('user_educations')->where('user_id', $eduUserId)->countAllResults() : 0;

                if ($eduUserId && $eduCount === 0) {
                    foreach ($alm['educations'] ?? [] as $edu) {
                        $db->table('user_educations')->insert([
                            'user_id'         => $eduUserId,
                            'education_level' => $edu['level'],
                            'degree_name'     => $edu['degree'],
                            'department'      => $edu['department'],
                            'specialization'  => $edu['specialization'] ?? null,
                            'enrollment_no'   => $edu['enrollment_no'] ?? null,
                            'start_year'      => $edu['start'],
                            'end_year'        => $edu['end'] ?? null,
                            'status'          => $edu['status'] ?? 'completed',
                            'grade'           => $edu['grade'] ?? null,
                            'research_title'  => $edu['research_title'] ?? null,
                            'created_at'      => date('Y-m-d H:i:s'),
                            'updated_at'      => date('Y-m-d H:i:s'),
                        ]);
                    }
                }
            }
        }

        // 5. Student User
        $studentUser = $db->table('users')->where('email', 'student@akaluniversity.ac.in')->get()->getRow();
        if (!$studentUser) {
            $db->table('users')->insert([
                'email'               => 'student@akaluniversity.ac.in',
                'password_hash'       => $studentPasswordHash,
                'role'                => 'student',
                'status'              => 'active',
                'verification_status' => 'verified',
                'created_at'          => date('Y-m-d H:i:s'),
                'updated_at'          => date('Y-m-d H:i:s'),
            ]);
            $stuId = $db->insertID();

            $db->table('student_profiles')->insert([
                'user_id'          => $stuId,
                'first_name'       => 'Dipanshu',
                'last_name'        => '',
                'enrollment_no'    => 'AU-STU-2023-1042',
                'degree'           => 'B.Tech in Computer Science & Engineering',
                'department'       => 'CSE',
                'current_year'     => 3,
                'semester'         => 6,
                'phone'            => '+91 9811223344',
                'bio'              => 'Enthusiastic 3rd-year CS student interested in Cloud computing, Full-stack development and Machine Learning.',
                'career_interests' => 'Software Engineering, Cloud Architecture, DevOps',
                'linkedin_url'     => 'https://linkedin.com/in/dipanshu-akal',
                'created_at'       => date('Y-m-d H:i:s'),
                'updated_at'       => date('Y-m-d H:i:s'),
            ]);
        }

        // Student's academic history at Akal University (UG / PG / PhD ...) — also backfills the existing demo account
        if ($db->tableExists('user_educations')) {
            $eduUser   = $db->table('users')->where('email', 'student@akaluniversity.ac.in')->get()->getRow();
            $eduUserId = $eduUser ? $eduUser->id : null;
            $eduCount  = $eduUserId ? $db->table('user_educations')->where('user_id', $eduUserId)->countAllResults() : 0;

            if ($eduUserId && $eduCount === 0) {
                $db->table('user_educations')->insert([
                    'user_id'         => $eduUserId,
                    'education_level' => 'UG',
                    'degree_name'     => 'B.Tech in Computer Science & Engineering',
                    'department'      => 'CSE',
                    'specialization'  => 'Full-stack Development',
                    'enrollment_no'   => 'AU-STU-2023-1042',
                    'start_year'      => 2023,
                    'end_year'        => 2027,
                    'status'          => 'ongoing',
                    'grade'           => '8.2 CGPA',
                    'created_at'      => date('Y-m-d H:i:s'),
                    'updated_at'      => date('Y-m-d H:i:s'),
                ]);
            }
        }

        // 6. Events
        $events = [
            [
                'title'                 => 'Grand Alumni Homecoming & Reunion 2026',
                'slug'                  => 'grand-alumni-homecoming-2026',
                'event_type'            => 'reunion',
                'description'           => 'Join us back at the serene Akal University campus for two days of nostalgic reconnections, campus tours, cultural nights and networking banquet.',
                'venue'                 => 'Main University Auditorium & Campus Lawns, Talwandi Sabo',
                'is_virtual'            => 0,
                'start_datetime'        => date('Y-m-d 09:30:00', strtotime('+20 days')),
                'end_datetime'          => date('Y-m-d 18:00:00', strtotime('+21 days')),
                'registration_deadline' => date('Y-m-d 23:59:59', strtotime('+15 days')),
                'max_capacity'          => 500,
                'is_published'          => 1,
            ],
            [
                'title'                 => 'Global Tech Leadership & AI Horizons Webinar',
                'slug'                  => 'global-tech-leadership-ai-webinar',
                'event_type'            => 'webinar',
                'description'           => 'Distinguished alumni in Google, Microsoft and Global Startups share insights on navigating career growth in the era of Generative AI.',
                'venue'                 => 'Online via Zoom / MS Teams',
                'is_virtual'            => 1,
                'virtual_link'          => 'https://akaluniversity.ac.in/webinar/ai-horizons',
                'start_datetime'        => date('Y-m-d 17:00:00', strtotime('+10 days')),
                'end_datetime'          => date('Y-m-d 19:00:00', strtotime('+10 days')),
                'registration_deadline' => date('Y-m-d 12:00:00', strtotime('+10 days')),
                'max_capacity'          => 300,
                'is_published'          => 1,
            ],
            [
                'title'                 => 'Akal Annual Innovation & Career Fair 2026',
                'slug'                  => 'akal-career-fair-2026',
                'event_type'            => 'meetup',
                'description'           => 'Connecting graduating students directly with alumni entrepreneurs, talent acquisition leaders and corporate mentors.',
                'venue'                 => 'Academic Block 2 Convention Hall',
                'is_virtual'            => 0,
                'start_datetime'        => date('Y-m-d 10:00:00', strtotime('+35 days')),
                'end_datetime'          => date('Y-m-d 16:30:00', strtotime('+35 days')),
                'registration_deadline' => date('Y-m-d 23:59:59', strtotime('+30 days')),
                'max_capacity'          => 400,
                'is_published'          => 1,
            ]
        ];

        foreach ($events as $ev) {
            $evCheck = $db->table('events')->where('slug', $ev['slug'])->get()->getRow();
            if (!$evCheck) {
                $ev['created_at'] = date('Y-m-d H:i:s');
                $ev['updated_at'] = date('Y-m-d H:i:s');
                $db->table('events')->insert($ev);
            }
        }

        // 7. Jobs & Opportunities
        $jobs = [
            [
                'title'               => 'Cloud Solutions Engineer (GCP/AWS)',
                'company_name'        => 'CloudScale Technologies',
                'job_type'            => 'full_time',
                'location'            => 'Bengaluru / Hybrid',
                'experience_required' => '1 - 3 Years',
                'salary_range'        => '₹12,00,000 - ₹18,00,000 P.A.',
                'description'         => 'We are looking for proactive engineers to build scalable cloud infrastructure, automate deployment pipelines and optimize multi-region Kubernetes clusters.',
                'requirements'        => 'Hands-on experience with Docker, Kubernetes, Terraform, Python/Go, and CI/CD pipelines.',
                'apply_link'          => 'https://cloudscale.careers/jobs/cloud-eng',
                'contact_email'       => 'careers@cloudscale.io',
                'deadline'            => date('Y-m-d', strtotime('+30 days')),
                'status'              => 'approved',
                'created_at'          => date('Y-m-d H:i:s'),
                'updated_at'          => date('Y-m-d H:i:s'),
            ],
            [
                'title'               => 'Junior AI/ML Research Intern',
                'company_name'        => 'NeuralEdge Labs',
                'job_type'            => 'internship',
                'location'            => 'Remote / Chandigarh',
                'experience_required' => 'Fresher / Final Year Student',
                'salary_range'        => '₹35,000 / Month Internship Stipend',
                'description'         => 'Exciting internship opportunity for motivated students and recent graduates passionate about fine-tuning LLMs and evaluating neural architectures.',
                'requirements'        => 'Solid understanding of Linear Algebra, PyTorch, HuggingFace transformers and Python.',
                'apply_link'          => 'https://neuraledgelabs.ai/internships',
                'contact_email'       => 'talent@neuraledgelabs.ai',
                'deadline'            => date('Y-m-d', strtotime('+25 days')),
                'status'              => 'approved',
                'created_at'          => date('Y-m-d H:i:s'),
                'updated_at'          => date('Y-m-d H:i:s'),
            ],
            [
                'title'               => 'Financial Advisory Consultant',
                'company_name'        => 'Apex Financial Partners',
                'job_type'            => 'full_time',
                'location'            => 'Gurugram / Delhi NCR',
                'experience_required' => '2+ Years',
                'salary_range'        => '₹10,00,000 - ₹15,00,000 P.A.',
                'description'         => 'Advising institutional clients on capital allocation, financial statement analysis, and regulatory risk compliance.',
                'requirements'        => 'Commerce / Finance background, advanced financial modeling, excellent communication.',
                'apply_link'          => 'https://apexfin.com/apply',
                'contact_email'       => 'hr@apexfin.com',
                'deadline'            => date('Y-m-d', strtotime('+40 days')),
                'status'              => 'approved',
                'created_at'          => date('Y-m-d H:i:s'),
                'updated_at'          => date('Y-m-d H:i:s'),
            ]
        ];

        foreach ($jobs as $j) {
            $jCheck = $db->table('jobs')->where('title', $j['title'])->get()->getRow();
            if (!$jCheck) {
                $db->table('jobs')->insert($j);
            }
        }

        // 8. Chapters
        $chapters = [
            ['name' => 'Bathinda & Malwa Regional Chapter', 'city' => 'Bathinda', 'state' => 'Punjab', 'country' => 'India', 'description' => 'Home chapter for alumni based in Punjab and Northern region. Organizing regular campus visits, community mentorship and regional meetups.', 'member_count' => 640],
            ['name' => 'Delhi NCR Professional Chapter', 'city' => 'New Delhi', 'state' => 'Delhi', 'country' => 'India', 'description' => 'Vibrant network of alumni professionals working in technology, civil services, corporate consulting and finance across Delhi, Noida & Gurugram.', 'member_count' => 480],
            ['name' => 'Bengaluru Tech & Innovation Hub', 'city' => 'Bengaluru', 'state' => 'Karnataka', 'country' => 'India', 'description' => 'Silicon Valley of India chapter uniting founders, tech leaders, data scientists and engineering alumni.', 'member_count' => 320],
            ['name' => 'Canada & North America Chapter', 'city' => 'Toronto', 'state' => 'Ontario', 'country' => 'Canada', 'description' => 'Connecting alumni across Canada and USA. Assisting new arrivals with settlement, academic guidance and professional networking.', 'member_count' => 290],
            ['name' => 'UK & Europe Chapter', 'city' => 'London', 'state' => 'England', 'country' => 'United Kingdom', 'description' => 'Alumni networking across Europe in academic research, healthcare, engineering and international business.', 'member_count' => 175],
        ];

        foreach ($chapters as $ch) {
            $chCheck = $db->table('chapters')->where('name', $ch['name'])->get()->getRow();
            if (!$chCheck) {
                $ch['is_active'] = 1;
                $ch['created_at'] = date('Y-m-d H:i:s');
                $ch['updated_at'] = date('Y-m-d H:i:s');
                $db->table('chapters')->insert($ch);
            }
        }

        // 9. Success Stories
        $stories = [
            [
                'title'        => 'From Akal Classrooms to Cloud Architecture at Google',
                'slug'         => 'from-akal-classrooms-to-google-cloud',
                'summary'      => 'How Harpreet Singh transformed his passion for algorithms during his B.Tech at Akal University into architecting enterprise cloud solutions globally.',
                'content'      => 'Reflecting on my university journey at Akal University, the balance of academic rigour, value-based education and personalized mentorship by the faculty provided the bedrock for my career in cloud computing...',
                'batch_year'   => '2016-2020',
                'company'      => 'Google Cloud',
                'designation'  => 'Senior Cloud Solutions Architect',
                'is_featured'  => 1,
                'is_published' => 1,
                'views_count'  => 1420,
            ],
            [
                'title'        => 'Pioneering AI Horizons: Dr. Amanpreet Kaur on Research Frontiers',
                'slug'         => 'pioneering-ai-horizons-amanpreet-kaur',
                'summary'      => 'Building multilingual AI architectures at Microsoft while mentoring the next generation of women researchers in STEM.',
                'content'      => 'The foundational mathematics and analytical training at Akal University prepared me to pursue challenging problems in Artificial Intelligence and Natural Language Processing...',
                'batch_year'   => '2018-2020',
                'company'      => 'Microsoft AI',
                'designation'  => 'Lead AI/ML Research Engineer',
                'is_featured'  => 1,
                'is_published' => 1,
                'views_count'  => 1180,
            ]
        ];

        foreach ($stories as $st) {
            $stCheck = $db->table('success_stories')->where('slug', $st['slug'])->get()->getRow();
            if (!$stCheck) {
                $st['created_at'] = date('Y-m-d H:i:s');
                $st['updated_at'] = date('Y-m-d H:i:s');
                $db->table('success_stories')->insert($st);
            }
        }

        // 10. News & Announcements
        $news = [
            [
                'title'        => 'Akal University Alumni Portal Launched with Digital ID & Mentorship Hub',
                'slug'         => 'alumni-portal-launched',
                'category'     => 'Announcement',
                'content'      => 'We are pleased to unveil the centralized digital alumni portal of Akal University, enabling global connectivity, mentorship programs, job boards, and digital verified alumni ID cards.',
                'is_pinned'    => 1,
                'is_published' => 1,
                'published_at' => date('Y-m-d H:i:s'),
                'created_at'   => date('Y-m-d H:i:s'),
                'updated_at'   => date('Y-m-d H:i:s'),
            ],
            [
                'title'        => 'Distinguished Alumni Awards 2026 Nominations Open',
                'slug'         => 'distinguished-alumni-awards-2026-nominations',
                'category'     => 'Awards',
                'content'      => 'Nominations are now invited for the Annual Distinguished Alumni Awards celebrating outstanding achievements in Corporate Leadership, Academic Research, Entrepreneurship and Social Impact.',
                'is_pinned'    => 0,
                'is_published' => 1,
                'published_at' => date('Y-m-d H:i:s'),
                'created_at'   => date('Y-m-d H:i:s'),
                'updated_at'   => date('Y-m-d H:i:s'),
            ]
        ];

        foreach ($news as $n) {
            $nCheck = $db->table('news_announcements')->where('slug', $n['slug'])->get()->getRow();
            if (!$nCheck) {
                $db->table('news_announcements')->insert($n);
            }
        }

        // 11. Gallery Albums
        $albums = [
            ['title' => 'Annual Convocation & Graduation Ceremony', 'category' => 'Convocation', 'description' => 'Celebrating the milestones and academic excellence of our graduating batches.', 'event_date' => '2025-05-15', 'is_published' => 1],
            ['title' => 'Grand Alumni Meet & Cultural Evening', 'category' => 'Reunion', 'description' => 'Memorable highlights from the biennial alumni gathering on campus.', 'event_date' => '2024-11-10', 'is_published' => 1],
            ['title' => 'Campus Life & State-of-the-Art Facilities', 'category' => 'Campus', 'description' => 'Glimpses of modern laboratories, smart classrooms, sports arenas and lush green campus.', 'event_date' => '2025-02-20', 'is_published' => 1],
        ];

        foreach ($albums as $alb) {
            $albCheck = $db->table('gallery_albums')->where('title', $alb['title'])->get()->getRow();
            if (!$albCheck) {
                $alb['created_at'] = date('Y-m-d H:i:s');
                $alb['updated_at'] = date('Y-m-d H:i:s');
                $db->table('gallery_albums')->insert($alb);
            }
        }
    }
}
