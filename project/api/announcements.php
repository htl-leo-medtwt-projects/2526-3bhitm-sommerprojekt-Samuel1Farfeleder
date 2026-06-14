<?php
declare(strict_types=1);

// Announcements API with reply support
// GET  -> returns posts with nested replies
// POST -> add new post or reply (parent_id)
// Authorization: Only user with username "admin" can create top-level posts (parent_id = null).
//                All authenticated users can create replies/comments (parent_id !== null).

require_once __DIR__ . '/bootstrap.php';

$storage = __DIR__ . '/../data/announcements.json';

header('Content-Type: application/json; charset=utf-8');

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    if (!file_exists($storage)) {
        echo json_encode(['ok' => true, 'announcements' => []], JSON_UNESCAPED_UNICODE);
        exit;
    }

    $json = file_get_contents($storage);
    $data = json_decode($json, true);
    if (!is_array($data)) $data = [];

    // Fetch watch details for any announcements that reference a watch_id
    $watchIds = [];
    foreach ($data as $entry) {
        if (!empty($entry['watch_id'])) {
            $watchIds[] = (int)$entry['watch_id'];
        }
    }
    $watchMap = [];
    if (!empty($watchIds)) {
        $watchIds = array_unique($watchIds);
        $connection = db();
        $idsStr = implode(',', $watchIds);
        $watchSql = "
            SELECT w.id, b.name AS brand, w.model, w.pic
            FROM watches w
            JOIN brands b ON b.id = w.brand_id
            WHERE w.id IN ($idsStr)
        ";
        $wResult = $connection->query($watchSql);
        if ($wResult) {
            while ($wRow = $wResult->fetch_assoc()) {
                $watchMap[(int)$wRow['id']] = [
                    'id' => (int)$wRow['id'],
                    'brand' => (string)$wRow['brand'],
                    'model' => (string)$wRow['model'],
                    'pic' => str_replace(["\r", "\n"], '', trim((string)($wRow['pic'] ?? ''))),
                ];
            }
        }
    }

    // Attach watch data to each announcement
    foreach ($data as &$entry) {
        if (!empty($entry['watch_id']) && isset($watchMap[(int)$entry['watch_id']])) {
            $entry['watch'] = $watchMap[(int)$entry['watch_id']];
        } else {
            $entry['watch'] = null;
        }
    }
    unset($entry);

    // Separate into top-level posts and replies
    $posts = [];
    $replies = [];
    foreach ($data as $entry) {
        if (!empty($entry['parent_id'])) {
            $replies[] = $entry;
        } else {
            $posts[] = $entry;
        }
    }

    // Sort posts newest first
    usort($posts, function($a, $b) {
        return $b['ts'] <=> $a['ts'];
    });

    // Sort replies oldest first (chronological under each post)
    usort($replies, function($a, $b) {
        return $a['ts'] <=> $b['ts'];
    });

    // Build reply map: parent_id => [replies]
    $replyMap = [];
    foreach ($replies as $reply) {
        $pid = (int)$reply['parent_id'];
        if (!isset($replyMap[$pid])) {
            $replyMap[$pid] = [];
        }
        $replyMap[$pid][] = $reply;
    }

    // Attach replies to their parent posts
    foreach ($posts as &$post) {
        $pid = (int)$post['id'];
        $post['replies'] = $replyMap[$pid] ?? [];
    }
    unset($post);

    echo json_encode(['ok' => true, 'announcements' => $posts], JSON_UNESCAPED_UNICODE);
    exit;
}

if ($method === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    if (!is_array($input)) {
        http_response_code(400);
        echo json_encode(['ok' => false, 'error' => 'Invalid payload']);
        exit;
    }

    $author = trim((string)($input['author'] ?? ''));
    $title = trim((string)($input['title'] ?? ''));
    $message = trim((string)($input['message'] ?? ''));
    $parentId = isset($input['parent_id']) && is_numeric($input['parent_id']) ? (int)$input['parent_id'] : null;

    if ($message === '') {
        http_response_code(400);
        echo json_encode(['ok' => false, 'error' => 'Message required']);
        exit;
    }

    if (strlen($message) > 2000) {
        http_response_code(400);
        echo json_encode(['ok' => false, 'error' => 'Message too long']);
        exit;
    }

    // --- Authorization: Only "admin" can create top-level posts ---
    if ($parentId === null) {
        // Creating a top-level post -> must be authenticated as "admin"
        $sessionUserId = authenticated_user_id();
        if ($sessionUserId === null) {
            http_response_code(401);
            echo json_encode(['ok' => false, 'error' => 'Nur angemeldete Benutzer können Beiträge erstellen.']);
            exit;
        }
        $connection = db();
        $userResult = $connection->query('SELECT username FROM users WHERE id = ' . (int)$sessionUserId);
        if (!$userResult || !($userRow = $userResult->fetch_assoc())) {
            http_response_code(403);
            echo json_encode(['ok' => false, 'error' => 'Benutzer nicht gefunden.']);
            exit;
        }
        if (strtolower(trim($userRow['username'])) !== 'admin') {
            http_response_code(403);
            echo json_encode(['ok' => false, 'error' => 'Nur der Admin kann Beiträge erstellen.']);
            exit;
        }
    } else {
        // Creating a reply -> must be authenticated (any user)
        $sessionUserId = authenticated_user_id();
        if ($sessionUserId === null) {
            http_response_code(401);
            echo json_encode(['ok' => false, 'error' => 'Nur angemeldete Benutzer können kommentieren.']);
            exit;
        }
    }

    // For replies, use parent's watch_id if not explicitly provided
    $watchId = isset($input['watch_id']) && is_numeric($input['watch_id']) ? (int)$input['watch_id'] : null;
    if ($watchId === null && $parentId !== null) {
        // Inherit watch_id from parent post
        if (file_exists($storage)) {
            $allJson = file_get_contents($storage);
            $allData = json_decode($allJson, true);
            if (is_array($allData)) {
                foreach ($allData as $existing) {
                    if ((int)$existing['id'] === $parentId && !empty($existing['watch_id'])) {
                        $watchId = (int)$existing['watch_id'];
                        break;
                    }
                }
            }
        }
    }

    $entry = [
        'id' => (int)(microtime(true) * 1000),
        'parent_id' => $parentId,
        'author' => $author === '' ? 'Anonymous' : htmlspecialchars($author, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8'),
        'title' => $title === '' ? null : htmlspecialchars($title, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8'),
        'message' => htmlspecialchars($message, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8'),
        'watch_id' => $watchId,
        'ts' => time()
    ];

    // load existing
    $all = [];
    if (file_exists($storage)) {
        $json = file_get_contents($storage);
        $tmp = json_decode($json, true);
        if (is_array($tmp)) $all = $tmp;
    }

    // prepend
    array_unshift($all, $entry);

    // save atomically
    $tmpFile = $storage . '.tmp';
    if (file_put_contents($tmpFile, json_encode($all, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT)) === false) {
        http_response_code(500);
        echo json_encode(['ok' => false, 'error' => 'Failed to save']);
        exit;
    }
    rename($tmpFile, $storage);

    echo json_encode(['ok' => true, 'announcement' => $entry], JSON_UNESCAPED_UNICODE);
    exit;
}

http_response_code(405);
echo json_encode(['ok' => false, 'error' => 'Method not allowed']);