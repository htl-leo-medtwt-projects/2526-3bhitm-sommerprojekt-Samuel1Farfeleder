<?php
declare(strict_types=1);

require_once __DIR__ . '/db.php';

header('Content-Type: application/json; charset=utf-8');

 $connection = db();

$watchListSql = '
    SELECT
        w.id,
        b.name AS brand,
        w.model,
        w.production_year AS year,
        w.pic,
        COALESCE(ROUND(AVG(r.rating)), 5) AS rating
    FROM watches w
    JOIN brands b ON b.id = w.brand_id
    LEFT JOIN reviews r ON r.watch_id = w.id
    GROUP BY w.id, b.name, w.model, w.production_year, w.pic
    ORDER BY b.name, w.model
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
        'id' => (int) $row['id'],
        'brand' => (string) $row['brand'],
        'model' => (string) $row['model'],
        'year' => (int) $row['year'],
        'pic' => str_replace(["\r", "\n"], '', trim((string) ($row['pic'] ?? ''))),
        'rating' => max(1, min(5, (int) $row['rating'])),
    ];
}

echo json_encode(['watches' => $watches], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
