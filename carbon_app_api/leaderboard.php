<?php declare(strict_types=1);
/**
 * ============================================================
 *  File: leaderboard.php
 *  Endpoint: GET /leaderboard.php
 *
 *  Purpose:
 *    Produce emissions leaderboards for a selected time window and scope,
 *    ranking users by their *filled daily average* (see “Ranking Policy”).
 *
 *  Author: Finlay Shaw
 * ============================================================
 */


require_once __DIR__ . '/config.php';
header('Content-Type: application/json; charset=utf-8');

$me    = current_user_id();
$scope = ($_GET['scope'] ?? 'friends') === 'global' ? 'global' : 'friends';
$cat   = trim((string)($_GET['category'] ?? ''));
$limit = max(5, min(100, (int)($_GET['limit'] ?? 50)));

$tz = new DateTimeZone('UTC');

/* ---- Build window ---- */
$startParam = isset($_GET['start']) ? trim((string)$_GET['start']) : '';
$endParam   = isset($_GET['end'])   ? trim((string)$_GET['end'])   : '';

if ($startParam && $endParam) {
  try {
    $start = (new DateTimeImmutable($startParam, $tz))->setTime(0,0,0);
    $end   = (new DateTimeImmutable($endParam, $tz))->setTime(0,0,0)->modify('+1 day');
  } catch (Exception $e) { fail(400, 'Invalid start/end format. Use YYYY-MM-DD.'); }
} else {
  $period = $_GET['period'] ?? 'week';
  $now = new DateTimeImmutable('now', $tz);
  switch ($period) {
    case 'month':
      $start = $now->modify('first day of this month')->setTime(0,0,0);
      $end   = $start->modify('+1 month'); break;
    case 'year':
    case 'ytd':
      $start = (new DateTimeImmutable($now->format('Y-01-01'), $tz))->setTime(0,0,0);
      $end   = $now->modify('+1 day')->setTime(0,0,0); break;
    default:
      $start = $now->modify('monday this week')->setTime(0,0,0);
      $end   = $start->modify('+7 days');
  }
}

$windowDays = (int)$start->diff($end)->days;
if ($windowDays <= 0) {
  ok(['rows' => [], 'range' => ['start'=>$start->format('Y-m-d H:i:s'), 'end'=>$end->format('Y-m-d H:i:s'), 'days'=>0]]);
  exit;
}

/* ---- Minimum activity requirement ----
   Default: at least 1/3 of the window days.
   Optional overrides:
     - ?min_active_days=10
     - ?min_active_ratio=0.25
*/
$overrideDays  = (int)($_GET['min_active_days'] ?? 0);
$ratioRaw      = isset($_GET['min_active_ratio']) ? (float)$_GET['min_active_ratio'] : 0.3333;
$minRatio      = max(0.0, min(1.0, $ratioRaw));
$minActiveDays = $overrideDays > 0 ? min($windowDays, $overrideDays) : (int)ceil($windowDays * $minRatio);

$prevEnd   = $start;
$prevStart = $prevEnd->modify("-{$windowDays} days");

$startStr = $start->format('Y-m-d H:i:s');
$endStr   = $end->format('Y-m-d H:i:s');
$prevSStr = $prevStart->format('Y-m-d H:i:s');
$prevEStr = $prevEnd->format('Y-m-d H:i:s');

/* ---- Filters with UNIQUE placeholders per occurrence ---- */
if ($scope === 'friends') {
  $scopeWhereC = "(u.id = :me_c1 OR EXISTS (SELECT 1 FROM v_user_friends vf WHERE vf.user_id = :me_c2 AND vf.friend_id = u.id))";
  $scopeWhereA = "(u.id = :me_a1 OR EXISTS (SELECT 1 FROM v_user_friends vf WHERE vf.user_id = :me_a2 AND vf.friend_id = u.id))";
  $scopeWhereP = "(u.id = :me_p1 OR EXISTS (SELECT 1 FROM v_user_friends vf WHERE vf.user_id = :me_p2 AND vf.friend_id = u.id))";
} else {
  $scopeWhereC = "u.privacy_public = 1";
  $scopeWhereA = "u.privacy_public = 1";
  $scopeWhereP = "u.privacy_public = 1";
}

$blockWhereC = "NOT EXISTS (
  SELECT 1 FROM blocks b
  WHERE (b.blocker_id = :me2_c1 AND b.blocked_id = u.id)
     OR (b.blocker_id = u.id  AND b.blocked_id = :me2_c2)
)";
$blockWhereA = "NOT EXISTS (
  SELECT 1 FROM blocks b
  WHERE (b.blocker_id = :me2_a1 AND b.blocked_id = u.id)
     OR (b.blocker_id = u.id  AND b.blocked_id = :me2_a2)
)";
$blockWhereP = "NOT EXISTS (
  SELECT 1 FROM blocks b
  WHERE (b.blocker_id = :me2_p1 AND b.blocked_id = u.id)
     OR (b.blocker_id = u.id  AND b.blocked_id = :me2_p2)
)";

$catFilterC  = $cat !== '' ? "AND a.category  = :cat_c" : "";
$catFilterP  = $cat !== '' ? "AND ap.category = :cat_p" : "";

/* emissions per your schema */
$EM  = "a.emissions_kg_co2e";
$EMP = "ap.emissions_kg_co2e";

