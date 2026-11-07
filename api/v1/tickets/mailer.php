<?php
/**
 * MSIS Support Ticket System • Automated Email Notifications
 * Sends step-by-step progress tracking emails using the root PHPMailer library
 * Path: api/v1/tickets/mailer.php
 */

// Safe dynamic PHPMailer loader: checks multiple paths and never throws fatal errors
$phpMailerAvailable = false;

if (class_exists('PHPMailer\PHPMailer\PHPMailer')) {
    $phpMailerAvailable = true;
} else {
    $docRoot = !empty($_SERVER['DOCUMENT_ROOT']) ? rtrim($_SERVER['DOCUMENT_ROOT'], '/\\') : null;
    $possibleRoots = array_values(array_unique(array_filter([
        dirname(__DIR__, 3) . '/PHPMailer/src',
        dirname(__DIR__, 3) . '/PHPMailer',
        $docRoot ? $docRoot . '/PHPMailer/src' : null,
        $docRoot ? $docRoot . '/PHPMailer' : null,
        $docRoot ? dirname($docRoot) . '/PHPMailer/src' : null,
        $docRoot ? dirname($docRoot) . '/PHPMailer' : null,
        dirname(__DIR__, 2) . '/PHPMailer/src',
        dirname(__DIR__, 2) . '/PHPMailer',
        dirname(__DIR__, 1) . '/PHPMailer/src',
        dirname(__DIR__, 1) . '/PHPMailer',
        __DIR__ . '/PHPMailer/src',
        __DIR__ . '/PHPMailer',
    ])));

    foreach ($possibleRoots as $pr) {
        $exceptionFile = $pr . '/Exception.php';
        $phpMailerFile = $pr . '/PHPMailer.php';
        $smtpFile = $pr . '/SMTP.php';

        if (file_exists($exceptionFile) && file_exists($phpMailerFile) && file_exists($smtpFile)) {
            require_once $exceptionFile;
            require_once $phpMailerFile;
            require_once $smtpFile;
            $phpMailerAvailable = true;
            break;
        }
    }

    // Composer vendor autoload fallback
    if (!$phpMailerAvailable) {
        $autoloadPaths = array_values(array_unique(array_filter([
            dirname(__DIR__, 3) . '/vendor/autoload.php',
            $docRoot ? $docRoot . '/vendor/autoload.php' : null,
            dirname(__DIR__, 2) . '/vendor/autoload.php',
        ])));
        foreach ($autoloadPaths as $ap) {
            if (file_exists($ap)) {
                require_once $ap;
                if (class_exists('PHPMailer\PHPMailer\PHPMailer')) {
                    $phpMailerAvailable = true;
                    break;
                }
            }
        }
    }
}

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;
use PHPMailer\PHPMailer\SMTP;

/**
 * Load mailer credentials dynamically from environment or root .env
 */
