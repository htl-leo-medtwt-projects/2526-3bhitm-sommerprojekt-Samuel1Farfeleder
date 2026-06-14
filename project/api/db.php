<?php
declare(strict_types=1);

function db(): mysqli
{
    static $connection = null;

    if ($connection instanceof mysqli) {
        return $connection;
    }

    $hostsToTry = ['db_server', '127.0.0.1', 'localhost'];
    $port = 3306;
    $user = 'root';
    $password = 'rootpassword';
    $database = 'chronovault';

    $lastError = null;
    foreach ($hostsToTry as $host) {
        $connection = new mysqli($host, $user, $password, $database, $port);
        if (!$connection->connect_error) {
            break;
        }
        $lastError = $connection->connect_error;
        $connection = null;
    }

    if (!($connection instanceof mysqli) || $connection->connect_error) {
        http_response_code(500);
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode(['error' => 'DB connection failed', 'detail' => $lastError]);
        exit;
    }

    $connection->set_charset('utf8mb4');
    return $connection;
}
