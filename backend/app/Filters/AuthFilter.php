<?php

namespace App\Filters;

use App\Libraries\JwtService;
use CodeIgniter\Filters\FilterInterface;
use CodeIgniter\HTTP\RequestInterface;
use CodeIgniter\HTTP\ResponseInterface;
use Config\Services;

class AuthFilter implements FilterInterface
{
    public function before(RequestInterface $request, $arguments = null)
    {
        $authHeader = $request->getServer('HTTP_AUTHORIZATION') ?? $request->getHeaderLine('Authorization');

        if (!$authHeader || !preg_match('/Bearer\s+(.+)/', $authHeader, $matches)) {
            $response = Services::response();
            return $response->setStatusCode(401)->setJSON([
                'status'  => false,
                'message' => 'Unauthorized: Authentication token required',
                'data'    => null,
                'errors'  => ['Token missing']
            ]);
        }

        $token = $matches[1];
        $payload = JwtService::validateToken($token);

        if (!$payload) {
            $response = Services::response();
            return $response->setStatusCode(401)->setJSON([
                'status'  => false,
                'message' => 'Unauthorized: Invalid or expired token',
                'data'    => null,
                'errors'  => ['Token expired or invalid']
            ]);
        }

        // Attach authenticated user to request context or global
        $request->authUser = $payload;

        // Alumni accounts are gated by admin approval — check the LIVE status on every
        // request so a pending/rejected alumni can never use the API, even with an old token.
        if (($payload['role'] ?? '') === 'alumni' && !empty($payload['id'])) {
            $row = \Config\Database::connect()
                ->table('users')
                ->select('status, verification_status')
                ->where('id', $payload['id'])
                ->get()
                ->getRowArray();

            $isPending = !$row
                || $row['status'] === 'pending'
                || $row['verification_status'] === 'pending';
            $isBlocked = $row && (
                in_array($row['status'], ['rejected', 'suspended'], true)
                || $row['verification_status'] === 'rejected'
            );

            if ($isPending || $isBlocked) {
                $message = $isPending
                    ? 'Your registration request is awaiting admin approval. Access will be enabled once an administrator approves your alumni account.'
                    : 'Your alumni account is not active. Please contact the Alumni Office.';

                return Services::response()->setStatusCode(403)->setJSON([
                    'status'  => false,
                    'message' => $message,
                    'data'    => null,
                    'errors'  => [$message],
                ]);
            }
        }

        // Check role arguments if provided
        if (!empty($arguments)) {
            $allowedRoles = is_array($arguments) ? $arguments : explode(',', $arguments);
            $userRole = $payload['role'] ?? '';

            // Super Admin can access admin routes
            if ($userRole === 'superadmin') {
                return $request;
            }

            if (!in_array($userRole, $allowedRoles, true)) {
                $response = Services::response();
                return $response->setStatusCode(403)->setJSON([
                    'status'  => false,
                    'message' => 'Forbidden: Insufficient privileges for this resource',
                    'data'    => null,
                    'errors'  => ['Access denied for role: ' . $userRole]
                ]);
            }
        }

        return $request;
    }

    public function after(RequestInterface $request, ResponseInterface $response, $arguments = null)
    {
        // No post-processing needed
    }
}
