<?php
/*
 * POST /api/content — the site content the Admin Panel edits (quick-update events, rewards and the
 * problem headline), kept on the server so every visitor, window and device sees the same thing.
 * PHP twin of netlify/functions/content.mjs; the data lives in api/data/content.json (web access
 * to that folder is blocked by its .htaccess).
 *
 *   { action: 'read', since }                  public  → the saved content (or { unchanged })
 *   { action: 'verify', email, code }          checks the admin credentials
 *   { action: 'publish', email, code, data }   admin only → saves the content
 *
 * Needs api/config.php (admin_email, admin_code).
 */
require __DIR__ . '/_lib.php';

const BCF_DEFAULT_ADMIN_EMAIL = 'debojit.aic@gmail.com';
const BCF_DEFAULT_ADMIN_CODE = 'AIC_2026';
const BCF_MAX_BODY = 5000000;
const BCF_MAX_EVENTS = 4;
const BCF_MAX_REWARDS = 30;
const BCF_MAX_IMAGE = 700000; // characters of a data: URL

function bcf_str($v, int $max): string
{
    return is_string($v) ? bcf_cut($v, $max) : '';
}

function bcf_image($v): string
{
    return is_string($v) && strpos($v, 'data:image/') === 0 && strlen($v) <= BCF_MAX_IMAGE ? $v : '';
}

function bcf_is_list($v): bool
{
    return is_array($v) && array_keys($v) === range(0, count($v) - 1) || $v === [];
}

function bcf_clean_content($data): array
{
    $d = is_array($data) ? $data : [];

    $events = [];
    $rawEvents = bcf_is_list($d['events'] ?? null) ? array_slice($d['events'], 0, BCF_MAX_EVENTS) : [];
    foreach ($rawEvents as $e) {
        $e = is_array($e) ? $e : [];
        $events[] = [
            'format' => bcf_str($e['format'] ?? null, 80),
            'language' => bcf_str($e['language'] ?? null, 60),
            'moment' => bcf_str($e['moment'] ?? null, 120),
            'catchyLine' => bcf_str($e['catchyLine'] ?? null, 200),
            'description' => bcf_str($e['description'] ?? null, 800),
            'headlineFirst' => bcf_str($e['headlineFirst'] ?? null, 120),
            'headlineSecond' => bcf_str($e['headlineSecond'] ?? null, 120),
            'image' => bcf_image($e['image'] ?? null),
            'start' => bcf_str($e['start'] ?? null, 32),
            'end' => bcf_str($e['end'] ?? null, 32),
        ];
    }

    $rewards = null;
    if (bcf_is_list($d['rewards'] ?? null)) {
        $rewards = [];
        foreach (array_slice($d['rewards'], 0, BCF_MAX_REWARDS) as $i => $r) {
            $r = is_array($r) ? $r : [];
            $id = bcf_str($r['id'] ?? null, 60);
            $rewards[] = [
                'id' => $id !== '' ? $id : 'rew-' . $i,
                'name' => bcf_str($r['name'] ?? null, 160),
                'image' => bcf_image($r['image'] ?? null),
            ];
        }
    }

    $headline = null;
    if (isset($d['headline']) && is_array($d['headline'])) {
        $headline = [
            'line1' => bcf_str($d['headline']['line1'] ?? null, 160),
            'line2' => bcf_str($d['headline']['line2'] ?? null, 160),
        ];
    }

    return ['events' => $events, 'rewards' => $rewards, 'headline' => $headline];
}

/* ---------- Storage: one JSON file, written atomically under a lock ---------- */

function bcf_store_dir(): string
{
    $dir = __DIR__ . '/data';
    if (!is_dir($dir) && !@mkdir($dir, 0755, true) && !is_dir($dir)) {
        throw new RuntimeException('cannot create the data folder');
    }
    $guard = $dir . '/.htaccess';
    if (!is_file($guard)) {
        @file_put_contents($guard, "<IfModule mod_authz_core.c>\n  Require all denied\n</IfModule>\n<IfModule !mod_authz_core.c>\n  Order deny,allow\n  Deny from all\n</IfModule>\n");
    }
    return $dir;
}

