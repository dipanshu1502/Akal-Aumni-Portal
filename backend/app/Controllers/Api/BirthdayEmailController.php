<?php

namespace App\Controllers\Api;

use App\Controllers\BaseController;
use App\Libraries\BirthdayEmailService;
use App\Traits\ApiResponseTrait;
use DateTimeImmutable;
use DateTimeZone;
use Throwable;

class BirthdayEmailController extends BaseController
{
    use ApiResponseTrait;

    private const TEST_RECIPIENT = 'dipanshu150206@gmail.com';

    private $db;
    private BirthdayEmailService $birthdayEmails;

    public function __construct()
    {
        $this->db = \Config\Database::connect();
        $this->birthdayEmails = new BirthdayEmailService($this->db);
    }

    public function getSettings()
    {
        $settings = $this->birthdayEmails->getSettings();

        return $this->respondSuccess([
            'settings' => [
                'subject'      => $settings['subject'],
                'message_body' => $settings['message_body'],
                'is_enabled'   => (bool) $settings['is_enabled'],
                'last_run_at'  => $settings['last_run_at'],
            ],
            'statistics' => [
                'sent'   => $this->db->table('birthday_email_logs')->where('status', 'sent')->countAllResults(),
                'failed' => $this->db->table('birthday_email_logs')->where('status', 'failed')->countAllResults(),
            ],
            'test_recipient' => self::TEST_RECIPIENT,
        ], 'Birthday email settings retrieved');
    }

    public function saveSettings()
    {
        $input = $this->request->getJSON(true);
        if (!is_array($input)) {
            return $this->respondValidationError(['body' => 'A JSON request body is required.']);
        }

        $validated = $this->validateTemplate($input);
        if ($validated['errors'] !== []) {
            return $this->respondValidationError($validated['errors']);
        }
        if (!array_key_exists('is_enabled', $input) || !$this->isBooleanValue($input['is_enabled'])) {
            return $this->respondValidationError(['is_enabled' => 'Choose whether automatic emails are enabled.']);
        }

        $this->db->table('birthday_email_settings')
            ->where('id', 1)
            ->update([
                'subject'      => $validated['subject'],
                'message_body' => $validated['message_body'],
                'is_enabled'   => (int) (bool) $input['is_enabled'],
                'updated_at'   => $this->now()->format('Y-m-d H:i:s'),
            ]);

        return $this->respondSuccess([], 'Birthday email settings saved');
    }

    public function preview()
    {
        $input = $this->request->getJSON(true);
        if (!is_array($input)) {
            return $this->respondValidationError(['body' => 'A JSON request body is required.']);
        }

        $validated = $this->validateTemplate($input);
        if ($validated['errors'] !== []) {
            return $this->respondValidationError($validated['errors']);
        }

        $rendered = $this->birthdayEmails->render(
            $validated['subject'],
            $validated['message_body'],
            'Akal Alumni',
        );

        return $this->respondSuccess($rendered, 'Email preview generated');
    }

    public function sendTest()
    {
        $input = $this->request->getJSON(true);
        if (!is_array($input)) {
            return $this->respondValidationError(['body' => 'A JSON request body is required.']);
        }
        $settings = $this->birthdayEmails->getSettings();
        $subject = (string) $settings['subject'];
        $messageBody = (string) $settings['message_body'];
        if (array_key_exists('subject', $input) || array_key_exists('message_body', $input)) {
            $validated = $this->validateTemplate($input);
            if ($validated['errors'] !== []) {
                return $this->respondValidationError($validated['errors']);
            }
            $subject = $validated['subject'];
            $messageBody = $validated['message_body'];
        }

        $authUser = $this->request->authUser ?? [];
        if (!BirthdayEmailService::validRecipient(self::TEST_RECIPIENT)) {
            return $this->respondError('The configured test recipient email address is invalid.', 500);
        }

        try {
            $this->birthdayEmails->assertSmtpConfiguration();
        } catch (\RuntimeException $exception) {
            log_message('error', 'Birthday email SMTP configuration is incomplete: ' . $this->birthdayEmails->safeDiagnostic($exception));
            return $this->respondError($exception->getMessage(), 503);
        }

        $now = $this->now();
        if (!$this->acquireTestSendLimit($now)) {
            return $this->respondError('A test email was sent recently. Wait one minute before trying again.', 429);
        }

        $rendered = $this->birthdayEmails->render(
            $subject,
            $messageBody,
            'Administrator',
        );

        try {
            if (!$this->birthdayEmails->send(self::TEST_RECIPIENT, $rendered['subject'], $rendered['html'])) {
                log_message('error', 'Birthday email test delivery failed for admin user ID ' . (int) $authUser['id'] . '.');
                return $this->respondError('The test email could not be delivered. Check the server mail configuration and application logs.', 502);
            }
        } catch (Throwable $exception) {
            log_message('error', 'Birthday email test delivery failed for admin user ID ' . (int) $authUser['id'] . ': ' . $this->birthdayEmails->safeDiagnostic($exception));
            return $this->respondError('The test email could not be delivered. Check the server mail configuration and application logs.', 502);
        }

        return $this->respondSuccess(['recipient' => self::TEST_RECIPIENT], 'Test email sent');
    }

