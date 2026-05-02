<?php
header('Content-Type: application/json; charset=utf-8');

require_once __DIR__ . '/db.php';

$connection = db();
$method = strtoupper($_SERVER['REQUEST_METHOD'] ?? 'GET');

if ($method === 'GET') {
    $watchId = isset($_GET['watch_id']) ? (int)$_GET['watch_id'] : 0;
    
    if ($watchId <= 0) {
        http_response_code(422);
        echo json_encode(['ok' => false, 'error' => 'watch_id query param is required.']);
        exit;
    }

    $stmt = $connection->query('
        SELECT
            r.id,
            r.rating,
            r.comment,
            r.created_at,
            u.username
        FROM reviews r
        JOIN users u ON u.id = r.user_id
        WHERE r.watch_id = ' . (int)$watchId . '
        ORDER BY r.created_at DESC
    ');

    if (!$stmt) {
        http_response_code(500);
        echo json_encode(['ok' => false, 'error' => 'Database error: ' . $connection->error]);
        exit;
    }

    $reviews = [];
    while ($row = $stmt->fetch_assoc()) {
        $reviews[] = [
            'id' => (int)$row['id'],
            'rating' => (int)$row['rating'],
            'comment' => (string)$row['comment'],
            'username' => (string)$row['username'],
            'created_at' => (string)$row['created_at'],
        ];
    }

    http_response_code(200);
    echo json_encode([
        'ok' => true,
        'reviews' => $reviews,
    ]);
    exit;
}

if ($method === 'POST') {
    $userId = isset($_GET['user_id']) ? (int)$_GET['user_id'] : 1;
    
    $input = file_get_contents('php://input');
    $body = json_decode($input, true) ?? [];

    $watchId = isset($body['watch_id']) ? (int)$body['watch_id'] : 0;
    $rating = isset($body['rating']) ? (int)$body['rating'] : 0;
    $comment = trim((string)($body['comment'] ?? ''));

    if ($watchId <= 0) {
        http_response_code(422);
        echo json_encode(['ok' => false, 'error' => 'watch_id is required.']);
        exit;
    }

    if ($rating < 1 || $rating > 5) {
        http_response_code(422);
        echo json_encode(['ok' => false, 'error' => 'rating must be between 1 and 5.']);
        exit;
    }

    if ($comment === '') {
        http_response_code(422);
        echo json_encode(['ok' => false, 'error' => 'comment is required.']);
        exit;
    }

    $watchExistsStmt = $connection->query('SELECT id FROM watches WHERE id = ' . (int)$watchId);
    if (!$watchExistsStmt || $watchExistsStmt->num_rows === 0) {
        http_response_code(404);
        echo json_encode(['ok' => false, 'error' => 'Watch not found.']);
        exit;
    }

    $comment_escaped = $connection->real_escape_string($comment);
    $connection->query('
        INSERT INTO reviews (user_id, watch_id, rating, comment)
        VALUES (' . (int)$userId . ', ' . (int)$watchId . ', ' . (int)$rating . ', "' . $comment_escaped . '")
    ');

    http_response_code(201);
    echo json_encode([
        'ok' => true,
        'review_id' => (int)$connection->insert_id,
    ]);
    exit;
}

http_response_code(405);
echo json_encode(['ok' => false, 'error' => 'Method not allowed.']);
exit;
