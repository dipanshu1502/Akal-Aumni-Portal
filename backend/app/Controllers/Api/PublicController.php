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
            if ($row['setting_key'] === 'donation_upi_qr_path') {
                continue;
            }
            $settings[$row['setting_key']] = $row['setting_value'];
        }
        $qrSetting = $this->db->table('system_settings')
            ->select('setting_value')
            ->where('setting_key', 'donation_upi_qr_path')
            ->get()->getRowArray();
        $settings['donation_upi_qr_url'] = !empty($qrSetting['setting_value'])
            ? '/api/public/donation-payment-qr'
            : '';

        return $this->respondSuccess($settings, 'Settings retrieved');
    }

    /** Serve the configured donation UPI QR image from private writable storage. */
    public function getDonationPaymentQr()
    {
        $setting = $this->db->table('system_settings')
            ->select('setting_value')
            ->where('setting_key', 'donation_upi_qr_path')
            ->get()->getRowArray();
        $fileName = basename((string) ($setting['setting_value'] ?? ''));
        if ($fileName === '') {
            return $this->respondError('Donation UPI QR image is not configured', 404);
        }

        $filePath = WRITEPATH . 'uploads' . DIRECTORY_SEPARATOR . 'donation-qr' . DIRECTORY_SEPARATOR . $fileName;
        if (!is_file($filePath)) {
            return $this->respondError('Donation UPI QR image is unavailable', 404);
        }

        $extension = strtolower(pathinfo($fileName, PATHINFO_EXTENSION));
        $mimeTypes = ['jpg' => 'image/jpeg', 'png' => 'image/png', 'webp' => 'image/webp'];
        if (!isset($mimeTypes[$extension])) {
            return $this->respondError('Donation UPI QR image type is not supported', 415);
        }

        $contents = file_get_contents($filePath);
        if ($contents === false) {
            return $this->respondError('Donation UPI QR image could not be read', 500);
        }

        return $this->response
            ->setContentType($mimeTypes[$extension])
            ->setHeader('Cache-Control', 'no-cache, must-revalidate')
            ->setHeader('X-Content-Type-Options', 'nosniff')
            ->setBody($contents);
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
     * Supports optional `filter` query parameter:
     *   - upcoming: events whose start_datetime >= NOW
     *   - past:     events whose start_datetime < NOW
     */
    public function getEvents()
    {
        $builder = $this->db->table('events')
            ->select('events.*, (SELECT COUNT(*) FROM event_registrations WHERE event_registrations.event_id = events.id) AS registration_count', false)
            ->where('is_published', 1)
            ->where('deleted_at IS NULL')
            ->orderBy('start_datetime', 'ASC');

        $filter = $this->request->getGet('filter');
        $department = trim((string) ($this->request->getGet('department') ?? ''));
        if ($department !== '') {
            $builder->where('department', $department);
        }
        $now = date('Y-m-d H:i:s');
        if ($filter === 'upcoming') {
            $builder->where('start_datetime >=', $now);
        } elseif ($filter === 'past') {
            $builder->where('start_datetime <', $now);
        }

        $events = $builder->get()->getResultArray();

        return $this->respondSuccess($events, 'Events retrieved');
    }

    /** Register a visitor for a published event. */
    public function registerForEvent($eventId)
    {
        if (!$this->db->tableExists('event_registrations')) {
            return $this->respondError('Event registration storage is not available. Run the database migrations.', 500);
        }

        $event = $this->db->table('events')
            ->where('id', (int) $eventId)
            ->where('is_published', 1)
            ->where('deleted_at IS NULL')
            ->get()->getRowArray();
        if (!$event) {
            return $this->respondError('This event is not available for registration.', 404);
        }

        $json = $this->request->getJSON(true) ?? [];
        $name = trim((string) ($json['attendee_name'] ?? ''));
        $email = trim((string) ($json['attendee_email'] ?? ''));
        $phone = trim((string) ($json['attendee_phone'] ?? ''));
        $errors = [];
        if ($name === '') $errors['attendee_name'] = 'Name is required';
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) $errors['attendee_email'] = 'Enter a valid email address';
        if ($errors) return $this->respondValidationError($errors);

        if (!empty($event['registration_deadline']) && strtotime($event['registration_deadline']) < time()) {
            return $this->respondError('Registration for this event has closed.', 400);
        }
        $authUser = $this->request->authUser ?? null;
        $duplicateQuery = $this->db->table('event_registrations')
            ->where('event_id', (int) $eventId);
        if (!empty($authUser['id'])) {
            $duplicateQuery->groupStart()
                ->where('attendee_email', $email)
                ->orWhere('user_id', (int) $authUser['id'])
                ->groupEnd();
        } else {
            $duplicateQuery->where('attendee_email', $email);
        }
        $duplicate = $duplicateQuery->countAllResults();
        if ($duplicate > 0) {
            return $this->respondError('This email is already registered for the event.', 409);
        }

        $capacity = (int) ($event['max_capacity'] ?? 0);
        if ($capacity > 0) {
            $registrationTotals = $this->db->table('event_registrations')
                ->selectSum('tickets_count', 'total')
                ->where('event_id', (int) $eventId)
                ->get()->getRowArray();
            $registeredCount = (int) ($registrationTotals['total'] ?? 0);
            if ($registeredCount >= $capacity) {
                return $this->respondError('This event has reached its registration capacity.', 409);
            }
        }

        $now = date('Y-m-d H:i:s');
        $saved = $this->db->table('event_registrations')->insert([
            'event_id' => (int) $eventId,
            'user_id' => !empty($authUser['id']) ? (int) $authUser['id'] : null,
            'attendee_name' => $name,
            'attendee_email' => $email,
            'attendee_phone' => $phone !== '' ? $phone : null,
            'tickets_count' => 1,
            'checkin_status' => 0,
            'created_at' => $now,
            'updated_at' => $now,
        ]);
        if (!$saved) {
            return $this->respondError('Registration could not be saved. Please try again.', 500);
        }
        $registrationId = (int) $this->db->insertID();
        if ($registrationId <= 0) {
            return $this->respondError('Registration could not be confirmed in the database. Please try again.', 500);
        }

        return $this->respondSuccess([
            'id' => $registrationId,
            'registration_count' => $this->db->table('event_registrations')->where('event_id', (int) $eventId)->countAllResults(),
        ], 'Event registration successful');
    }

    /** Persist a signed-in alumni or student's application for an approved job. */
    public function applyForJob($jobId)
    {
        $authUser = $this->request->authUser ?? [];
        $userId = (int) ($authUser['id'] ?? 0);
        if (!in_array($authUser['role'] ?? '', ['alumni', 'student'], true) || !$userId) {
            return $this->respondError('Only signed-in alumni and students can apply for jobs.', 403);
        }

        $job = $this->db->table('jobs')->select('id, status, deadline, posted_by_user_id')
            ->where('id', (int) $jobId)->where('deleted_at IS NULL', null, false)->get()->getRowArray();
        if (!$job || $job['status'] !== 'approved' || (!empty($job['deadline']) && $job['deadline'] < date('Y-m-d'))) {
            return $this->respondError('This job is not accepting applications.', 404);
        }
        if ((int) ($job['posted_by_user_id'] ?? 0) === $userId) {
            return $this->respondError('You cannot apply to your own job posting.', 400);
        }
        if ($this->db->table('job_applications')->where('job_id', (int) $jobId)->where('user_id', $userId)->countAllResults() > 0) {
            return $this->respondError('You have already applied for this job.', 409);
        }

        $now = date('Y-m-d H:i:s');
        $saved = $this->db->table('job_applications')->insert([
            'job_id' => (int) $jobId,
            'user_id' => $userId,
            'created_at' => $now,
            'updated_at' => $now,
        ]);
        if (!$saved) {
            return $this->respondError('Application could not be saved. Please try again.', 500);
        }
        return $this->respondSuccess(['id' => $this->db->insertID()], 'Job application submitted successfully');
    }

    /** Public Jobs List */
    public function getJobs()
    {
        $jobs = $this->db->table('jobs')
            ->select('jobs.*, (SELECT COUNT(*) FROM job_applications WHERE job_applications.job_id = jobs.id) AS application_count', false)
            ->where('jobs.status', 'approved')
            ->where('deleted_at IS NULL')
            ->orderBy('jobs.created_at', 'DESC')
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
            ->select('gallery_albums.id, gallery_albums.title, gallery_albums.category, gallery_albums.cover_image, gallery_albums.description, gallery_albums.event_date, gallery_albums.is_published, gallery_albums.photos_json,
                event_reports.email_address as report_email, event_reports.coordinators as report_coordinators,
                event_reports.department as report_department, event_reports.event_type as report_event_type,
                event_reports.event_date as report_event_date, event_reports.speaker_name as report_speaker_name,
                event_reports.speaker_uid as report_speaker_uid, event_reports.batch as report_batch,
                event_reports.participants_count as report_participants_count, event_reports.detailed_report as report_details,
                event_reports.learning_outcomes as report_learning_outcomes,
                event_reports.photos_json as report_photos_json')
            ->join('event_reports', 'event_reports.event_id = gallery_albums.event_id', 'left')
            ->where('gallery_albums.is_published', 1)
            ->orderBy('gallery_albums.event_date', 'DESC')
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

    /** Submit a bank-transfer donation and its payment proof for admin review. */
    public function makeDonation()
    {
        $authUser = $this->request->authUser ?? null;
        if (!$authUser) {
            return $this->respondError('Authentication required to donate', 401);
        }

        $campaignId = (int) $this->request->getPost('campaign_id');
        $amountInput = $this->request->getPost('amount');
        $amount = is_numeric($amountInput) ? (float) $amountInput : 0;
        $file = $this->request->getFile('payment_proof');

        if ($campaignId <= 0) {
            return $this->respondValidationError(['campaign_id' => 'Campaign is required']);
        }
        if (!is_finite($amount) || $amount <= 0 || $amount > 9999999999.99) {
            return $this->respondValidationError(['amount' => 'Donation amount must be greater than 0']);
        }
        if (!$file || !$file->isValid() || $file->hasMoved()) {
            return $this->respondValidationError(['payment_proof' => 'Upload a clear payment screenshot']);
        }
        if ($file->getSize() > 5 * 1024 * 1024) {
            return $this->respondValidationError(['payment_proof' => 'Payment screenshot must be 5 MB or smaller']);
        }

        $mimeType = $file->getMimeType();
        $allowedTypes = [
            'image/jpeg' => 'jpg',
            'image/png' => 'png',
            'image/webp' => 'webp',
        ];
        if (!isset($allowedTypes[$mimeType])) {
            return $this->respondValidationError(['payment_proof' => 'Upload a JPG, PNG, or WebP screenshot']);
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

        $isAnonymous = $this->request->getPost('is_anonymous') === '1' ? 1 : 0;
        $uploadDirectory = WRITEPATH . 'uploads/donation-proofs';
        if (!is_dir($uploadDirectory) && !mkdir($uploadDirectory, 0750, true) && !is_dir($uploadDirectory)) {
            return $this->respondError('Payment proof storage is unavailable. Please try again later.', 500);
        }

        $proofName = bin2hex(random_bytes(16)) . '.' . $allowedTypes[$mimeType];
        if (!$file->move($uploadDirectory, $proofName)) {
            return $this->respondError('Payment screenshot could not be saved. Please try again.', 500);
        }

        $saved = $this->db->table('donations')->insert([
            'campaign_id'    => $campaignId,
            'user_id'        => $authUser['id'] ?? null,
            'donor_name'     => $isAnonymous ? 'Anonymous' : mb_substr($donorName, 0, 200),
            'donor_email'    => mb_substr($donorEmail, 0, 191),
            'donor_phone'    => null,
            'amount'         => $amount,
            'message'        => mb_substr((string) $this->request->getPost('message'), 0, 5000),
            'payment_method' => 'bank_transfer',
            'transaction_id' => mb_substr(trim((string) $this->request->getPost('transaction_id')), 0, 255) ?: null,
            'proof_path'     => 'donation-proofs/' . $proofName,
            'status'         => 'pending',
            'is_anonymous'   => $isAnonymous,
            'created_at'     => date('Y-m-d H:i:s'),
        ]);
        if (!$saved) {
            $orphanedProof = $uploadDirectory . DIRECTORY_SEPARATOR . $proofName;
            if (is_file($orphanedProof) && !unlink($orphanedProof)) {
                log_message('error', 'Could not remove an orphaned donation proof file.');
            }
            return $this->respondError('Donation could not be submitted. Please try again.', 500);
        }
        $donationId = $this->db->insertID();

        return $this->respondSuccess([
            'donation_id' => $donationId,
            'amount'      => $amount,
            'campaign'    => $campaign['title'],
            'status'      => 'pending',
        ], 'Donation proof submitted. Your contribution will be added after admin verification.');
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
