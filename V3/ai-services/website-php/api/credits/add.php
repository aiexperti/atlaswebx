<?php
// Add credits to user account (you handle payment separately)
require_once '../../simple-config.php';
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
$note = isset($data['note']) ? $data['note'] : 'Credits added';

if ($amount <= 0) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid amount']);
    exit;
}

// Add credits
$newCredits = $user['credits'] + $amount;
$stmt = $pdo->prepare("UPDATE users SET credits = ? WHERE id = ?");
$stmt->execute([$newCredits, $user['id']]);

// Log credit addition
$stmt = $pdo->prepare("
    INSERT INTO credit_history (user_id, amount, type, note) 
    VALUES (?, ?, 'added', ?)
");
$stmt->execute([$user['id'], $amount, $note]);

echo json_encode([
    'success' => true,
    'credits' => $newCredits,
    'added' => $amount
]);
?>
