<?php
declare(strict_types=1);

require_once __DIR__ . '/db.php';

header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);

if (!isset($input['user_id']) || !isset($input['watch_id'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Missing parameters']);
    exit;
}

$userId = (int) $input['user_id'];
$watchId = (int) $input['watch_id'];

$connection = db();
$checkSql = 'SELECT id FROM favorites WHERE user_id = ? AND watch_id = ?';
$stmt = $connection->prepare($checkSql);
if (!$stmt) {
    http_response_code(500);
    echo json_encode(['error' => 'Query failed']);
    exit;
}

$stmt->bind_param('ii', $userId, $watchId);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows > 0) {
    http_response_code(409);
    echo json_encode(['error' => 'Already in favorites']);
    exit;
}
$insertSql = 'INSERT INTO favorites (user_id, watch_id) VALUES (?, ?)';
$stmt = $connection->prepare($insertSql);
if (!$stmt) {
    http_response_code(500);
    echo json_encode(['error' => 'Insert failed']);
    exit;
}

$stmt->bind_param('ii', $userId, $watchId);
$stmt->execute();

http_response_code(200);
echo json_encode(['success' => true, 'message' => 'Added to favorites']);
