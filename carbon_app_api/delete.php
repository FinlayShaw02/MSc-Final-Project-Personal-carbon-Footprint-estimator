<?php
// htdocs/carbon_app_api/delete.php

/**
 * ============================================================
 *  File: delete.php
 *  Endpoint: DELETE /delete.php
 *
 *  Description:
 *  Deletes a single activity row owned by the authenticated user.
 *  Accepts the activity id via either a query parameter (?id=123)
 *  or a JSON request body: { "id": 123 }.
 *
 *  Notes:
 *  - Uses LIMIT 1 for safety/perf; guarded by user_id to prevent cross user deletes.
 *  - Keeps error messages generic for production; uncomment detail while debugging.
 *
 *  Author: Finlay Shaw
 * ============================================================
 */

require __DIR__ . '/config.php';

try {
  // Enforce HTTP method: this endpoint only supports DELETE.
  if ($_SERVER['REQUEST_METHOD'] !== 'DELETE') {
    http_response_code(405);
    echo json_encode(["error" => "Use DELETE"]);
    exit;
  }

  // Resolve current user (401 + exit if not logged in).
  $uid = current_user_id(); // 401 + exit if not logged in

  // ----------------------------------------------------------------
  // Accept the target activity id from either:
  //  (1) Query string: /delete.php?id=123
  //  (2) JSON body:    { "id": 123 }
  // ----------------------------------------------------------------
  $id = 0;

  // (1) Try query string first
  if (isset($_GET['id'])) {
    $id = intval($_GET['id']);
  }

  // (2) Fallback to JSON body if id not yet resolved
  if ($id <= 0) {
    $raw = file_get_contents('php://input');
    if ($raw) {
      $data = json_decode($raw, true);
      if (json_last_error() === JSON_ERROR_NONE && isset($data['id'])) {
        $id = intval($data['id']);
      }
    }
  }

  // Validate id before touching the DB
  if ($id <= 0) {
    http_response_code(400);
    echo json_encode(["error" => "Missing or invalid id"]);
    exit;
  }

  // ----------------------------------------------------------------
  // Perform the delete only if the row belongs to the current user.
  // LIMIT 1 prevents accidental multi row changes.
  // ----------------------------------------------------------------
  $stmt = $pdo->prepare(
    "DELETE FROM user_activities
     WHERE id = :id AND user_id = :uid
     LIMIT 1"
  );
  $stmt->execute([":id" => $id, ":uid" => $uid]);

  // If no row was affected, either it didnt exist or wasnt owned by the user.
  if ($stmt->rowCount() === 0) {
    http_response_code(404);
    echo json_encode(["error" => "Not found"]);
    exit;
  }
  
  echo json_encode(["ok" => true, "deleted" => 1, "id" => $id]);

} catch (Throwable $e) {
  // Generic server error; keep details out of production responses.
  http_response_code(500);
  echo json_encode([
    "error" => "Server error",
    // "detail" => $e->getMessage(), // uncomment while debugging
  ]);
}
