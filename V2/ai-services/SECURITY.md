# API Key Security Guide

## 🔐 Best Practices for Distributed Software

### ❌ NEVER Do This:
```javascript
// DON'T hardcode API keys
const apiKey = 'sk-1234567890abcdef'; // NEVER!

// DON'T commit .env files
// DON'T include keys in source code
// DON'T ship keys with the application
```

### ✅ DO This Instead:

## 1. User-Provided Keys (Recommended)

**Users add their own API keys through Settings UI**

### Advantages:
- ✅ No cost to you
- ✅ Users control their usage
- ✅ No key management burden
- ✅ Scalable
- ✅ Secure

### Implementation:

```javascript
// Users enter keys in Settings
// Keys are encrypted and stored locally
const aiManager = new AIManager();
aiManager.setApiKey('chatgpt', userProvidedKey);
```

### User Flow:
1. User opens Settings
2. Goes to "AI Services" tab
3. Enters their API key
4. Key is encrypted and saved
5. AI features become available

---

## 2. Proxy Server (Advanced)

**Route requests through your own server**

### Advantages:
- ✅ Hide API keys from users
- ✅ Monitor usage
- ✅ Rate limiting
- ✅ Cost control

### Disadvantages:
- ❌ Server costs
- ❌ Maintenance burden
- ❌ Latency
- ❌ Privacy concerns

### Architecture:
```
[Browser] → [Your Server] → [OpenAI/Claude/Gemini]
           (Has API keys)
```

---

## 3. Freemium Model

**Provide limited free usage, charge for more**

### Implementation:
```javascript
// Free tier: 10 messages/day with your keys
// Paid tier: Unlimited with user's keys or your keys
```

### Advantages:
- ✅ User can try before buying keys
- ✅ Revenue opportunity
- ✅ Controlled costs

---

## 4. Hybrid Approach (Best)

**Combine multiple methods:**

```javascript
class AIManager {
    async sendMessage(message) {
        // 1. Check if user has their own key
        if (this.hasUserKey()) {
            return this.useUserKey(message);
        }
        
        // 2. Check if free tier available
        if (this.hasFreeCredits()) {
            return this.useProxyServer(message);
        }
        
        // 3. Prompt user to add key
        throw new Error('Please add your API key in Settings');
    }
}
```

---

## Our Implementation

### Current Setup: User-Provided Keys

**How it works:**

1. **Secure Storage**
   ```javascript
   // Keys encrypted with Electron's safeStorage
   const encrypted = safeStorage.encryptString(apiKey);
   store.set('keys.chatgpt', encrypted);
   ```

2. **Key Validation**
   ```javascript
   // Validate format before saving
   validateKeyFormat('chatgpt', 'sk-...');
   ```

3. **Automatic Loading**
   ```javascript
   // Keys loaded on startup
   aiManager.loadApiKeys();
   ```

### Storage Location:
- **macOS:** `~/Library/Application Support/lenoir-browser/ai-keys.json`
- **Windows:** `%APPDATA%/lenoir-browser/ai-keys.json`
- **Linux:** `~/.config/lenoir-browser/ai-keys.json`

### Security Features:
- ✅ Encrypted at rest (Electron safeStorage)
- ✅ Never sent to our servers
- ✅ Stored locally only
- ✅ Format validation
- ✅ Easy to remove

---

## For Users: How to Get API Keys

### ChatGPT (OpenAI)
1. Go to https://platform.openai.com/api-keys
2. Sign up / Log in
3. Click "Create new secret key"
4. Copy the key (starts with `sk-`)
5. Paste in Lenoir Settings

**Cost:** Pay as you go (~$0.002 per message)

### Claude (Anthropic)
1. Go to https://console.anthropic.com/
2. Sign up / Log in
3. Navigate to API Keys
4. Create new key (starts with `sk-ant-`)
5. Paste in Lenoir Settings

**Cost:** Pay as you go (~$0.003 per message)

### Gemini (Google)
1. Go to https://makersuite.google.com/app/apikey
2. Sign in with Google
3. Create API key (starts with `AI`)
4. Paste in Lenoir Settings

**Cost:** Free tier available, then pay as you go

---

## Privacy & Security

### What We Store:
- ✅ Encrypted API keys (locally only)
- ✅ Conversation history (locally only)
- ✅ User preferences (locally only)

### What We DON'T Store:
- ❌ Your API keys on our servers
- ❌ Your conversations on our servers
- ❌ Any personal data

### Data Flow:
```
[Your Computer] → [AI Provider (OpenAI/Anthropic/Google)]
                  ↑
            Your API key used directly
            No middleman
```

---

## For Developers

### Adding New Providers:

1. Create provider file:
```javascript
// providers/newai.js
class NewAIService {
    setApiKey(key) { this.apiKey = key; }
    isConfigured() { return !!this.apiKey; }
    async sendMessage(msg) { /* implementation */ }
}
```

2. Register in AIManager:
```javascript
this.providers.newai = new NewAIService();
```

3. Add to KeyManager validation:
```javascript
case 'newai':
    return apiKey.startsWith('na-') && apiKey.length > 20;
```

---

## FAQ

**Q: Are my API keys safe?**
A: Yes, they're encrypted and stored only on your computer.

**Q: Can you see my API keys?**
A: No, we never have access to your keys.

**Q: What if I lose my keys?**
A: You can regenerate them from the AI provider's website.

**Q: Can I use the app without API keys?**
A: No, you need at least one provider configured.

**Q: Which provider is cheapest?**
A: Gemini has a free tier. ChatGPT and Claude are pay-as-you-go.

**Q: How much will it cost?**
A: Typical usage: $1-5/month for casual use.

---

## Recommendations

### For Distribution:

1. ✅ **Use user-provided keys** (current implementation)
2. ✅ **Provide clear setup instructions**
3. ✅ **Link to API key pages**
4. ✅ **Show cost estimates**
5. ✅ **Offer multiple providers**

### For Future:

- Consider adding a free tier with proxy server
- Implement usage tracking
- Add cost calculator
- Provide key rotation
- Support team/organization keys

---

## Summary

**Current Approach: User-Provided Keys**
- ✅ Secure
- ✅ Scalable
- ✅ No cost to you
- ✅ Privacy-friendly
- ✅ Easy to implement

This is the **best approach for distributed software** where users control their own AI usage and costs.
