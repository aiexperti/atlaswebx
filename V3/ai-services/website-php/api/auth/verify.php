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
$result = $auth->verify($token);

if (isset($result['error'])) {
    http_response_code(403);
}

echo json_encode($result);
?>
