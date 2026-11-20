<?php
/*
 * POST /api/inquiry — a visitor's query from the brief builder, emailed to the team's Gmail.
 * PHP twin of netlify/functions/inquiry.mjs: same checks, same JSON answers, so the front end
 * does not care which host it runs on. Reply-To is the visitor; visitors are never a recipient.
 *
 * Needs api/config.php (gmail_user, gmail_app_password, optional inquiry_to).
 */
require __DIR__ . '/_lib.php';

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    bcf_json(405, ['ok' => false, 'error' => 'method']);
}

$cfg = bcf_config();
$user = trim((string) ($cfg['gmail_user'] ?? ''));
// Google shows app passwords in groups of four; the spaces are not part of it.
$pass = preg_replace('/\s+/', '', (string) ($cfg['gmail_app_password'] ?? ''));
$to = trim((string) ($cfg['inquiry_to'] ?? '')) ?: BCF_TEAM_INBOX;
if ($user === '' || $pass === '') {
    error_log('[inquiry] gmail_user / gmail_app_password are not set in api/config.php');
    bcf_json(500, ['ok' => false, 'error' => 'not-configured']);
}

$body = bcf_read_json(20000);
$b = is_array($body) ? $body : [];
$brief = isset($b['brief']) && is_array($b['brief']) ? $b['brief'] : [];

// Bots fill the hidden "website" field; tell them it worked and send nothing.
if (bcf_line($b['website'] ?? '', 200) !== '') {
    bcf_json(200, ['ok' => true]);
}

$data = [
    'name' => bcf_line($b['name'] ?? '', 120),
    'email' => bcf_line($b['email'] ?? '', 200),
    'company' => bcf_line($b['company'] ?? '', 160),
    'phone' => bcf_line($b['phone'] ?? '', 40),
    'message' => bcf_text($b['message'] ?? '', 5000),
    'markets' => bcf_list($brief['markets'] ?? null),
    'languages' => bcf_list($brief['languages'] ?? null),
    'moment' => bcf_line($brief['moment'] ?? '', 60),
    'moments' => bcf_list($brief['moments'] ?? null),
    'formats' => bcf_list($brief['formats'] ?? null),
    'page' => bcf_line($b['page'] ?? '', 300),
];

$errors = [];
if ($data['name'] === '') {
    $errors['name'] = 'Please tell us your name.';
}
if (!preg_match('/^[^\s@<>()]+@[^\s@<>()]+\.[^\s@<>()]{2,}$/u', $data['email'])) {
    $errors['email'] = 'Please enter a valid email address.';
}
if ($errors) {
    bcf_json(422, ['ok' => false, 'errors' => $errors]);
}

try {
    bcf_smtp_send($user, $pass, $to, bcf_build_mail($data, $user));
} catch (Throwable $e) {
    error_log('[inquiry] Gmail SMTP failed: ' . $e->getMessage());
    // Fallback: the host's own mailer, sent from an address on this domain so it is accepted.
    $host = preg_replace('/^www\./i', '', preg_replace('/[^a-z0-9.-]/i', '', (string) ($_SERVER['HTTP_HOST'] ?? '')));
    $mail = bcf_build_mail($data, 'noreply@' . ($host !== '' ? $host : 'localhost'));
    $sent = @mail($to, bcf_encode_header($mail['subject']), $mail['body'], implode("\r\n", $mail['headers']));
    if (!$sent) {
        error_log('[inquiry] fallback mail() failed too');
        bcf_json(502, ['ok' => false, 'error' => 'send-failed']);
    }
}

bcf_json(200, ['ok' => true]);
