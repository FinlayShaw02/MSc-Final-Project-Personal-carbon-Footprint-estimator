<?php
/**
 * ============================================================
 *  File: log_activity.php
 *  Endpoint: POST /log_activity.php
 *
 *  Purpose:
 *    Create a single activity log entry for the authenticated user.
 *    The database computes `emissions_kg_co2e` from `quantity` × `emission_factor`
 *    so the request only supplies inputs.
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

  if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method Not Allowed']);
    exit;
  }

  $uid = current_user_id(); // session user (401s if not logged in)

  // Read JSON body
  $raw = file_get_contents('php://input');
  $data = json_decode($raw, true);
  if (!is_array($data)) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid JSON']);
    exit;
  }

  // Required fields (do NOT include user_id)
  $required = [
    'activity_id', 'activity_name',
    'category', 'type', 'unit',
    'emission_factor', 'quantity', 'occurred_at'
  ];
  foreach ($required as $f) {
    if (!array_key_exists($f, $data)) {
      http_response_code(400);
      echo json_encode(['error' => "Missing field: $f"]);
      exit;
    }
  }

  // Coerce / validate
  $activity_id     = trim((string)$data['activity_id']);
  $activity_name   = trim((string)$data['activity_name']);
  $category        = trim((string)$data['category']);
  $type            = trim((string)$data['type']);
  $unit            = trim((string)$data['unit']);
  $emission_factor = filter_var($data['emission_factor'], FILTER_VALIDATE_FLOAT);
  $quantity        = filter_var($data['quantity'], FILTER_VALIDATE_FLOAT);
  $occurred_raw    = trim((string)$data['occurred_at']); // accepts many formats
  $meta            = array_key_exists('meta', $data) ? $data['meta'] : null;

  if ($activity_id === '' || $activity_name === '' || $category === '' || $type === '' || $unit === '') {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid string field(s)']);
    exit;
  }
  if ($emission_factor === false || $emission_factor < 0) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid emission_factor']);
    exit;
  }
  if ($quantity === false || $quantity < 0) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid quantity']);
    exit;
  }

  // Normalise occurred_at → 'Y-m-d H:i:s'
  $ts = strtotime($occurred_raw);
  if ($ts === false) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid occurred_at']);
    exit;
  }
  $occurred_at = date('Y-m-d H:i:s', $ts);

  // Encode meta as JSON text or set NULL
  $metaJson = null;
  if ($meta !== null) {
    if (is_string($meta)) {
      // trust string if client already stringified
      $metaJson = $meta;
    } else {
      $metaJson = json_encode($meta, JSON_UNESCAPED_UNICODE);
      if ($metaJson === false) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid meta']);
        exit;
      }
    }
  }

  // Insert row (emissions_kg_co2e is generated in DB)
  $sql = "
    INSERT INTO user_activities
      (user_id, activity_id, activity_name, category, type, unit,
       emission_factor, quantity, occurred_at, meta)
    VALUES
      (:uid, :activity_id, :activity_name, :category, :type, :unit,
       :emission_factor, :quantity, :occurred_at, :meta)
  ";

  $stmt = $pdo->prepare($sql);
  $stmt->bindValue(':uid',             $uid,              PDO::PARAM_INT);
  $stmt->bindValue(':activity_id',     $activity_id);
  $stmt->bindValue(':activity_name',   $activity_name);
  $stmt->bindValue(':category',        $category);
  $stmt->bindValue(':type',            $type);
  $stmt->bindValue(':unit',            $unit);
  $stmt->bindValue(':emission_factor', $emission_factor);
  $stmt->bindValue(':quantity',        $quantity);
  $stmt->bindValue(':occurred_at',     $occurred_at);
  // meta can be NULL
  if ($metaJson === null) {
    $stmt->bindValue(':meta', null, PDO::PARAM_NULL);
  } else {
    $stmt->bindValue(':meta', $metaJson);
  }

  $stmt->execute();
  $id = (int)$pdo->lastInsertId();

  echo json_encode(['success' => true, 'id' => $id]);

} catch (Throwable $e) {
  http_response_code(500);
  echo json_encode([
    'error' => 'Server error',
    // 'detail' => $e->getMessage(), // uncomment while debugging
  ]);
}
