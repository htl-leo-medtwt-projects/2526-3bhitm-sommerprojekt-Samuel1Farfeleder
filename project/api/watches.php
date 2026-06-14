<?php
declare(strict_types=1);

require_once __DIR__ . '/bootstrap.php';

$connection = db();

$watchId = isset($_GET['id']) ? (int)$_GET['id'] : 0;
$userId = authenticated_user_id();

if ($watchId > 0) {
    $singleWatchSql = '
        SELECT
            w.id,
            b.name AS brand,
            w.model,
            w.production_year,
            w.price_usd,
            w.movement,
            w.description,
            w.pic,
            COALESCE(ROUND(AVG(r.rating)), 5) AS rating,
            COUNT(r.id) AS review_count
        FROM watches w
        JOIN brands b ON b.id = w.brand_id
        LEFT JOIN reviews r ON r.watch_id = w.id
        WHERE w.id = ' . $watchId . '
        GROUP BY w.id, b.name, w.model, w.production_year, w.price_usd, w.movement, w.description, w.pic
    ';

    $result = $connection->query($singleWatchSql);
    if (!$result || $result->num_rows === 0) {
        http_response_code(404);
        echo json_encode(['ok' => false, 'error' => 'Watch not found']);
        exit;
    }

    $row = $result->fetch_assoc();
    
    // Check if watch is favorite for authenticated user
    $isFavorite = false;
    if ($userId !== null) {
        $favResult = $connection->query('SELECT id FROM favorites WHERE user_id = ' . (int)$userId . ' AND watch_id = ' . (int)$watchId);
        $isFavorite = $favResult && $favResult->num_rows > 0;
    }
    
    $watch = [
        'id' => (int)$row['id'],
        'brand' => (string)$row['brand'],
        'model' => (string)$row['model'],
        'production_year' => (int)$row['production_year'],
        'price_usd' => (float)($row['price_usd'] ?? 0),
        'movement' => (string)($row['movement'] ?? ''),
        'description' => (string)($row['description'] ?? ''),
        'pic' => str_replace(["\r", "\n"], '', trim((string)($row['pic'] ?? ''))),
        'rating' => max(1, min(5, (int)$row['rating'])),
        'review_count' => (int)$row['review_count'],
        'is_favorite' => $isFavorite,
    ];

    http_response_code(200);
    echo json_encode(['ok' => true, 'watch' => $watch], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

$limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 0;
$random = isset($_GET['random']) && ($_GET['random'] === '1' || $_GET['random'] === 'true');

$orderClause = $random ? 'ORDER BY RAND()' : 'ORDER BY b.name, w.model';
$limitClause = $limit > 0 ? ' LIMIT ' . $limit : '';

$watchListSql = '
    SELECT
        w.id,
        b.name AS brand,
        w.model,
        w.production_year AS year,
        w.pic,
        COALESCE(ROUND(AVG(r.rating)), 5) AS rating,
        COUNT(r.id) AS review_count
    FROM watches w
    JOIN brands b ON b.id = w.brand_id
    LEFT JOIN reviews r ON r.watch_id = w.id
    GROUP BY w.id, b.name, w.model, w.production_year, w.pic
    ' . $orderClause . $limitClause . '
';

$queryResult = $connection->query($watchListSql);
if (!$queryResult) {
    http_response_code(500);
    echo json_encode(['error' => 'Query failed']);
    exit;
}

$watches = [];
while ($row = $queryResult->fetch_assoc()) {
    $watches[] = [
        'id' => (int)$row['id'],
        'brand' => (string)$row['brand'],
        'model' => (string)$row['model'],
        'year' => (int)$row['year'],
        'pic' => str_replace(["\r", "\n"], '', trim((string)($row['pic'] ?? ''))),
        'rating' => max(1, min(5, (int)$row['rating'])),
        'review_count' => (int)$row['review_count'],
    ];
}

echo json_encode(['ok' => true, 'watches' => $watches], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
