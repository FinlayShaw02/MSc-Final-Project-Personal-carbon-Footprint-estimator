<?php
require_once __DIR__ . '/config.php';

/**
 * ============================================================
 *  File: friend_request_act.php
 *  Endpoint: POST /friend_request_act.php
 *
 *  Description:
 *  Handles actions on friend requests between two users.
 *  Supported actions:
 *    - "accept"  : Addressee accepts a pending request from other_user_id
 *    - "decline" : Addressee declines a pending request from other_user_id
 *    - "cancel"  : Requester cancels their own pending request to other_user_id
 *
 *  Author: Finlay Shaw
 * ============================================================
 */

try {
  $pdo->exec("SET SESSION sql_mode = CONCAT_WS(',', @@sql_mode, 'STRICT_TRANS_TABLES','NO_ENGINE_SUBSTITUTION')");
} catch (Throwable $e) { /* ignore */ }

$me    = current_user_id();          
$body  = json_body();                 
$other = (int)($body['other_user_id'] ?? 0);
$action = strtolower(trim((string)($body['action'] ?? 'accept')));

// Basic input validation: other must be a valid different user; action must be known
if ($other <= 0 || $other === $me) fail(400, 'Bad other_user_id');
if (!in_array($action, ['accept','decline','cancel'], true)) fail(400, 'Unknown action');

try {
  $pdo->beginTransaction();

  if ($action === 'accept') {
    // Only the addressee can accept a still pending request from $other
    $upd = $pdo->prepare(
      'UPDATE friend_requests
         SET status = "accepted", responded_at = NOW()
       WHERE requester_id = ? AND addressee_id = ? AND status = "pending"'
    );
    $upd->execute([$other, $me]);
    if ($upd->rowCount() !== 1) {
      $pdo->rollBack();             // ensure no partial state
      fail(404, 'Pending request not found');
    }

    // Create friendship (ordered pair; IGNORE if it already exists)
    $ins = $pdo->prepare(
      'INSERT IGNORE INTO friendships (user_id_low, user_id_high, created_at)
       VALUES (LEAST(?, ?), GREATEST(?, ?), NOW())'
    );
    $ins->execute([$me, $other, $me, $other]);

    // Remove the request now that it became a friendship
    $del = $pdo->prepare(
      'DELETE FROM friend_requests
        WHERE requester_id = ? AND addressee_id = ? AND status = "accepted"'
    );
    $del->execute([$other, $me]);

    $pdo->commit();
    ok(['status' => 'accepted']);
    exit;
  }

  if ($action === 'decline') {
    // Only the addressee can decline a still pending request from $other
    $upd = $pdo->prepare(
      'UPDATE friend_requests
         SET status = "declined", responded_at = NOW()
       WHERE requester_id = ? AND addressee_id = ? AND status = "pending"'
    );
    $upd->execute([$other, $me]);
    if ($upd->rowCount() !== 1) {
      $pdo->rollBack();             // nothing changed -> treat as not found
      fail(404, 'Pending request not found');
    }

    $pdo->commit();
    ok(['status' => 'declined']);
    exit;
  }

  // cancel: only the requester can cancel an outgoing pending request to $other
  $upd = $pdo->prepare(
    'UPDATE friend_requests
       SET status = "canceled", responded_at = NOW()
     WHERE requester_id = ? AND addressee_id = ? AND status = "pending"'
  );
  $upd->execute([$me, $other]);
  if ($upd->rowCount() !== 1) {
    $pdo->rollBack();
    fail(404, 'Pending outgoing request not found');
  }

  $pdo->commit();
  ok(['status' => 'canceled']);

} catch (Throwable $e) {
  // Safety net: revert any partial changes and return a concise error
  if ($pdo->inTransaction()) $pdo->rollBack();
  fail(500, 'Failed to update friend request', ['error' => $e->getMessage()]);
}
