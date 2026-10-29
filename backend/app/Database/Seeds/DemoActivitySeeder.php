<?php

namespace App\Database\Seeds;

use CodeIgniter\Database\Seeder;

class DemoActivitySeeder extends Seeder
{
    public function run()
    {
        $db = \Config\Database::connect();
        $now = date('Y-m-d H:i:s');

        // The technical webinar is a clear department-specific example for the dashboard.
        $db->table('events')
            ->where('slug', 'global-tech-leadership-ai-webinar')
            ->groupStart()->where('department', null)->orWhere('department', '')->groupEnd()
            ->update(['department' => 'CSE', 'updated_at' => $now]);

        $student = $db->table('users')
            ->select('users.id, users.email, student_profiles.first_name, student_profiles.last_name, student_profiles.phone')
            ->join('student_profiles', 'student_profiles.user_id = users.id')
            ->where('users.role', 'student')
            ->orderBy('users.id', 'ASC')
            ->get()->getRowArray();

        $mentors = $db->table('users')
            ->select('users.id, users.email, alumni_profiles.first_name, alumni_profiles.last_name, alumni_profiles.phone, alumni_profiles.mentorship_topics')
            ->join('alumni_profiles', 'alumni_profiles.user_id = users.id')
            ->where('users.role', 'alumni')
            ->where('alumni_profiles.is_mentor', 1)
            ->orderBy('users.id', 'ASC')
            ->limit(2)
            ->get()->getResultArray();

        if ($student) {
            $event = $db->table('events')->where('slug', 'grand-alumni-homecoming-2026')->get()->getRowArray();
            if ($event) {
                $alreadyRegistered = $db->table('event_registrations')
                    ->where('event_id', $event['id'])->where('user_id', $student['id'])->countAllResults();
                if (!$alreadyRegistered) {
                    $db->table('event_registrations')->insert([
                        'event_id' => $event['id'],
                        'user_id' => $student['id'],
                        'attendee_name' => trim(($student['first_name'] ?? '') . ' ' . ($student['last_name'] ?? '')) ?: 'Demo Student',
                        'attendee_email' => $student['email'],
                        'attendee_phone' => $student['phone'] ?? null,
                        'tickets_count' => 1,
                        'qr_code' => 'DEMO-EVENT-' . $event['id'] . '-' . $student['id'],
                        'checkin_status' => 1,
                        'checkin_time' => $now,
                        'created_at' => $now,
                        'updated_at' => $now,
                    ]);
                }
            }

            $careerFair = $db->table('events')->where('slug', 'akal-career-fair-2026')->get()->getRowArray();
            if ($careerFair && count($mentors) > 0) {
                $existingDemoRegistration = $db->table('event_registrations')
                    ->where('user_id', $mentors[0]['id'])->like('qr_code', 'DEMO-EVENT-', 'after')
                    ->orderBy('id', 'ASC')->get()->getRowArray();
                if ($existingDemoRegistration && (int) $existingDemoRegistration['event_id'] !== (int) $careerFair['id']) {
                    $db->table('event_registrations')->where('id', $existingDemoRegistration['id'])->update([
                        'event_id' => $careerFair['id'],
                        'qr_code' => 'DEMO-EVENT-' . $careerFair['id'] . '-' . $mentors[0]['id'],
                        'updated_at' => $now,
                    ]);
                }
                $alreadyRegistered = $db->table('event_registrations')
                    ->where('event_id', $careerFair['id'])->where('user_id', $mentors[0]['id'])->countAllResults();
                if (!$alreadyRegistered) {
                    $db->table('event_registrations')->insert([
                        'event_id' => $careerFair['id'],
                        'user_id' => $mentors[0]['id'],
                        'attendee_name' => trim(($mentors[0]['first_name'] ?? '') . ' ' . ($mentors[0]['last_name'] ?? '')) ?: 'Demo Alumni',
                        'attendee_email' => $mentors[0]['email'],
                        'attendee_phone' => $mentors[0]['phone'] ?? null,
                        'tickets_count' => 1,
                        'qr_code' => 'DEMO-EVENT-' . $careerFair['id'] . '-' . $mentors[0]['id'],
                        'checkin_status' => 0,
                        'created_at' => $now,
                        'updated_at' => $now,
                    ]);
                }
            }

            foreach ($mentors as $index => $mentor) {
                $topic = $index === 0 ? 'Career planning and industry mentorship' : 'Higher studies and research guidance';
                $exists = $db->table('mentorship_programs')
                    ->where('mentor_user_id', $mentor['id'])
                    ->where('mentee_user_id', $student['id'])
                    ->where('topic', $topic)
                    ->countAllResults();
                if (!$exists) {
                    $status = $index === 0 ? 'accepted' : 'requested';
                    $db->table('mentorship_programs')->insert([
                        'mentor_user_id' => $mentor['id'],
                        'mentee_user_id' => $student['id'],
                        'topic' => $topic,
                        'status' => $status,
                        'message' => '[DEMO] Sample mentorship request for portal preview.',
                        'notes' => $status === 'accepted' ? '[DEMO] Sample accepted mentorship connection.' : null,
                        'requested_at' => $now,
                        'accepted_at' => $status === 'accepted' ? $now : null,
                        'created_at' => $now,
                        'updated_at' => $now,
                    ]);
                }
            }
        }

        echo "Demo activity seeded (duplicate-safe).\n";
    }
}
