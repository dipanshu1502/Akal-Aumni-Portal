<?php

namespace App\Libraries;

use CodeIgniter\Database\BaseConnection;
use Config\Database;
use DateTimeImmutable;
use RuntimeException;
use Throwable;

class BirthdayEmailService
{
    private ?BaseConnection $db;
    private ?string $cachedUniversityName = null;

    public function __construct(?BaseConnection $db = null)
    {
        $this->db = $db;
    }

    public function getSettings(): array
    {
        $settings = $this->connection()->table('birthday_email_settings')
            ->where('id', 1)
            ->get()
            ->getRowArray();

        if (!$settings) {
            throw new RuntimeException('Birthday email settings are missing; run database migrations.');
        }

        return $settings;
    }

    public function universityName(): string
    {
        if ($this->cachedUniversityName !== null) {
            return $this->cachedUniversityName;
        }

        $setting = $this->connection()->table('system_settings')
            ->select('setting_value')
            ->where('setting_key', 'university_name')
            ->get()
            ->getRowArray();

        $name = trim((string) ($setting['setting_value'] ?? ''));
        $this->cachedUniversityName = $name !== '' ? $name : 'Akal University';
        return $this->cachedUniversityName;
    }

    /**
     * February 29 birthdays are observed on February 28 in non-leap years.
     *
     * @return list<string>
     */
    public static function birthdayPatterns(DateTimeImmutable $day): array
    {
        $pattern = $day->format('m-d');
        if ($pattern === '02-28' && $day->format('L') === '0') {
            return ['02-28', '02-29'];
        }

        return [$pattern];
    }

    public static function validRecipient(string $email): bool
    {
        return filter_var(trim($email), FILTER_VALIDATE_EMAIL) !== false;
    }

    /**
     * Treat the editor content as plain text, escape it, then apply known placeholders.
     *
     * @return array{subject: string, html: string}
     */
    public function render(string $subject, string $body, string $name, ?string $universityName = null): array
    {
        $university = $universityName ?? $this->universityName();
        $subject = str_replace(
            ['{{name}}', '{{university_name}}'],
            [$name, $university],
            $subject,
        );
        $subject = trim((string) preg_replace('/[\r\n\x00-\x1F\x7F]+/u', ' ', strip_tags($subject)));

        $safeName = esc($name, 'html');
        $safeUniversity = esc($university, 'html');
        $safeBody = esc($body, 'html');
        $safeBody = str_replace(
            ['{{name}}', '{{university_name}}'],
            [$safeName, $safeUniversity],
            $safeBody,
        );
        $safeBody = nl2br($safeBody, false);

        $html = '<!doctype html><html lang="en"><head><meta charset="utf-8">'
            . '<meta name="viewport" content="width=device-width,initial-scale=1">'
            . '<title>' . esc($subject, 'html') . '</title></head>'
            . '<body style="margin:0;padding:24px 12px;background:#f2f5f7;font-family:Arial,Helvetica,sans-serif;color:#243746">'
            . '<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:620px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden">'
            . '<tr><td style="padding:30px 28px;background:#073b4c;color:#fff;text-align:center">'
            . '<div style="font-size:13px;letter-spacing:2px;text-transform:uppercase;color:#f4c95d;font-weight:bold">Akal University</div>'
            . '<div style="font-size:14px;margin-top:8px;color:#e7f0f3">Alumni Association</div></td></tr>'
            . '<tr><td style="padding:34px 32px 18px;text-align:center">'
            . '<div style="font-size:34px;line-height:1">🎂</div>'
            . '<h1 style="font-size:27px;line-height:1.25;color:#073b4c;margin:18px 0 8px">Happy Birthday, ' . $safeName . '!</h1>'
            . '<div style="height:3px;width:54px;background:#e6b83f;margin:18px auto 24px;border-radius:4px"></div>'
            . '<div style="font-size:16px;line-height:1.8;text-align:left;color:#405565">' . $safeBody . '</div>'
            . '<p style="font-size:14px;color:#687b88;margin:28px 0 0">With warm wishes from your ' . $safeUniversity . ' family</p>'
            . '</td></tr><tr><td style="padding:18px 24px;background:#f8fafb;text-align:center;font-size:12px;color:#71818b">'
            . 'Akal University Alumni Association</td></tr></table></body></html>';

        return ['subject' => $subject, 'html' => $html];
    }

    public function send(string $recipient, string $subject, string $html): bool
    {
        $recipient = trim($recipient);
        if (!self::validRecipient($recipient)) {
            throw new RuntimeException('The recipient email address is invalid.');
        }

        $this->assertSmtpConfiguration();
        $emailConfig = config('Email');
        $sender = trim($emailConfig->fromEmail) !== ''
            ? trim($emailConfig->fromEmail)
            : trim($emailConfig->SMTPUser);

        $email = \Config\Services::email(null, false);
        $email->setFrom($sender, $emailConfig->fromName ?: 'Akal University Alumni Association');
        $email->setTo($recipient);
        $email->setSubject($subject);
        $email->setMessage($html);
        $email->setMailType('html');

        return $email->send(false);
    }

    public function assertSmtpConfiguration(): void
    {
        $emailConfig = config('Email');
        if (
            $emailConfig->SMTPHost !== 'smtp.gmail.com'
            || $emailConfig->SMTPPort !== 587
            || strtolower($emailConfig->SMTPCrypto) !== 'tls'
        ) {
            throw new RuntimeException('Gmail SMTP must be configured for smtp.gmail.com:587 with TLS.');
        }
        if (trim($emailConfig->SMTPUser) === '' || trim($emailConfig->SMTPPass) === '') {
            throw new RuntimeException('Gmail SMTP credentials are incomplete. Set email.SMTPUser and email.SMTPPass in backend/.env; use a Google App Password for email.SMTPPass.');
        }

        $sender = trim($emailConfig->fromEmail) !== ''
            ? trim($emailConfig->fromEmail)
            : trim($emailConfig->SMTPUser);
        if (!self::validRecipient($sender)) {
            throw new RuntimeException('The configured sender email address is invalid.');
        }
    }

    public function safeDiagnostic(Throwable $exception): string
    {
        $emailConfig = config('Email');
        $secrets = array_filter([$emailConfig->SMTPUser, $emailConfig->SMTPPass]);
        $message = str_replace($secrets, '[redacted]', $exception->getMessage());
        $message = trim((string) preg_replace('/[\r\n\x00-\x1F\x7F]+/u', ' ', strip_tags($message)));

        return mb_substr($message !== '' ? $message : $exception::class, 0, 400);
    }

    private function connection(): BaseConnection
    {
        return $this->db ??= Database::connect();
    }
}
