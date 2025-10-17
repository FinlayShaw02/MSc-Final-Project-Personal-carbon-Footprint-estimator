<?php
require_once __DIR__ . '/config.php';

/**
 * ============================================================
 *  File: friends_search.php
 *  Endpoint: GET /friends_search.php?q=<query>
 *
 *  Description:
 *  Lightweight user search for the “Discover” tab. Returns users who:
 *    - match the query (name tokens ANDed; email ORed),
 *    - aren’t already friends,
 *    - don’t have a pending request with me (either direction),
 *    - aren’t blocked in either direction.
 *
 *  Notes:
 *  - Uses positional placeholders throughout.
 *  - LEFT JOIN + IS NULL filters exclude relationships.
 *  - Requires at least 2 characters to search.
 *
 *  Author: Finlay Shaw
 * ============================================================
 */

require_method('GET');
$me    = current_user_id();                // Authenticated user ID
$q     = trim((string)($_GET['q'] ?? '')); // Raw search input
$limit = 20;                               // Cap result set size

// Require at least 2 chars to search
if (mb_strlen($q) < 2) {
  ok(['results' => []]);
  exit;
}

// Tokenise query so "fin shaw" matches both words in any order/position.
$tokens     = preg_split('/\s+/', $q, -1, PREG_SPLIT_NO_EMPTY);
$nameConds  = [];
$nameParams = [];
foreach ($tokens as $t) {
  $nameConds[]  = "u.name LIKE ?";
  $nameParams[] = '%' . $t . '%';
}

// Build SQL with positional placeholders only.
// Exclusions via LEFT JOIN ... IS NULL:
//   - v_user_friends 
//   - friend_requests 
//   - blocks (block by me or them)
$sql = "
SELECT u.id, u.name, u.email
FROM users u
LEFT JOIN v_user_friends vf
  ON vf.user_id = ? AND vf.friend_id = u.id
LEFT JOIN friend_requests fr_out
  ON fr_out.requester_id = ? AND fr_out.addressee_id = u.id AND fr_out.status = 'pending'
LEFT JOIN friend_requests fr_in
  ON fr_in.requester_id = u.id AND fr_in.addressee_id = ? AND fr_in.status = 'pending'
LEFT JOIN blocks b1
  ON b1.blocker_id = ? AND b1.blocked_id = u.id
LEFT JOIN blocks b2
  ON b2.blocker_id = u.id AND b2.blocked_id = ?
WHERE u.id <> ?
  AND ( " . implode(' AND ', $nameConds) . " OR u.email LIKE ? )
  AND vf.friend_id IS NULL
  AND fr_out.id IS NULL
  AND fr_in.id IS NULL
  AND b1.blocked_id IS NULL
  AND b2.blocker_id IS NULL
ORDER BY u.name ASC
LIMIT $limit
";

// Positional parameters in exact placeholder order:
$params = [
  $me, $me, $me, $me, $me,  // LEFT JOIN predicates
  $me,                      // u.id <> ?
  ...$nameParams,           // tokenised name LIKEs
  '%' . $q . '%',           // OR email LIKE %q%
];

$stmt = $pdo->prepare($sql);
$stmt->execute($params);
$rows = $stmt->fetchAll();

ok(['results' => $rows]);
