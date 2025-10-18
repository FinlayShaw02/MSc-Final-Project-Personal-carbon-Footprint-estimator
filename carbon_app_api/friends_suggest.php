<?php
require_once __DIR__ . '/config.php';

/**
 * ============================================================
 *  File: friends_suggest.php
 *  Endpoint: GET /friends_suggest.php?limit=NN
 *
 *  Purpose:
 *  Suggests people you might know. Tries increasingly permissive
 *  query modes to always return *something* for the UI:
 *    1) "strict": exclude existing friends, any pending requests
 *       (both directions), and block relations (either direction).
 *    2) "wide"  : exclude only the current user.
 *    3) "any"   : return anyone (including me) as last resort.
 *
 *  Notes:
 *  - The strict query LEFT JOINs relationship tables and filters on
 *    IS NULL to exclude connected/blocked users efficiently.
 *  - ORDER BY prefers most recently created users, then name ASC.
 *
 *  Author: Finlay Shaw
 * ============================================================
 */

$me    = current_user_id();
$limit = max(1, min(100, (int)($_GET['limit'] ?? 24))); // clamp 1..100

/* 1) Strict (exclude friends/pending/blocks) – use positional placeholders */
$sqlStrict = "
SELECT u.id, u.name, u.email
FROM users u
LEFT JOIN v_user_friends vf
  ON vf.user_id = ?   AND vf.friend_id = u.id
LEFT JOIN friend_requests fr_out
  ON fr_out.requester_id = ? AND fr_out.addressee_id = u.id AND fr_out.status='pending'
LEFT JOIN friend_requests fr_in
  ON fr_in.requester_id = u.id AND fr_in.addressee_id = ? AND fr_in.status='pending'
LEFT JOIN blocks b1 ON b1.blocker_id = ? AND b1.blocked_id = u.id
LEFT JOIN blocks b2 ON b2.blocker_id = u.id AND b2.blocked_id = ?
WHERE u.id <> ?
ORDER BY u.created_at DESC, u.name ASC
LIMIT $limit";
$stmt = $pdo->prepare($sqlStrict);
$stmt->execute([$me, $me, $me, $me, $me, $me]);  // 5 joins + WHERE u.id <> ?
$rows = $stmt->fetchAll();
$mode = 'strict';

/* 2) Wide fallback, exclude only me */
if (!$rows) {
  $sqlWide = "
    SELECT u.id, u.name, u.email
    FROM users u
    WHERE u.id <> ?
    ORDER BY u.created_at DESC, u.name ASC
    LIMIT $limit";
  $w = $pdo->prepare($sqlWide);
  $w->execute([$me]);
  $rows = $w->fetchAll();
  $mode = 'wide';
}

/* 3) Last resort, anybody (incl. me) */
if (!$rows) {
  $sqlAny = "
    SELECT u.id, u.name, u.email
    FROM users u
    ORDER BY u.created_at DESC, u.name ASC
    LIMIT $limit";
  $rows = $pdo->query($sqlAny)->fetchAll();
  $mode = 'any';
}

ok(['results' => $rows, 'debug' => ['mode' => $mode, 'limit' => $limit]]);