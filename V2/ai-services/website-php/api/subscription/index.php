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

// Get subscription details
$stmt = $pdo->prepare("SELECT * FROM subscriptions WHERE user_id = ? ORDER BY created_at DESC LIMIT 1");
$stmt->execute([$user['id']]);
$subscription = $stmt->fetch();

$plans = PLANS;
$planDetails = isset($plans[$user['plan']]) ? $plans[$user['plan']] : $plans['free'];

echo json_encode([
    'plan' => $user['plan'],
    'planName' => $planDetails['name'],
    'credits' => $user['credits'],
    'price' => $planDetails['price'],
    'status' => $subscription ? $subscription['status'] : 'active',
    'renewsAt' => $subscription ? $subscription['current_period_end'] : null,
    'stripeCustomerId' => $user['stripe_customer_id'],
    'stripeSubscriptionId' => $user['stripe_subscription_id']
]);
?>
