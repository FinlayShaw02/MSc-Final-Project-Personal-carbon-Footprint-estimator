<?php
// htdocs/carbon_app_api/goals.php
require __DIR__ . '/config.php';

/**
 * ============================================================
 *  File: goals.php
 *  Endpoint: /goals.php
 *
 *  Purpose:
 *    CRUD-style API for user emission goals (caps).
 *    Currently supports: GET (list), POST (create), DELETE (remove).
 *
 *  Author: Finlay Shaw (revised)
 * ============================================================
 */

try {
  /* ---- Preflight early exit (handled after CORS in config.php) ---- */
  if (($_SERVER['REQUEST_METHOD'] ?? '') === 'OPTIONS') {
    http_response_code(204);
    exit;
  }

  /* ---- Auth ---- */
  $uid = current_user_id(); // 401 + JSON + exit if not logged in

  $method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

  /* ============================================================
   * GET /goals.php
   *  - Optional filters:
   *      ?active=1|0
   *      ?category=<slug>|all|''   (normalised to NULL for “all”)
   *  - Returns: plain JSON array of rows (for existing frontend code)
   * ============================================================ */
  if ($method === 'GET') {
    $active = isset($_GET['active']) ? (int)$_GET['active'] : null;

    $catRaw = $_GET['category'] ?? null;
    $category = null;
    $filterByCategory = false;
    if ($catRaw !== null) {
      $tmp = trim((string)$catRaw);
      if ($tmp !== '' && strtolower($tmp) !== 'all') {
        $category = $tmp;
      }
      $filterByCategory = true;
    }

    if ($active !== null && $filterByCategory) {
      if ($category === null) {
        $stmt = $pdo->prepare("
          SELECT *
          FROM user_goals
          WHERE user_id = ? AND is_active = ? AND category IS NULL
          ORDER BY created_at DESC
        ");
        $stmt->execute([$uid, $active]);
      } else {
        $stmt = $pdo->prepare("
          SELECT *
          FROM user_goals
          WHERE user_id = ? AND is_active = ? AND category = ?
          ORDER BY created_at DESC
        ");
        $stmt->execute([$uid, $active, $category]);
      }
    } elseif ($active !== null) {
      $stmt = $pdo->prepare("
        SELECT *
        FROM user_goals
        WHERE user_id = ? AND is_active = ?
        ORDER BY created_at DESC
      ");
      $stmt->execute([$uid, $active]);
    } elseif ($filterByCategory) {
      if ($category === null) {
        $stmt = $pdo->prepare("
          SELECT *
          FROM user_goals
          WHERE user_id = ? AND category IS NULL
          ORDER BY created_at DESC
        ");
        $stmt->execute([$uid]);
      } else {
        $stmt = $pdo->prepare("
          SELECT *
          FROM user_goals
          WHERE user_id = ? AND category = ?
          ORDER BY created_at DESC
        ");
        $stmt->execute([$uid, $category]);
      }
    } else {
      $stmt = $pdo->prepare("
        SELECT *
        FROM user_goals
        WHERE user_id = ?
        ORDER BY created_at DESC
      ");
      $stmt->execute([$uid]);
    }

    echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
    exit;
  }

  /* ============================================================
   * POST /goals.php
   * ============================================================ */
  if ($method === 'POST') {
    $data = json_body();
    if (!is_array($data)) {
      fail(400, 'Invalid JSON');
    }

    $name = trim((string)($data['name'] ?? ''));
    $period = (string)($data['period'] ?? '');
    $categoryRaw = $data['category'] ?? null;
    $category = ($categoryRaw === null || $categoryRaw === '' || strtolower((string)$categoryRaw) === 'all')
      ? null
      : trim((string)$categoryRaw);
    $target_kg = $data['target_kg'] ?? null;
    $type = 'cap';
    $is_active = array_key_exists('is_active', $data) ? (!empty($data['is_active']) ? 1 : 0) : 1;

    // Basic validation
    if ($name === '') {
      fail(422, 'Name is required');
    }
    if (mb_strlen($name) > 100) {
      fail(422, 'Name is too long');
    }
    if (!in_array($period, ['week', 'month', 'year'], true)) {
      fail(422, 'Invalid period');
    }
    $target = filter_var($target_kg, FILTER_VALIDATE_FLOAT);
    if ($target === false || $target < 0) {
      fail(422, 'target_kg must be ≥ 0');
    }

    $stmt = $pdo->prepare("
      INSERT INTO user_goals (user_id, name, type, period, category, target_kg, is_active)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    ");
    $stmt->execute([$uid, $name, $type, $period, $category, $target, $is_active]);

    ok(['id' => (int)$pdo->lastInsertId()]);
    exit;
  }

  /* ============================================================
   * DELETE /goals.php?id=123
   * ============================================================ */
  if ($method === 'DELETE') {
    $id = isset($_GET['id']) ? (int)$_GET['id'] : 0;

    if ($id <= 0) {
      // Try JSON body fallback
      $body = json_body();
      if (is_array($body) && isset($body['id'])) {
        $id = (int)$body['id'];
      }
    }

    if ($id <= 0) {
      fail(400, 'Missing id');
    }

    $stmt = $pdo->prepare("
      DELETE FROM user_goals
      WHERE id = ? AND user_id = ?
      LIMIT 1
    ");
    $stmt->execute([$id, $uid]);

    if ($stmt->rowCount() === 0) {
      fail(404, 'Not found');
    }

    ok(['deleted' => 1, 'id' => $id]);
    exit;
  }

  /* ---- Unsupported method ---- */
  fail(405, 'Method not allowed');

} catch (Throwable $e) {
  fail(500, 'Server error');
}
