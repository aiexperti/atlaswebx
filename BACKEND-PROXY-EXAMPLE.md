# Backend Proxy for API Key Security

## 🎯 The Problem:

Even with DevTools disabled, API keys in Electron apps can be extracted by:
- Decompiling the app
- Using network monitoring tools
- Inspecting memory

## ✅ The Solution: Backend Proxy

Keep the API key on your server, never in the app.

## 📁 Simple PHP Backend

### 1. Create `api-proxy.php` on your server:

```php
<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *'); // Restrict in production!
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// Your OpenAI API key (store in environment variable!)
$apiKey = getenv('OPENAI_API_KEY');
if (!$apiKey) {
    http_response_code(500);
    echo json_encode(['error' => 'API key not configured']);
    exit;
}

// Get request from your app
$input = json_decode(file_get_contents('php://input'), true);

if (!$input || !isset($input['messages'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid request']);
    exit;
}

// Optional: Add rate limiting, authentication, etc.

// Forward to OpenAI
$ch = curl_init('https://api.openai.com/v1/chat/completions');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Authorization: Bearer ' . $apiKey,
    'Content-Type: application/json'
]);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode([
    'model' => $input['model'] ?? 'gpt-4',
    'messages' => $input['messages'],
    'temperature' => $input['temperature'] ?? 0.7,
    'max_tokens' => $input['max_tokens'] ?? 2000
]));

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

http_response_code($httpCode);
echo $response;
?>
```

### 2. Set Environment Variable on Server:

```bash
# Linux/Mac
export OPENAI_API_KEY="sk-your-key-here"

# Or in .htaccess (Apache)
SetEnv OPENAI_API_KEY "sk-your-key-here"

# Or in php.ini
env[OPENAI_API_KEY] = "sk-your-key-here"
```

### 3. Update Your Electron App:

Find where you call OpenAI API and replace with:

```javascript
// OLD CODE (API key in app - insecure):
const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({
        model: 'gpt-4',
        messages: messages
    })
});

// NEW CODE (using your proxy - secure):
const response = await fetch('https://yourserver.com/api-proxy.php', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({
        model: 'gpt-4',
        messages: messages
    })
});
```

## 🔒 Add Authentication (Optional but Recommended):

### 1. Generate User Tokens:

```php
<?php
// generate-token.php
function generateUserToken($userId) {
    $secret = getenv('APP_SECRET');
    $data = json_encode(['user_id' => $userId, 'exp' => time() + 86400]);
    return base64_encode($data . '.' . hash_hmac('sha256', $data, $secret));
}

echo generateUserToken('user123');
?>
```

### 2. Verify Tokens in Proxy:

```php
<?php
// In api-proxy.php, add before forwarding to OpenAI:

function verifyToken($token) {
    $secret = getenv('APP_SECRET');
    $parts = explode('.', base64_decode($token));
    if (count($parts) !== 2) return false;
    
    $data = $parts[0];
    $hash = $parts[1];
    
    if (hash_hmac('sha256', $data, $secret) !== $hash) return false;
    
    $decoded = json_decode($data, true);
    if ($decoded['exp'] < time()) return false;
    
    return $decoded;
}

$authHeader = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
$token = str_replace('Bearer ', '', $authHeader);

if (!verifyToken($token)) {
    http_response_code(401);
    echo json_encode(['error' => 'Unauthorized']);
    exit;
}
?>
```

### 3. Send Token from Electron:

```javascript
const userToken = 'your-generated-token'; // Store securely

const response = await fetch('https://yourserver.com/api-proxy.php', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userToken}`
    },
    body: JSON.stringify({
        model: 'gpt-4',
        messages: messages
    })
});
```

## 🚀 Node.js Backend (Alternative):

```javascript
// server.js
const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
app.use(cors());
app.use(express.json());

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

app.post('/api/chat', async (req, res) => {
    try {
        const { messages, model = 'gpt-4' } = req.body;
        
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${OPENAI_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ model, messages })
        });
        
        const data = await response.json();
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.listen(3000, () => {
    console.log('Proxy server running on port 3000');
});
```

## 💰 Add Usage Limits:

```php
<?php
// Track usage per user
$userId = $tokenData['user_id'];
$usageFile = "usage/$userId.json";

$usage = file_exists($usageFile) 
    ? json_decode(file_get_contents($usageFile), true) 
    : ['requests' => 0, 'tokens' => 0];

// Check limits
if ($usage['requests'] >= 100) { // 100 requests per day
    http_response_code(429);
    echo json_encode(['error' => 'Rate limit exceeded']);
    exit;
}

// Increment usage
$usage['requests']++;
file_put_contents($usageFile, json_encode($usage));
?>
```

## 📊 Benefits:

✅ **API key never exposed** - Stays on server
✅ **Control usage** - Rate limiting, quotas
✅ **Add authentication** - Only your users can access
✅ **Monitor costs** - Track API usage
✅ **Update easily** - Change API key without updating app
✅ **Add features** - Caching, logging, analytics

## 🎯 Deployment:

### Free Options:
- **Vercel** - Node.js serverless functions
- **Netlify** - Serverless functions
- **Railway** - Full backend hosting
- **Heroku** - Free tier available

### Paid Options:
- **DigitalOcean** - $5/month
- **AWS Lambda** - Pay per request
- **Google Cloud Functions** - Pay per request

## 🔐 Security Checklist:

- ✅ API key in environment variable (not code)
- ✅ CORS restricted to your domain
- ✅ Rate limiting implemented
- ✅ User authentication added
- ✅ HTTPS enabled
- ✅ Input validation
- ✅ Error handling
- ✅ Logging for monitoring

---

**This is the ONLY truly secure way to protect API keys in Electron apps!**
