<?php
/**
 * ============================================================
 *  File: register.php
 *  Endpoint: /register.php
 *
 *  Purpose:
 *    Create a new user account and start a session (auto login)
 *    on success. Intended for use by the public signup form.
 *
 *  Author: Finlay Shaw
 * ============================================================
 */

require __DIR__ . '/config.php';

try {
  // Handle CORS preflight (when called from a dev frontend)
  if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
  }

  // Only POST is allowed here
  if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method Not Allowed']);
    exit;
  }

  // Read and decode JSON body
  $raw = file_get_contents('php://input');
  $data = json_decode($raw, true);
  if (!is_array($data)) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid JSON']);
    exit;
  }

  // Basic validation
  $name  = trim((string)($data['name'] ?? ''));
  $email = strtolower(trim((string)($data['email'] ?? '')));
  $pass  = (string)($data['password'] ?? '');

  if ($name === '' || $email === '' || $pass === '') {
    http_response_code(400);
    echo json_encode(['error' => 'Missing required fields']);
    exit;
  }
  if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid email']);
    exit;
  }
  // enforce minimal password rules
  if (strlen($pass) < 8) {
    http_response_code(400);
    echo json_encode(['error' => 'Password must be at least 8 characters']);
    exit;
  }

  // Uniqueness check on email
  $stmt = $pdo->prepare('SELECT id FROM users WHERE email = :email LIMIT 1');
  $stmt->execute([':email' => $email]);
  if ($stmt->fetch()) {
    http_response_code(409);
    echo json_encode(['error' => 'Email already registered']);
    exit;
  }

  // Create user
  $hash = password_hash($pass, PASSWORD_DEFAULT);
  $ins = $pdo->prepare('INSERT INTO users (name, email, password) VALUES (:name, :email, :password)');
  $ins->execute([
    ':name'     => $name,
    ':email'    => $email,
    ':password' => $hash,
  ]);

  $userId = (int)$pdo->lastInsertId();

  // Auto-login
  session_regenerate_id(true);
  $_SESSION['user_id'] = $userId;

  // Success payload mirrors what the frontend typically needs
  echo json_encode([
    'success' => true,
    'user' => [
      'id'    => $userId,
      'name'  => $name,
      'email' => $email,
    ],
  ]);

} catch (Throwable $e) {
  http_response_code(500);
  echo json_encode([
    'error' => 'Server error',
    // 'detail' => $e->getMessage(), // uncomment during local debugging
  ]);
}