function get_msis_mailer_config(): array {
    static $config = null;
    if ($config !== null) {
        return $config;
    }

    // Check pre-loaded global $envConfig from connection.php
    $env = isset($GLOBALS['envConfig']) && is_array($GLOBALS['envConfig']) ? $GLOBALS['envConfig'] : [];

    // If empty, search and load .env directly
    if (empty($env)) {
        $docRoot = !empty($_SERVER['DOCUMENT_ROOT']) ? rtrim($_SERVER['DOCUMENT_ROOT'], '/\\') : null;
        $envPaths = array_values(array_unique(array_filter([
            $docRoot ? $docRoot . '/.env' : null,
            $docRoot ? dirname($docRoot) . '/.env' : null,
            dirname(__DIR__, 3) . '/.env',
            dirname(__DIR__, 2) . '/.env',
            dirname(__DIR__) . '/.env',
            __DIR__ . '/.env'
        ])));

        foreach ($envPaths as $p) {
            if (file_exists($p) && is_readable($p)) {
                $lines = file($p, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
                foreach ($lines as $line) {
                    $line = trim($line);
                    if (empty($line) || strpos($line, '#') === 0) continue;
                    if (strpos($line, '=') !== false) {
                        list($k, $v) = explode('=', $line, 2);
                        $k = trim($k);
                        $v = trim(trim($v), "\"'");
                        if (strpos($v, '#') !== false) {
                            $v = trim(explode('#', $v)[0]);
                        }
                        $env[$k] = $v;
                    }
                }
                break;
            }
        }
    }

    $mailer = $env['VITE_MAIL_MAILER'] ?? getenv('VITE_MAIL_MAILER') ?? 'smtp';
    $host = $env['VITE_MAIL_HOST'] ?? getenv('VITE_MAIL_HOST') ?? 'smtp.gmail.com';
    $port = (int)($env['VITE_MAIL_PORT'] ?? getenv('VITE_MAIL_PORT') ?? 587);
    $username = $env['VITE_MAIL_USERNAME'] ?? getenv('VITE_MAIL_USERNAME') ?? 'medsis798@gmail.com';
    $password = $env['VITE_MAIL_PASSWORD'] ?? getenv('VITE_MAIL_PASSWORD') ?? '';
    $encryption = strtolower($env['VITE_MAIL_ENCRYPTION'] ?? getenv('VITE_MAIL_ENCRYPTION') ?? 'tls');
    $fromAddress = $env['VITE_MAIL_FROM_ADDRESS'] ?? getenv('VITE_MAIL_FROM_ADDRESS') ?? $username;
    $fromName = $env['VITE_MAIL_FROM_NAME'] ?? getenv('VITE_MAIL_FROM_NAME') ?? 'Southwestern University PHINMA - MSIS Support';
    $baseUrl = $env['VITE_BACKEND_URL'] ?? getenv('VITE_BACKEND_URL') ?? 'https://support.swu-som.com';

    // Parse VITE_MAILER_DSN fallback if password was empty
    if (empty($password) && !empty($env['VITE_MAILER_DSN'])) {
        $parts = parse_url($env['VITE_MAILER_DSN']);
        if ($parts) {
            if (!empty($parts['host'])) $host = $parts['host'];
            if (!empty($parts['port'])) $port = (int)$parts['port'];
            if (!empty($parts['user'])) $username = urldecode($parts['user']);
            if (!empty($parts['pass'])) $password = urldecode($parts['pass']);
        }
    }

    $config = [
        'mailer' => $mailer,
        'host' => $host,
        'port' => $port,
        'username' => $username,
        'password' => $password,
        'encryption' => $encryption,
        'from_address' => $fromAddress,
        'from_name' => $fromName,
        'base_url' => rtrim($baseUrl, '/'),
    ];

    return $config;
}

/**
 * Dispatch email using the root PHPMailer library
 */
function send_msis_phpmailer(string $toEmail, string $toName, string $subject, string $htmlBody, string $altBody, array $config): array {
    if (!class_exists('PHPMailer\PHPMailer\PHPMailer')) {
        return [
            'sent' => false,
            'reason' => 'PHPMailer library files not found on server.'
        ];
    }

    if (empty($config['password']) || empty($config['username'])) {
        return [
            'sent' => false,
            'reason' => 'SMTP mail credentials (username/password) are not configured in environment.'
        ];
    }

    $mail = new PHPMailer(true);

    try {
        // Server settings
        $mail->isSMTP();
        $mail->Host       = $config['host'];
        $mail->SMTPAuth   = true;
        $mail->Username   = $config['username'];
        $mail->Password   = $config['password'];
        $mail->Port       = $config['port'];
        $mail->CharSet    = 'UTF-8';
        $mail->Timeout    = 8; // 8-second safety timeout so API calls never hang

        // Encryption
        if ($config['encryption'] === 'ssl' || $config['port'] === 465) {
            $mail->SMTPSecure = PHPMailer::ENCRYPTION_SMTPS;
        } else {
            $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
        }

        // Recipients
        $mail->setFrom($config['from_address'], $config['from_name']);
        $mail->addAddress($toEmail, $toName);
        $mail->addReplyTo($config['from_address'], $config['from_name']);

        // Content
        $mail->isHTML(true);
        $mail->Subject = $subject;
        $mail->Body    = $htmlBody;
        $mail->AltBody = $altBody;

        $mail->send();

        return [
            'sent' => true,
            'recipient' => $toEmail
        ];
    } catch (Exception $e) {
        return [
            'sent' => false,
            'error' => "PHPMailer Error: {$mail->ErrorInfo} ({$e->getMessage()})"
        ];
    } catch (Throwable $t) {
        return [
            'sent' => false,
            'error' => "PHPMailer Exception: {$t->getMessage()}"
        ];
    }
}

/**
 * Build responsive, polished Step-by-Step Progress Tracking HTML Email
 */
function build_ticket_progress_email_html(
    array $ticket,
    string $newStatus,
    ?string $supportMessage,
    array $adminInfo,
    array $config
): array {
    $ticketCode = htmlspecialchars($ticket['ticket_code'] ?? ('#' . $ticket['id']));
    $subject = htmlspecialchars($ticket['subject'] ?? 'Technical Support Issue');
    $reporterName = htmlspecialchars($ticket['reporter_name'] ?? 'Colleague / Student');
    $reporterRole = htmlspecialchars($ticket['reporter_role'] ?? 'Reporter');
    $department = htmlspecialchars($ticket['department'] ?? 'General Systems');
    $supportMsgClean = $supportMessage ? htmlspecialchars($supportMessage) : null;
    $adminName = htmlspecialchars($adminInfo['name'] ?? 'MSIS Technical Support Team');

    // Role-tailored direct live ticket tracking URL
    $roleSlug = strtolower(str_replace(' ', '-', $reporterRole));
    $ticketParam = !empty($ticket['id']) ? rawurlencode((string)$ticket['id']) : '';
    $portalUrl = htmlspecialchars($config['base_url'] . '/' . $roleSlug . '/tickets/' . $ticketParam);

    // 5 Progressive Lifecycle Levels
    $stages = [
        [
            'level' => 1,
            'name' => 'In Progress',
            'badge' => 'Level 1: Intake & Evaluation',
            'summary' => 'Issue successfully ingested. Technical triage team has scheduled initial evaluation.'
        ],
        [
            'level' => 2,
            'name' => 'Investigating',
            'badge' => 'Level 2: Root Cause Diagnostics',
            'summary' => 'Engineering actively reviewing system logs, stack traces, and database replication steps.'
        ],
        [
            'level' => 3,
            'name' => 'Dispatched',
            'badge' => 'Level 3: Specialized Queue',
            'summary' => 'Dispatched to specialized department queue for immediate code or infrastructure remediation.'
        ],
        [
            'level' => 4,
            'name' => 'Resolved',
            'badge' => 'Level 4: Fix Deployed & Verified',
            'summary' => 'Technical solution deployed, tested in staging/production, and verified by engineers.'
        ],
        [
            'level' => 5,
            'name' => 'Closed',
            'badge' => 'Level 5: Completed & Archived',
            'summary' => 'Verification complete. The reported technical issue is officially verified and archived.'
        ],
    ];

    // Determine current level index
    $currentLevelIndex = 0;
    foreach ($stages as $idx => $st) {
        if ($st['name'] === $newStatus) {
            $currentLevelIndex = $idx;
            break;
        }
    }

    $currentStage = $stages[$currentLevelIndex];
    $currentLevelNum = $currentStage['level'];
    $progressPercent = ($currentLevelNum / 5) * 100;

    // Dynamic theme for current stage avoiding harsh red
    $activeTheme = [
        'activeColor' => '#d97706', // Amber
        'activeBg' => '#fffbeb',
        'activeBorder' => '#fde68a',
        'badgeBg' => '#fef3c7',
        'badgeText' => '#b45309',
    ];

    if ($newStatus === 'Resolved') {
        $activeTheme = [
            'activeColor' => '#059669', // Emerald
            'activeBg' => '#ecfdf5',
            'activeBorder' => '#a7f3d0',
            'badgeBg' => '#d1fae5',
            'badgeText' => '#047857',
        ];
    } elseif ($newStatus === 'Closed') {
        $activeTheme = [
            'activeColor' => '#475569', // Slate
            'activeBg' => '#f8fafc',
            'activeBorder' => '#cbd5e1',
            'badgeBg' => '#e2e8f0',
            'badgeText' => '#334155',
        ];
    } elseif ($newStatus === 'Investigating') {
        $activeTheme = [
            'activeColor' => '#0284c7', // Sky
            'activeBg' => '#f0f9ff',
            'activeBorder' => '#bae6fd',
            'badgeBg' => '#e0f2fe',
            'badgeText' => '#0369a1',
        ];
    } elseif ($newStatus === 'Dispatched') {
        $activeTheme = [
            'activeColor' => '#7c3aed', // Purple
            'activeBg' => '#faf5ff',
            'activeBorder' => '#e9d5ff',
            'badgeBg' => '#f3e8ff',
            'badgeText' => '#6b21a8',
        ];
    }

    $statusPillBg = $activeTheme['badgeBg'];
    $statusPillText = $activeTheme['badgeText'];
    $statusPillBorder = $activeTheme['activeBorder'];

    // Official project font stack matching frontend (Plus Jakarta Sans)
    $fontFamily = "'Plus Jakarta Sans', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";

    // Build Step-by-Step UI Items
    $stepsHtml = '';
    foreach ($stages as $idx => $st) {
        $isCompleted = $idx < $currentLevelIndex;
        $isCurrent = $idx === $currentLevelIndex;

        $nodeBg = $isCompleted ? '#10b981' : ($isCurrent ? $activeTheme['activeColor'] : '#ffffff');
        $nodeColor = $isCompleted ? '#ffffff' : ($isCurrent ? '#ffffff' : '#94a3b8');
        $nodeBorder = $isCompleted ? '#10b981' : ($isCurrent ? $activeTheme['activeColor'] : '#cbd5e1');
        $nodeContent = $isCompleted ? '&#10003;' : (string)$st['level'];

        $titleColor = $isCurrent ? '#0f172a' : ($isCompleted ? '#334155' : '#94a3b8');
        $descColor = $isCurrent ? '#475569' : ($isCompleted ? '#64748b' : '#94a3b8');

        $currentBadge = $isCurrent
            ? "<span style=\"display:inline-block;margin-left:8px;padding:2px 8px;font-size:10px;font-weight:800;letter-spacing:0.5px;color:{$activeTheme['badgeText']};background:{$activeTheme['badgeBg']};border-radius:999px;border:1px solid {$activeTheme['activeBorder']};text-transform:uppercase;font-family:{$fontFamily};\">CURRENT STAGE</span>"
            : ($isCompleted ? "<span style=\"display:inline-block;margin-left:8px;padding:1px 6px;font-size:9px;font-weight:700;color:#047857;background:#d1fae5;border-radius:999px;font-family:{$fontFamily};\">Completed</span>" : '');

        $cardBg = $isCurrent ? $activeTheme['activeBg'] : '#ffffff';
        $cardBorder = $isCurrent ? "1px solid {$activeTheme['activeBorder']}" : '1px solid #f1f5f9';

        $stepsHtml .= "
        <tr>
            <td style=\"vertical-align: top; width: 44px; text-align: center; padding-right: 12px; font-family: {$fontFamily};\">
                <div style=\"width: 32px; height: 32px; border-radius: 50%; background: {$nodeBg}; color: {$nodeColor}; border: 2px solid {$nodeBorder}; font-size: 13px; font-weight: 800; line-height: 28px; text-align: center; margin: 0 auto; font-family: {$fontFamily}; box-shadow: " . ($isCurrent ? "0 0 0 3px rgba(16, 185, 129, 0.2)" : "none") . ";\">
                    {$nodeContent}
                </div>
                " . ($idx < count($stages) - 1 ? "<div style=\"width: 2px; height: 34px; margin: 4px auto 0; background: " . ($isCompleted ? "#10b981" : "#e2e8f0") . ";\"></div>" : "") . "
            </td>
            <td style=\"vertical-align: top; padding-bottom: 16px; font-family: {$fontFamily};\">
                <div style=\"background: {$cardBg}; border: {$cardBorder}; border-radius: 12px; padding: 10px 14px; font-family: {$fontFamily};\">
                    <div style=\"font-size: 13px; font-weight: 800; color: {$titleColor}; font-family: {$fontFamily};\">
                        {$st['name']} {$currentBadge}
                    </div>
                    <div style=\"font-size: 11px; font-weight: 600; color: " . ($isCurrent ? $activeTheme['activeColor'] : '#64748b') . "; margin-top: 1px; font-family: {$fontFamily};\">
                        {$st['badge']}
                    </div>
                    <div style=\"font-size: 11px; color: {$descColor}; line-height: 1.45; margin-top: 4px; font-family: {$fontFamily};\">
                        {$st['summary']}
                    </div>
                </div>
            </td>
        </tr>";
    }

    // Support Note Block
    $supportBlock = '';
    if ($supportMsgClean) {
        $supportBlock = "
        <div style=\"margin: 22px 0 16px; padding: 14px 18px; background-color: #f0f9ff; border-left: 4px solid #0284c7; border-radius: 12px; border-top: 1px solid #e0f2fe; border-right: 1px solid #e0f2fe; border-bottom: 1px solid #e0f2fe; font-family: {$fontFamily};\">
            <div style=\"font-size: 10px; font-weight: 800; color: #0369a1; text-transform: uppercase; letter-spacing: 0.8px; margin-bottom: 4px; font-family: {$fontFamily};\">
                &#9993; Direct Message from Technical Support Staff
            </div>
            <div style=\"font-size: 13px; font-style: italic; color: #1e293b; line-height: 1.5; font-weight: 500; font-family: {$fontFamily};\">
                &ldquo;{$supportMsgClean}&rdquo;
            </div>
            <div style=\"font-size: 10px; font-weight: 700; color: #64748b; margin-top: 6px; font-family: {$fontFamily};\">
                &mdash; {$adminName} &bull; MSIS Technical & Systems Team
            </div>
        </div>";
    }

    $dateTimeNow = date('F j, Y, g:i A') . ' PHT';

    $html = "
<!DOCTYPE html>
<html lang=\"en\">
<head>
    <meta charset=\"UTF-8\">
    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">
    <title>Ticket Progress Update: {$ticketCode}</title>
    <!-- Plus Jakarta Sans Font (Matching MSIS Project Typography) -->
    <link rel=\"preconnect\" href=\"https://fonts.googleapis.com\">
    <link rel=\"preconnect\" href=\"https://fonts.gstatic.com\" crossorigin>
    <link href=\"https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap\" rel=\"stylesheet\">
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');
        body, table, td, div, span, p, a, strong, b {
            font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif !important;
        }
    </style>
</head>
<body style=\"margin: 0; padding: 0; background-color: #f8fafc; font-family: {$fontFamily}; color: #0f172a; -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale;\">
    <table role=\"presentation\" width=\"100%\" border=\"0\" cellspacing=\"0\" cellpadding=\"0\" style=\"background-color: #f8fafc; padding: 24px 12px; font-family: {$fontFamily};\">
        <tr>
            <td align=\"center\">
                <table role=\"presentation\" width=\"100%\" max-width=\"620\" border=\"0\" cellspacing=\"0\" cellpadding=\"0\" style=\"max-width: 620px; background-color: #ffffff; border-radius: 20px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05); text-align: left; font-family: {$fontFamily};\">
                    
                    <!-- Header Banner -->
                    <tr>
                        <td style=\"background: linear-gradient(135deg, #991b1b 0%, #b91c1c 50%, #dc2626 100%); padding: 24px 28px; text-align: left; font-family: {$fontFamily};\">
                            <table role=\"presentation\" width=\"100%\" border=\"0\" cellspacing=\"0\" cellpadding=\"0\" style=\"font-family: {$fontFamily};\">
                                <tr>
                                    <td>
                                        <div style=\"font-size: 10px; font-weight: 800; letter-spacing: 1.2px; text-transform: uppercase; color: #fecaca; margin-bottom: 4px; font-family: {$fontFamily};\">
                                            Southwestern University PHINMA
                                        </div>
                                        <div style=\"font-size: 20px; font-weight: 900; color: #ffffff; letter-spacing: -0.3px; line-height: 1.2; font-family: {$fontFamily};\">
                                            MSIS Support Ticket System
                                        </div>
                                        <div style=\"font-size: 11px; color: #fee2e2; margin-top: 4px; font-weight: 500; font-family: {$fontFamily};\">
                                            School of Medicine & Allied Health Sciences &bull; Technical Triage
                                        </div>
                                    </td>
                                    <td align=\"right\" style=\"vertical-align: top;\">
                                        <span style=\"display: inline-block; padding: 5px 12px; font-size: 12px; font-weight: 800; color: #ffffff; background: rgba(255, 255, 255, 0.2); border: 1px solid rgba(255, 255, 255, 0.3); border-radius: 12px; font-family: monospace;\">
                                            {$ticketCode}
                                        </span>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    <!-- Body Content -->
                    <tr>
                        <td style=\"padding: 28px 28px 24px; font-family: {$fontFamily};\">
                            <!-- Greeting & High-level Status -->
                            <div style=\"font-size: 14px; font-weight: 600; color: #475569; font-family: {$fontFamily};\">
                                Dear <strong style=\"color: #0f172a;\">{$reporterName}</strong>,
                            </div>
                            <div style=\"font-size: 13px; color: #334155; line-height: 1.55; margin-top: 6px; font-family: {$fontFamily};\">
                                Your submitted technical support ticket has advanced to a new stage in our engineering triage process.
                            </div>

                            <!-- Current Level Highlight Card -->
                            <div style=\"margin: 18px 0 20px; padding: 16px 18px; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 16px; font-family: {$fontFamily};\">
                                <table role=\"presentation\" width=\"100%\" border=\"0\" cellspacing=\"0\" cellpadding=\"0\" style=\"font-family: {$fontFamily};\">
                                    <tr>
                                        <td>
                                            <div style=\"font-size: 10px; font-weight: 800; color: #64748b; text-transform: uppercase; letter-spacing: 0.8px; font-family: {$fontFamily};\">
                                                Current Triage Status
                                            </div>
                                            <div style=\"font-size: 18px; font-weight: 900; color: #0f172a; margin-top: 2px; font-family: {$fontFamily};\">
                                                {$newStatus}
                                            </div>
                                            <div style=\"font-size: 11px; font-weight: 600; color: {$activeTheme['activeColor']}; margin-top: 2px; font-family: {$fontFamily};\">
                                                Level {$currentLevelNum} of 5 &bull; {$currentStage['badge']}
                                            </div>
                                        </td>
                                        <td align=\"right\" style=\"vertical-align: middle;\">
                                            <span style=\"display: inline-block; padding: 6px 14px; font-size: 11px; font-weight: 800; color: {$statusPillText}; background-color: {$statusPillBg}; border: 1px solid {$statusPillBorder}; border-radius: 999px; text-transform: uppercase; letter-spacing: 0.5px; font-family: {$fontFamily};\">
                                                {$newStatus}
                                            </span>
                                        </td>
                                    </tr>
                                </table>

                                <!-- Progress Bar -->
                                <div style=\"margin-top: 14px;\">
                                    <div style=\"width: 100%; height: 7px; background-color: #e2e8f0; border-radius: 999px; overflow: hidden;\">
                                        <div style=\"width: {$progressPercent}%; height: 100%; background-color: {$activeTheme['activeColor']}; border-radius: 999px;\"></div>
                                    </div>
                                    <div style=\"font-size: 10px; color: #64748b; font-weight: 600; margin-top: 5px; text-align: right; font-family: {$fontFamily};\">
                                        {$progressPercent}% Completed Across SLA Pipeline
                                    </div>
                                </div>
                            </div>

                            <!-- Step by Step Visual Stepper -->
                            <div style=\"margin: 22px 0 10px; font-family: {$fontFamily};\">
                                <div style=\"font-size: 11px; font-weight: 800; color: #0f172a; text-transform: uppercase; letter-spacing: 0.8px; margin-bottom: 12px; font-family: {$fontFamily};\">
                                    Step-by-Step Lifecycle Progress
                                </div>

                                <table role=\"presentation\" width=\"100%\" border=\"0\" cellspacing=\"0\" cellpadding=\"0\" style=\"font-family: {$fontFamily};\">
                                    {$stepsHtml}
                                </table>
                            </div>

                            {$supportBlock}

                            <!-- Ticket Summary Specifications -->
                            <div style=\"margin: 20px 0 24px; padding: 14px 18px; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 14px; font-family: {$fontFamily};\">
                                <div style=\"font-size: 10px; font-weight: 800; color: #64748b; text-transform: uppercase; letter-spacing: 0.8px; margin-bottom: 8px; font-family: {$fontFamily};\">
                                    Ticket Reference Details
                                </div>
                                <table role=\"presentation\" width=\"100%\" border=\"0\" cellspacing=\"0\" cellpadding=\"0\" style=\"font-size: 12px; font-family: {$fontFamily};\">
                                    <tr>
                                        <td style=\"padding: 3px 0; color: #64748b; width: 32%; font-family: {$fontFamily};\"><strong>Subject:</strong></td>
                                        <td style=\"padding: 3px 0; color: #0f172a; font-weight: 700; font-family: {$fontFamily};\">{$subject}</td>
                                    </tr>
                                    <tr>
                                        <td style=\"padding: 3px 0; color: #64748b; font-family: {$fontFamily};\"><strong>Category / Role:</strong></td>
                                        <td style=\"padding: 3px 0; color: #0f172a; font-family: {$fontFamily};\">{$reporterRole}</td>
                                    </tr>
                                    <tr>
                                        <td style=\"padding: 3px 0; color: #64748b; font-family: {$fontFamily};\"><strong>Department:</strong></td>
                                        <td style=\"padding: 3px 0; color: #0f172a; font-family: {$fontFamily};\">{$department}</td>
                                    </tr>
                                    <tr>
                                        <td style=\"padding: 3px 0; color: #64748b; font-family: {$fontFamily};\"><strong>Last Updated:</strong></td>
                                        <td style=\"padding: 3px 0; color: #0f172a; font-family: {$fontFamily};\">{$dateTimeNow}</td>
                                    </tr>
                                </table>
                            </div>

                            <!-- Call to Action Button -->
                            <div style=\"text-align: center; margin: 26px 0 10px; font-family: {$fontFamily};\">
                                <a href=\"{$portalUrl}\" target=\"_blank\" style=\"display: inline-block; padding: 12px 28px; font-size: 13px; font-weight: 800; color: #ffffff; background-color: #0f172a; border-radius: 12px; text-decoration: none; box-shadow: 0 4px 14px rgba(15, 23, 42, 0.25); letter-spacing: 0.3px; font-family: {$fontFamily};\">
                                    Track Your Ticket Live in Portal &rarr;
                                </a>
                                <div style=\"font-size: 11px; color: #94a3b8; margin-top: 8px; font-family: {$fontFamily};\">
                                    Instant real-time triage updates &bull; Sign in via Google SSO
                                </div>
                            </div>
                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td style=\"background-color: #f1f5f9; padding: 20px 28px; border-top: 1px solid #e2e8f0; font-size: 11px; color: #64748b; line-height: 1.5; text-align: center; font-family: {$fontFamily};\">
                            <div style=\"font-weight: 700; color: #334155; font-family: {$fontFamily};\">
                                Southwestern University PHINMA &bull; Medical & Health Sciences IT Support
                            </div>
                            <div style=\"margin-top: 4px; font-family: {$fontFamily};\">
                                Urgello St., Sambag II, Cebu City, Philippines 6000
                            </div>
                            <div style=\"margin-top: 8px; font-size: 10px; color: #94a3b8; font-family: {$fontFamily};\">
                                This is an automated operational notification generated upon ticket triage updates. Please do not reply directly to this mailer address.
                            </div>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>";

    $plainText = "Ticket #{$ticketCode} Progress Update: [{$newStatus}]\n\n"
        . "Dear {$reporterName},\n\n"
        . "Your ticket has advanced to: Level {$currentLevelNum} of 5 ({$newStatus}).\n"
        . "Subject: {$subject}\n"
        . "Department: {$department}\n"
        . ($supportMsgClean ? "\nSupport Staff Note: \"{$supportMsgClean}\" - {$adminName}\n" : "")
        . "\nTrack your ticket live: {$portalUrl}\n\n"
        . "Southwestern University PHINMA - MSIS Support Team";

    return [
        'html' => $html,
        'plain' => $plainText
    ];
}

