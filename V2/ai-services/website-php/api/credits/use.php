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

// Get POST data
$data = json_decode(file_get_contents('php://input'), true);
$amount = isset($data['amount']) ? (int)$data['amount'] : 0;
$metadata = isset($data['metadata']) ? $data['metadata'] : [];

if ($amount <= 0) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid amount']);
    exit;
}

// Check if user has enough credits (unless unlimited)
if ($user['credits'] >= 0 && $user['credits'] < $amount) {
    http_response_code(400);
    echo json_encode(['error' => 'Insufficient credits']);
    exit;
}

// Deduct credits (unless unlimited)
if ($user['credits'] >= 0) {
    $newCredits = $user['credits'] - $amount;
    $stmt = $pdo->prepare("UPDATE users SET credits = ? WHERE id = ?");
    $stmt->execute([$newCredits, $user['id']]);
} else {
    $newCredits = -1; // Unlimited
}

// Log usage
$stmt = $pdo->prepare("
    INSERT INTO credit_history (user_id, amount, type, model, metadata) 
    VALUES (?, ?, 'usage', ?, ?)
");
$stmt->execute([
    $user['id'],
    -$amount,
    isset($metadata['model']) ? $metadata['model'] : null,
    json_encode($metadata)
]);

// Log API usage
$stmt = $pdo->prepare("
    INSERT INTO api_usage (user_id, endpoint, model, credits_used) 
    VALUES (?, 'ai_message', ?, ?)
");
$stmt->execute([
    $user['id'],
    isset($metadata['model']) ? $metadata['model'] : null,
    $amount
]);

echo json_encode([
    'success' => true,
    'remainingCredits' => $newCredits,
    'used' => $amount
]);
?>