/* ---- Query (LEFT JOIN agg, then filter on min active days) ---- */
$sql = "
SELECT
  c.id,
  c.name,
  COALESCE((ag.total_kg / NULLIF(ag.active_days,0)) * :wd1, 0)              AS total_kg,
  COALESCE((agp.total_kg / NULLIF(agp.active_days,0)) * :wd2, 0)            AS prev_total_kg,
  COALESCE(ag.active_days, 0)                                               AS active_days,
  :wd3                                                                       AS window_days,
  CASE WHEN ag.active_days  > 0 THEN ag.total_kg  / ag.active_days  ELSE NULL END AS avg_active_day,
  CASE WHEN agp.active_days > 0 THEN agp.total_kg / agp.active_days ELSE NULL END AS prev_avg_active_day
FROM
  (
    SELECT u.id, u.name
    FROM users u
    WHERE $scopeWhereC
      AND $blockWhereC
  ) AS c
LEFT JOIN
  (
    SELECT d.user_id,
           SUM(d.kg) AS total_kg,
           COUNT(*)  AS active_days
    FROM (
      SELECT a.user_id, DATE(a.occurred_at) AS d, SUM($EM) AS kg
      FROM user_activities a
      WHERE a.occurred_at >= :start AND a.occurred_at < :end
        $catFilterC
        AND a.user_id IN (
          SELECT u.id FROM users u
          WHERE $scopeWhereA AND $blockWhereA
        )
      GROUP BY a.user_id, DATE(a.occurred_at)
    ) AS d
    GROUP BY d.user_id
  ) AS ag
  ON ag.user_id = c.id
LEFT JOIN
  (
    SELECT dp.user_id,
           SUM(dp.kg) AS total_kg,
           COUNT(*)   AS active_days
    FROM (
      SELECT ap.user_id, DATE(ap.occurred_at) AS d, SUM($EMP) AS kg
      FROM user_activities ap
      WHERE ap.occurred_at >= :pstart AND ap.occurred_at < :pend
        $catFilterP
        AND ap.user_id IN (
          SELECT u.id FROM users u
          WHERE $scopeWhereP AND $blockWhereP
        )
      GROUP BY ap.user_id, DATE(ap.occurred_at)
    ) AS dp
    GROUP BY dp.user_id
  ) AS agp
  ON agp.user_id = c.id
/* require at least N active days in the current window */
WHERE COALESCE(ag.active_days, 0) >= :minActive
ORDER BY total_kg ASC, c.name ASC
LIMIT $limit
";

$stmt = $pdo->prepare($sql);

/* bind window params */
$stmt->bindValue(':start',  $startStr);
$stmt->bindValue(':end',    $endStr);
$stmt->bindValue(':pstart', $prevSStr);
$stmt->bindValue(':pend',   $prevEStr);
/* three distinct :wd* placeholders */
$stmt->bindValue(':wd1',    $windowDays, PDO::PARAM_INT);
$stmt->bindValue(':wd2',    $windowDays, PDO::PARAM_INT);
$stmt->bindValue(':wd3',    $windowDays, PDO::PARAM_INT);
/* min active requirement */
$stmt->bindValue(':minActive', $minActiveDays, PDO::PARAM_INT);

/* bind block params (always present) */
$stmt->bindValue(':me2_c1',  $me, PDO::PARAM_INT);
$stmt->bindValue(':me2_c2',  $me, PDO::PARAM_INT);
$stmt->bindValue(':me2_a1',  $me, PDO::PARAM_INT);
$stmt->bindValue(':me2_a2',  $me, PDO::PARAM_INT);
$stmt->bindValue(':me2_p1',  $me, PDO::PARAM_INT);
$stmt->bindValue(':me2_p2',  $me, PDO::PARAM_INT);

/* bind scope params if friends */
if ($scope === 'friends') {
  $stmt->bindValue(':me_c1', $me, PDO::PARAM_INT);
  $stmt->bindValue(':me_c2', $me, PDO::PARAM_INT);
  $stmt->bindValue(':me_a1', $me, PDO::PARAM_INT);
  $stmt->bindValue(':me_a2', $me, PDO::PARAM_INT);
  $stmt->bindValue(':me_p1', $me, PDO::PARAM_INT);
  $stmt->bindValue(':me_p2', $me, PDO::PARAM_INT);
}

/* bind category params if any */
if ($cat !== '') {
  $stmt->bindValue(':cat_c', $cat);
  $stmt->bindValue(':cat_p', $cat);
}

$stmt->execute();
$rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

/* ---- Rank + rounding ---- */
$rank = 0; $last = null;
foreach ($rows as &$r) {
  $key = (float)$r['total_kg'];
  if ($last === null || $key !== $last) { $rank++; $last = $key; }
  $r['rank']                = $rank;
  $r['total_kg']            = round((float)$r['total_kg'], 3);
  $r['prev_total_kg']       = round((float)$r['prev_total_kg'], 3);
  $r['delta_kg']            = round($r['total_kg'] - $r['prev_total_kg'], 3);
  $r['avg_active_day']      = $r['avg_active_day'] === null ? null : round((float)$r['avg_active_day'], 3);
  $r['prev_avg_active_day'] = $r['prev_avg_active_day'] === null ? null : round((float)$r['prev_avg_active_day'], 3);
  $r['active_days']         = (int)$r['active_days'];
  $r['window_days']         = (int)$r['window_days'];
}
unset($r);

ok([
  'scope' => $scope,
  'range' => ['start' => $startStr, 'end' => $endStr, 'days' => $windowDays],
  'min_active_days' => $minActiveDays,
  'rows'  => $rows,
]);