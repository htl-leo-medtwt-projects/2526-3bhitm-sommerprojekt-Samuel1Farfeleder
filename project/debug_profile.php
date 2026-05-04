<?php
header('Content-Type: application/json; charset=utf-8');
session_start();
require_once __DIR__ . '/api/db.php';

$connection = db();

echo json_encode([
    'session' => $_SESSION,
    'users' => $connection->query("SELECT * FROM users")->fetch_all(MYSQLI_ASSOC),
    'favorites' => $connection->query("SELECT * FROM favorites")->fetch_all(MYSQLI_ASSOC),
    'reviews' => $connection->query("SELECT * FROM reviews")->fetch_all(MYSQLI_ASSOC),
], JSON_PRETTY_PRINT);
?>
