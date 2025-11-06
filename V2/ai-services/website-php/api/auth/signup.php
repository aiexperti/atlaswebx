<?php
require_once '../../config.php';
require_once '../../auth.php';

// Get POST data
$data = json_decode(file_get_contents('php://input'), true);

if (!isset($data['email']) || !isset($data['password'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Email and password required']);
    exit;
}

$auth = new Auth($pdo);
$result = $auth->signup($data['email'], $data['password']);

if (isset($result['error'])) {
    http_response_code(400);
}

echo json_encode($result);
?>
