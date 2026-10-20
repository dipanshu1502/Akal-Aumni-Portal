<?php

namespace App\Controllers\Api;

use App\Controllers\BaseController;
use App\Traits\ApiResponseTrait;

class PublicController extends BaseController
{
    use ApiResponseTrait;

    protected $db;

    public function __construct()
    {
        $this->db = \Config\Database::connect();
    }

    /**
     * Get Portal Settings & Configuration for Public View
     */
    public function getSettings()
    {
        $rows = $this->db->table('system_settings')->get()->getResultArray();
        $settings = [];
        foreach ($rows as $row) {
            $settings[$row['setting_key']] = $row['setting_value'];
        }

        return $this->respondSuccess($settings, 'Settings retrieved');
    }

    /**
     * Public Alumni Directory (with search, department, batch, company, and location filters)
     */
    public function getAlumni()
    {
        $builder = $this->db->table('alumni_profiles')
            ->select('alumni_profiles.id, alumni_profiles.user_id, alumni_profiles.first_name, alumni_profiles.last_name, alumni_profiles.degree, alumni_profiles.department, alumni_profiles.batch_year, alumni_profiles.graduation_year, alumni_profiles.current_company, alumni_profiles.current_designation, alumni_profiles.location_city, alumni_profiles.location_country, alumni_profiles.bio, alumni_profiles.skills, alumni_profiles.is_distinguished, alumni_profiles.distinguished_title, alumni_profiles.is_mentor, alumni_profiles.mentorship_topics, alumni_profiles.linkedin_url, alumni_profiles.profile_photo, alumni_profiles.show_email_public, IF(alumni_profiles.show_email_public = 1, users.email, NULL) as public_email, users.verification_status')
            ->join('users', 'users.id = alumni_profiles.user_id')
            ->where('alumni_profiles.is_public_profile', 1)
            ->where('users.status', 'active')
            ->whereNotIn('users.verification_status', ['pending', 'rejected']);

        // Filters
        $search = $this->request->getGet('search');
        if (!empty($search)) {
            $builder->groupStart()
                ->like('alumni_profiles.first_name', $search)
                ->orLike('alumni_profiles.last_name', $search)
                ->orLike('alumni_profiles.current_company', $search)
                ->orLike('alumni_profiles.current_designation', $search)
                ->orLike('alumni_profiles.skills', $search)
                ->orLike('alumni_profiles.location_city', $search)
                ->groupEnd();
        }

        $department = $this->request->getGet('department');
        if (!empty($department)) {
            $builder->where('alumni_profiles.department', $department);
        }

        $batch = $this->request->getGet('batch');
        if (!empty($batch)) {
            $builder->where('alumni_profiles.batch_year', $batch);
        }

        $isMentor = $this->request->getGet('mentor');
        if ($isMentor === '1' || $isMentor === 'true') {
            $builder->where('alumni_profiles.is_mentor', 1);
        }

        $isDistinguished = $this->request->getGet('distinguished');
        if ($isDistinguished === '1' || $isDistinguished === 'true') {
            $builder->where('alumni_profiles.is_distinguished', 1);
        }

        $builder->orderBy('alumni_profiles.is_distinguished', 'DESC');
        $builder->orderBy('alumni_profiles.id', 'DESC');

        $alumni = $builder->get()->getResultArray();

        return $this->respondSuccess($alumni, 'Alumni directory retrieved');
    }

    /**
     * Get Single Alumni Public Profile (by numeric id OR Alumni ID like AUAA2024012345)
     * QR scan isi endpoint se profile par aata hai.
     */
    public function getAlumniDetail($id)
    {
        $builder = $this->db->table('alumni_profiles')
            ->select('alumni_profiles.*, IF(alumni_profiles.show_email_public = 1, users.email, NULL) as public_email, users.verification_status')
            ->join('users', 'users.id = alumni_profiles.user_id')
            ->where('alumni_profiles.is_public_profile', 1)
            ->where('users.status', 'active')
            ->whereNotIn('users.verification_status', ['pending', 'rejected']);

        // /api/public/alumni/AUAAxxxxxxxxxx  (QR scan)
        if (!is_numeric($id)) {
            $builder->where('alumni_profiles.alumni_id', $id);
        } else {
            $builder->where('alumni_profiles.id', $id);
        }

        $alumni = $builder->get()->getRowArray();

        if (!$alumni) {
            return $this->respondError('Alumni profile not found', 404);
        }

        return $this->respondSuccess($alumni, 'Alumni profile retrieved');
    }

