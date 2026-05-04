<?php
declare(strict_types=1);

require_once __DIR__ . '/db.php';

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

header('Content-Type: application/json; charset=utf-8');

set_exception_handler(static function (Throwable $exception): void {
    http_response_code(500);
    echo json_encode([
        'ok' => false,
        'error' => $exception->getMessage(),
    ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
});

function json_response(array $payload, int $status = 200): void
{
    http_response_code($status);
    echo json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

function json_error(string $message, int $status = 400): void
{
    json_response([
        'ok' => false,
        'error' => $message,
    ], $status);
}

function require_method(string $expected): void
{
    if (strtoupper($_SERVER['REQUEST_METHOD'] ?? '') !== strtoupper($expected)) {
        json_error('Method not allowed.', 405);
    }
}

function get_json_input(): array
{
    $raw = file_get_contents('php://input');
    if ($raw === false || trim($raw) === '') {
        return [];
    }

    $data = json_decode($raw, true);
    if (!is_array($data)) {
        json_error('Invalid JSON body.', 400);
    }

    return $data;
}

function current_user_id(): int
{
    if (isset($_SESSION['user_id']) && is_numeric($_SESSION['user_id'])) {
        return max(1, (int) $_SESSION['user_id']);
    }

    if (isset($_GET['user_id']) && is_numeric($_GET['user_id'])) {
        return max(1, (int) $_GET['user_id']);
    }

    return 1;
}

function authenticated_user_id(): ?int
{
    if (!isset($_SESSION['user_id']) || !is_numeric($_SESSION['user_id'])) {
        return null;
    }

    return max(1, (int) $_SESSION['user_id']);
}

function require_authenticated_user_id(): int
{
    $userId = authenticated_user_id();
    if ($userId === null) {
        json_error('Authentication required.', 401);
    }

    return $userId;
}

function resolve_user_id(mysqli $connection, ?int $requestedUserId = null): int
{
    $requestedUserId = $requestedUserId !== null ? max(1, $requestedUserId) : current_user_id();

    $result = $connection->query('SELECT id FROM users WHERE id = ' . (int)$requestedUserId);
    if ($result && $row = $result->fetch_assoc()) {
        return (int) $row['id'];
    }

    $result = $connection->query('SELECT id FROM users ORDER BY id ASC LIMIT 1');
    if ($result && $row = $result->fetch_assoc()) {
        return (int) $row['id'];
    }

    $connection->query("INSERT INTO users (username, email) VALUES ('Watch Enthusiast', 'demo@chronovault.com')");
    return (int) $connection->insert_id;
}
