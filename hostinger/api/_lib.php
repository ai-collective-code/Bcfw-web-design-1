<?php
/*
 * Shared helpers for the BCF backend on Hostinger (plain PHP 7.4+, no Composer).
 * Mirrors netlify/functions/*.mjs so the site behaves the same here as on Vercel and Netlify.
 * Secrets live in config.php next to this file; it is never committed (see config.sample.php).
 */

ini_set('display_errors', '0');
error_reporting(E_ALL);

const BCF_TEAM_INBOX = 'debojit.aic@gmail.com';

function bcf_config(): array
{
    static $cfg = null;
    if ($cfg === null) {
        $file = __DIR__ . '/config.php';
        $loaded = is_file($file) ? include $file : [];
        $cfg = is_array($loaded) ? $loaded : [];
    }
    return $cfg;
}

function bcf_json(int $status, array $body): void
{
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    header('Cache-Control: no-store');
    echo json_encode($body, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

/** Reads the request body (capped) and decodes it as JSON; answers 413 / 400 itself on failure. */
function bcf_read_json(int $max)
{
    $len = isset($_SERVER['CONTENT_LENGTH']) ? (int) $_SERVER['CONTENT_LENGTH'] : 0;
    if ($len > $max) {
        bcf_json(413, ['ok' => false, 'error' => 'too-large']);
    }
    $raw = file_get_contents('php://input', false, null, 0, $max + 1);
    if ($raw === false) {
        $raw = '';
    }
    if (strlen($raw) > $max) {
        bcf_json(413, ['ok' => false, 'error' => 'too-large']);
    }
    $body = json_decode($raw, true);
    if (json_last_error() !== JSON_ERROR_NONE) {
        bcf_json(400, ['ok' => false, 'error' => 'bad-json']);
    }
    return $body;
}

function bcf_cut(string $s, int $max): string
{
    return function_exists('mb_substr') ? mb_substr($s, 0, $max, 'UTF-8') : substr($s, 0, $max);
}

/** Single-line field: line breaks and tabs become spaces so nothing can spill into mail headers. */
function bcf_line($v, int $max): string
{
    if (!is_string($v)) {
        return '';
    }
    return trim(bcf_cut(trim(preg_replace('/[\r\n\t]+/', ' ', $v)), $max));
}

function bcf_text($v, int $max): string
{
    if (!is_string($v)) {
        return '';
    }
    return trim(bcf_cut(trim(str_replace(["\r\n", "\r"], "\n", $v)), $max));
}

function bcf_list($v): array
{
    if (!is_array($v)) {
        return [];
    }
    $out = [];
    foreach ($v as $x) {
        $s = bcf_line($x, 80);
        if ($s !== '') {
            $out[] = $s;
        }
        if (count($out) >= 40) {
            break;
        }
    }
    return $out;
}

function bcf_esc(string $s): string
{
    return htmlspecialchars($s, ENT_QUOTES, 'UTF-8');
}

/* ---------- Mail ---------- */

/** RFC 2047 encoded-words for any header text that is not plain ASCII. */
function bcf_encode_header(string $s): string
{
    if (preg_match('/^[\x20-\x7e]*$/', $s)) {
        return $s;
    }
    $chars = preg_split('//u', $s, -1, PREG_SPLIT_NO_EMPTY);
    if ($chars === false) {
        $chars = str_split($s);
    }
    $words = [];
    $cur = '';
    foreach ($chars as $c) {
        if (strlen($cur) + strlen($c) > 36) {
            $words[] = $cur;
            $cur = '';
        }
        $cur .= $c;
    }
    if ($cur !== '') {
        $words[] = $cur;
    }
    return implode("\r\n ", array_map(function ($w) {
        return '=?UTF-8?B?' . base64_encode($w) . '?=';
    }, $words));
}

function bcf_address(string $name, string $email): string
{
    if ($name === '') {
        return '<' . $email . '>';
    }
    if (preg_match('/^[\x20-\x7e]*$/', $name)) {
        return '"' . addcslashes($name, "\\\"") . '" <' . $email . '>';
    }
    return bcf_encode_header($name) . ' <' . $email . '>';
}

/** The team email for one inquiry: subject, extra headers and a multipart text + HTML body. */
function bcf_build_mail(array $d, string $from): array
{
    $rows = [
        ['Name', $d['name']],
        ['Email', $d['email']],
        ['Company', $d['company']],
        ['Phone', $d['phone']],
        ['Markets', implode(', ', $d['markets'])],
        ['Languages', implode(', ', $d['languages'])],
        ['Moment', $d['moment']],
        ['Festivals', implode(', ', $d['moments'])],
        ['Formats', implode(', ', $d['formats'])],
        ['Message', $d['message']],
        ['Sent from', $d['page']],
    ];
    $rows = array_values(array_filter($rows, function ($r) {
        return $r[1] !== '';
    }));

    $textLines = [];
    $htmlRows = '';
    foreach ($rows as $r) {
        $textLines[] = $r[0] . ': ' . $r[1];
        $htmlRows .= '<tr><td style="vertical-align:top;color:#6b6c86;white-space:nowrap">' . bcf_esc($r[0])
            . '</td><td style="white-space:pre-wrap">' . bcf_esc($r[1]) . '</td></tr>';
    }
    $text = implode("\n", $textLines);
    $html = '<div style="font-family:Arial,sans-serif;font-size:15px;color:#0b0b1f">'
        . '<h2 style="margin:0 0 14px">New query from the BCF website</h2>'
        . '<table cellpadding="8" style="border-collapse:collapse">' . $htmlRows . '</table>'
        . '<p style="color:#6b6c86;font-size:13px">Hit Reply to answer ' . bcf_esc($d['name']) . ' directly.</p></div>';

    $boundary = 'bcf_' . bin2hex(random_bytes(12));
    $part = function (string $type, string $content) use ($boundary): string {
        return '--' . $boundary . "\r\n"
            . 'Content-Type: ' . $type . '; charset=UTF-8' . "\r\n"
            . 'Content-Transfer-Encoding: base64' . "\r\n\r\n"
            . chunk_split(base64_encode($content));
    };
    $body = $part('text/plain', $text) . $part('text/html', $html) . '--' . $boundary . "--\r\n";

    $headers = ['From: ' . bcf_address('BCF website', $from)];
    if (filter_var($d['email'], FILTER_VALIDATE_EMAIL)) {
        $headers[] = 'Reply-To: ' . bcf_address($d['name'], $d['email']);
    }
    $headers[] = 'MIME-Version: 1.0';
    $headers[] = 'Content-Type: multipart/alternative; boundary="' . $boundary . '"';

    return [
        'subject' => 'New query: ' . $d['name'] . ($d['company'] !== '' ? ' (' . $d['company'] . ')' : ''),
        'headers' => $headers,
        'body' => $body,
    ];
}

function bcf_smtp_reply($fp): array
{
    $text = '';
    $code = 0;
    while (($line = fgets($fp, 1024)) !== false) {
        $text .= $line;
        $code = (int) substr($line, 0, 3);
        if (strlen($line) < 4 || $line[3] !== '-') {
            break;
        }
    }
    if ($text === '') {
        throw new RuntimeException('smtp: no reply (timed out)');
    }
    return [$code, trim($text)];
}

function bcf_smtp_expect($fp, array $ok): void
{
    [$code, $text] = bcf_smtp_reply($fp);
    if (!in_array($code, $ok, true)) {
        throw new RuntimeException('smtp: unexpected reply: ' . $text);
    }
}

function bcf_smtp_cmd($fp, string $cmd, array $ok): void
{
    fwrite($fp, $cmd . "\r\n");
    bcf_smtp_expect($fp, $ok);
}

/** Sends one message through Gmail's SMTP (implicit TLS, port 465) with an app password. */
function bcf_smtp_send(string $user, string $pass, string $to, array $mail): void
{
    $ctx = stream_context_create(['ssl' => ['verify_peer' => true, 'verify_peer_name' => true]]);
    $fp = @stream_socket_client('ssl://smtp.gmail.com:465', $errno, $errstr, 15, STREAM_CLIENT_CONNECT, $ctx);
    if (!$fp) {
        throw new RuntimeException('smtp: connect failed: ' . $errstr . ' (' . $errno . ')');
    }
    stream_set_timeout($fp, 20);
    try {
        bcf_smtp_expect($fp, [220]);
        $host = preg_replace('/[^a-z0-9.-]/i', '', (string) ($_SERVER['SERVER_NAME'] ?? ''));
        bcf_smtp_cmd($fp, 'EHLO ' . ($host !== '' ? $host : 'localhost'), [250]);
        bcf_smtp_cmd($fp, 'AUTH LOGIN', [334]);
        bcf_smtp_cmd($fp, base64_encode($user), [334]);
        bcf_smtp_cmd($fp, base64_encode($pass), [235]);
        bcf_smtp_cmd($fp, 'MAIL FROM:<' . $user . '>', [250]);
        bcf_smtp_cmd($fp, 'RCPT TO:<' . $to . '>', [250, 251]);
        bcf_smtp_cmd($fp, 'DATA', [354]);

        $domain = substr((string) strrchr($user, '@'), 1);
        $head = array_merge([
            'Date: ' . date('r'),
            'Message-ID: <' . bin2hex(random_bytes(12)) . '@' . ($domain !== '' ? $domain : 'localhost') . '>',
            'To: ' . $to,
            'Subject: ' . bcf_encode_header($mail['subject']),
        ], $mail['headers']);
        $msg = implode("\r\n", $head) . "\r\n\r\n" . $mail['body'];
        $msg = preg_replace('/^\./m', '..', $msg);
        fwrite($fp, rtrim($msg, "\r\n") . "\r\n.\r\n");
        bcf_smtp_expect($fp, [250]);
        fwrite($fp, "QUIT\r\n");
    } finally {
        fclose($fp);
    }
}
