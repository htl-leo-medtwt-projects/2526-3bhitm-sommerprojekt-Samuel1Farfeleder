<?php
declare(strict_types=1);

require_once __DIR__ . '/db.php';

header('Content-Type: application/json; charset=utf-8');

$connection = db();
$method = strtoupper($_SERVER['REQUEST_METHOD'] ?? 'GET');
$userId = isset($_GET['user_id']) ? (int)$_GET['user_id'] : 1;

if ($userId <= 0) {
    http_response_code(422);
    echo json_encode(['ok' => false, 'error' => 'user_id must be greater than 0.']);
    exit;
}

function fetchProfile(mysqli $connection, int $userId): ?array
{
    $stmt = $connection->prepare('SELECT id, username, email, created_at FROM users WHERE id = ?');
    if (!$stmt) {
        return null;
    }

    $stmt->bind_param('i', $userId);
    $stmt->execute();
    $result = $stmt->get_result();

    if (!$result || $result->num_rows === 0) {
        return null;
    }

    $row = $result->fetch_assoc();
    if (!$row) {
        return null;
    }

    return [
        'id' => (int)$row['id'],
        'username' => (string)$row['username'],
        'email' => (string)$row['email'],
        'created_at' => (string)$row['created_at'],
    ];
}

if ($method === 'GET') {
    $profile = fetchProfile($connection, $userId);

    if ($profile === null) {
        http_response_code(404);
        echo json_encode(['ok' => false, 'error' => 'Profile not found.']);
        exit;
    }

    echo json_encode([
        'ok' => true,
        'profile' => $profile,
    ]);
    exit;
}

if ($method === 'POST') {
    $body = json_decode(file_get_contents('php://input'), true) ?? [];
    $username = trim((string)($body['username'] ?? ''));
    $email = trim((string)($body['email'] ?? ''));

    if ($username === '') {
        http_response_code(422);
        echo json_encode(['ok' => false, 'error' => 'username is required.']);
        exit;
    }

    if (mb_strlen($username) > 80) {
        http_response_code(422);
        echo json_encode(['ok' => false, 'error' => 'username is too long.']);
        exit;
    }

    if ($email === '' || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
        http_response_code(422);
        echo json_encode(['ok' => false, 'error' => 'A valid email is required.']);
        exit;
    }

    if (fetchProfile($connection, $userId) === null) {
        http_response_code(404);
        echo json_encode(['ok' => false, 'error' => 'Profile not found.']);
        exit;
    }

    $stmt = $connection->prepare('UPDATE users SET username = ?, email = ? WHERE id = ?');
    if (!$stmt) {
        http_response_code(500);
        echo json_encode(['ok' => false, 'error' => 'Update failed.']);
        exit;
    }

    $stmt->bind_param('ssi', $username, $email, $userId);

    if (!$stmt->execute()) {
        if ($connection->errno === 1062) {
            http_response_code(409);
            echo json_encode(['ok' => false, 'error' => 'Email already exists.']);
            exit;
        }

        http_response_code(500);
        echo json_encode(['ok' => false, 'error' => 'Database update failed.']);
        exit;
    }

    $profile = fetchProfile($connection, $userId);

    echo json_encode([
        'ok' => true,
        'profile' => $profile,
    ]);
    exit;
}

http_response_code(405);
echo json_encode(['ok' => false, 'error' => 'Method not allowed.']);
exit;