/**
 * Public trigger to send ticket progress notification to reporter
 */
function send_ticket_progress_notification(
    array $ticket,
    string $newStatus,
    ?string $supportMessage = null,
    array $adminInfo = []
): array {
    try {
        $recipientEmail = trim((string)($ticket['reporter_email'] ?? ''));
        $recipientName = trim((string)($ticket['reporter_name'] ?? 'MSIS Colleague'));
        $ticketCode = $ticket['ticket_code'] ?? ('#' . ($ticket['id'] ?? 'TICKET'));

        if (empty($recipientEmail) || !filter_var($recipientEmail, FILTER_VALIDATE_EMAIL)) {
            return [
                'sent' => false,
                'reason' => 'No valid recipient email address found on ticket record.'
            ];
        }

        $config = get_msis_mailer_config();

        $rawSubject = trim((string)($ticket['subject'] ?? ''));
        // Strip test placeholders or generic tags so production emails remain clean
        $isTestOrGeneric = empty($rawSubject) || preg_match('/^(test|testing|new test|sample|test ticket|technical support)$/i', $rawSubject);
        $subject = $isTestOrGeneric
            ? "Ticket #{$ticketCode} Progress: [{$newStatus}]"
            : "Ticket #{$ticketCode} Progress: [{$newStatus}] - {$rawSubject}";
        $content = build_ticket_progress_email_html($ticket, $newStatus, $supportMessage, $adminInfo, $config);

        return send_msis_phpmailer($recipientEmail, $recipientName, $subject, $content['html'], $content['plain'], $config);
    } catch (Throwable $e) {
        return [
            'sent' => false,
            'reason' => 'Progress notification exception: ' . $e->getMessage()
        ];
    }
}

