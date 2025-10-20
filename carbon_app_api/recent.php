<?php
/**
 * ============================================================
 *  File: recent.php
 *  Endpoint: /recent.php
 *
 *  Purpose:
 *    Return the most recent user activities (optionally filtered
 *    by category) for the authenticated user. Designed for
 *    dashboard “Recent activity” widgets and similar UIs.
 *
 *  Author: Finlay Shaw
 * ============================================================
 */

require __DIR__ . '/config.php';

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: http://localhost:5173');
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Headers: Content-Type, Authorisation');
header('Access-Control-Allow-Methods: GET, OPTIONS');

try {
  // ---- Preflight & method guard ----
  if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);  
    exit;
  }
  if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
  }

  // Must be logged in
  $uid = current_user_id();

  // ---- Query params ----
  $limitRaw  = $_GET['limit']    ?? 5;     // how many to return
  $catRaw    = $_GET['category'] ?? null;  // optional filter

  // Sanitise and clamp limit to a sensible range
  $limit = (int)$limitRaw;
  if ($limit <= 0) $limit = 5;
  if ($limit > 50) $limit = 50;            // sane cap

  // Normalise category: null means "no filter"
  $category = null;
  if ($catRaw !== null) {
    $tmp = trim((string)$catRaw);
    if ($tmp !== '' && strcasecmp($tmp, 'all') !== 0) {
      $category = $tmp;
    }
  }

  // ---- Query ----
  // user_activities with columns:
  $sql = "
    SELECT
      id,
      category,
      activity_id,
      activity_name,
      ROUND(emissions_kg_co2e, 3) AS emissions_kg_co2e,
      occurred_at
    FROM user_activities
    WHERE user_id = :uid
  ";
  $params = [':uid' => $uid];

  // Optional category filter
  if ($category !== null) {
    $sql .= " AND category = :category";
    $params[':category'] = $category;
  }

  $sql .= " ORDER BY occurred_at DESC, id DESC
            LIMIT :lim";

  /** @var PDO $pdo */
  $stmt = $pdo->prepare($sql);

  // Bind the non string params properly
  foreach ($params as $k => $v) {
    $stmt->bindValue($k, $v, is_int($v) ? PDO::PARAM_INT : PDO::PARAM_STR);
  }
  $stmt->bindValue(':lim', $limit, PDO::PARAM_INT);

  $stmt->execute();
  $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

  // ---- Response ----
  echo json_encode($rows);

} catch (Throwable $e) {
  http_response_code(500);
  echo json_encode(['error' => 'Server error']);
}
