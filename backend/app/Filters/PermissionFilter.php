<?php

namespace App\Filters;

use CodeIgniter\Filters\FilterInterface;
use CodeIgniter\HTTP\RequestInterface;
use CodeIgniter\HTTP\ResponseInterface;
use Config\Services;

/**
 * PermissionFilter — granular admin permission guard.
 *
 * Usage in Routes:
 *   $routes->get('settings', 'Api\AdminController::getSettings', ['filter' => 'permission:manage_settings']);
 *   (must be combined with `auth` filter — auth runs first via globals/group)
 *
 * Superadmin bypasses all permission checks.
 * Permissions are stored as JSON in `admin_profiles.permissions`, e.g.:
 *   {"verify_alumni":true,"manage_events":true}
 *   or legacy list form: ["verify_alumni","manage_events"]
 */
class PermissionFilter implements FilterInterface
{
    public const AVAILABLE = [
        'verify_alumni'    => 'Verify alumni accounts (approve / reject)',
        'manage_alumni'    => 'Manage alumni accounts (view, activate / deactivate)',
        'manage_students'  => 'Manage student accounts (view, activate / deactivate)',
        'manage_users'     => 'Manage all user accounts & roles',
        'manage_admins'    => 'Add / remove admins & edit permissions (superadmin only)',
        'manage_events'    => 'Create / delete events',
        'manage_jobs'      => 'Approve / manage job board',
        'manage_stories'   => 'Manage success stories',
        'manage_news'      => 'Manage news & announcements',
        'manage_chapters'  => 'Manage chapters',
        'manage_gallery'   => 'Manage gallery albums',
        'manage_settings'  => 'Edit system settings & site customizer',
        'view_reports'     => 'View dashboard analytics & reports',
        'view_audit_logs'  => 'View audit logs',
    ];

    public function before(RequestInterface $request, $arguments = null)
    {
        // AuthFilter attaches authUser; if missing, let auth handle it
        $authUser = $request->authUser ?? null;
        if (!$authUser) {
            return null;
        }

        $role = $authUser['role'] ?? '';

        // Superadmin has every permission implicitly
        if ($role === 'superadmin') {
            return null;
        }

        // Only admin role is subject to granular checks here
        if ($role !== 'admin') {
            $response = Services::response();
            return $response->setStatusCode(403)->setJSON([
                'status'  => false,
                'message' => 'Forbidden: admin access required',
                'data'    => null,
                'errors'  => ['Admin role required'],
            ]);
        }

        if (empty($arguments)) {
            return $request;
        }

        $required = is_array($arguments) ? $arguments : explode(',', (string) $arguments);
        $required = array_map('trim', $required);

        $granted = self::getPermissionsForUser((int) ($authUser['id'] ?? 0));

        // Check if user has ANY of the specified permissions (OR matching)
        $hasAny = false;
        foreach ($required as $perm) {
            if ($perm === '') {
                continue;
            }
            if (!empty($granted[$perm])) {
                $hasAny = true;
                break;
            }
        }

        if (!$hasAny) {
            $response = Services::response();
            return $response->setStatusCode(403)->setJSON([
                'status'  => false,
                'message' => 'Forbidden: missing required permission (' . implode(' or ', $required) . ')',
                'data'    => null,
                'errors'  => ['Requires at least one permission: ' . implode(', ', $required)],
            ]);
        }

        return $request;
    }

    public function after(RequestInterface $request, ResponseInterface $response, $arguments = null)
    {
    }

    /**
     * Load granted permissions for an admin user id as map perm => true
     */
    public static function getPermissionsForUser(int $userId): array
    {
        if ($userId <= 0) {
            return [];
        }
        try {
            $db = \Config\Database::connect();
            $row = $db->table('admin_profiles')->where('user_id', $userId)->get()->getRowArray();
            if (!$row || empty($row['permissions'])) {
                return [];
            }
            return self::normalize($row['permissions']);
        } catch (\Throwable $e) {
            return [];
        }
    }

    /**
     * Normalize LONGTEXT JSON (map or list) into map perm => true
     *
     * @param string|array $raw
     */
    public static function normalize($raw): array
    {
        if (is_array($raw)) {
            $data = $raw;
        } else {
            $decoded = json_decode((string) $raw, true);
            if (!is_array($decoded)) {
                return [];
            }
            $data = $decoded;
        }

        $out = [];
        // List form: ["verify_alumni", ...]
        if (array_is_list($data)) {
            foreach ($data as $perm) {
                if (is_string($perm) && $perm !== '' && isset(self::AVAILABLE[$perm])) {
                    $out[$perm] = true;
                }
            }
            return $out;
        }

        // Map form: {"verify_alumni": true, ...}
        foreach ($data as $perm => $val) {
            if (isset(self::AVAILABLE[$perm]) && $val) {
                $out[$perm] = true;
            }
        }
        return $out;
    }

    /**
     * Filter out unknown keys, keep only catalogue permissions
     *
     * @param mixed $input array map or list
     */
    public static function sanitize($input): array
    {
        if (!is_array($input)) {
            return [];
        }
        $out = [];
        if (array_is_list($input)) {
            foreach ($input as $perm) {
                if (is_string($perm) && isset(self::AVAILABLE[$perm])) {
                    $out[$perm] = true;
                }
            }
        } else {
            foreach ($input as $perm => $val) {
                if (isset(self::AVAILABLE[$perm]) && $val) {
                    $out[$perm] = true;
                }
            }
        }
        return $out;
    }
}
