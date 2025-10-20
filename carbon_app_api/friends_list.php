<?php
require_once __DIR__ . '/config.php';

/**
 * ============================================================
 *  File: friends_list.php
 *  Endpoint: GET /friends_list.php
 *
 *  Description:
 *  Returns the authenticated user’s current list of friends.
 *  Each row includes the friend’s id, name, email, and the date
 *  the friendship was established (via `v_user_friends` view).
 *
 *  Author: Finlay Shaw
 * ============================================================
 */

$me = current_user_id(); // current authenticated user ID

// Retrieve all friends from the v_user_friends view
$sql = '
  SELECT 
    u.id, 
    u.name, 
    u.email, 
    v.created_at
  FROM v_user_friends v
  JOIN users u ON u.id = v.friend_id
  WHERE v.user_id = ?
  ORDER BY u.name
';

$stmt = $pdo->prepare($sql);
$stmt->execute([$me]);

// Send the friends list as a JSON response
ok(['friends' => $stmt->fetchAll()]);
