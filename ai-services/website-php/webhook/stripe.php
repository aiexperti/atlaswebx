<?php
require_once '../config.php';
require_once '../vendor/autoload.php';

\Stripe\Stripe::setApiKey(STRIPE_SECRET_KEY);

// Get raw POST data
$payload = @file_get_contents('php://input');
$sig_header = $_SERVER['HTTP_STRIPE_SIGNATURE'];

try {
    $event = \Stripe\Webhook::constructEvent(
        $payload, $sig_header, STRIPE_WEBHOOK_SECRET
    );
} catch(\UnexpectedValueException $e) {
    http_response_code(400);
    exit();
} catch(\Stripe\Exception\SignatureVerificationException $e) {
    http_response_code(400);
    exit();
}

// Log webhook event
$stmt = $pdo->prepare("
    INSERT INTO webhook_events (event_id, type, data) 
    VALUES (?, ?, ?)
");
$stmt->execute([
    $event->id,
    $event->type,
    json_encode($event->data->object)
]);

// Handle the event
switch ($event->type) {
    case 'checkout.session.completed':
        $session = $event->data->object;
        handleCheckoutCompleted($pdo, $session);
        break;
        
    case 'customer.subscription.updated':
        $subscription = $event->data->object;
        handleSubscriptionUpdated($pdo, $subscription);
        break;
        
    case 'customer.subscription.deleted':
        $subscription = $event->data->object;
        handleSubscriptionDeleted($pdo, $subscription);
        break;
        
    case 'invoice.payment_succeeded':
        $invoice = $event->data->object;
        handlePaymentSucceeded($pdo, $invoice);
        break;
        
    case 'invoice.payment_failed':
        $invoice = $event->data->object;
        handlePaymentFailed($pdo, $invoice);
        break;
}

http_response_code(200);
echo json_encode(['received' => true]);

// ==================== WEBHOOK HANDLERS ====================

function handleCheckoutCompleted($pdo, $session) {
    $userId = $session->client_reference_id;
    $plan = $session->metadata->plan ?? 'pro';
    
    $plans = PLANS;
    $credits = $plans[$plan]['credits'];
    
    // Update user
    $stmt = $pdo->prepare("
        UPDATE users 
        SET plan = ?, 
            credits = ?, 
            stripe_customer_id = ?, 
            stripe_subscription_id = ? 
        WHERE id = ?
    ");
    $stmt->execute([
        $plan,
        $credits,
        $session->customer,
        $session->subscription,
        $userId
    ]);
    
    // Create subscription record
    $stmt = $pdo->prepare("
        INSERT INTO subscriptions (user_id, plan, status, current_period_start, current_period_end) 
        VALUES (?, ?, 'active', NOW(), DATE_ADD(NOW(), INTERVAL 30 DAY))
    ");
    $stmt->execute([$userId, $plan]);
    
    // Add credit history
    $stmt = $pdo->prepare("
        INSERT INTO credit_history (user_id, amount, type) 
        VALUES (?, ?, 'subscription')
    ");
    $stmt->execute([$userId, $credits]);
}

function handleSubscriptionUpdated($pdo, $subscription) {
    $stmt = $pdo->prepare("
        UPDATE subscriptions 
        SET status = ?, 
            current_period_end = FROM_UNIXTIME(?) 
        WHERE user_id IN (
            SELECT id FROM users WHERE stripe_subscription_id = ?
        )
    ");
    $stmt->execute([
        $subscription->status,
        $subscription->current_period_end,
        $subscription->id
    ]);
}

function handleSubscriptionDeleted($pdo, $subscription) {
    // Downgrade to free plan
    $stmt = $pdo->prepare("
        UPDATE users 
        SET plan = 'free', 
            credits = 10 
        WHERE stripe_subscription_id = ?
    ");
    $stmt->execute([$subscription->id]);
    
    $stmt = $pdo->prepare("
        UPDATE subscriptions 
        SET status = 'canceled' 
        WHERE user_id IN (
            SELECT id FROM users WHERE stripe_subscription_id = ?
        )
    ");
    $stmt->execute([$subscription->id]);
}

function handlePaymentSucceeded($pdo, $invoice) {
    // Renew credits for the month
    $customerId = $invoice->customer;
    
    $stmt = $pdo->prepare("SELECT * FROM users WHERE stripe_customer_id = ?");
    $stmt->execute([$customerId]);
    $user = $stmt->fetch();
    
    if ($user) {
        $plans = PLANS;
        $credits = $plans[$user['plan']]['credits'];
        
        // Renew credits
        $stmt = $pdo->prepare("UPDATE users SET credits = ? WHERE id = ?");
        $stmt->execute([$credits, $user['id']]);
        
        // Log credit renewal
        $stmt = $pdo->prepare("
            INSERT INTO credit_history (user_id, amount, type) 
            VALUES (?, ?, 'subscription')
        ");
        $stmt->execute([$user['id'], $credits]);
    }
}

function handlePaymentFailed($pdo, $invoice) {
    $customerId = $invoice->customer;
    
    // Mark subscription as past_due
    $stmt = $pdo->prepare("
        UPDATE subscriptions 
        SET status = 'past_due' 
        WHERE user_id IN (
            SELECT id FROM users WHERE stripe_customer_id = ?
        )
    ");
    $stmt->execute([$customerId]);
}
?>
