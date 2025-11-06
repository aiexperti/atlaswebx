<?php
// Database Configuration
define('DB_HOST', 'localhost');
define('DB_NAME', 'lenoir_db');
define('DB_USER', 'your_db_user');
define('DB_PASS', 'your_db_password');

// JWT Configuration
define('JWT_SECRET', 'your-super-secret-jwt-key-change-this-in-production');
define('JWT_EXPIRY', 30 * 24 * 60 * 60); // 30 days

// Stripe Configuration
define('STRIPE_SECRET_KEY', 'sk_live_...');
define('STRIPE_PUBLISHABLE_KEY', 'pk_live_...');
define('STRIPE_WEBHOOK_SECRET', 'whsec_...');

// Stripe Price IDs
define('STRIPE_PRICE_PRO', 'price_pro_monthly');
define('STRIPE_PRICE_ENTERPRISE', 'price_enterprise_monthly');

// AI API Keys (Your keys for providing service)
define('OPENAI_API_KEY', 'sk-...');
define('ANTHROPIC_API_KEY', 'sk-ant-...');
define('GOOGLE_AI_API_KEY', 'AI...');

// App Configuration
define('APP_URL', 'https://lenoir.app');
define('API_URL', 'https://api.lenoir.app');

// Credit Costs
define('CREDIT_COSTS', [
    'gpt-3.5-turbo' => 1,
    'gpt-4' => 3,
    'gpt-4-turbo' => 2,
    'claude-3-sonnet' => 2,
    'claude-3-opus' => 4,
    'claude-3-5-sonnet' => 3,
    'gemini-pro' => 1,
    'gemini-pro-vision' => 2
]);

// Plans Configuration
define('PLANS', [
    'free' => [
        'name' => 'Free',
        'price' => 0,
        'credits' => 10,
        'renewal' => 'daily'
    ],
    'pro' => [
        'name' => 'Pro',
        'price' => 9,
        'credits' => 500,
        'renewal' => 'monthly'
    ],
    'enterprise' => [
        'name' => 'Enterprise',
        'price' => 49,
        'credits' => -1, // Unlimited
        'renewal' => 'monthly'
    ]
]);

// Database Connection
try {
    $pdo = new PDO(
        "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=utf8mb4",
        DB_USER,
        DB_PASS,
        [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false
        ]
    );
} catch (PDOException $e) {
    die("Database connection failed: " . $e->getMessage());
}

// CORS Headers
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}
?>
