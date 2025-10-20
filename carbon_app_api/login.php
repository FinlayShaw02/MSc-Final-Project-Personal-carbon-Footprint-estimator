<?php
/**
 * ============================================================
 *  File: login.php
 *  Endpoint: POST /login.php
 *
 *  Purpose:
 *    Authenticate a user by email + password and establish a
 *    PHP session. On success, sets `$_SESSION['user_id']` and
 *    returns basic user info.
 *
 *  Author: Finlay Shaw
 * ============================================================
 */

// htdocs/carbon_app_api/login.php
require __DIR__ . '/config.php';

try {
  // Handle CORS preflight early
  if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
  }

  // Enforce POST for this endpoint
  if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method Not Allowed']);
    exit;
  }

  // Parse JSON body
  $raw = file_get_contents('php://input');
  $data = json_decode($raw, true);
  if (!is_array($data)) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid JSON']);
    exit;
  }

  // Extract and validate fields
  $email = trim((string)($data['email'] ?? ''));
  $pass  = (string)($data['password'] ?? '');

  if ($email === '' || $pass === '') {
    http_response_code(400);
    echo json_encode(['error' => 'Missing email or password']);
    exit;
  }

  // Look up user by email
  $stmt = $pdo->prepare('SELECT id, name, email, password FROM users WHERE email = :email LIMIT 1');
  $stmt->execute([':email' => $email]);
  $user = $stmt->fetch();

  // Uniform error on bad credentials
  if (!$user || !password_verify($pass, $user['password'])) {
    http_response_code(401);
    echo json_encode(['error' => 'Invalid email or password']);
    exit;
  }

  // Success: harden session, set identity
  session_regenerate_id(true);
  $_SESSION['user_id'] = (int)$user['id'];

  // Minimal user payload
  echo json_encode([
    'success' => true,
    'user' => [
      'id'    => (int)$user['id'],
      'name'  => $user['name'],
      'email' => $user['email'],
    ],
  ]);

} catch (Throwable $e) {
  http_response_code(500);
  echo json_encode([
    'error' => 'Server error',
    // 'detail' => $e->getMessage(), // uncomment for debugging
  ]);
}
