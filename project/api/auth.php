<?php
declare(strict_types=1);

require_once __DIR__ . '/bootstrap.php';

$connection = db();
$method = strtoupper($_SERVER['REQUEST_METHOD'] ?? 'GET');

function load_user_by_id(mysqli $connection, int $userId): ?array
{
    $result = $connection->query('SELECT id, username, email, created_at FROM users WHERE id = ' . (int)$userId);
    if (!$result) {
        return null;
    }
    
    $user = $result->fetch_assoc();
    return $user ?: null;
}

if ($method === 'GET') {
    $sessionUserId = authenticated_user_id();

    if ($sessionUserId === null) {
        json_response([
            'ok' => true,
            'authenticated' => false,
            'user' => null,
        ]);
    }

    $user = load_user_by_id($connection, $sessionUserId);
    if ($user === null) {
        unset($_SESSION['user_id']);
        json_response([
            'ok' => true,
            'authenticated' => false,
            'user' => null,
        ]);
    }

    json_response([
        'ok' => true,
        'authenticated' => true,
        'user' => [
            'id' => (int) $user['id'],
            'username' => (string) $user['username'],
            'email' => (string) $user['email'],
            'created_at' => (string) $user['created_at'],
        ],
    ]);
}

if ($method === 'DELETE') {
    unset($_SESSION['user_id']);
    json_response([
        'ok' => true,
        'authenticated' => false,
    ]);
}

if ($method !== 'POST') {
    json_error('Method not allowed.', 405);
}

$body = get_json_input();
$action = strtolower(trim((string) ($body['action'] ?? '')));

if ($action === 'register') {
    $username = trim((string) ($body['username'] ?? ''));
    $email = trim((string) ($body['email'] ?? ''));
    $password = (string) ($body['password'] ?? '');

    if ($username === '') {
        json_error('username is required.', 422);
    }

    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        json_error('valid email is required.', 422);
    }

    if (mb_strlen($password) < 6) {
        json_error('password must be at least 6 characters.', 422);
    }

    $result = $connection->query('SELECT id FROM users WHERE email = "' . $connection->real_escape_string($email) . '"');
    if ($result && $result->num_rows > 0) {
        json_error('Email is already in use.', 409);
    }

    $passwordHash = password_hash($password, PASSWORD_DEFAULT);
    
    $username_escaped = $connection->real_escape_string($username);
    $email_escaped = $connection->real_escape_string($email);
    $hash_escaped = $connection->real_escape_string($passwordHash);

    $connection->query("INSERT INTO users (username, email, password_hash) VALUES ('$username_escaped', '$email_escaped', '$hash_escaped')");
    
    $userId = (int) $connection->insert_id;
    $_SESSION['user_id'] = $userId;

    $user = load_user_by_id($connection, $userId);

    json_response([
        'ok' => true,
        'authenticated' => true,
        'user' => [
            'id' => (int) $user['id'],
            'username' => (string) $user['username'],
            'email' => (string) $user['email'],
            'created_at' => (string) $user['created_at'],
        ],
    ], 201);
}

if ($action === 'login') {
    $email = trim((string) ($body['email'] ?? ''));
    $password = (string) ($body['password'] ?? '');

    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        json_error('valid email is required.', 422);
    }

    if ($password === '') {
        json_error('password is required.', 422);
    }

    $email_escaped = $connection->real_escape_string($email);
    $result = $connection->query('SELECT id, username, email, created_at, password_hash FROM users WHERE email = "' . $email_escaped . '"');
    if (!$result || !($user = $result->fetch_assoc())) {
        json_error('Invalid credentials.', 401);
    }

    if (empty($user['password_hash']) || !password_verify($password, (string) $user['password_hash'])) {
        json_error('Invalid credentials.', 401);
    }

    $_SESSION['user_id'] = (int) $user['id'];

    json_response([
        'ok' => true,
        'authenticated' => true,
        'user' => [
            'id' => (int) $user['id'],
            'username' => (string) $user['username'],
            'email' => (string) $user['email'],
            'created_at' => (string) $user['created_at'],
        ],
    ]);
}

json_error('Unsupported action.', 422);
