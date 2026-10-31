<?php

use CodeIgniter\Router\RouteCollection;
use CodeIgniter\Config\Services;

/** @var RouteCollection $routes */

$routes->get('/', 'Home::index');

// API Group
$routes->group('api', function ($routes) {

    // Options preflight handler for CORS
    $routes->options('(:any)', fn () => Services::response()->setStatusCode(200));

    // Public Routes
    $routes->group('public', function ($routes) {
        $routes->get('settings', 'Api\PublicController::getSettings');
        $routes->get('stats', 'Api\PublicController::getStats');
        $routes->get('alumni', 'Api\PublicController::getAlumni');
        $routes->get('alumni/(:any)', 'Api\PublicController::getAlumniDetail/$1');
        $routes->get('events', 'Api\PublicController::getEvents');
        $routes->post('events/(:num)/register', 'Api\PublicController::registerForEvent/$1');
        $routes->get('jobs', 'Api\PublicController::getJobs');
        $routes->get('chapters', 'Api\PublicController::getChapters');
        $routes->get('stories', 'Api\PublicController::getStories');
        $routes->get('news', 'Api\PublicController::getNews');
        $routes->get('gallery', 'Api\PublicController::getGallery');
        $routes->get('donations', 'Api\PublicController::getDonationCampaigns');
    });

    // Auth Routes
    $routes->group('auth', function ($routes) {
        $routes->post('login', 'Api\AuthController::login');
        $routes->post('register', 'Api\AuthController::register');
        $routes->get('me', 'Api\AuthController::me', ['filter' => 'auth']);
    });

    // Authenticated user routes (any logged-in role — e.g. donate)
    $routes->group('user', ['filter' => 'auth'], function ($routes) {
        $routes->post('donate', 'Api\PublicController::makeDonation');
        $routes->post('jobs/(:num)/apply', 'Api\PublicController::applyForJob/$1');
    });

    // Alumni Authenticated Routes
    $routes->group('alumni', ['filter' => 'auth:alumni'], function ($routes) {
        $routes->get('profile', 'Api\AlumniController::getProfile');
        $routes->put('profile', 'Api\AlumniController::updateProfile');
        $routes->get('id-card', 'Api\AlumniController::getIdCard');
        $routes->post('jobs', 'Api\AlumniController::postJob');
        $routes->get('jobs', 'Api\AlumniController::getMyJobs');
        $routes->get('jobs/(:num)/applications', 'Api\AlumniController::getMyJobApplications/$1');
        $routes->get('mentorship-requests', 'Api\AlumniController::getMentorshipRequests');
        $routes->put('mentorship-requests/(:num)', 'Api\AlumniController::updateMentorshipStatus/$1');
    });

    // Student Authenticated Routes
    $routes->group('student', ['filter' => 'auth:student'], function ($routes) {
        $routes->get('profile', 'Api\StudentController::getProfile');
        $routes->put('profile', 'Api\StudentController::updateProfile');
        $routes->post('mentorship-request', 'Api\StudentController::requestMentorship');
        $routes->get('my-mentorships', 'Api\StudentController::getMyMentorships');
    });

    // Admin & Super Admin Authenticated Routes
    $routes->group('admin', ['filter' => 'auth:admin,superadmin'], function ($routes) {
        $routes->get('birthday-emails', 'Api\BirthdayEmailController::getSettings', ['filter' => 'permission:manage_birthday_emails']);
        $routes->put('birthday-emails', 'Api\BirthdayEmailController::saveSettings', ['filter' => 'permission:manage_birthday_emails']);
        $routes->post('birthday-emails/preview', 'Api\BirthdayEmailController::preview', ['filter' => 'permission:manage_birthday_emails']);
        $routes->post('birthday-emails/test', 'Api\BirthdayEmailController::sendTest', ['filter' => 'permission:manage_birthday_emails']);
        $routes->get('birthday-emails/history', 'Api\BirthdayEmailController::history', ['filter' => 'permission:manage_birthday_emails']);

        $routes->get('dashboard', 'Api\AdminController::getDashboard');
        $routes->get('mentorship-requests', 'Api\AdminController::getMentorshipRequests');
        $routes->get('alumni-mentors', 'Api\AdminController::getAlumniMentorRoster');
        $routes->get('alumni-mentors/(:num)/students', 'Api\AdminController::getMentorStudents/$1');
        $routes->get('verifications', 'Api\AdminController::getPendingVerifications', ['filter' => 'permission:verify_alumni,manage_alumni,manage_users']);
        $routes->post('verifications/(:num)/approve', 'Api\AdminController::approveVerification/$1', ['filter' => 'permission:verify_alumni,manage_alumni,manage_users']);
        $routes->post('verifications/(:num)/reject', 'Api\AdminController::rejectVerification/$1', ['filter' => 'permission:verify_alumni,manage_alumni,manage_users']);
        
        // Users Management (requires manage_users OR manage_alumni OR manage_students)
        $routes->get('users', 'Api\AdminController::getAllUsers', ['filter' => 'permission:manage_users,manage_alumni,manage_students']);
        $routes->get('reports/alumni', 'Api\AdminController::getAlumniReport');
        // Full profile of any user (alumni / student / admin) — Manage tabs ke "Full Info" modal ke liye
        $routes->get('users/(:num)/detail', 'Api\AdminController::getUserDetail/$1', ['filter' => 'permission:manage_users,manage_alumni,manage_students']);
        // Role changes are superadmin-only (checked inside controller);
        // status changes: superadmin OR admin with appropriate permission (checked inside controller)
        $routes->put('users/(:num)/role', 'Api\AdminController::updateUserRole/$1');
        $routes->put('users/(:num)/status', 'Api\AdminController::updateUserStatus/$1');

        // Admin accounts management (superadmin-only, checked inside controller)
        $routes->get('admins', 'Api\AdminController::getAdmins');
        $routes->get('admin-permissions', 'Api\AdminController::getAdminPermissionsCatalogue');
        $routes->post('admins', 'Api\AdminController::createAdmin');
        $routes->put('admins/(:num)', 'Api\AdminController::updateAdminPermissions/$1');
        $routes->put('admins/(:num)/permissions', 'Api\AdminController::updateAdminPermissions/$1');
        $routes->delete('admins/(:num)', 'Api\AdminController::deleteAdmin/$1');

        // Events (requires manage_events)
        $routes->post('events', 'Api\AdminController::saveEvent', ['filter' => 'permission:manage_events']);
        $routes->delete('events/(:num)', 'Api\AdminController::deleteEvent/$1', ['filter' => 'permission:manage_events']);
        $routes->get('events/(:num)/registrations', 'Api\AdminController::getEventRegistrations/$1', ['filter' => 'permission:manage_events']);

        // Settings (requires manage_settings)
        $routes->get('settings', 'Api\AdminController::getSettings', ['filter' => 'permission:manage_settings']);
        $routes->post('settings', 'Api\AdminController::saveSettings', ['filter' => 'permission:manage_settings']);
        $routes->post('settings/custom', 'Api\AdminController::addCustomSetting', ['filter' => 'permission:manage_settings']);
        $routes->delete('settings/(:segment)', 'Api\AdminController::deleteSetting/$1', ['filter' => 'permission:manage_settings']);

        // Stories CMS (requires manage_stories)
        $routes->get('stories', 'Api\AdminController::getStories');
        $routes->post('stories', 'Api\AdminController::saveStory', ['filter' => 'permission:manage_stories']);
        $routes->delete('stories/(:num)', 'Api\AdminController::deleteStory/$1', ['filter' => 'permission:manage_stories']);

        // News CMS (requires manage_news)
        $routes->get('news', 'Api\AdminController::getNews');
        $routes->post('news', 'Api\AdminController::saveNews', ['filter' => 'permission:manage_news']);
        $routes->delete('news/(:num)', 'Api\AdminController::deleteNews/$1', ['filter' => 'permission:manage_news']);

        // Chapters CMS (requires manage_chapters)
        $routes->get('chapters', 'Api\AdminController::getChapters');
        $routes->post('chapters', 'Api\AdminController::saveChapter', ['filter' => 'permission:manage_chapters']);
        $routes->delete('chapters/(:num)', 'Api\AdminController::deleteChapter/$1', ['filter' => 'permission:manage_chapters']);

        // Jobs CMS (requires manage_jobs)
        $routes->get('jobs', 'Api\AdminController::getJobs', ['filter' => 'permission:manage_jobs']);
        $routes->get('jobs/(:num)/applications', 'Api\AdminController::getJobApplications/$1', ['filter' => 'permission:manage_jobs']);
        $routes->post('jobs', 'Api\AdminController::saveJob', ['filter' => 'permission:manage_jobs']);
        $routes->delete('jobs/(:num)', 'Api\AdminController::deleteJob/$1', ['filter' => 'permission:manage_jobs']);

        // Gallery CMS (requires manage_gallery)
        $routes->get('gallery', 'Api\AdminController::getGallery');
        $routes->post('gallery', 'Api\AdminController::saveGallery', ['filter' => 'permission:manage_gallery']);
        $routes->delete('gallery/(:num)', 'Api\AdminController::deleteGallery/$1', ['filter' => 'permission:manage_gallery']);

        // Donation Campaigns CMS (requires manage_donations)
        $routes->get('donation-campaigns', 'Api\AdminController::getDonationCampaigns', ['filter' => 'permission:manage_donations']);
        $routes->post('donation-campaigns', 'Api\AdminController::saveDonationCampaign', ['filter' => 'permission:manage_donations']);
        $routes->delete('donation-campaigns/(:num)', 'Api\AdminController::deleteDonationCampaign/$1', ['filter' => 'permission:manage_donations']);
        $routes->get('donations', 'Api\AdminController::getDonations', ['filter' => 'permission:manage_donations']);

        // Audit Logs (requires view_audit_logs)
        $routes->get('audit-logs', 'Api\AdminController::getAuditLogs', ['filter' => 'permission:view_audit_logs']);
    });
});
