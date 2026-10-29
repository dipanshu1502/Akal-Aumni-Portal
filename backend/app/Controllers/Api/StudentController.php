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
}