    public function history()
    {
        $page = max(1, (int) ($this->request->getGet('page') ?? 1));
        $page = min(1000000, $page);
        $perPage = (int) ($this->request->getGet('per_page') ?? 20);
        if (!in_array($perPage, [10, 20, 50], true)) {
            $perPage = 20;
        }
        $status = trim((string) ($this->request->getGet('status') ?? ''));
        if ($status !== '' && !in_array($status, ['sent', 'failed'], true)) {
            return $this->respondValidationError(['status' => 'Choose sent or failed.']);
        }
        $search = mb_substr(trim((string) ($this->request->getGet('search') ?? '')), 0, 100);

        $builder = $this->historyQuery($status, $search);
        $total = (clone $builder)->countAllResults();
        $page = min($page, max(1, (int) ceil($total / $perPage)));
        $rows = $builder
            ->select("birthday_email_logs.id, birthday_email_logs.user_id, birthday_email_logs.birthday_year, birthday_email_logs.recipient_email, birthday_email_logs.email_subject, birthday_email_logs.status, birthday_email_logs.error_message, birthday_email_logs.sent_at, birthday_email_logs.created_at, TRIM(CONCAT(COALESCE(alumni_profiles.first_name, ''), ' ', COALESCE(alumni_profiles.last_name, ''))) AS alumni_name", false)
            ->orderBy('birthday_email_logs.created_at', 'DESC')
            ->orderBy('birthday_email_logs.id', 'DESC')
            ->limit($perPage, ($page - 1) * $perPage)
            ->get()
            ->getResultArray();

        return $this->respondSuccess([
            'items'       => $rows,
            'pagination'  => [
                'page'        => $page,
                'per_page'    => $perPage,
                'total'       => $total,
                'total_pages' => (int) ceil($total / $perPage),
            ],
        ], 'Birthday email history retrieved');
    }

    private function historyQuery(string $status, string $search)
    {
        $builder = $this->db->table('birthday_email_logs')
            ->join('users', 'users.id = birthday_email_logs.user_id', 'left')
            ->join('alumni_profiles', 'alumni_profiles.user_id = birthday_email_logs.user_id', 'left');

        if ($status !== '') {
            $builder->where('birthday_email_logs.status', $status);
        }
        if ($search !== '') {
            $builder->groupStart()
                ->like('alumni_profiles.first_name', $search)
                ->orLike('alumni_profiles.last_name', $search)
                ->orLike('users.email', $search)
                ->orLike('birthday_email_logs.recipient_email', $search)
                ->orLike('birthday_email_logs.email_subject', $search)
                ->groupEnd();
        }

        return $builder;
    }

    private function validateTemplate(array $input): array
    {
        $errors = [];
        $subject = $input['subject'] ?? null;
        $body = $input['message_body'] ?? null;

        if (!is_string($subject) || trim($subject) === '') {
            $errors['subject'] = 'Email subject is required.';
        } elseif (mb_strlen(trim($subject)) > 255 || preg_match('/[\r\n\x00-\x1F\x7F]/u', $subject)) {
            $errors['subject'] = 'Subject must be at most 255 characters and contain no line breaks.';
        }
        if (!is_string($body) || trim($body) === '') {
            $errors['message_body'] = 'Email message is required.';
        } elseif (mb_strlen($body) > 10000) {
            $errors['message_body'] = 'Email message must be 10,000 characters or fewer.';
        }

        return [
            'subject'      => is_string($subject) ? trim($subject) : '',
            'message_body' => is_string($body) ? trim($body) : '',
            'errors'       => $errors,
        ];
    }

    private function isBooleanValue($value): bool
    {
        return is_bool($value) || in_array($value, [0, 1, '0', '1'], true);
    }

    private function acquireTestSendLimit(DateTimeImmutable $now): bool
    {
        $this->db->transBegin();
        $row = $this->db->query(
            'SELECT last_test_email_at FROM birthday_email_settings WHERE id = ? FOR UPDATE',
            [1],
        )->getRowArray();

        if (!$row) {
            $this->db->transRollback();
            return false;
        }
        if (!empty($row['last_test_email_at'])) {
            $lastSent = new DateTimeImmutable(
                $row['last_test_email_at'],
                new DateTimeZone(config('App')->appTimezone),
            );
            if ($now->getTimestamp() - $lastSent->getTimestamp() < 60) {
                $this->db->transRollback();
                return false;
            }
        }

        $this->db->table('birthday_email_settings')
            ->where('id', 1)
            ->update(['last_test_email_at' => $now->format('Y-m-d H:i:s')]);
        if (!$this->db->transStatus()) {
            $this->db->transRollback();
            throw new \RuntimeException('Unable to apply the birthday test-email rate limit.');
        }
        $this->db->transCommit();

        return true;
    }

    private function now(): DateTimeImmutable
    {
        return new DateTimeImmutable('now', new DateTimeZone(config('App')->appTimezone));
    }
}
