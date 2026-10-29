# CodeIgniter 4 Application Starter

## What is CodeIgniter?

CodeIgniter is a PHP full-stack web framework that is light, fast, flexible and secure.
More information can be found at the [official site](https://codeigniter.com).

This repository holds a composer-installable app starter.
It has been built from the
[development repository](https://github.com/codeigniter4/CodeIgniter4).

More information about the plans for version 4 can be found in [CodeIgniter 4](https://forum.codeigniter.com/forumdisplay.php?fid=28) on the forums.

You can read the [user guide](https://codeigniter.com/user_guide/)
corresponding to the latest version of the framework.

## Installation & updates

`composer create-project codeigniter4/appstarter` then `composer update` whenever
there is a new release of the framework.

When updating, check the release notes to see if there are any changes you might need to apply
to your `app` folder. The affected files can be copied or merged from
`vendor/codeigniter4/framework/app`.

## Setup

Copy `env` to `.env` and tailor for your app, specifically the baseURL
and any database settings.

## Important Change with index.php

`index.php` is no longer in the root of the project! It has been moved inside the *public* folder,
for better security and separation of components.

This means that you should configure your web server to "point" to your project's *public* folder, and
not to the project root. A better practice would be to configure a virtual host to point there. A poor practice would be to point your web server to the project root and expect to enter *public/...*, as the rest of your logic and the
framework are exposed.

**Please** read the user guide for a better explanation of how CI4 works!

## Repository Management

We use GitHub issues, in our main repository, to track **BUGS** and to track approved **DEVELOPMENT** work packages.
We use our [forum](http://forum.codeigniter.com) to provide SUPPORT and to discuss
FEATURE REQUESTS.

This repository is a "distribution" one, built by our release preparation script.
Problems with it can be raised on our forum, or as issues in the main repository.

## Server Requirements

PHP version 8.2 or higher is required, with the following extensions installed:

- [intl](http://php.net/manual/en/intl.requirements.php)
- [mbstring](http://php.net/manual/en/mbstring.installation.php)

> [!WARNING]
> - The end of life date for PHP 7.4 was November 28, 2022.
> - The end of life date for PHP 8.0 was November 26, 2023.
> - The end of life date for PHP 8.1 was December 31, 2025.
> - If you are still using below PHP 8.2, you should upgrade immediately.
> - The end of life date for PHP 8.2 will be December 31, 2026.

Additionally, make sure that the following extensions are enabled in your PHP:

- json (enabled by default - don't turn it off)
- [mysqlnd](http://php.net/manual/en/mysqlnd.install.php) if you plan to use MySQL
- [libcurl](http://php.net/manual/en/curl.requirements.php) if you plan to use the HTTP\CURLRequest library

## Automatic alumni birthday emails

Birthday email settings are available in the admin console to administrators granted the
`manage_birthday_emails` permission and to superadmins. The template editor accepts plain text;
the application escapes the message and renders it in the branded HTML email. Available
placeholders are `{{name}}` and `{{university_name}}`. Test emails are sent only to the
fixed test address `dipanshu150206@gmail.com`. Only authenticated admins with the
`manage_birthday_emails` permission (and superadmins) can trigger a test; sends are limited to
one per minute.

For Gmail delivery, the backend `.env` must use CodeIgniter's exact setting names (case
matters). Set `email.SMTPUser` to the Gmail sender account and `email.SMTPPass` to that
account's Google App Password (not the normal Google account password). The password key must
be named `email.SMTPPass`; a differently named password setting will not enable SMTP
authentication. Never commit or share the App Password. Gmail's `530 Authentication
Required` response means SMTP authentication was not performed; the test endpoint now reports
an actionable configuration error when either credential is missing.

Run the database migration from the backend directory:

```powershell
php spark migrate
```

The CLI command reads the application timezone configured by `app.appTimezone` and should be
scheduled once daily. It selects only active, verified, non-deleted accounts with the exact
`alumni` role. February 29 birthdays are observed on February 28 in non-leap years. Each
user/year gets one delivery attempt (including failed attempts), enforced by a unique database
key. `--dry-run` checks candidates and duplicates without sending or recording emails, even
while automation is disabled:

```powershell
php spark birthday:send --dry-run
php spark birthday:send
```

### Windows Task Scheduler (XAMPP)

Create a daily task with a 9:00 AM trigger. Set **Program/script** to
`C:\xampp\php\php.exe`, **Add arguments** to `spark birthday:send`, and **Start in** to
`C:\Users\dipan\Desktop\Akal Aumni Portal\backend`. The working directory must be the backend
folder so CodeIgniter loads its `.env` and `spark` entry point. Use **Run whether user is logged
on or not** if the task should run while the desktop session is closed. Test the task first with
`spark birthday:send --dry-run`.

### Linux cron

For Linux hosting, schedule the PHP CLI command at 9:00 AM server time (configure the
application timezone to match the server's intended birthday date):

```cron
0 9 * * * cd /path/to/backend && /usr/bin/php spark birthday:send >> writable/logs/birthday-cron.log 2>&1
```
