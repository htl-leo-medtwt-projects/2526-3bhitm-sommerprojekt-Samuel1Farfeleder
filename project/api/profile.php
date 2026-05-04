<?php
declare(strict_types=1);

require_once __DIR__ . '/bootstrap.php';

$connection = db();
$userId = require_authenticated_user_id();
$method = strtoupper($_SERVER['REQUEST_METHOD'] ?? 'GET');

if ($method === 'GET') {
    // Load user data
    $result = $connection->query('SELECT id, username, email, created_at FROM users WHERE id = ' . (int)$userId);
    if (!$result || $result->num_rows === 0) {
        json_error('User not found.', 404);
    }
    
    $user = $result->fetch_assoc();
    
    // Count favorites
    $favResult = $connection->query('SELECT COUNT(*) as count FROM favorites WHERE user_id = ' . (int)$userId);
    $favCount = $favResult ? $favResult->fetch_assoc()['count'] : 0;
    
    // Count reviews
    $revResult = $connection->query('SELECT COUNT(*) as count FROM reviews WHERE user_id = ' . (int)$userId);
    $revCount = $revResult ? $revResult->fetch_assoc()['count'] : 0;
    
    // Get recent favorites
    $recentResult = $connection->query(
        'SELECT f.id, f.watch_id, w.model as watch_name, w.brand_id, b.name as brand_name 
         FROM favorites f
         LEFT JOIN watches w ON f.watch_id = w.id
         LEFT JOIN brands b ON w.brand_id = b.id
         WHERE f.user_id = ' . (int)$userId . '
         ORDER BY f.created_at DESC
         LIMIT 6'
    );
    
    $recentFavorites = [];
    if ($recentResult) {
        while ($row = $recentResult->fetch_assoc()) {
            $recentFavorites[] = [
                'id' => (int) $row['id'],
                'watch_id' => (int) $row['watch_id'],
                'watch_name' => (string) $row['watch_name'],
                'brand_id' => (int) $row['brand_id'],
                'brand_name' => (string) $row['brand_name'],
            ];
        }
    }
    
    // Get recent reviews
    $reviewsResult = $connection->query(
        'SELECT r.id, r.watch_id, r.rating, r.comment, r.created_at, w.model as watch_name, b.name as brand_name 
         FROM reviews r
         LEFT JOIN watches w ON r.watch_id = w.id
         LEFT JOIN brands b ON w.brand_id = b.id
         WHERE r.user_id = ' . (int)$userId . '
         ORDER BY r.created_at DESC
         LIMIT 6'
    );
    
    $recentReviews = [];
    if ($reviewsResult) {
        while ($row = $reviewsResult->fetch_assoc()) {
            $recentReviews[] = [
                'id' => (int) $row['id'],
                'watch_id' => (int) $row['watch_id'],
                'watch_name' => (string) $row['watch_name'],
                'brand_name' => (string) $row['brand_name'],
                'rating' => (int) $row['rating'],
                'comment' => (string) $row['comment'],
                'created_at' => (string) $row['created_at'],
            ];
        }
    }
    
    json_response([
        'ok' => true,
        'user' => [
            'id' => (int) $user['id'],
            'username' => (string) $user['username'],
            'email' => (string) $user['email'],
            'created_at' => (string) $user['created_at'],
        ],
        'favorites_count' => (int) $favCount,
        'reviews_count' => (int) $revCount,
        'recent_favorites' => $recentFavorites,
        'recent_reviews' => $recentReviews,
    ]);
}

if ($method === 'PUT') {
    $body = get_json_input();

    $username = trim((string) ($body['username'] ?? ''));
    $email = trim((string) ($body['email'] ?? ''));
    $password = (string) ($body['password'] ?? '');

    if ($username === '') {
        json_error('username is required.', 422);
    }

    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        json_error('valid email is required.', 422);
    }

    $email_escaped = $connection->real_escape_string($email);
    $result = $connection->query('SELECT id FROM users WHERE email = "' . $email_escaped . '" AND id <> ' . (int)$userId);
    if ($result && $result->num_rows > 0) {
        json_error('Email is already in use.', 409);
    }

    $username_escaped = $connection->real_escape_string($username);

    if ($password !== '') {
        if (mb_strlen($password) < 6) {
            json_error('password must be at least 6 characters.', 422);
        }

        $hash = password_hash($password, PASSWORD_DEFAULT);
        $hash_escaped = $connection->real_escape_string($hash);
        $connection->query("UPDATE users SET username = '$username_escaped', email = '$email_escaped', password_hash = '$hash_escaped' WHERE id = " . (int)$userId);
    } else {
        $connection->query("UPDATE users SET username = '$username_escaped', email = '$email_escaped' WHERE id = " . (int)$userId);
    }

    json_response([
        'ok' => true,
        'updated' => true,
    ]);
}

json_error('Method not allowed.', 405);