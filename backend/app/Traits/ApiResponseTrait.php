<?php

namespace App\Traits;

use CodeIgniter\HTTP\ResponseInterface;

trait ApiResponseTrait
{
    /**
     * Send standardized JSON success response
     */
    protected function respondSuccess($data = [], string $message = 'Request successful', int $statusCode = 200): ResponseInterface
    {
        return $this->response->setStatusCode($statusCode)->setJSON([
            'status'  => true,
            'message' => $message,
            'data'    => $data,
            'errors'  => []
        ]);
    }

    /**
     * Send standardized JSON error response
     */
    protected function respondError(string $message = 'An error occurred', int $statusCode = 400, $errors = []): ResponseInterface
    {
        return $this->response->setStatusCode($statusCode)->setJSON([
            'status'  => false,
            'message' => $message,
            'data'    => null,
            'errors'  => is_array($errors) ? $errors : [$errors]
        ]);
    }

    /**
     * Send standardized JSON validation error response
     */
    protected function respondValidationError($errors, string $message = 'Validation failed'): ResponseInterface
    {
        return $this->respondError($message, 422, $errors);
    }
}
