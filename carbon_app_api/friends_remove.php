<?php
require_once __DIR__ . '/config.php';

/**
 * ============================================================
 *  File: friends_remove.php
 *  Endpoint: DELETE /friends_remove.php
 *
 *  Description:
 *  Removes a friendship between the authenticated user and the
 *  specified friend. The friendships table stores normalised pairs
 *  (user_id_low, user_id_high), so the delete uses LEAST/GREATEST
 *  to target the correct row regardless of caller/order.
 *
 *  Author: Finlay Shaw
 * ============================================================
 */

$me   = current_user_id();        
$body = json_body();              
$friend = (int)($body['friend_id'] ?? 0); // Friend to remove

// Validate target: must be a positive integer and not the current user
if ($friend <= 0 || $friend === $me) fail(400, 'Invalid friend_id');

// Delete the friendship using normalised ordered pair to avoid direction issues
$stmt = $pdo->prepare('DELETE FROM friendships
                       WHERE user_id_low = LEAST(?,?)
                         AND user_id_high = GREATEST(?,?)');
$stmt->execute([$me,$friend,$me,$friend]);

// If no rows were affected, the users were not friends 
if ($stmt->rowCount() === 0) fail(404, 'Not friends');

// Success payload
ok(['removed'=>true]);
