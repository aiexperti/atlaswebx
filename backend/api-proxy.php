<?php
/**
 * OpenAI API Proxy for Atlasweb
 * Keeps your API key secure on the server
 */

// Enable error reporting for debugging (disable in production)
error_reporting(E_ALL);
ini_set('display_errors', 0); // Set to 0 in production
ini_set('log_errors', 1);
ini_set('error_log', __DIR__ . '/error.log');

// CORS Headers - Restrict this in production!
header('Access-Control-Allow-Origin: *'); // Change to your domain in production
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit(0);
}

// Only allow POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

// Get OpenAI API key from environment variable
$apiKey = getenv('OPENAI_API_KEY');

// Fallback: Read from config file (create this file separately)
if (!$apiKey && file_exists(__DIR__ . '/config.php')) {
    require_once __DIR__ . '/config.php';
    $apiKey = defined('OPENAI_API_KEY') ? OPENAI_API_KEY : null;
}

if (!$apiKey) {
    http_response_code(500);
    echo json_encode(['error' => 'API key not configured on server']);
    exit;
}

// Get request body
$input = json_decode(file_get_contents('php://input'), true);

if (!$input) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid JSON in request body']);
    exit;
}

// Validate required fields
if (!isset($input['messages']) || !is_array($input['messages'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Missing or invalid messages array']);
    exit;
}

// Optional: Rate limiting (simple file-based)
$rateLimitEnabled = true;
if ($rateLimitEnabled) {
    $clientIp = $_SERVER['REMOTE_ADDR'];
    $rateLimitFile = __DIR__ . '/rate_limit/' . md5($clientIp) . '.json';
    
    // Create rate limit directory if it doesn't exist
    if (!is_dir(__DIR__ . '/rate_limit')) {
        mkdir(__DIR__ . '/rate_limit', 0755, true);
    }
    
    $now = time();
    $rateLimit = ['requests' => [], 'blocked_until' => 0];
    
    if (file_exists($rateLimitFile)) {
        $rateLimit = json_decode(file_get_contents($rateLimitFile), true);
    }
    
    // Check if blocked
    if ($rateLimit['blocked_until'] > $now) {
        http_response_code(429);
        echo json_encode([
            'error' => 'Rate limit exceeded',
            'retry_after' => $rateLimit['blocked_until'] - $now
        ]);
        exit;
    }
    
    // Clean old requests (older than 1 hour)
    $rateLimit['requests'] = array_filter($rateLimit['requests'], function($time) use ($now) {
        return $time > ($now - 3600);
    });
    
    // Check rate limit: 100 requests per hour
    if (count($rateLimit['requests']) >= 100) {
        $rateLimit['blocked_until'] = $now + 3600; // Block for 1 hour
        file_put_contents($rateLimitFile, json_encode($rateLimit));
        
        http_response_code(429);
        echo json_encode([
            'error' => 'Rate limit exceeded',
            'message' => 'Maximum 100 requests per hour',
            'retry_after' => 3600
        ]);
        exit;
    }
    
    // Add current request
    $rateLimit['requests'][] = $now;
    file_put_contents($rateLimitFile, json_encode($rateLimit));
}

// Prepare OpenAI API request
// Always use gpt-4o-mini - simple and cheap
$openaiData = [
    'model' => 'gpt-4o-mini',
    'messages' => $input['messages'],
    'temperature' => $input['temperature'] ?? 0.7,
    'max_tokens' => $input['max_tokens'] ?? 2000,
];

// Add optional parameters if provided
if (isset($input['stream'])) {
    $openaiData['stream'] = $input['stream'];
}
if (isset($input['top_p'])) {
    $openaiData['top_p'] = $input['top_p'];
}
if (isset($input['frequency_penalty'])) {
    $openaiData['frequency_penalty'] = $input['frequency_penalty'];
}
if (isset($input['presence_penalty'])) {
    $openaiData['presence_penalty'] = $input['presence_penalty'];
}

// Initialize cURL
$ch = curl_init('https://api.openai.com/v1/chat/completions');

curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_POST => true,
    CURLOPT_HTTPHEADER => [
        'Authorization: Bearer ' . $apiKey,
        'Content-Type: application/json'
    ],
    CURLOPT_POSTFIELDS => json_encode($openaiData),
    CURLOPT_TIMEOUT => 60,
    CURLOPT_SSL_VERIFYPEER => true,
    CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1  // Force HTTP/1.1 to avoid HTTP/2 issues
]);

// Execute request
$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$curlError = curl_error($ch);
curl_close($ch);

// Handle cURL errors
if ($curlError) {
    error_log('cURL Error: ' . $curlError);
    http_response_code(500);
    echo json_encode(['error' => 'Failed to connect to OpenAI API']);
    exit;
}

// Log usage (optional)
$logEnabled = true;
if ($logEnabled) {
    $logFile = __DIR__ . '/usage.log';
    $logEntry = [
        'timestamp' => date('Y-m-d H:i:s'),
        'ip' => $_SERVER['REMOTE_ADDR'],
        'model' => $openaiData['model'],
        'messages_count' => count($openaiData['messages']),
        'http_code' => $httpCode
    ];
    file_put_contents($logFile, json_encode($logEntry) . "\n", FILE_APPEND);
}

// Return response
http_response_code($httpCode);
echo $response;
?>
