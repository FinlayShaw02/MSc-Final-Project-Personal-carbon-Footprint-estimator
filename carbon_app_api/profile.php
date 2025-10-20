<?php
/**
 * ============================================================
 *  File: profile.php
 *  Endpoint: /profile.php
 *
 *  Purpose:
 *    Read, update, or delete the authenticated user's profile.
 *    The profile includes name, email, preferred units (kg/lb),
 *    and privacy_public (global leaderboard visibility).
 *
 *  Author: Finlay Shaw
 * ============================================================
 */

require __DIR__ . '/config.php';

try {
  $uid = current_user_id();
  $method = $_SERVER['REQUEST_METHOD'];

  if ($method === 'GET') {
    $stmt = $pdo->prepare("
      SELECT id, name, email, units, privacy_public, created_at, updated_at
      FROM users
      WHERE id = ?
      LIMIT 1
    ");
    $stmt->execute([$uid]);
    $row = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$row) {
      http_response_code(404);
      echo json_encode(['error' => 'Profile not found']);
      exit;
    }

    echo json_encode($row);
    exit;
  }

  if ($method === 'PATCH') {
    // Parse and validate JSON body
    $raw = file_get_contents('php://input');
    $data = json_decode($raw, true);
    if (!is_array($data)) {
      http_response_code(400);
      echo json_encode(['error' => 'Invalid JSON']);
      exit;
    }

    $set = [];
    $params = [':id' => $uid];

    // name
    if (array_key_exists('name', $data)) {
      $name = trim((string)$data['name']);
      if ($name === '') {
        http_response_code(422);
        echo json_encode(['error' => 'Name is required.']);
        exit;
      }
      $set[] = 'name = :name';
      $params[':name'] = $name;
    }

    // email
    if (array_key_exists('email', $data)) {
      $email = trim((string)$data['email']);
      if ($email === '' || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
        http_response_code(422);
        echo json_encode(['error' => 'Valid email is required.']);
        exit;
      }
      $set[] = 'email = :email';
      $params[':email'] = $email;
    }

    // units: 'kg' | 'lb'
    if (array_key_exists('units', $data)) {
      $units = ($data['units'] === 'lb') ? 'lb' : 'kg';
      $set[] = 'units = :units';
      $params[':units'] = $units;
    }

    // privacy_public: 1|0
    if (array_key_exists('privacy_public', $data)) {
      $pp = !empty($data['privacy_public']) ? 1 : 0;
      $set[] = 'privacy_public = :privacy_public';
      $params[':privacy_public'] = $pp;
    }

    // Must have at least one allowed field
    if (!$set) {
      http_response_code(400);
      echo json_encode(['error' => 'No allowed fields to update.']);
      exit;
    }

    $sql = "UPDATE users SET " . implode(', ', $set) . ", updated_at = NOW() WHERE id = :id LIMIT 1";
    $stmt = $pdo->prepare($sql);

    try {
      $stmt->execute($params);
    } catch (PDOException $e) {
      // Handle unique constraint violations 
      if ($e->getCode() === '23000') {
        http_response_code(409);
        echo json_encode(['error' => 'That email is already in use.']);
        exit;
      }
      throw $e;
    }

    echo json_encode(['ok' => true]);
    exit;
  }

  if ($method === 'DELETE') {
    // Hard delete the user
    $pdo->beginTransaction();
    try {
      $pdo->prepare("DELETE FROM users WHERE id = ? LIMIT 1")->execute([$uid]);

      // End session so the user is fully signed out
      if (session_status() === PHP_SESSION_ACTIVE) {
        $_SESSION = [];
        if (ini_get('session.use_cookies')) {
          $p = session_get_cookie_params();
          setcookie(session_name(), '', time() - 42000, $p['path'], $p['domain'], $p['secure'], $p['httponly']);
        }
        session_destroy();
      }

      $pdo->commit();
      echo json_encode(['ok' => true]);
      exit;
    } catch (Throwable $e) {
      $pdo->rollBack();
      http_response_code(500);
      echo json_encode(['error' => 'Failed to delete account']);
      exit;
    }
  }

  // Method not supported
  http_response_code(405);
  echo json_encode(['error' => 'Method not allowed']);
} catch (Throwable $e) {
  http_response_code(500);
  echo json_encode(['error' => 'Server error']);
}
