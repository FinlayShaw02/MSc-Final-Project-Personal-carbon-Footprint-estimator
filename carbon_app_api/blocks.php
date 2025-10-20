<?php
/**
 * ============================================================
 *  File: blocks.php
 *  Endpoint: POST /blocks.php
 *
 *  Purpose:
 *    Create or remove a block between the current user and another user.
 *    Side-effects on "block":
 *      - Ensures a block row exists 
 *      - Removes any existing friendship (friendships table stores pairs as low/high)
 *      - Deletes any pending friend requests between the two users
 *
 *  Notes:
 *    - Blocking is one way
 *    - Friendship rows are normalised
 *
 *  Author: Finlay Shaw
 * ============================================================
 */

require_once __DIR__ . '/config.php';

$me = current_user_id();

// Enforce POST only
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
  http_response_code(405);
  echo json_encode(['error' => 'Method not allowed']);
  exit;
}

$body    = json_decode(file_get_contents('php://input'), true) ?: [];
$otherId = (int)($body['user_id'] ?? 0);
$action  = strtolower((string)($body['action'] ?? ''));

// Basic validations
if ($otherId <= 0) { http_response_code(422); echo json_encode(['error'=>'user_id required']); exit; }
if ($otherId === $me) { http_response_code(400); echo json_encode(['error'=>'Cannot block yourself']); exit; }

if ($action === 'block') {
  // 1) Create block row; INSERT IGNORE makes the operation idempotent
  $pdo->prepare("INSERT IGNORE INTO blocks (blocker_id, blocked_id) VALUES (?, ?)")->execute([$me, $otherId]);

  // 2) Remove friendship if present
  $low  = min($me, $otherId);
  $high = max($me, $otherId);
  $pdo->prepare("DELETE FROM friendships WHERE user_id_low=? AND user_id_high=?")->execute([$low, $high]);

  // 3) Remove any pending friend requests in either direction
  $pdo->prepare("
    DELETE FROM friend_requests
    WHERE ((requester_id=? AND addressee_id=?) OR (requester_id=? AND addressee_id=?))
      AND status='pending'
  ")->execute([$me, $otherId, $otherId, $me]);

  // 4) Success payload
  echo json_encode(['ok'=>true, 'blocked'=>true]);
  exit;
}

if ($action === 'unblock') {
  // Remove the block row if it exists
  $pdo->prepare("DELETE FROM blocks WHERE blocker_id=? AND blocked_id=?")->execute([$me, $otherId]);
  echo json_encode(['ok'=>true, 'blocked'=>false]);
  exit;
}

// Invalid action value
http_response_code(422);
echo json_encode(['error'=>'Invalid action']);
