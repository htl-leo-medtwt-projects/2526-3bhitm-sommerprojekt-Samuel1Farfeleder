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
$deleteSql = 'DELETE FROM favorites WHERE user_id = ? AND watch_id = ?';
$stmt = $connection->prepare($deleteSql);
if (!$stmt) {
    http_response_code(500);
    echo json_encode(['error' => 'Delete failed']);
    exit;
}

$stmt->bind_param('ii', $userId, $watchId);
$stmt->execute();

if ($stmt->affected_rows === 0) {
    http_response_code(404);
    echo json_encode(['error' => 'Not in favorites']);
    exit;
}

http_response_code(200);
echo json_encode(['success' => true, 'message' => 'Removed from favorites']);
