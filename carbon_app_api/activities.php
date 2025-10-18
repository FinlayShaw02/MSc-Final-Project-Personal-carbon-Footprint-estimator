<?php
/**
 * ============================================================
 *  File: htdocs/carbon_app_api/activities.php
 *  Endpoint: GET /activities.php
 *
 *  Purpose:
 *  Returns a paginated list of the authenticated user's activity
 *  records within an (inclusive start, exclusive end) datetime range,
 *  with optional filtering by category and fuzzy search across
 *  activity_name, category and type.
 *
 *  Author: Finlay Shaw
 * ============================================================
 */

declare(strict_types=1);

require __DIR__ . '/config.php';
header('Content-Type: application/json; charset=utf-8');

// Ensure PDO throws exceptions so we can catch and format errors consistently
if (isset($pdo) && $pdo instanceof PDO) {
  $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
}

try {
  // Resolve the current user (401 + exit inside helper on failure)
  $uid = current_user_id(); // 401 + exit if not logged in

  /* ---------- Helpers ---------- */
  // Normalise date-ish inputs into 'Y-m-d H:i:s' or fall back to a safe default
  $toSqlDate = function ($v, string $fallback): string {
    if ($v === null || $v === '') return $fallback;
    $ts = strtotime((string)$v);
    if ($ts === false) return $fallback;
    return date('Y-m-d H:i:s', $ts);
  };

  /* ---------- Query params ---------- */
  // Raw inputs from query string (all optional)
  $fromRaw   = $_GET['from']     ?? null;
  $toRaw     = $_GET['to']       ?? null;
  $category  = isset($_GET['category']) ? (string)$_GET['category'] : '';
  $qRaw      = isset($_GET['q']) ? trim((string)$_GET['q']) : '';
  $limit     = (int)($_GET['limit']  ?? 50);
  $offset    = (int)($_GET['offset'] ?? 0);

  // Date bounds: inclusive start, exclusive end (common for time buckets)
  $from = $toSqlDate($fromRaw, '1970-01-01 00:00:00');
  $to   = $toSqlDate($toRaw,   '2100-01-01 00:00:00');

  // Pagination safety clamps (later interpolated into SQL LIMIT/OFFSET)
  if ($limit < 1)   $limit = 1;
  if ($limit > 200) $limit = 200;
  if ($offset < 0)  $offset = 0;

  // ---- Search term preparation ----
  // Escape SQL LIKE wildcards using '!' as ESCAPE char:
  //   '!' -> '!!', '%' -> '!%', '_' -> '!_'
  $q = $qRaw !== '' ? str_replace(['!', '%', '_'], ['!!', '!%', '!_'], $qRaw) : '';
  // Ignore extremely short search terms (noise)
  if ($q !== '' && strlen($q) < 2) $q = '';

  /* ---------- Build SQL ---------- */
  // Base selection constrained to the current user and date window
  $sql = "
    SELECT
      id,
      activity_name,
      category,
      `type`,
      unit,
      quantity,
      emission_factor,
      emissions_kg_co2e,
      occurred_at,
      created_at,
      updated_at,
      meta
    FROM user_activities
    WHERE user_id = :uid
      AND occurred_at >= :from
      AND occurred_at <  :to
  ";

  // Optional exact category filter (bound safely)
  if ($category !== '') {
    $sql .= " AND category = :category";
  }
  // Optional fuzzy search across three columns with ESCAPE '!'
  if ($q !== '') {
    // Using ESCAPE '!' ensures our manual escapes are honored regardless of sql_mode
    $sql .= " AND (
      `activity_name` LIKE :q1 ESCAPE '!'
      OR `category`   LIKE :q2 ESCAPE '!'
      OR `type`       LIKE :q3 ESCAPE '!'
    )";
  }

  // Deterministic ordering (newest first), then bounded pagination
  // Note: LIMIT/OFFSET are safe after clamping above
  $sql .= " ORDER BY occurred_at DESC, id DESC LIMIT $offset, $limit";

  /* ---------- Execute ---------- */
  $stmt = $pdo->prepare($sql);
  // Required bindings
  $stmt->bindValue(':uid',  $uid, PDO::PARAM_INT);
  $stmt->bindValue(':from', $from);
  $stmt->bindValue(':to',   $to);

  // Conditional bindings for optional filters
  if ($category !== '') {
    $stmt->bindValue(':category', $category);
  }
  if ($q !== '') {
    $like = "%{$q}%";
    $stmt->bindValue(':q1', $like);
    $stmt->bindValue(':q2', $like);
    $stmt->bindValue(':q3', $like);
  }

  // Run and collect results
  $stmt->execute();
  $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

  // Emit JSON (UTF-8 kept as-is)
  echo json_encode($rows, JSON_UNESCAPED_UNICODE);

} catch (Throwable $e) {
  // Server-side log for diagnostics (no PII)
  error_log("activities.php error: " . $e->getMessage());
  http_response_code(500);

  // While in development, surface the error message; swap $debug=false for prod
  $debug = true;
  echo json_encode([
    'error' => $debug ? $e->getMessage() : 'Server error',
  ], JSON_UNESCAPED_UNICODE);
}
