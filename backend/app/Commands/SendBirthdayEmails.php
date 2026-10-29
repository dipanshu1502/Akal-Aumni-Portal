<?php

namespace App\Commands;

use App\Libraries\BirthdayEmailService;
use CodeIgniter\CLI\BaseCommand;
use CodeIgniter\CLI\CLI;
use CodeIgniter\Database\RawSql;
use Config\Database;
use DateTimeImmutable;
use DateTimeZone;
use RuntimeException;
use Throwable;

class SendBirthdayEmails extends BaseCommand
{
    protected $group       = 'Email';
    protected $name        = 'birthday:send';
    protected $description = 'Send the configured birthday email to eligible alumni.';
    protected $usage       = 'birthday:send [--dry-run]';
    protected $options     = [
        '--dry-run' => 'Show eligible recipients without sending or recording attempts.',
    ];

    public function run(array $params)
    {
        $db = Database::connect();
        $service = new BirthdayEmailService($db);
        $settings = $service->getSettings();
        $now = new DateTimeImmutable('now', new DateTimeZone(config('App')->appTimezone));
        $today = $now->format('Y-m-d H:i:s');
        $dryRun = CLI::getOption('dry-run') !== null;

        if (!$dryRun) {
            $db->table('birthday_email_settings')
                ->where('id', 1)
                ->update(['last_run_at' => $today]);
        }

        if (!(bool) $settings['is_enabled'] && !$dryRun) {
            CLI::write('Automatic birthday emails are disabled; no messages were sent.', 'yellow');
            $this->writeSummary(0, 0, 0, 0);
            return EXIT_SUCCESS;
        }

        $patterns = BirthdayEmailService::birthdayPatterns($now);
        $dateConditions = array_map(
            static fn (string $pattern): string => "DATE_FORMAT(alumni_profiles.date_of_birth, '%m-%d') = " . $db->escape($pattern),
            $patterns,
        );
        $alumni = $db->table('users')
            ->select('users.id, users.email, alumni_profiles.first_name, alumni_profiles.last_name')
            ->join('alumni_profiles', 'alumni_profiles.user_id = users.id')
            ->where('users.role', 'alumni')
            ->where('users.status', 'active')
            ->where('users.verification_status', 'verified')
            ->where('users.deleted_at', null)
            ->where(new RawSql('(' . implode(' OR ', $dateConditions) . ')'))
            ->get()
            ->getResultArray();

        $eligible = count($alumni);
        $sent = 0;
        $skipped = 0;
        $failed = 0;
        $wouldSend = 0;
        $birthdayYear = (int) $now->format('Y');

        foreach ($alumni as $alumnus) {
            $email = trim((string) ($alumnus['email'] ?? ''));
            if (!BirthdayEmailService::validRecipient($email)) {
                $skipped++;
                continue;
            }

            if ($dryRun) {
                $alreadyAttempted = $db->table('birthday_email_logs')
                    ->where('user_id', $alumnus['id'])
                    ->where('birthday_year', $birthdayYear)
                    ->countAllResults() > 0;
                if ($alreadyAttempted) {
                    $skipped++;
                } else {
                    $wouldSend++;
                }
                continue;
            }

            $rendered = $service->render(
                (string) $settings['subject'],
                (string) $settings['message_body'],
                trim((string) $alumnus['first_name'] . ' ' . (string) $alumnus['last_name']) ?: 'Alumni',
            );
            $createdAt = $now->format('Y-m-d H:i:s');
            $db->query(
                'INSERT IGNORE INTO birthday_email_logs (user_id, birthday_year, recipient_email, email_subject, status, error_message, sent_at, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
                [
                    $alumnus['id'],
                    $birthdayYear,
                    $email,
                    $rendered['subject'],
                    'failed',
                    'Delivery attempt did not complete.',
                    null,
                    $createdAt,
                ],
            );

            if ($db->affectedRows() === 0) {
                $existing = $db->table('birthday_email_logs')
                    ->where('user_id', $alumnus['id'])
                    ->where('birthday_year', $birthdayYear)
                    ->get()
                    ->getRowArray();
                if ($existing) {
                    $skipped++;
                    continue;
                }
                throw new RuntimeException('Unable to reserve a birthday email attempt.');
            }

            $logId = (int) $db->insertID();
            $deliverySucceeded = false;
            $failure = 'Email delivery failed. Check protected application logs.';
            try {
                $deliverySucceeded = $service->send($email, $rendered['subject'], $rendered['html']);
            } catch (Throwable $exception) {
                log_message('error', 'Birthday email delivery failed for log ID ' . $logId . ': ' . $service->safeDiagnostic($exception));
            }

            if (!$deliverySucceeded) {
                log_message('error', 'Birthday email delivery returned failure for log ID ' . $logId . '.');
                $failed++;
                $db->table('birthday_email_logs')->where('id', $logId)->update([
                    'status'        => 'failed',
                    'error_message' => $failure,
                ]);
                continue;
            }

            $sent++;
            $db->table('birthday_email_logs')->where('id', $logId)->update([
                'status'        => 'sent',
                'error_message' => null,
                'sent_at'       => $now->format('Y-m-d H:i:s'),
            ]);
        }

        if ($dryRun) {
            CLI::write('Dry run complete; no email was sent and no attempt was recorded.', 'yellow');
            if (!(bool) $settings['is_enabled']) {
                CLI::write('Automation is disabled; candidates below are informational only.', 'yellow');
            }
            CLI::write('Sendable candidates: ' . $wouldSend);
        }
        $this->writeSummary($eligible, $sent, $skipped, $failed);

        return $failed > 0 ? EXIT_FAILURE : EXIT_SUCCESS;
    }

    private function writeSummary(int $eligible, int $sent, int $skipped, int $failed): void
    {
        CLI::write('Eligible: ' . $eligible);
        CLI::write('Sent: ' . $sent, 'green');
        CLI::write('Skipped: ' . $skipped, 'yellow');
        CLI::write('Failed: ' . $failed, $failed > 0 ? 'red' : 'white');
    }
}
