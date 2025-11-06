<?php
require_once '../../config.php';
require_once '../../auth.php';

// Get Authorization header
$headers = getallheaders();
$authHeader = isset($headers['Authorization']) ? $headers['Authorization'] : '';

if (empty($authHeader) || !preg_match('/Bearer\s(\S+)/', $authHeader, $matches)) {
    http_response_code(401);
    echo json_encode(['error' => 'No token provided']);
    exit;
}

$token = $matches[1];
$auth = new Auth($pdo);
$user = $auth->getUserFromToken($token);

if (!$user) {
    http_response_code(403);
    echo json_encode(['error' => 'Invalid token']);
    exit;
}

// Return user credits
echo json_encode([
    'credits' => (int)$user['credits'],
    'plan' => $user['plan']
]);
?>
