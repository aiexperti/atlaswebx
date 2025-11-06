<?php
require_once '../../config.php';
require_once '../../auth.php';
require_once '../../vendor/autoload.php'; // Stripe PHP library

\Stripe\Stripe::setApiKey(STRIPE_SECRET_KEY);

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
$plan = isset($data['plan']) ? $data['plan'] : 'pro';

// Get Stripe price ID
$priceIds = [
    'pro' => STRIPE_PRICE_PRO,
    'enterprise' => STRIPE_PRICE_ENTERPRISE
];

if (!isset($priceIds[$plan])) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid plan']);
    exit;
}

try {
    // Create Stripe checkout session
    $session = \Stripe\Checkout\Session::create([
        'customer_email' => $user['email'],
        'client_reference_id' => $user['id'],
        'payment_method_types' => ['card'],
        'line_items' => [[
            'price' => $priceIds[$plan],
            'quantity' => 1,
        ]],
        'mode' => 'subscription',
        'success_url' => APP_URL . '/success?session_id={CHECKOUT_SESSION_ID}',
        'cancel_url' => APP_URL . '/pricing',
        'metadata' => [
            'user_id' => $user['id'],
            'plan' => $plan
        ]
    ]);
    
    echo json_encode([
        'url' => $session->url,
        'sessionId' => $session->id
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
?>
