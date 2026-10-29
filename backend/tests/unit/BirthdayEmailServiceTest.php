<?php

use App\Libraries\BirthdayEmailService;
use App\Filters\PermissionFilter;
use CodeIgniter\Test\CIUnitTestCase;

/**
 * @internal
 */
final class BirthdayEmailServiceTest extends CIUnitTestCase
{
    public function testLeapDayIsObservedOnFebruary28OnlyInNonLeapYears(): void
    {
        $this->assertSame(
            ['02-28', '02-29'],
            BirthdayEmailService::birthdayPatterns(new \DateTimeImmutable('2025-02-28')),
        );
        $this->assertSame(
            ['02-28'],
            BirthdayEmailService::birthdayPatterns(new \DateTimeImmutable('2024-02-28')),
        );
        $this->assertSame(
            ['02-29'],
            BirthdayEmailService::birthdayPatterns(new \DateTimeImmutable('2024-02-29')),
        );
    }

    public function testRendererEscapesPersonalizedDataAndAppliesPlaceholders(): void
    {
        $service = new BirthdayEmailService();
        $rendered = $service->render(
            'Happy Birthday, {{name}}!',
            "Dear {{name}},\nWelcome to {{university_name}}.",
            '<img src=x onerror=alert(1)>',
            'Akal University',
        );

        $this->assertStringContainsString('Happy Birthday, !', $rendered['subject']);
        $this->assertStringContainsString('&lt;img src=x onerror=alert(1)&gt;', $rendered['html']);
        $this->assertStringContainsString('Welcome to Akal University.', $rendered['html']);
        $this->assertStringNotContainsString('<img src=x', $rendered['html']);
    }

    public function testRecipientValidationRejectsInvalidAddresses(): void
    {
        $this->assertTrue(BirthdayEmailService::validRecipient('alumni@example.org'));
        $this->assertFalse(BirthdayEmailService::validRecipient('invalid recipient'));
        $this->assertFalse(BirthdayEmailService::validRecipient(''));
    }

    public function testBirthdayPermissionIsExplicitAndCanBeGrantedToAdmins(): void
    {
        $permissions = PermissionFilter::normalize('{"manage_birthday_emails":true,"manage_admins":true}');

        $this->assertSame(['manage_birthday_emails' => true], $permissions);
    }
}
