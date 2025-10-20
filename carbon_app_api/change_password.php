<?php
/**
 * ============================================================
 *  File: change_password.php
 *  Endpoint: POST /change_password.php
 *
 *  Purpose:
 *    Allows an authenticated user to change their password by
 *    submitting current_password, new_password, and confirm_password.
 *
 *  Notes:
 *    - Uses password_verify/password_hash .
 *    - Does not change any other profile data or invalidate sessions;
 *      adjust as needed
 *
 *  Author: Finlay Shaw
 * ============================================================
 */

require __DIR__ . '/config.php';

/* --- CORS + content type headers ---------------------------------------- */
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: http://localhost:5173");      // frontend origin
header("Access-Control-Allow-Credentials: true");                   // allow cookies
header("Access-Control-Allow-Headers: Content-Type, Authorisation");// allow custom headers
header("Access-Control-Allow-Methods: POST, OPTIONS");              // methods permitted


if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(204); exit; }

if ($_SERVER['REQUEST_METHOD'] !== 'POST') { http_response_code(405); echo json_encode(['error'=>'Use POST']); exit; }

try {
  /* --- Resolve authenticated user (will 401/exit if not logged in) ------- */
  $uid = current_user_id(); // should 401 + exit if not logged in

  /* --- Parse JSON body -------------------- */
  $data = json_decode(file_get_contents('php://input'), true);
  $current = (string)($data['current_password'] ?? '');
  $next    = (string)($data['new_password'] ?? '');
  $confirm = (string)($data['confirm_password'] ?? '');

  /* --- Basic validations -------------------------------------------------- */
  if ($current === '' || $next === '' || $confirm === '') {
    http_response_code(422); echo json_encode(['error'=>'All fields are required.']); exit;
  }
  if ($next !== $confirm) {
    http_response_code(422); echo json_encode(['error'=>'New passwords do not match.']); exit;
  }
  // Minimal strength rule; consider stronger policies
  if (strlen($next) < 8) {
    http_response_code(422); echo json_encode(['error'=>'Password must be at least 8 characters.']); exit;
  }

  /* --- Fetch existing password hash -------------------------------------- */
  $stmt = $pdo->prepare("SELECT password FROM users WHERE id = ? LIMIT 1");
  $stmt->execute([$uid]);
  $row = $stmt->fetch(PDO::FETCH_ASSOC);
  if (!$row) { http_response_code(404); echo json_encode(['error'=>'User not found']); exit; }

  $hash = $row['password'];

  /* --- Verify current password ------------------------------------------- */
  if (!password_verify($current, $hash)) {
    http_response_code(401); echo json_encode(['error'=>'Current password is incorrect.']); exit;
  }

  /* --- Prevent reusing the current password ----------------------------- */
  if (password_verify($next, $hash)) {
    http_response_code(422); echo json_encode(['error'=>'New password must be different from current.']); exit;
  }

  /* --- Hash the new password & persist ----------------------------------- */
  $newHash = password_hash($next, PASSWORD_DEFAULT);
  $upd = $pdo->prepare("UPDATE users SET password = ?, updated_at = NOW() WHERE id = ? LIMIT 1");
  $upd->execute([$newHash, $uid]);

  /* --- Success ------------------------------------------------------------ */
  echo json_encode(['ok'=>true]);

} catch (Throwable $e) {
  // Avoid leaking internal errors; log server-side if needed
  http_response_code(500);
  echo json_encode(['error'=>'Server error']);
}

