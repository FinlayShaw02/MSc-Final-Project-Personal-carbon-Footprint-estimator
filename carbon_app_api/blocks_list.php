<?php
/**
 * ============================================================
 *  File: blocks_list.php
 *  Endpoint: GET /blocks.php
 *
 *  Purpose:
 *  Returns two lists related to the current user’s block relationships:
 *    1. Users that the current user has blocked (outgoing blocks)
 *    2. Users who have blocked the current user (incoming blocks)
 *
 *  Notes:
 *  - Used to display block management lists (blocked users + awareness list).
 *  - Data is read only; unblocking handled by separate endpoint.
 *
 *  Author: Finlay Shaw
 * ============================================================
 */

require_once __DIR__ . '/config.php';

// Ensure user is authenticated, helper will exit if not logged in
$me = current_user_id();

/* ------------------------------------------------------------
 * 1. Get list of users I have blocked 
 * ------------------------------------------------------------ */
$stmt = $pdo->prepare("
  SELECT u.id, u.name, u.email, b.created_at
  FROM blocks b
  JOIN users u ON u.id = b.blocked_id
  WHERE b.blocker_id = ?
  ORDER BY b.created_at DESC
");
$stmt->execute([$me]);
$blocked = $stmt->fetchAll();

/* ------------------------------------------------------------
 * 2. Get list of users who have blocked me
 * ------------------------------------------------------------ */
$stmt = $pdo->prepare("
  SELECT u.id, u.name, u.email, b.created_at
  FROM blocks b
  JOIN users u ON u.id = b.blocker_id
  WHERE b.blocked_id = ?
  ORDER BY b.created_at DESC
");
$stmt->execute([$me]);
$blocked_me = $stmt->fetchAll();

/* ------------------------------------------------------------
 * 3. Return combined result as JSON
 * ------------------------------------------------------------ */
echo json_encode([
  'ok'         => true,
  'blocked'    => $blocked,     // people I have blocked
  'blocked_me' => $blocked_me,  // people who have blocked me
]);
