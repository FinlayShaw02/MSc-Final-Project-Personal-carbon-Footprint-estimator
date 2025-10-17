<?php
/**
 * ============================================================
 *  File: update.php
 *  Endpoint: /update.php
 *
 *  Purpose:
 *    Update a single user activitys quantity. The emissions value
 *    is derived in the database (e.g., via a generated column or trigger),
 *    so this endpoint only permits changing `quantity`.
 *
 *  Author: Finlay Shaw
 * ============================================================
 */


require __DIR__ . '/config.php';

try {
  if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
  }
  if ($_SERVER['REQUEST_METHOD'] !== 'PATCH') {
    http_response_code(405);
    echo json_encode(['error' => 'Use PATCH']);
    exit;
  }

  $uid = current_user_id(); // 401 + exit if not logged in

  $raw  = file_get_contents('php://input');
  $data = json_decode($raw, true);
  if (!is_array($data)) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid JSON']);
    exit;
  }

  $id = intval($data['id'] ?? 0);
  if ($id <= 0) {
    http_response_code(400);
    echo json_encode(['error' => 'Missing or invalid id']);
    exit;
  }

  // Only allow quantity changes
  if (!array_key_exists('quantity', $data)) {
    http_response_code(400);
    echo json_encode(['error' => 'Only quantity can be updated']);
    exit;
  }
  $quantity = filter_var($data['quantity'], FILTER_VALIDATE_FLOAT);
  if ($quantity === false || $quantity < 0) {
    http_response_code(400);
    echo json_encode(['error' => 'Quantity must be a non-negative number']);
    exit;
  }

  // Update (emissions_kg_co2e is a generated column in DB)
  $stmt = $pdo->prepare("
    UPDATE user_activities
       SET quantity = :quantity
     WHERE id = :id AND user_id = :uid
     LIMIT 1
  ");
  $stmt->execute([
    ':quantity' => $quantity,
    ':id'       => $id,
    ':uid'      => $uid,
  ]);

  if ($stmt->rowCount() === 0) {
    // Not found or not owned by this user
    http_response_code(404);
    echo json_encode(['error' => 'Not found']);
    exit;
  }

  echo json_encode(['ok' => true, 'id' => $id, 'quantity' => $quantity]);

} catch (Throwable $e) {
  http_response_code(500);
  echo json_encode([
    'error' => 'Server error',
    // 'detail' => $e->getMessage(), // uncomment while debugging
  ]);
}