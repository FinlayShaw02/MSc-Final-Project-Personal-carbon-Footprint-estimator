<?php
/**
 * ============================================================
 *  File: summary.php
 *  Endpoint: GET /summary.php
 *
 *  Purpose:
 *    Return a totals summary and a breakdown of a user’s emissions for
 *    a given date range. The breakdown can be grouped by category or
 *    by activity. Optionally filter the data to a single category.
 *
 *  Author: Finlay Shaw
 * ============================================================
 */

// htdocs/carbon_app_api/summary.php
require __DIR__ . '/config.php';

try {
  /* ---- Method guard & auth ---- */
  require_method('GET');          // 405 + JSON if not GET
  $uid = current_user_id();       // 401 + JSON if not logged in

  /* ---- Helpers ---- */
  $toSqlDate = function ($v, $fallback) {
    if ($v === null || $v === '') return $fallback;
    $ts = strtotime($v);
    if ($ts === false) return $fallback;
    return date('Y-m-d H:i:s', $ts);
  };

  /* ---- Query params ---- */
  $fromRaw  = $_GET['from']     ?? null;
  $toRaw    = $_GET['to']       ?? null;
  $catRaw   = $_GET['category'] ?? null; // "all" | "" | null => no filter
  $groupRaw = $_GET['group']    ?? null; // optional: "category" | "activity"

  // Normalise category filter
  $category = null;
  if ($catRaw !== null) {
    $tmp = trim((string)$catRaw);
    if ($tmp !== '' && strcasecmp($tmp, 'all') !== 0) {
      $category = $tmp; // specific category selected
    }
  }

  // Grouping: specific category => activity; otherwise => category (unless overridden)
  $group = $groupRaw ? strtolower(trim((string)$groupRaw)) : null;
  if ($group !== 'activity' && $group !== 'category') {
    $group = ($category !== null) ? 'activity' : 'category';
  }

  // Dates: inclusive start / exclusive end (matches daily.php)
  $from = $toSqlDate($fromRaw, '1970-01-01 00:00:00');
  $to   = $toSqlDate($toRaw,   '2100-01-01 00:00:00');
  if (strtotime($from) > strtotime($to)) { $tmp = $from; $from = $to; $to = $tmp; }

  /* ---- Grand total (respects category filter) ---- */
  $totSql = "
    SELECT ROUND(COALESCE(SUM(emissions_kg_co2e), 0), 3) AS total_kg
    FROM user_activities
    WHERE user_id = :uid
      AND occurred_at >= :from
      AND occurred_at <  :to
  ";
  $totParams = [ ':uid' => $uid, ':from' => $from, ':to' => $to ];
  if ($category !== null) {
    $totSql .= " AND category = :category";
    $totParams[':category'] = $category;
  }

  /** @var PDO $pdo */
  $stmt = $pdo->prepare($totSql);
  $stmt->execute($totParams);
  $totalKg = (float)($stmt->fetchColumn() ?? 0.0);

  /* ---- Breakdown (normalised to {label, value}) ---- */
  if ($group === 'activity') {
    // Per-activity (optionally within selected category)
    $sql = "
      SELECT activity_id,
             activity_name AS label,
             ROUND(SUM(emissions_kg_co2e), 3) AS value
      FROM user_activities
      WHERE user_id = :uid
        AND occurred_at >= :from
        AND occurred_at <  :to
    ";
    $params = [ ':uid' => $uid, ':from' => $from, ':to' => $to ];
    if ($category !== null) {
      $sql .= " AND category = :category";
      $params[':category'] = $category;
    }
    $sql .= " GROUP BY activity_id, activity_name
              ORDER BY value DESC";
  } else {
    // Per-category
    $sql = "
      SELECT category AS label,
             ROUND(SUM(emissions_kg_co2e), 3) AS value
      FROM user_activities
      WHERE user_id = :uid
        AND occurred_at >= :from
        AND occurred_at <  :to
    ";
    $params = [ ':uid' => $uid, ':from' => $from, ':to' => $to ];
    if ($category !== null) {
      // If group=category while filtering a category, this returns a single-row total for that category.
      $sql .= " AND category = :category";
      $params[':category'] = $category;
    }
    $sql .= " GROUP BY category
              ORDER BY value DESC";
  }

  $brkStmt = $pdo->prepare($sql);
  $brkStmt->execute($params);
  $items = $brkStmt->fetchAll(PDO::FETCH_ASSOC);

  /* ---- Response ---- */
  ok([
    'totalKg' => $totalKg,  // number
    'group'   => $group,    // "category" | "activity"
    'items'   => $items,    // [{ label, value, ...(maybe activity_id) }]
  ]);

} catch (Throwable $e) {
  fail(500, 'Server error');
}
