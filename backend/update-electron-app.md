# Update Electron App to Use Backend Proxy

## 🎯 What to Change:

You need to find where your app calls the OpenAI API and update it to use your backend proxy instead.

## 🔍 Find Your OpenAI API Calls:

Search your project for OpenAI API calls:

```bash
# Search for OpenAI API calls
grep -r "api.openai.com" .
grep -r "OPENAI_API_KEY" .
grep -r "chat/completions" .
```

Common locations:
- `ai-assistant/` folder
- `main.js`
- `renderer.js`
- Any AI-related JavaScript files

## ✏️ Update the Code:

### Example 1: Simple Fetch Call

**Before:**
```javascript
async function callOpenAI(messages) {
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
    
    return await response.json();
}
```

**After:**
```javascript
async function callOpenAI(messages) {
    // Use your backend proxy instead
    const response = await fetch('https://yourserver.com/backend/api-proxy.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            model: 'gpt-4',
            messages: messages
        })
    });
    
    return await response.json();
}
```

### Example 2: With OpenAI SDK

**Before:**
```javascript
const { Configuration, OpenAIApi } = require('openai');

const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

const response = await openai.createChatCompletion({
    model: 'gpt-4',
    messages: messages
});
```

**After:**
```javascript
// Remove OpenAI SDK, use direct fetch to your backend
async function callOpenAI(messages) {
    const response = await fetch('https://yourserver.com/backend/api-proxy.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            model: 'gpt-4',
            messages: messages
        })
    });
    
    return await response.json();
}
```

### Example 3: With Error Handling

```javascript
async function callOpenAI(messages, model = 'gpt-4') {
    try {
        const response = await fetch('https://yourserver.com/backend/api-proxy.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: model,
                messages: messages,
                temperature: 0.7,
                max_tokens: 2000
            })
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'API request failed');
        }
        
        const data = await response.json();
        return data;
        
    } catch (error) {
        console.error('OpenAI API Error:', error);
        
        // Handle rate limiting
        if (error.message.includes('Rate limit')) {
            throw new Error('Too many requests. Please try again later.');
        }
        
        throw error;
    }
}
```

## 🔧 Create a Centralized API Module:

Create `api/openai.js`:

```javascript
/**
 * OpenAI API Client
 * Uses backend proxy for security
 */

const BACKEND_URL = 'https://yourserver.com/backend/api-proxy.php';

class OpenAIClient {
    constructor(backendUrl = BACKEND_URL) {
        this.backendUrl = backendUrl;
    }
    
    async chat(messages, options = {}) {
        const {
            model = 'gpt-4',
            temperature = 0.7,
            max_tokens = 2000,
            stream = false
        } = options;
        
        try {
            const response = await fetch(this.backendUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model,
                    messages,
                    temperature,
                    max_tokens,
                    stream
                })
            });
            
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || `HTTP ${response.status}`);
            }
            
            return await response.json();
            
        } catch (error) {
            console.error('OpenAI API Error:', error);
            throw this.handleError(error);
        }
    }
    
    handleError(error) {
        if (error.message.includes('Rate limit')) {
            return new Error('Too many requests. Please wait and try again.');
        }
        if (error.message.includes('API key')) {
            return new Error('Server configuration error. Please contact support.');
        }
        return error;
    }
}

// Export singleton instance
module.exports = new OpenAIClient();
```

**Then use it anywhere:**
```javascript
const openai = require('./api/openai');

// Simple usage
const response = await openai.chat([
    { role: 'user', content: 'Hello!' }
]);

// With options
const response = await openai.chat(messages, {
    model: 'gpt-4',
    temperature: 0.9,
    max_tokens: 1000
});
```

## 🧪 Testing:

### 1. Test Backend First:
```bash
curl -X POST https://yourserver.com/backend/api-proxy.php \
  -H "Content-Type: application/json" \
  -d '{"model":"gpt-4","messages":[{"role":"user","content":"Test"}]}'
```

### 2. Test in Electron:
```javascript
// Add this to your app for testing
async function testBackend() {
    try {
        const response = await fetch('https://yourserver.com/backend/api-proxy.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: 'gpt-4',
                messages: [{ role: 'user', content: 'Hello!' }]
            })
        });
        
        const data = await response.json();
        console.log('Backend test successful:', data);
        alert('Backend connected successfully!');
    } catch (error) {
        console.error('Backend test failed:', error);
        alert('Backend connection failed: ' + error.message);
    }
}

// Call this on app startup
testBackend();
```

## 🔄 Migration Checklist:

- [ ] Upload backend files to server
- [ ] Create `config.php` with your API key
- [ ] Test backend with cURL
- [ ] Find all OpenAI API calls in your app
- [ ] Update API calls to use backend URL
- [ ] Remove API key from `.env` file
- [ ] Test in development mode
- [ ] Build and test production app
- [ ] Monitor usage logs

## 📝 Environment Variables:

Update your `.env` file:

**Before:**
```bash
OPENAI_API_KEY=sk-your-key-here
```

**After:**
```bash
# API key now on backend server
BACKEND_API_URL=https://yourserver.com/backend/api-proxy.php
```

**In your code:**
```javascript
const BACKEND_URL = process.env.BACKEND_API_URL || 'https://yourserver.com/backend/api-proxy.php';
```

## 🚀 Benefits After Migration:

✅ API key never exposed to users
✅ Rate limiting automatically enforced
✅ Usage tracking and monitoring
✅ Can update API key without rebuilding app
✅ Can add authentication later
✅ Better error handling
✅ Cost control

---

**Need help finding your API calls?** Let me know and I can search your codebase!
