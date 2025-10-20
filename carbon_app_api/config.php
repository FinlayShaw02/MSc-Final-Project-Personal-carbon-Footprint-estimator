<?php
// htdocs/carbon_app_api/config.php
declare(strict_types=1);

/**
 * ============================================================
 *  File: config.php
 *  Purpose: Global API bootstrap for XAMPP + React dev.
 *
 *  Description:
 *  Centralised setup for:
 *    - Environment flags & error reporting
 *    - PHP sessions (with secure cookie defaults)
 *    - CORS headers for local dev and future prod origins
 *    - Default JSON content-type
 *    - PDO database connection (UTF-8, UTC, safe defaults)
 *    - Small helper utilities (JSON body, ok/fail, auth, verb guard)
 *
 *  Notes:
 *  - XAMPP defaults (root/empty password) are used for local dev only.
 *    Change credentials and tighten CORS in production.
 *  - Keep SQL/session timestamps in UTC for consistency across services.
 *
 *  Author: Finlay Shaw
 * ============================================================
 */

if (defined('CARBON_APP_BOOTSTRAPPED')) {
  return; // Already loaded in this request avoid re-running side effects
}
define('CARBON_APP_BOOTSTRAPPED', true);

/* -------------------------------------------------------------------------- */
/* Environment & error reporting                                              */
/* -------------------------------------------------------------------------- */

$APP_ENV = $_ENV['APP_ENV'] ?? getenv('APP_ENV') ?: 'dev'; // 'dev' | 'prod'
$IS_PROD = ($APP_ENV === 'prod');

if ($IS_PROD) {
  error_reporting(E_ALL & ~E_NOTICE & ~E_STRICT & ~E_DEPRECATED);
  ini_set('display_errors', '0');
} else {
  error_reporting(E_ALL);
  ini_set('display_errors', '1');
}

/* -------------------------------------------------------------------------- */
/* Security headers                                                           */
/* -------------------------------------------------------------------------- */

header('X-Content-Type-Options: nosniff');
header('Referrer-Policy: no-referrer');
header('X-Frame-Options: DENY'); // API shouldn’t be framed

// Minimal CSP suitable for APIs (no script eval, deny framing)
header("Content-Security-Policy: default-src 'none'; frame-ancestors 'none'; base-uri 'none'");

// HSTS in production over HTTPS (prevents protocol downgrade)
$isHttps = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off')
        || (isset($_SERVER['SERVER_PORT']) && (int)$_SERVER['SERVER_PORT'] === 443)
        || (isset($_SERVER['HTTP_X_FORWARDED_PROTO']) && $_SERVER['HTTP_X_FORWARDED_PROTO'] === 'https');

if ($IS_PROD && $isHttps) {
  // IncludeSubDomains/preload optional; add once you control all subdomains
  header('Strict-Transport-Security: max-age=31536000');
}

/* -------------------------------------------------------------------------- */
/* Sessions (secure cookie defaults)                                          */
/* -------------------------------------------------------------------------- */

// Harden the session engine (must be set before session_start)
ini_set('session.use_only_cookies', '1');       // no URL-based IDs
ini_set('session.use_strict_mode', '1');        // reject uninitialised IDs
ini_set('session.cookie_httponly', '1');        // mitigate XSS cookie theft
ini_set('session.sid_length', '48');            // longer IDs
ini_set('session.sid_bits_per_character', '6'); // more entropy per character

// SameSite policy: Lax by default; allow None (cross-site apps) via env
$cookieSameSite = $_ENV['COOKIE_SAMESITE'] ?? getenv('COOKIE_SAMESITE') ?: 'Lax';
$cookieSameSite = in_array($cookieSameSite, ['Lax', 'Strict', 'None'], true) ? $cookieSameSite : 'Lax';

// In prod we should be on HTTPS; enforce Secure there.
// In dev, allow non-HTTPS for local testing.
$secureFlag = $IS_PROD ? true : $isHttps;

$cookieParams = session_get_cookie_params();
session_set_cookie_params([
  'lifetime' => $cookieParams['lifetime'] ?? 0,
  'path'     => $cookieParams['path'] ?? '/',
  'domain'   => $cookieParams['domain'] ?? '',
  'secure'   => $secureFlag,
  'httponly' => true,
  'samesite' => $cookieSameSite, // 'None' requires HTTPS
]);