function bcf_store_get(): ?array
{
    $file = __DIR__ . '/data/content.json';
    if (!is_file($file)) {
        return null;
    }
    $raw = @file_get_contents($file);
    if ($raw === false || $raw === '') {
        return null;
    }
    $rec = json_decode($raw, true);
    return is_array($rec) ? $rec : null;
}

/** Runs $fn (a read-modify-write) while holding an exclusive lock, so two admins cannot interleave. */
function bcf_store_locked(callable $fn)
{
    $dir = bcf_store_dir();
    $lock = fopen($dir . '/.lock', 'c');
    if (!$lock || !flock($lock, LOCK_EX)) {
        throw new RuntimeException('cannot lock the data folder');
    }
    try {
        return $fn($dir);
    } finally {
        flock($lock, LOCK_UN);
        fclose($lock);
    }
}

function bcf_store_set(string $dir, array $rec): void
{
    $json = json_encode($rec, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    $tmp = $dir . '/content.json.tmp';
    $dest = $dir . '/content.json';
    if ($json === false || file_put_contents($tmp, $json) === false) {
        throw new RuntimeException('cannot write the content file');
    }
    if (!@rename($tmp, $dest)) {
        if (!@copy($tmp, $dest)) {
            throw new RuntimeException('cannot replace the content file');
        }
        @unlink($tmp);
    }
}

/* ---------- Request ---------- */

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    bcf_json(405, ['ok' => false, 'error' => 'method']);
}
$body = bcf_read_json(BCF_MAX_BODY);
$b = is_array($body) ? $body : [];

$cfg = bcf_config();
$adminEmail = trim((string) ($cfg['admin_email'] ?? '')) ?: BCF_DEFAULT_ADMIN_EMAIL;
$adminCode = (string) ($cfg['admin_code'] ?? '') !== '' ? (string) $cfg['admin_code'] : BCF_DEFAULT_ADMIN_CODE;

$authorised = function () use ($b, $adminEmail, $adminCode): bool {
    $email = strtolower(trim(bcf_str($b['email'] ?? null, 200)));
    $code = trim(bcf_str($b['code'] ?? null, 200));
    $ok = hash_equals(strtolower($adminEmail), $email) & hash_equals($adminCode, $code);
    if (!$ok) {
        usleep(400000); // slows down guessing
    }
    return (bool) $ok;
};

try {
    $action = $b['action'] ?? null;

    if ($action === 'read') {
        $rec = bcf_store_get();
        if (!$rec) {
            bcf_json(200, ['ok' => true, 'data' => null, 'updatedAt' => 0]);
        }
        $updatedAt = (int) ($rec['updatedAt'] ?? 0);
        if ((int) ($b['since'] ?? 0) === $updatedAt) {
            bcf_json(200, ['ok' => true, 'unchanged' => true, 'updatedAt' => $updatedAt]);
        }
        bcf_json(200, ['ok' => true, 'data' => $rec['data'] ?? null, 'updatedAt' => $updatedAt]);
    }

    if ($action === 'verify') {
        $authorised() ? bcf_json(200, ['ok' => true]) : bcf_json(401, ['ok' => false, 'error' => 'denied']);
    }

    if ($action === 'publish') {
        if (!$authorised()) {
            bcf_json(401, ['ok' => false, 'error' => 'denied']);
        }
        $clean = bcf_clean_content($b['data'] ?? null);
        $by = bcf_str($b['name'] ?? null, 120) ?: bcf_str($b['email'] ?? null, 200);
        $updatedAt = bcf_store_locked(function (string $dir) use ($clean, $by): int {
            $prev = bcf_store_get();
            $now = (int) round(microtime(true) * 1000);
            $next = max($now, (int) ($prev['updatedAt'] ?? 0) + 1);
            bcf_store_set($dir, ['data' => $clean, 'updatedAt' => $next, 'by' => $by]);
            return $next;
        });
        bcf_json(200, ['ok' => true, 'updatedAt' => $updatedAt]);
    }
} catch (Throwable $e) {
    error_log('[content] storage failed: ' . $e->getMessage());
    bcf_json(502, ['ok' => false, 'error' => 'storage']);
}

bcf_json(400, ['ok' => false, 'error' => 'bad-action']);
