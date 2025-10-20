<?php
require_once __DIR__ . '/config.php';

/**
 * ============================================================
 *  File: friend_request_send.php
 *  Endpoint: POST /friend_request_send.php
 *
 *  Description:
 *  Creates a new friend request from the authenticated user to the
 *  specified addressee. Backend constraints/DB triggers ensure that:
 *    - Duplicate pending requests are prevented.
 *    - Users already friends cannot create a new request.
 *    - Block relationships can prevent requests in either direction.
 *
 *  Notes:
 *  - Uses helper functions from config.php:
 *      • current_user_id() - session auth
 *      • json_body()       - safe JSON decode
 *      • ok()/fail()       - consistent JSON responses
 *
 *  Author: Finlay Shaw
 * ============================================================
 */

$me   = current_user_id();              // current authenticated user
$body = json_body();                    // safely parse JSON body -> assoc array
$to   = (int)($body['addressee_id'] ?? 0); // target user id
if ($to <= 0 || $to === $me) fail(400, 'Invalid addressee_id'); // basic validation

try {
  // Insert a new pending friend request. DB layer should enforce:
  // - No duplicates for the same requester/addressee pair while pending
  // - Domain rules via triggers/constraints (e.g., cant friend yourself)
  $stmt = $pdo->prepare('INSERT INTO friend_requests (requester_id, addressee_id) VALUES (?, ?)');
  $stmt->execute([$me, $to]);

  // Fetch the newly created requests status
  $id  = (int)$pdo->lastInsertId();
  $row = $pdo->query('SELECT status FROM friend_requests WHERE id='.$id)->fetch();
  ok(['status' => $row['status'] ?? 'pending']);

} catch (PDOException $e) {
  // Map common conflict/error cases to friendly API errors
  $msg = $e->getMessage();

  // MySQL integrity constraint
  if ($e->getCode() === '23000') {
    // See if an opposite direction or same pair pending request already exists
    $q = $pdo->prepare('SELECT id, requester_id, status
                        FROM friend_requests
                        WHERE pending_pair_low = LEAST(?,?)
                          AND pending_pair_high= GREATEST(?,?)');
    $q->execute([$me,$to,$me,$to]);
    if ($ex = $q->fetch()) {
      if ($ex['status'] === 'pending') {
        // Tell client whether this is outgoing or incoming 
        $dir = ((int)$ex['requester_id'] === $me) ? 'outgoing' : 'incoming';
        fail(409, 'Request already pending', ['direction'=>$dir, 'request_id'=>(int)$ex['id']]);
      }
    }
  }

  // Optional trigger/constraint messages normalised to API responses
  if (str_contains($msg, 'Already friends'))         fail(409, 'Already friends');            // friendship exists
  if (str_contains($msg, 'Cannot send request'))     fail(409, 'Blocked');                    // blocked relationship
  if (str_contains($msg, 'Cannot friend yourself'))  fail(400, 'Cannot friend yourself');     // self friendship

  // Fallback: generic creation failure (include details in dev logs/UI if desired)
  fail(400, 'Could not create request', ['details'=>$msg]);
}


