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
