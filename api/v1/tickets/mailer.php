<?php
/**
 * MSIS Support Ticket System • Automated Email Notifications
 * Sends step-by-step progress tracking emails using the root PHPMailer library
 * Path: api/v1/tickets/mailer.php
 */

// Load PHPMailer from the root folder
$phpMailerRoot = dirname(__DIR__, 3) . '/PHPMailer/src';
if (!file_exists($phpMailerRoot . '/PHPMailer.php')) {
    // Fallback relative search paths
    $docRoot = !empty($_SERVER['DOCUMENT_ROOT']) ? rtrim($_SERVER['DOCUMENT_ROOT'], '/\\') : null;
    $possibleRoots = array_filter([
        $docRoot ? $docRoot . '/PHPMailer/src' : null,
        dirname(__DIR__, 2) . '/PHPMailer/src',
        __DIR__ . '/../../../PHPMailer/src',
        __DIR__ . '/../../PHPMailer/src'
    ]);
    foreach ($possibleRoots as $pr) {
        if (file_exists($pr . '/PHPMailer.php')) {
            $phpMailerRoot = $pr;
            break;
        }
    }
}

require_once $phpMailerRoot . '/Exception.php';
require_once $phpMailerRoot . '/PHPMailer.php';
require_once $phpMailerRoot . '/SMTP.php';

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
            ? "<span style=\"display:inline-block;margin-left:8px;padding:2px 8px;font-size:10px;font-weight:800;letter-spacing:0.5px;color:{$activeTheme['badgeText']};background:{$activeTheme['badgeBg']};border-radius:999px;border:1px solid {$activeTheme['activeBorder']};text-transform:uppercase;\">CURRENT STAGE</span>"
            : ($isCompleted ? '<span style="display:inline-block;margin-left:8px;padding:1px 6px;font-size:9px;font-weight:700;color:#047857;background:#d1fae5;border-radius:999px;">Completed</span>' : '');

        $cardBg = $isCurrent ? $activeTheme['activeBg'] : '#ffffff';
        $cardBorder = $isCurrent ? "1px solid {$activeTheme['activeBorder']}" : '1px solid #f1f5f9';

        $stepsHtml .= "
        <tr>
            <td style=\"vertical-align: top; width: 44px; text-align: center; padding-right: 12px;\">
                <div style=\"width: 32px; height: 32px; border-radius: 50%; background: {$nodeBg}; color: {$nodeColor}; border: 2px solid {$nodeBorder}; font-size: 13px; font-weight: 800; line-height: 28px; text-align: center; margin: 0 auto; box-shadow: " . ($isCurrent ? "0 0 0 3px rgba(16, 185, 129, 0.2)" : "none") . ";\">
                    {$nodeContent}
                </div>
                " . ($idx < count($stages) - 1 ? "<div style=\"width: 2px; height: 34px; margin: 4px auto 0; background: " . ($isCompleted ? "#10b981" : "#e2e8f0") . ";\"></div>" : "") . "
            </td>
            <td style=\"vertical-align: top; padding-bottom: 16px;\">
                <div style=\"background: {$cardBg}; border: {$cardBorder}; border-radius: 12px; padding: 10px 14px;\">
                    <div style=\"font-size: 13px; font-weight: 800; color: {$titleColor};\">
                        {$st['name']} {$currentBadge}
                    </div>
                    <div style=\"font-size: 11px; font-weight: 600; color: " . ($isCurrent ? $activeTheme['activeColor'] : '#64748b') . "; margin-top: 1px;\">
                        {$st['badge']}
                    </div>
                    <div style=\"font-size: 11px; color: {$descColor}; line-height: 1.45; margin-top: 4px;\">
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
        <div style=\"margin: 22px 0 16px; padding: 14px 18px; background-color: #f0f9ff; border-left: 4px solid #0284c7; border-radius: 12px; border-top: 1px solid #e0f2fe; border-right: 1px solid #e0f2fe; border-bottom: 1px solid #e0f2fe;\">
            <div style=\"font-size: 10px; font-weight: 800; color: #0369a1; text-transform: uppercase; letter-spacing: 0.8px; margin-bottom: 4px;\">
                &#9993; Direct Message from Technical Support Staff
            </div>
            <div style=\"font-size: 13px; font-style: italic; color: #1e293b; line-height: 1.5; font-weight: 500;\">
                &ldquo;{$supportMsgClean}&rdquo;
            </div>
            <div style=\"font-size: 10px; font-weight: 700; color: #64748b; margin-top: 6px;\">
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
</head>
<body style=\"margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #0f172a;\">
    <table role=\"presentation\" width=\"100%\" border=\"0\" cellspacing=\"0\" cellpadding=\"0\" style=\"background-color: #f8fafc; padding: 24px 12px;\">
        <tr>
            <td align=\"center\">
                <table role=\"presentation\" width=\"100%\" max-width=\"620\" border=\"0\" cellspacing=\"0\" cellpadding=\"0\" style=\"max-width: 620px; background-color: #ffffff; border-radius: 20px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05); text-align: left;\">
                    
                    <!-- Header Banner -->
                    <tr>
                        <td style=\"background: linear-gradient(135deg, #991b1b 0%, #b91c1c 50%, #dc2626 100%); padding: 24px 28px; text-align: left;\">
                            <table role=\"presentation\" width=\"100%\" border=\"0\" cellspacing=\"0\" cellpadding=\"0\">
                                <tr>
                                    <td>
                                        <div style=\"font-size: 10px; font-weight: 800; letter-spacing: 1.2px; text-transform: uppercase; color: #fecaca; margin-bottom: 4px;\">
                                            Southwestern University PHINMA
                                        </div>
                                        <div style=\"font-size: 20px; font-weight: 900; color: #ffffff; letter-spacing: -0.3px; line-height: 1.2;\">
                                            MSIS Support Ticket System
                                        </div>
                                        <div style=\"font-size: 11px; color: #fee2e2; margin-top: 4px; font-weight: 500;\">
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
                        <td style=\"padding: 28px 28px 24px;\">
                            <!-- Greeting & High-level Status -->
                            <div style=\"font-size: 14px; font-weight: 600; color: #475569;\">
                                Dear <strong style=\"color: #0f172a;\">{$reporterName}</strong>,
                            </div>
                            <div style=\"font-size: 13px; color: #334155; line-height: 1.55; margin-top: 6px;\">
                                Your submitted technical support ticket has advanced to a new stage in our engineering triage process.
                            </div>

                            <!-- Current Level Highlight Card -->
                            <div style=\"margin: 18px 0 20px; padding: 16px 18px; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 16px;\">
                                <table role=\"presentation\" width=\"100%\" border=\"0\" cellspacing=\"0\" cellpadding=\"0\">
                                    <tr>
                                        <td>
                                            <div style=\"font-size: 10px; font-weight: 800; color: #64748b; text-transform: uppercase; letter-spacing: 0.8px;\">
                                                Current Triage Status
                                            </div>
                                            <div style=\"font-size: 18px; font-weight: 900; color: #0f172a; margin-top: 2px;\">
                                                {$newStatus}
                                            </div>
                                            <div style=\"font-size: 11px; font-weight: 600; color: {$activeTheme['activeColor']}; margin-top: 2px;\">
                                                Level {$currentLevelNum} of 5 &bull; {$currentStage['badge']}
                                            </div>
                                        </td>
                                        <td align=\"right\" style=\"vertical-align: middle;\">
                                            <span style=\"display: inline-block; padding: 6px 14px; font-size: 11px; font-weight: 800; color: {$statusPillText}; background-color: {$statusPillBg}; border: 1px solid {$statusPillBorder}; border-radius: 999px; text-transform: uppercase; letter-spacing: 0.5px;\">
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
                                    <div style=\"font-size: 10px; color: #64748b; font-weight: 600; margin-top: 5px; text-align: right;\">
                                        {$progressPercent}% Completed Across SLA Pipeline
                                    </div>
                                </div>
                            </div>

                            <!-- Step by Step Visual Stepper -->
                            <div style=\"margin: 22px 0 10px;\">
                                <div style=\"font-size: 11px; font-weight: 800; color: #0f172a; text-transform: uppercase; letter-spacing: 0.8px; margin-bottom: 12px;\">
                                    Step-by-Step Lifecycle Progress
                                </div>

                                <table role=\"presentation\" width=\"100%\" border=\"0\" cellspacing=\"0\" cellpadding=\"0\">
                                    {$stepsHtml}
                                </table>
                            </div>

                            {$supportBlock}

                            <!-- Ticket Summary Specifications -->
                            <div style=\"margin: 20px 0 24px; padding: 14px 18px; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 14px;\">
                                <div style=\"font-size: 10px; font-weight: 800; color: #64748b; text-transform: uppercase; letter-spacing: 0.8px; margin-bottom: 8px;\">
                                    Ticket Reference Details
                                </div>
                                <table role=\"presentation\" width=\"100%\" border=\"0\" cellspacing=\"0\" cellpadding=\"0\" style=\"font-size: 12px;\">
                                    <tr>
                                        <td style=\"padding: 3px 0; color: #64748b; width: 32%;\"><strong>Subject:</strong></td>
                                        <td style=\"padding: 3px 0; color: #0f172a; font-weight: 700;\">{$subject}</td>
                                    </tr>
                                    <tr>
                                        <td style=\"padding: 3px 0; color: #64748b;\"><strong>Category / Role:</strong></td>
                                        <td style=\"padding: 3px 0; color: #0f172a;\">{$reporterRole}</td>
                                    </tr>
                                    <tr>
                                        <td style=\"padding: 3px 0; color: #64748b;\"><strong>Department:</strong></td>
                                        <td style=\"padding: 3px 0; color: #0f172a;\">{$department}</td>
                                    </tr>
                                    <tr>
                                        <td style=\"padding: 3px 0; color: #64748b;\"><strong>Last Updated:</strong></td>
                                        <td style=\"padding: 3px 0; color: #0f172a;\">{$dateTimeNow}</td>
                                    </tr>
                                </table>
                            </div>

                            <!-- Call to Action Button -->
                            <div style=\"text-align: center; margin: 26px 0 10px;\">
                                <a href=\"{$portalUrl}\" target=\"_blank\" style=\"display: inline-block; padding: 12px 28px; font-size: 13px; font-weight: 800; color: #ffffff; background-color: #0f172a; border-radius: 12px; text-decoration: none; box-shadow: 0 4px 14px rgba(15, 23, 42, 0.25); letter-spacing: 0.3px;\">
                                    Track Your Ticket Live in Portal &rarr;
                                </a>
                                <div style=\"font-size: 11px; color: #94a3b8; margin-top: 8px;\">
                                    Instant real-time triage updates &bull; Sign in via Google SSO
                                </div>
                            </div>
                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td style=\"background-color: #f1f5f9; padding: 20px 28px; border-top: 1px solid #e2e8f0; font-size: 11px; color: #64748b; line-height: 1.5; text-align: center;\">
                            <div style=\"font-weight: 700; color: #334155;\">
                                Southwestern University PHINMA &bull; Medical & Health Sciences IT Support
                            </div>
                            <div style=\"margin-top: 4px;\">
                                Urgello St., Sambag II, Cebu City, Philippines 6000
                            </div>
                            <div style=\"margin-top: 8px; font-size: 10px; color: #94a3b8;\">
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
    $recipientEmail = trim($ticket['reporter_email'] ?? '');
    $recipientName = trim($ticket['reporter_name'] ?? 'MSIS Colleague');
    $ticketCode = $ticket['ticket_code'] ?? ('#' . ($ticket['id'] ?? 'TICKET'));

    if (empty($recipientEmail) || !filter_var($recipientEmail, FILTER_VALIDATE_EMAIL)) {
        return [
            'sent' => false,
            'reason' => 'No valid recipient email address found on ticket record.'
        ];
    }

    $config = get_msis_mailer_config();
    $subject = "Ticket #{$ticketCode} Progress: [{$newStatus}] - " . ($ticket['subject'] ?? 'Technical Support');
    $content = build_ticket_progress_email_html($ticket, $newStatus, $supportMessage, $adminInfo, $config);

    return send_msis_phpmailer($recipientEmail, $recipientName, $subject, $content['html'], $content['plain'], $config);
}
