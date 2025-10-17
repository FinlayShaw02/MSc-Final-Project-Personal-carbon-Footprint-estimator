<?php
// htdocs/carbon_app_api/daily.php

/**
 * ============================================================
 *  File: daily.php
 *  Endpoint: GET /daily.php
 *
 *  Description:
 *  Returns per-day emission totals for the authenticated user
 *  within a given date range, optionally filtered by category.
 *
 *  Notes:
 *    - Date handling uses strtotime(); invalid inputs fall back
 *      to broad defaults to avoid SQL errors.
 *    - Category filter is optional; when present it is an exact match.
 *
 *  Author: Finlay Shaw
 * ============================================================
 */

require __DIR__ . '/config.php';

try {
  $uid = current_user_id(); // 401 + exit if not logged in

  // ---- Helpers ------------------------------------------------
  // Convert arbitrary input to 'Y-m-d H:i:s' or fall back safely.
  $toSqlDate = function ($v, $fallback) {
    if (!$v) return $fallback;
    $ts = strtotime($v);
    if ($ts === false) return $fallback;
    return date('Y-m-d H:i:s', $ts);
  };

  // ---- Query params -------------------------------------------
  // Raw inputs from the query string (may be absent/empty).
  $fromRaw   = $_GET['from']     ?? null;
  $toRaw     = $_GET['to']       ?? null;
  $category  = $_GET['category'] ?? '';

  // Normalise to inclusive start / exclusive end with safe defaults.
  $from = $toSqlDate($fromRaw, '1970-01-01 00:00:00');
  $to   = $toSqlDate($toRaw,   '2100-01-01 00:00:00');

  // ---- SQL -----------------------------------------------------
  // Aggregate emissions per calendar day for this user and window.
  $sql = "
    SELECT
      DATE(occurred_at) AS day,
      ROUND(SUM(emissions_kg_co2e), 3) AS total_kg,
      COUNT(*) AS entries
    FROM user_activities
    WHERE user_id = :uid
      AND occurred_at >= :from
      AND occurred_at <  :to
  ";

  // Optional category filter (exact match).
  if ($category !== '') {
    $sql .= " AND category = :category";
  }

  // Group by day and return oldest->newest for charting.
  $sql .= "
    GROUP BY day
    ORDER BY day
  ";

  // ---- Execute -------------------------------------------------
  $stmt = $pdo->prepare($sql);
  $stmt->bindValue(':uid',  $uid,  PDO::PARAM_INT);
  $stmt->bindValue(':from', $from);
  $stmt->bindValue(':to',   $to);
  if ($category !== '') {
    $stmt->bindValue(':category', $category);
  }
  $stmt->execute();

  // Return rows as JSON (uses default FETCH_ASSOC from config.php).
  $rows = $stmt->fetchAll();
  echo json_encode($rows);

} catch (Throwable $e) {
  // Generic 500 for clients; keep details out of production responses.
  http_response_code(500);
  echo json_encode([
    "error" => "Server error",
    // "detail" => $e->getMessage(), // uncomment while debugging
  ]);
}
