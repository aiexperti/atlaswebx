<?php
/**
 * OpenAI API Proxy for Atlasweb - Simplified Version
 */

// Error reporting
error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);
ini_set('error_log', __DIR__ . '/error.log');

// CORS Headers
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json');

// Handle preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit(0);
}

// Only allow POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

// Get API key
$apiKey = getenv('OPENAI_API_KEY');
if (!$apiKey && file_exists(__DIR__ . '/config.php')) {
    require_once __DIR__ . '/config.php';
    $apiKey = defined('OPENAI_API_KEY') ? OPENAI_API_KEY : null;
}

if (!$apiKey) {
    error_log('API key not found');
    http_response_code(500);
    echo json_encode(['error' => 'API key not configured on server']);
    exit;
}

// Get request body
$input = json_decode(file_get_contents('php://input'), true);
if (!$input || !isset($input['messages'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Missing messages array']);
    exit;
}

// Prepare OpenAI request
// Always use gpt-4o-mini - simple and cheap
$openaiData = [
    'model' => 'gpt-4o-mini',
    'messages' => $input['messages'],
    'temperature' => $input['temperature'] ?? 0.7,
    'max_tokens' => $input['max_tokens'] ?? 2000,
];

// Initialize cURL with better error handling
$ch = curl_init('https://api.openai.com/v1/chat/completions');

if ($ch === false) {
    error_log('Failed to initialize cURL');
    http_response_code(500);
    echo json_encode(['error' => 'Server configuration error']);
    exit;
}

curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_POST => true,
    CURLOPT_HTTPHEADER => [
        'Authorization: Bearer ' . $apiKey,
        'Content-Type: application/json'
    ],
    CURLOPT_POSTFIELDS => json_encode($openaiData),
    CURLOPT_TIMEOUT => 60,
    CURLOPT_CONNECTTIMEOUT => 10,
    CURLOPT_SSL_VERIFYPEER => true,
    CURLOPT_SSL_VERIFYHOST => 2,
    CURLOPT_FOLLOWLOCATION => true,
    CURLOPT_MAXREDIRS => 3,
    CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1  // Force HTTP/1.1 to avoid HTTP/2 issues
]);

// Execute request
$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$curlError = curl_error($ch);
$curlErrno = curl_errno($ch);

// Log detailed error information
if ($curlError) {
    error_log('cURL Error #' . $curlErrno . ': ' . $curlError);
    error_log('HTTP Code: ' . $httpCode);
    error_log('API Key length: ' . strlen($apiKey));
    error_log('API Key prefix: ' . substr($apiKey, 0, 7));
}

curl_close($ch);

// Handle cURL errors with more detail
if ($curlError) {
    http_response_code(500);
    echo json_encode([
        'error' => 'Failed to connect to OpenAI API',
        'details' => $curlError,
        'errno' => $curlErrno,
        'debug' => [
            'curl_version' => curl_version()['version'],
            'ssl_version' => curl_version()['ssl_version'],
            'api_key_set' => !empty($apiKey),
            'api_key_length' => strlen($apiKey)
        ]
    ]);
    exit;
}

// Log response for debugging
error_log('OpenAI Response Code: ' . $httpCode);
if ($httpCode !== 200) {
    error_log('OpenAI Response: ' . substr($response, 0, 500));
}

// Return response
http_response_code($httpCode);
echo $response;
?>
