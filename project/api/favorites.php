<?php
declare(strict_types=1);

require_once __DIR__ . '/bootstrap.php';

$connection = db();
$method = strtoupper($_SERVER['REQUEST_METHOD'] ?? 'GET');

// GET - Load all favorites for authenticated user
if ($method === 'GET') {
	$userId = authenticated_user_id();
	
	if ($userId === null) {
		json_response([
			'ok' => true,
			'favorites' => [],
		]);
		exit;
	}

	$sql = '
		SELECT
			f.id,
			f.watch_id,
			w.model,
			b.name AS brand,
			w.production_year AS year,
			w.pic,
			COALESCE(ROUND(AVG(r.rating)), 5) AS rating,
			COUNT(r.id) AS review_count
		FROM favorites f
		JOIN watches w ON w.id = f.watch_id
		JOIN brands b ON b.id = w.brand_id
		LEFT JOIN reviews r ON r.watch_id = w.id
		WHERE f.user_id = ' . (int)$userId . '
		GROUP BY f.id, f.watch_id, w.model, b.name, w.production_year, w.pic
		ORDER BY f.created_at DESC
	';

	$result = $connection->query($sql);
	if (!$result) {
		json_error('Database error: ' . $connection->error, 500);
	}

	$favorites = [];
	while ($row = $result->fetch_assoc()) {
		$favorites[] = [
			'id' => (int)$row['id'],
			'watch_id' => (int)$row['watch_id'],
			'brand' => (string)$row['brand'],
			'model' => (string)$row['model'],
			'year' => (int)$row['year'],
			'pic' => str_replace(["\r", "\n"], '', trim((string)($row['pic'] ?? ''))),
			'rating' => max(1, min(5, (int)$row['rating'])),
			'review_count' => (int)$row['review_count'],
		];
	}

	json_response([
		'ok' => true,
		'favorites' => $favorites,
	]);
	exit;
}

// POST - Add favorite
if ($method === 'POST') {
	$userId = authenticated_user_id();
	
	if ($userId === null) {
		json_error('Authentication required.', 401);
	}

	$body = get_json_input();
	$watchId = isset($body['watch_id']) ? (int)$body['watch_id'] : 0;

	if ($watchId <= 0) {
		json_error('watch_id is required.', 422);
	}

	$checkSql = 'SELECT id FROM favorites WHERE user_id = ' . (int)$userId . ' AND watch_id = ' . (int)$watchId;
	$checkResult = $connection->query($checkSql);
	
	if ($checkResult && $checkResult->num_rows > 0) {
		json_error('Already in favorites.', 409);
	}

	$insertSql = 'INSERT INTO favorites (user_id, watch_id) VALUES (' . (int)$userId . ', ' . (int)$watchId . ')';
	
	if (!$connection->query($insertSql)) {
		json_error('Failed to add favorite: ' . $connection->error, 500);
	}

	json_response([
		'ok' => true,
		'message' => 'Added to favorites',
	], 201);
	exit;
}

// DELETE - Remove favorite
if ($method === 'DELETE') {
	$userId = authenticated_user_id();
	
	if ($userId === null) {
		json_error('Authentication required.', 401);
	}

	$watchId = isset($_GET['watch_id']) ? (int)$_GET['watch_id'] : 0;

	if ($watchId <= 0) {
		json_error('watch_id query param is required.', 422);
	}

	$deleteSql = 'DELETE FROM favorites WHERE user_id = ' . (int)$userId . ' AND watch_id = ' . (int)$watchId;
	
	if (!$connection->query($deleteSql)) {
		json_error('Failed to remove favorite: ' . $connection->error, 500);
	}

	if ($connection->affected_rows === 0) {
		json_error('Not in favorites.', 404);
	}

	json_response([
		'ok' => true,
		'message' => 'Removed from favorites',
	]);
	exit;
}

json_error('Method not allowed.', 405);