    /**
     * Public Events List
     */
    public function getEvents()
    {
        $events = $this->db->table('events')
            ->where('is_published', 1)
            ->where('deleted_at IS NULL')
            ->orderBy('start_datetime', 'ASC')
            ->get()->getResultArray();

        return $this->respondSuccess($events, 'Events retrieved');
    }

    /**
     * Public Jobs List
     */
    public function getJobs()
    {
        $jobs = $this->db->table('jobs')
            ->where('status', 'approved')
            ->where('deleted_at IS NULL')
            ->orderBy('created_at', 'DESC')
            ->get()->getResultArray();

        return $this->respondSuccess($jobs, 'Jobs retrieved');
    }

    /**
     * Public Chapters List
     */
    public function getChapters()
    {
        $chapters = $this->db->table('chapters')
            ->where('is_active', 1)
            ->orderBy('member_count', 'DESC')
            ->get()->getResultArray();

        return $this->respondSuccess($chapters, 'Chapters retrieved');
    }

    /**
     * Public Success Stories
     */
    public function getStories()
    {
        $stories = $this->db->table('success_stories')
            ->where('is_published', 1)
            ->orderBy('is_featured', 'DESC')
            ->orderBy('created_at', 'DESC')
            ->get()->getResultArray();

        return $this->respondSuccess($stories, 'Success stories retrieved');
    }

    /**
     * Public News & Announcements
     */
    public function getNews()
    {
        $news = $this->db->table('news_announcements')
            ->where('is_published', 1)
            ->orderBy('is_pinned', 'DESC')
            ->orderBy('published_at', 'DESC')
            ->get()->getResultArray();

        return $this->respondSuccess($news, 'News announcements retrieved');
    }

    /**
     * Public Gallery Albums
     */
    public function getGallery()
    {
        $gallery = $this->db->table('gallery_albums')
            ->where('is_published', 1)
            ->orderBy('event_date', 'DESC')
            ->get()->getResultArray();

        return $this->respondSuccess($gallery, 'Gallery albums retrieved');
    }

    /**
     * Public Donation Campaigns (only published)
     */
    public function getDonationCampaigns()
    {
        $campaigns = $this->db->table('donation_campaigns')
            ->where('is_published', 1)
            ->orderBy('is_featured', 'DESC')
            ->orderBy('created_at', 'DESC')
            ->get()->getResultArray();

        foreach ($campaigns as &$c) {
            $stats = $this->db->table('donations')
                ->select('COUNT(*) as total_donors, COALESCE(SUM(amount), 0) as total_raised')
                ->where('campaign_id', $c['id'])
                ->where('status', 'completed')
                ->get()->getRowArray();
            $c['total_donors'] = (int) ($stats['total_donors'] ?? 0);
            $c['raised_amount'] = (float) ($stats['total_raised'] ?? 0);
            // Don't expose internal fields publicly
            unset($c['created_by']);
        }

        return $this->respondSuccess($campaigns, 'Donation campaigns retrieved');
    }

