<?php
require_once __DIR__ . '/config.php';

/**
 * ============================================================
 *  File: friends_requests.php
 *  Endpoint: GET /friends_requests.php?type=incoming/outgoing
 *
 *  Description:
 *  Lists **pending** friend requests for the authenticated user.
 *  Supports two modes via `type`:
 *    - `incoming` : requests sent *to me* that I can accept/decline
 *    - `outgoing` : requests I sent to others that I can cancel
 *
 *  Author: Finlay Shaw
 * ============================================================
 */

$me   = current_user_id();                 // Authenticated user ID (401 if not logged in)
$type = $_GET['type'] ?? 'incoming';       // Which list to show

// STATUS normaliser: treat legacy '' as 'pending' so old rows still behave
$pending = "COALESCE(NULLIF(fr.status,''),'pending') = 'pending'";

// Paranoia guard: if a friendship already exists for this pair, we do NOT show the request.
// This prevents stale pending requests from appearing after the users are friends.
$noFriendship = "NOT EXISTS (
  SELECT 1
  FROM friendships f
  WHERE f.user_id_low  = LEAST(fr.requester_id, fr.addressee_id)
    AND f.user_id_high = GREATEST(fr.requester_id, fr.addressee_id)
)";

if ($type === 'incoming') {
  // Incoming = requests to me. The other user is the requester.
  $sql = "SELECT fr.id,
                 fr.requester_id AS other_user_id,
                 u.name, u.email,
                 fr.created_at
          FROM friend_requests fr
          JOIN users u ON u.id = fr.requester_id
          WHERE fr.addressee_id = ? AND $pending AND $noFriendship
          ORDER BY fr.created_at DESC";
  $params = [$me];

} elseif ($type === 'outgoing') {
  // Outgoing = requests from me. The other user is the addressee.
  $sql = "SELECT fr.id,
                 fr.addressee_id AS other_user_id,
                 u.name, u.email,
                 fr.created_at
          FROM friend_requests fr
          JOIN users u ON u.id = fr.addressee_id
          WHERE fr.requester_id = ? AND $pending AND $noFriendship
          ORDER BY fr.created_at DESC";
  $params = [$me];

} else {
  // Any other type is rejected
  fail(400, 'Bad type');
}

// Execute the prepared statement and return results
$stmt = $pdo->prepare($sql);
$stmt->execute($params);
ok(['requests' => $stmt->fetchAll()]);