// Optional: custom session name to avoid collisions on shared hosts
if (!headers_sent()) {
  session_name($_ENV['SESSION_NAME'] ?? getenv('SESSION_NAME') ?: 'CARBONSESSID');
}

if (session_status() !== PHP_SESSION_ACTIVE) {
  session_start();
}

/* -------------------------------------------------------------------------- */
/* CORS (tight by default; configurable origins)                              */
/* -------------------------------------------------------------------------- */

// Allow list. In dev, include localhost defaults. In prod, read from env.
$devOrigins = [
  'http://localhost:5173', 'http://127.0.0.1:5173',
  'http://localhost:3000', 'http://127.0.0.1:3000',
];

$envOrigins = array_filter(array_map('trim', explode(',', $_ENV['APP_UI_ORIGINS'] ?? getenv('APP_UI_ORIGINS') ?: '')));
$allowedOrigins = $IS_PROD ? $envOrigins : array_unique([...$devOrigins, ...$envOrigins]);

$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if ($origin && in_array($origin, $allowedOrigins, true)) {
  header("Access-Control-Allow-Origin: $origin");
  header('Vary: Origin'); // make caches origin-aware
  header('Access-Control-Allow-Credentials: true'); // allow cookies
  // Header name uses the standard (American) spelling and must remain as-is:
  header('Access-Control-Allow-Headers: Content-Type, Authorization');
  header('Access-Control-Allow-Methods: GET, POST, PATCH, DELETE, OPTIONS');
}

// Preflight short-circuit (respond after setting CORS headers)
if (($_SERVER['REQUEST_METHOD'] ?? '') === 'OPTIONS') {
  http_response_code(204);
  exit;
}

/* -------------------------------------------------------------------------- */
/* JSON defaults                                                              */
/* -------------------------------------------------------------------------- */

header('Content-Type: application/json; charset=utf-8');
// Discourage caching of dynamic API responses unless you add ETags
header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');

/* -------------------------------------------------------------------------- */
/* Database (PDO)                                                             */
/* -------------------------------------------------------------------------- */

// Prefer env vars in prod; fall back to dev defaults
$dbHost = $_ENV['DB_HOST'] ?? getenv('DB_HOST') ?: '127.0.0.1';
$dbName = $_ENV['DB_NAME'] ?? getenv('DB_NAME') ?: 'carbon_app';
$dbUser = $_ENV['DB_USER'] ?? getenv('DB_USER') ?: 'root';
$dbPass = $_ENV['DB_PASS'] ?? getenv('DB_PASS') ?: '';
$dbPort = $_ENV['DB_PORT'] ?? getenv('DB_PORT') ?: '3306';

$dsn = "mysql:host={$dbHost};port={$dbPort};dbname={$dbName};charset=utf8mb4";

$options = [
  PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
  PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
  PDO::ATTR_EMULATE_PREPARES   => false,
  PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8mb4",
];

try {
  /** @var PDO $pdo */
  $pdo = new PDO($dsn, $dbUser, $dbPass, $options);
  // Normalise server timezone to UTC to keep timestamps consistent
  $pdo->query("SET time_zone = '+00:00'");
} catch (Throwable $e) {
  http_response_code(500);
  echo json_encode(['error' => 'DB connection failed']);
  exit;
}

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

/**
 * Read JSON body safely and return an associative array.
 * Returns [] for empty/invalid JSON.
 */
function json_body(): array {
  $raw = file_get_contents('php://input');
  if ($raw === false || $raw === '') return [];
  $data = json_decode($raw, true);
  return is_array($data) ? $data : [];
}

/**
 * a standard success.
 * Example: ok(['user' => $user]);
 */
function ok(array $data = []): void {
  echo json_encode(['ok' => true] + $data, JSON_UNESCAPED_SLASHES);
}

/**
 * an error with HTTP code and stop execution.
 * Example: fail(422, 'Invalid input', ['field' => 'email']);
 */
function fail(int $code, string $msg, array $extra = []): void {
  http_response_code($code);
  echo json_encode(['error' => $msg] + $extra, JSON_UNESCAPED_SLASHES);
  exit;
}

function current_user_id(): int {
  if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['error' => 'unauthorised']);
    exit;
  }
  return (int)$_SESSION['user_id'];
}

/**
 * Ensure the incoming request uses the expected HTTP method.
 */
function require_method(string $method): void {
  if (strcasecmp($_SERVER['REQUEST_METHOD'] ?? '', $method) !== 0) {
    fail(405, 'Method not allowed', ['allowed' => $method]);
  }
}