    /**
     * Record a donation made by an authenticated user (any role).
     * Body: { campaign_id, amount, message?, payment_method?, is_anonymous? }
     */
    public function makeDonation()
    {
        $authUser = $this->request->authUser ?? null;
        if (!$authUser) {
            return $this->respondError('Authentication required to donate', 401);
        }

        $json = $this->request->getJSON(true);
        $campaignId = (int) ($json['campaign_id'] ?? 0);
        $amount = (float) ($json['amount'] ?? 0);

        if ($campaignId <= 0) {
            return $this->respondValidationError(['campaign_id' => 'Campaign is required']);
        }
        if ($amount <= 0) {
            return $this->respondValidationError(['amount' => 'Donation amount must be greater than 0']);
        }

        $campaign = $this->db->table('donation_campaigns')
            ->where('id', $campaignId)
            ->where('is_published', 1)
            ->get()->getRowArray();
        if (!$campaign) {
            return $this->respondError('Donation campaign not found', 404);
        }

        // Resolve donor identity from profile tables
        $donorName = '';
        $donorEmail = $authUser['email'] ?? '';
        $role = $authUser['role'] ?? '';
        if (in_array($role, ['admin', 'superadmin'], true)) {
            $p = $this->db->table('admin_profiles')->where('user_id', $authUser['id'])->get()->getRowArray();
            $donorName = trim($p['full_name'] ?? '');
        } elseif ($role === 'alumni') {
            $p = $this->db->table('alumni_profiles')->where('user_id', $authUser['id'])->get()->getRowArray();
            $donorName = trim(($p['first_name'] ?? '') . ' ' . ($p['last_name'] ?? ''));
        } elseif ($role === 'student') {
            $p = $this->db->table('student_profiles')->where('user_id', $authUser['id'])->get()->getRowArray();
            $donorName = trim(($p['first_name'] ?? '') . ' ' . ($p['last_name'] ?? ''));
        }
        if ($donorName === '') {
            $donorName = $donorEmail ?: 'Anonymous Donor';
        }

        $isAnonymous = !empty($json['is_anonymous']) ? 1 : 0;

        $this->db->table('donations')->insert([
            'campaign_id'    => $campaignId,
            'user_id'        => $authUser['id'] ?? null,
            'donor_name'     => $isAnonymous ? 'Anonymous' : mb_substr($donorName, 0, 200),
            'donor_email'    => mb_substr($donorEmail, 0, 191),
            'donor_phone'    => $json['donor_phone'] ?? null,
            'amount'         => $amount,
            'message'        => $json['message'] ?? null,
            'payment_method' => $json['payment_method'] ?? 'online',
            'transaction_id' => 'TXN-' . strtoupper(bin2hex(random_bytes(6))),
            'status'         => 'completed',
            'is_anonymous'   => $isAnonymous,
            'created_at'     => date('Y-m-d H:i:s'),
        ]);
        $donationId = $this->db->insertID();

        return $this->respondSuccess([
            'donation_id' => $donationId,
            'amount'      => $amount,
            'campaign'    => $campaign['title'],
        ], 'Thank you! Your donation has been recorded.');
    }

    /**
     * Portal General Statistics & Department Lists for Filter UI
     */
    public function getStats()
    {
        $totalAlumni = $this->db->table('users')->where('role', 'alumni')->where('status', 'active')->countAllResults();
        $verifiedAlumni = $this->db->table('users')->where('role', 'alumni')->where('verification_status', 'verified')->countAllResults();
        $totalStudents = $this->db->table('users')->where('role', 'student')->countAllResults();
        $totalEvents = $this->db->table('events')->where('is_published', 1)->where('deleted_at IS NULL')->countAllResults();
        $totalJobs = $this->db->table('jobs')->where('status', 'approved')->where('deleted_at IS NULL')->countAllResults();
        $totalMentors = $this->db->table('alumni_profiles')->where('is_mentor', 1)->countAllResults();
        $totalChapters = $this->db->table('chapters')->where('is_active', 1)->countAllResults();
        $totalStories = $this->db->table('success_stories')->where('is_published', 1)->countAllResults();
        $totalNews = $this->db->table('news_announcements')->where('is_published', 1)->countAllResults();
        $totalAlbums = $this->db->table('gallery_albums')->where('is_published', 1)->countAllResults();

        // Sum of all chapter members
        $chapterMembersRow = $this->db->table('chapters')->selectSum('member_count')->where('is_active', 1)->get()->getRow();
        $totalChapterMembers = (int)($chapterMembersRow->member_count ?? 0);

        // Get unique departments and batch years for filter chips
        $departments = $this->db->table('alumni_profiles')
            ->select('department')
            ->where('department IS NOT NULL')
            ->distinct()
            ->get()->getResultArray();

        $batches = $this->db->table('alumni_profiles')
            ->select('batch_year')
            ->where('batch_year IS NOT NULL')
            ->distinct()
            ->orderBy('batch_year', 'DESC')
            ->get()->getResultArray();

        return $this->respondSuccess([
            'counts' => [
                'total_alumni'          => $totalAlumni,
                'verified_alumni'       => $verifiedAlumni,
                'total_students'        => $totalStudents,
                'total_events'          => $totalEvents,
                'total_jobs'            => $totalJobs,
                'total_mentors'         => $totalMentors,
                'total_chapters'        => $totalChapters,
                'total_chapter_members' => $totalChapterMembers,
                'total_stories'         => $totalStories,
                'total_news'            => $totalNews,
                'total_albums'          => $totalAlbums,
            ],
            'departments' => array_column($departments, 'department'),
            'batches'     => array_column($batches, 'batch_year'),
        ], 'Public stats retrieved');
    }
}
