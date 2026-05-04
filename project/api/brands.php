<?php
declare(strict_types=1);

require_once __DIR__ . '/bootstrap.php';

require_method('GET');

$connection = db();
$name = isset($_GET['name']) ? trim((string) $_GET['name']) : '';

if ($name !== '') {
	$sql = '
		SELECT
			b.id,
			b.name,
			b.founded_year,
			b.country,
			b.description,
			COUNT(w.id) AS watch_count
		FROM brands b
		LEFT JOIN watches w ON w.brand_id = b.id
		WHERE b.name = "' . $connection->real_escape_string($name) . '"
		GROUP BY b.id, b.name, b.founded_year, b.country, b.description
	';
	$result = $connection->query($sql);
	if (!$result) {
		json_error('Database error: ' . $connection->error, 500);
	}

	$brand = $result->fetch_assoc();

	if (!$brand) {
		json_error('Brand not found.', 404);
	}

	json_response([
		'ok' => true,
		'brand' => [
			'id' => (int) $brand['id'],
			'name' => (string) $brand['name'],
			'founded_year' => $brand['founded_year'] !== null ? (int) $brand['founded_year'] : null,
			'country' => $brand['country'] !== null ? (string) $brand['country'] : null,
			'description' => $brand['description'] !== null ? (string) $brand['description'] : '',
			'watch_count' => (int) $brand['watch_count'],
		],
	]);
}

$sql = '
	SELECT
		b.id,
		b.name,
		b.founded_year,
		b.country,
		COUNT(w.id) AS watch_count
	FROM brands b
	LEFT JOIN watches w ON w.brand_id = b.id
	GROUP BY b.id, b.name, b.founded_year, b.country
	ORDER BY b.name ASC
';

$result = $connection->query($sql);
if (!$result) {
	json_error('Database error: ' . $connection->error, 500);
}

$brands = [];
while ($row = $result->fetch_assoc()) {
	$brands[] = [
		'id' => (int) $row['id'],
		'name' => (string) $row['name'],
		'founded_year' => $row['founded_year'] !== null ? (int) $row['founded_year'] : null,
		'country' => $row['country'] !== null ? (string) $row['country'] : null,
		'watch_count' => (int) $row['watch_count'],
	];
}

json_response([
	'ok' => true,
	'brands' => $brands,
]);