/**
 * Build responsive HTML Email Alert for Super Admin / Support Personnel
 */
function build_super_admin_new_ticket_email_html(
    array $ticket,
    array $attachments,
    array $config
): array {
    $ticketCode = htmlspecialchars($ticket['ticket_code'] ?? ('#' . ($ticket['id'] ?? 'TICKET')));
    $subject = htmlspecialchars($ticket['subject'] ?? 'Untitled Technical Issue');
    $description = htmlspecialchars($ticket['description'] ?? 'No detailed description provided.');
    $reporterName = htmlspecialchars($ticket['reporter_name'] ?? 'MSIS User');
    $reporterRole = htmlspecialchars($ticket['reporter_role'] ?? 'Reporter');
    $reporterEmail = htmlspecialchars($ticket['reporter_email'] ?? 'unspecified@msis.edu');
    $department = htmlspecialchars($ticket['department'] ?? 'General Systems');
    $priority = htmlspecialchars($ticket['priority'] ?? 'Medium');

    $fontFamily = "'Plus Jakarta Sans', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";
    $dateTimeNow = date('F j, Y, g:i A') . ' PHT';

    // Direct Super Admin triage deep link
    $ticketParam = !empty($ticket['id']) ? rawurlencode((string)$ticket['id']) : '';
    $adminPortalUrl = htmlspecialchars($config['base_url'] . '/super-admin/tickets');
    if ($ticketParam) {
        $adminPortalUrl = htmlspecialchars($config['base_url'] . '/admin/tickets/' . $ticketParam);
    }

    // Priority Styling
    $priorityColor = '#0369a1';
    $priorityBg = '#e0f2fe';
    $priorityBorder = '#bae6fd';
    if (strcasecmp($priority, 'Critical') === 0) {
        $priorityColor = '#991b1b';
        $priorityBg = '#fee2e2';
        $priorityBorder = '#fecaca';
    } elseif (strcasecmp($priority, 'High') === 0) {
        $priorityColor = '#c2410c';
        $priorityBg = '#ffedd5';
        $priorityBorder = '#fed7aa';
    } elseif (strcasecmp($priority, 'Low') === 0) {
        $priorityColor = '#475569';
        $priorityBg = '#f1f5f9';
        $priorityBorder = '#e2e8f0';
    }

    // Attachments HTML
    $attachmentsHtml = '';
    if (!empty($attachments) && is_array($attachments)) {
        $attItems = '';
        foreach ($attachments as $att) {
            $attName = htmlspecialchars($att['name'] ?? $att['original_name'] ?? 'Attached File');
            $attUrl = !empty($att['url']) ? htmlspecialchars($att['url']) : null;
            $attSize = !empty($att['size']) ? ' (' . round($att['size'] / 1024, 1) . ' KB)' : '';

            if ($attUrl) {
                $attItems .= "<li style=\"margin-bottom: 4px;\"><a href=\"{$attUrl}\" target=\"_blank\" style=\"color: #0284c7; text-decoration: underline; font-weight: 600;\">{$attName}</a><span style=\"color: #64748b; font-size: 11px;\">{$attSize}</span></li>";
            } else {
                $attItems .= "<li style=\"margin-bottom: 4px; color: #334155; font-weight: 600;\">{$attName}<span style=\"color: #64748b; font-size: 11px;\">{$attSize}</span></li>";
            }
        }

        $attachmentsHtml = "
        <div style=\"margin: 18px 0 20px; padding: 12px 16px; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; font-family: {$fontFamily};\">
            <div style=\"font-size: 10px; font-weight: 800; color: #64748b; text-transform: uppercase; letter-spacing: 0.8px; margin-bottom: 6px; font-family: {$fontFamily};\">
                Attached Diagnostic Files (" . count($attachments) . ")
            </div>
            <ul style=\"margin: 0; padding-left: 18px; font-size: 12px; font-family: {$fontFamily};\">
                {$attItems}
            </ul>
        </div>";
    }

    $descriptionFormatted = nl2br($description);

    $html = "
<!DOCTYPE html>
<html lang=\"en\">
<head>
    <meta charset=\"UTF-8\">
    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">
    <title>New Ticket Ingested: {$ticketCode}</title>
    <!-- Plus Jakarta Sans Font (Matching MSIS Project Typography) -->
    <link rel=\"preconnect\" href=\"https://fonts.googleapis.com\">
    <link rel=\"preconnect\" href=\"https://fonts.gstatic.com\" crossorigin>
    <link href=\"https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap\" rel=\"stylesheet\">
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');
        body, table, td, div, span, p, a, strong, b {
            font-family: 'Plus Jakarta Sans', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif !important;
        }
    </style>
</head>
<body style=\"margin: 0; padding: 0; background-color: #f8fafc; font-family: {$fontFamily}; color: #0f172a; -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale;\">
    <table role=\"presentation\" width=\"100%\" border=\"0\" cellspacing=\"0\" cellpadding=\"0\" style=\"background-color: #f8fafc; padding: 24px 12px; font-family: {$fontFamily};\">
        <tr>
            <td align=\"center\">
                <table role=\"presentation\" width=\"100%\" max-width=\"620\" border=\"0\" cellspacing=\"0\" cellpadding=\"0\" style=\"max-width: 620px; background-color: #ffffff; border-radius: 20px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05); text-align: left; font-family: {$fontFamily};\">
                    
                    <!-- Header Banner -->
                    <tr>
                        <td style=\"background: linear-gradient(135deg, #7f1d1d 0%, #991b1b 50%, #dc2626 100%); padding: 24px 28px; text-align: left; font-family: {$fontFamily};\">
                            <table role=\"presentation\" width=\"100%\" border=\"0\" cellspacing=\"0\" cellpadding=\"0\" style=\"font-family: {$fontFamily};\">
                                <tr>
                                    <td>
                                        <div style=\"font-size: 10px; font-weight: 800; letter-spacing: 1.2px; text-transform: uppercase; color: #fecaca; margin-bottom: 4px; font-family: {$fontFamily};\">
                                            Super Admin Triage Alert &bull; Southwestern University PHINMA
                                        </div>
                                        <div style=\"font-size: 20px; font-weight: 900; color: #ffffff; letter-spacing: -0.3px; line-height: 1.2; font-family: {$fontFamily};\">
                                            New Support Ticket Ingested
                                        </div>
                                        <div style=\"font-size: 11px; color: #fee2e2; margin-top: 4px; font-weight: 500; font-family: {$fontFamily};\">
                                            Medical Student Information System (MSIS) &bull; Immediate Attention Required
                                        </div>
                                    </td>
                                    <td align=\"right\" style=\"vertical-align: top;\">
                                        <span style=\"display: inline-block; padding: 5px 12px; font-size: 12px; font-weight: 800; color: #ffffff; background: rgba(255, 255, 255, 0.2); border: 1px solid rgba(255, 255, 255, 0.3); border-radius: 12px; font-family: monospace;\">
                                            {$ticketCode}
                                        </span>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    <!-- Body Content -->
                    <tr>
                        <td style=\"padding: 28px 28px 24px; font-family: {$fontFamily};\">
                            <!-- Alert Callout -->
                            <div style=\"padding: 14px 18px; background-color: #fef2f2; border: 1px solid #fecaca; border-radius: 14px; margin-bottom: 20px; font-family: {$fontFamily};\">
                                <div style=\"font-size: 13px; color: #991b1b; line-height: 1.5; font-weight: 600; font-family: {$fontFamily};\">
                                    &#9888; A new technical support incident was submitted by <strong style=\"color: #7f1d1d;\">{$reporterName}</strong> ({$reporterRole}) and has been registered in the triage queue.
                                </div>
                            </div>

                            <!-- Highlights Grid -->
                            <div style=\"margin: 18px 0 20px; padding: 16px 18px; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 16px; font-family: {$fontFamily};\">
                                <table role=\"presentation\" width=\"100%\" border=\"0\" cellspacing=\"0\" cellpadding=\"0\" style=\"font-family: {$fontFamily};\">
                                    <tr>
                                        <td>
                                            <div style=\"font-size: 10px; font-weight: 800; color: #64748b; text-transform: uppercase; letter-spacing: 0.8px; font-family: {$fontFamily};\">
                                                Subject / Issue Title
                                            </div>
                                            <div style=\"font-size: 17px; font-weight: 900; color: #0f172a; margin-top: 3px; font-family: {$fontFamily};\">
                                                {$subject}
                                            </div>
                                            <div style=\"font-size: 11px; font-weight: 600; color: #64748b; margin-top: 3px; font-family: {$fontFamily};\">
                                                Department: {$department} &bull; {$dateTimeNow}
                                            </div>
                                        </td>
                                        <td align=\"right\" style=\"vertical-align: middle;\">
                                            <span style=\"display: inline-block; padding: 6px 14px; font-size: 11px; font-weight: 800; color: {$priorityColor}; background-color: {$priorityBg}; border: 1px solid {$priorityBorder}; border-radius: 999px; text-transform: uppercase; letter-spacing: 0.5px; font-family: {$fontFamily};\">
                                                Priority: {$priority}
                                            </span>
                                        </td>
                                    </tr>
                                </table>
                            </div>

                            <!-- Reporter Information Card -->
                            <div style=\"margin: 18px 0 20px; padding: 14px 18px; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 14px; font-family: {$fontFamily};\">
                                <div style=\"font-size: 10px; font-weight: 800; color: #64748b; text-transform: uppercase; letter-spacing: 0.8px; margin-bottom: 8px; font-family: {$fontFamily};\">
                                    Reporter Identification Details
                                </div>
                                <table role=\"presentation\" width=\"100%\" border=\"0\" cellspacing=\"0\" cellpadding=\"0\" style=\"font-size: 12px; font-family: {$fontFamily};\">
                                    <tr>
                                        <td style=\"padding: 3px 0; color: #64748b; width: 32%; font-family: {$fontFamily};\"><strong>Full Name:</strong></td>
                                        <td style=\"padding: 3px 0; color: #0f172a; font-weight: 700; font-family: {$fontFamily};\">{$reporterName}</td>
                                    </tr>
                                    <tr>
                                        <td style=\"padding: 3px 0; color: #64748b; font-family: {$fontFamily};\"><strong>Institutional Email:</strong></td>
                                        <td style=\"padding: 3px 0; color: #0284c7; font-weight: 600; font-family: {$fontFamily};\"><a href=\"mailto:{$reporterEmail}\" style=\"color: #0284c7; text-decoration: none;\">{$reporterEmail}</a></td>
                                    </tr>
                                    <tr>
                                        <td style=\"padding: 3px 0; color: #64748b; font-family: {$fontFamily};\"><strong>Institutional Role:</strong></td>
                                        <td style=\"padding: 3px 0; color: #0f172a; font-family: {$fontFamily};\">{$reporterRole}</td>
                                    </tr>
                                    <tr>
                                        <td style=\"padding: 3px 0; color: #64748b; font-family: {$fontFamily};\"><strong>Department / Unit:</strong></td>
                                        <td style=\"padding: 3px 0; color: #0f172a; font-family: {$fontFamily};\">{$department}</td>
                                    </tr>
                                </table>
                            </div>

                            <!-- Description Block -->
                            <div style=\"margin: 20px 0; font-family: {$fontFamily};\">
                                <div style=\"font-size: 11px; font-weight: 800; color: #0f172a; text-transform: uppercase; letter-spacing: 0.8px; margin-bottom: 8px; font-family: {$fontFamily};\">
                                    Issue Description & Telemetry Notes
                                </div>
                                <div style=\"background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 14px 16px; font-size: 13px; color: #334155; line-height: 1.6; white-space: normal; font-family: {$fontFamily};\">
                                    {$descriptionFormatted}
                                </div>
                            </div>

                            {$attachmentsHtml}

                            <!-- Call to Action Button -->
                            <div style=\"text-align: center; margin: 28px 0 10px; font-family: {$fontFamily};\">
                                <a href=\"{$adminPortalUrl}\" target=\"_blank\" style=\"display: inline-block; padding: 13px 30px; font-size: 13px; font-weight: 800; color: #ffffff; background-color: #991b1b; border-radius: 12px; text-decoration: none; box-shadow: 0 4px 14px rgba(153, 27, 27, 0.3); letter-spacing: 0.3px; font-family: {$fontFamily};\">
                                    Open Ticket in Super Admin Console &rarr;
                                </a>
                                <div style=\"font-size: 11px; color: #94a3b8; margin-top: 8px; font-family: {$fontFamily};\">
                                    Direct access to triage status updater, audit trail & technician assigner
                                </div>
                            </div>
                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td style=\"background-color: #f1f5f9; padding: 20px 28px; border-top: 1px solid #e2e8f0; font-size: 11px; color: #64748b; line-height: 1.5; text-align: center; font-family: {$fontFamily};\">
                            <div style=\"font-weight: 700; color: #334155; font-family: {$fontFamily};\">
                                Southwestern University PHINMA &bull; Medical Student Information System (MSIS)
                            </div>
                            <div style=\"margin-top: 4px; font-family: {$fontFamily};\">
                                Technical Administration & Engineering &bull; Urgello St., Sambag II, Cebu City, Philippines 6000
                            </div>
                            <div style=\"margin-top: 8px; font-size: 10px; color: #94a3b8; font-family: {$fontFamily};\">
                                This is an automated internal operational alert dispatched to system administrators.
                            </div>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>";

    $plainText = "[MSIS SUPPORT ALERT] New Ticket Ingested: #{$ticketCode}\n\n"
        . "A new support ticket has been filed and requires triage.\n\n"
        . "Ticket: #{$ticketCode}\n"
        . "Priority: {$priority}\n"
        . "Subject: {$subject}\n"
        . "Department: {$department}\n"
        . "Reporter: {$reporterName} ({$reporterRole})\n"
        . "Email: {$reporterEmail}\n"
        . "Submitted At: {$dateTimeNow}\n\n"
        . "Description:\n{$description}\n\n"
        . "View in Admin Console: {$adminPortalUrl}\n\n"
        . "Southwestern University PHINMA - MSIS Technical Administration";

    return [
        'html' => $html,
        'plain' => $plainText
    ];
}

