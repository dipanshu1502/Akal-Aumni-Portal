<?php

namespace App\Controllers\Api;

use App\Controllers\BaseController;
use App\Traits\ApiResponseTrait;

class StudentController extends BaseController
{
    use ApiResponseTrait;

    protected $db;

    public function __construct()
    {
        $this->db = \Config\Database::connect();
    }

    /**
     * Get Student Own Profile
     */
    public function getProfile()
    {
        $authUser = $this->request->authUser;
        $profile = $this->db->table('student_profiles')
            ->select('student_profiles.*, users.email, users.status')
            ->join('users', 'users.id = student_profiles.user_id')
            ->where('student_profiles.user_id', $authUser['id'])
            ->get()->getRowArray();

        if (!$profile) {
            return $this->respondError('Student profile not found', 404);
        }

        $profile['educations'] = $this->db->table('user_educations')
            ->where('user_id', $authUser['id'])
            ->orderBy('id', 'ASC')
            ->get()->getResultArray();

        return $this->respondSuccess($profile, 'Student profile retrieved');
    }

    /**
     * Update Student Profile
     */
    public function updateProfile()
    {
        $authUser = $this->request->authUser;
        $json = $this->request->getJSON(true);

        $allowedFields = [
            'first_name', 'last_name', 'phone', 'degree', 'department',
            'current_year', 'semester', 'bio', 'career_interests', 'linkedin_url',
            'github_url', 'profile_photo'
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
        $updateData['updated_at'] = date('Y-m-d H:i:s');

        $this->db->table('student_profiles')->where('user_id', $authUser['id'])->update($updateData);

        return $this->respondSuccess($updateData, 'Student profile updated successfully');
    }

    /**
     * Request Mentorship with an Alumni Mentor
     */
    public function requestMentorship()
    {
        $authUser = $this->request->authUser;
        $json = $this->request->getJSON(true);

        $mentorUserId = $json['mentor_user_id'] ?? null;
        $topic = trim($json['topic'] ?? '');
        $message = trim($json['message'] ?? '');

        if (!$mentorUserId || empty($topic)) {
            return $this->respondValidationError(['topic' => 'Mentor selection and mentorship topic are required']);
        }

        $data = [
            'mentor_user_id' => (int)$mentorUserId,
            'mentee_user_id' => $authUser['id'],
            'topic'          => $topic,
            'status'         => 'requested',
            'message'        => $message,
            'requested_at'   => date('Y-m-d H:i:s'),
            'created_at'     => date('Y-m-d H:i:s'),
            'updated_at'     => date('Y-m-d H:i:s'),
        ];

        $this->db->table('mentorship_programs')->insert($data);
        $id = $this->db->insertID();

        // Add Notification for Mentor
        $this->db->table('notifications')->insert([
            'user_id'    => (int)$mentorUserId,
            'title'      => 'New Mentorship Request',
            'message'    => "A student requested mentorship on: $topic",
            'type'       => 'action',
            'link_url'   => '/alumni/mentorship',
            'created_at' => date('Y-m-d H:i:s'),
        ]);

        return $this->respondSuccess(['id' => $id], 'Mentorship request submitted successfully');
    }

    /**
     * Get Student's Mentorship Requests & Sessions
     */
    public function getMyMentorships()
    {
        $authUser = $this->request->authUser;
        $mentorships = $this->db->table('mentorship_programs')
            ->select('mentorship_programs.*, alumni_profiles.first_name as mentor_first_name, alumni_profiles.last_name as mentor_last_name, alumni_profiles.current_company, alumni_profiles.current_designation, alumni_profiles.linkedin_url, users.email as mentor_email')
            ->join('alumni_profiles', 'alumni_profiles.user_id = mentorship_programs.mentor_user_id')
            ->join('users', 'users.id = mentorship_programs.mentor_user_id')
            ->where('mentorship_programs.mentee_user_id', $authUser['id'])
            ->orderBy('mentorship_programs.created_at', 'DESC')
            ->get()->getResultArray();

        return $this->respondSuccess($mentorships, 'Mentorship list retrieved');
    }

    /** Get the authenticated user's job applications, event registrations, and donations. */
    public function getMyActivities()
    {
        $userId = (int) $this->request->authUser['id'];
        $student = $this->db->table('users')
            ->select('email')
            ->where('id', $userId)
            ->get()->getRowArray();
        $applications = $this->db->table('job_applications')
            ->select('job_applications.id, job_applications.created_at as applied_at, jobs.id as job_id, jobs.title, jobs.company_name, jobs.job_type, jobs.location, jobs.salary_range, jobs.deadline, jobs.status')
            ->join('jobs', 'jobs.id = job_applications.job_id')
            ->where('job_applications.user_id', $userId)
            ->orderBy('job_applications.created_at', 'DESC')
            ->get()->getResultArray();

        $eventsQuery = $this->db->table('event_registrations')
            ->select('event_registrations.id, event_registrations.created_at as registered_at, event_registrations.tickets_count, events.id as event_id, events.title, events.event_type, events.start_datetime, events.end_datetime, events.venue as location, events.is_virtual')
            ->join('events', 'events.id = event_registrations.event_id')
            ->groupStart()
            ->where('event_registrations.user_id', $userId);
        if (!empty($student['email'])) {
            $eventsQuery->orGroupStart()
                ->where('event_registrations.user_id', null)
                ->where('event_registrations.attendee_email', $student['email'])
                ->groupEnd();
        }
        $events = $eventsQuery->groupEnd()
            ->orderBy('event_registrations.created_at', 'DESC')
            ->get()->getResultArray();
        $donations = $this->getDonationRows($userId);

        return $this->respondSuccess([
            'applications' => $applications,
            'events' => $events,
            'donations' => $donations,
        ], 'Student activities retrieved');
    }

    /** Get only the authenticated user's donation records. */
    public function getMyDonations()
    {
        return $this->respondSuccess(
            $this->getDonationRows((int) $this->request->authUser['id']),
            'Your donations retrieved'
        );
    }

    private function getDonationRows(int $userId): array
    {
        return $this->db->table('donations')
            ->select('donations.id, donations.campaign_id, donations.amount, donations.message, donations.transaction_id, donations.status, donations.created_at, donation_campaigns.title AS campaign_title')
            ->join('donation_campaigns', 'donation_campaigns.id = donations.campaign_id', 'left')
            ->where('donations.user_id', $userId)
            ->orderBy('donations.created_at', 'DESC')
            ->get()->getResultArray();
    }
}
