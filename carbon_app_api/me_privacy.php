<?php
/**
 * ============================================================
 *  File: privacy.php
 *  Endpoint: GET/POST/PATCH /privacy.php
 *
 *  Purpose:
 *    Read or update the user's global profile visibility flag
 *    (privacy_public). This flag controls inclusion on the
 *    global leaderboard and other public listings.
 *
 *  Author: Finlay Shaw
 * ============================================================
 */

require_once __DIR__ . '/config.php';

$me = current_user_id(); // ensure session user or 401 + exit

// ----- Read current visibility -----
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
  // Fetch a single column; fail with 404 if somehow missing
  $stmt = $pdo->prepare('SELECT privacy_public FROM users WHERE id = ?');
  $stmt->execute([$me]);
  $row = $stmt->fetch(PDO::FETCH_ASSOC);
  if (!$row) fail(404, 'User not found');

  // Normalise to int (0/1)
  ok(['privacy_public' => (int)$row['privacy_public']]);
  exit;
}

// ----- Update visibility (POST or PATCH) -----
if ($_SERVER['REQUEST_METHOD'] === 'POST' || $_SERVER['REQUEST_METHOD'] === 'PATCH') {
  // Expect JSON like { "public": true|false }
  $body = json_body();
  if (!array_key_exists('public', $body)) fail(400, 'Missing "public" boolean');

  // Coerce to integer 0/1 and persist
  $public = (int) (!!$body['public']);
  $stmt = $pdo->prepare('UPDATE users SET privacy_public = ? WHERE id = ?');
  $stmt->execute([$public, $me]);

  ok(['privacy_public' => $public]);
  exit;
}

fail(405, 'Use GET or POST/PATCH');