/**
 * Public trigger to dispatch email alert to Super Admin / Support Personnel
 */
function send_super_admin_new_ticket_alert(
    array $ticket,
    array $attachments = [],
    ?mysqli $conn = null
): array {
    try {
        $config = get_msis_mailer_config();
        $ticketCode = $ticket['ticket_code'] ?? ('#' . ($ticket['id'] ?? 'TICKET'));
        $rawSubject = trim((string)($ticket['subject'] ?? 'Technical Support Request'));

        // Query active Super Admins from database
        $adminRecipients = [];
        if ($conn instanceof mysqli) {
            $adminRes = @$conn->query("
                SELECT `name`, `email` 
                FROM `it_support_ticket_user` 
                WHERE `role` = 'Super Admin' AND `status` = 'active'
            ");
            if ($adminRes && $adminRes->num_rows > 0) {
                while ($adminRow = $adminRes->fetch_assoc()) {
                    $em = trim((string)($adminRow['email'] ?? ''));
                    if (filter_var($em, FILTER_VALIDATE_EMAIL)) {
                        $adminRecipients[$em] = trim((string)($adminRow['name'] ?? 'Super Admin')) ?: 'Super Admin';
                    }
                }
            }
        }

        // Environment / default Super Admin fallback
        if (empty($adminRecipients)) {
            $supportEmail = $config['username'] ?: 'medsis798@gmail.com';
            if (filter_var($supportEmail, FILTER_VALIDATE_EMAIL)) {
                $adminRecipients[$supportEmail] = 'MSIS Super Admin';
            }
        }

        if (empty($adminRecipients)) {
            return [
                'sent' => false,
                'reason' => 'No valid Super Admin email address discovered.'
            ];
        }

        $emailSubject = "[MSIS Support Alert] New Ticket #{$ticketCode}: {$rawSubject}";
        $content = build_super_admin_new_ticket_email_html($ticket, $attachments, $config);

        $sentCount = 0;
        $errors = [];

        foreach ($adminRecipients as $admEmail => $admName) {
            $res = send_msis_phpmailer($admEmail, $admName, $emailSubject, $content['html'], $content['plain'], $config);
            if (!empty($res['sent'])) {
                $sentCount++;
            } else {
                $errors[] = $res['error'] ?? $res['reason'] ?? "Failed sending to {$admEmail}";
            }
        }

        return [
            'sent' => $sentCount > 0,
            'recipients' => array_keys($adminRecipients),
            'sent_count' => $sentCount,
            'errors' => $errors
        ];
    } catch (Throwable $e) {
        return [
            'sent' => false,
            'reason' => 'Super admin alert exception: ' . $e->getMessage()
        ];
    }
}
