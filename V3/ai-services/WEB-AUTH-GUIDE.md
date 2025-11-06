# Web-Based Authentication & Subscription System

## 🌐 Architecture Overview

```
┌─────────────────┐      ┌──────────────────┐      ┌─────────────────┐
│  Lenoir Browser │ ←──→ │  Your Web Server │ ←──→ │  Stripe/Paddle  │
│   (Electron)    │      │   (Node.js API)  │      │   (Payments)    │
└─────────────────┘      └──────────────────┘      └─────────────────┘
        ↓                         ↓
   Local Storage            Database (Users,
   (Auth Token)             Subscriptions,
                            Credits)
```

## 🔐 Authentication Flow

### 1. User Signs Up on Website

**Website: `https://lenoir-browser.com/signup`**

```html
<!-- signup.html -->
<form action="/api/auth/signup" method="POST">
    <input type="email" name="email" required>
    <input type="password" name="password" required>
    <button type="submit">Sign Up</button>
</form>
```

**Server Response:**
```json
{
    "success": true,
    "user": {
        "id": "user_123",
        "email": "user@example.com",
        "plan": "free",
        "credits": 10
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### 2. User Logs In from Browser

**Option A: Email/Password in App**
```javascript
const authManager = new AuthManager();
await authManager.login('user@example.com', 'password');
```

**Option B: Web Login (Recommended)**
```javascript
// Open website for login
authManager.openWebsite('login');

// User logs in on website
// Website redirects to: lenoir://auth?token=xxx

// App receives deep link and saves token
await authManager.loginWithToken(token);
```

### 3. Deep Link Setup

**Register URL Scheme:**
```javascript
// main.js
app.setAsDefaultProtocolClient('lenoir');

app.on('open-url', (event, url) => {
    event.preventDefault();
    
    // Parse: lenoir://auth?token=xxx
    const urlObj = new URL(url);
    if (urlObj.hostname === 'auth') {
        const token = urlObj.searchParams.get('token');
        mainWindow.webContents.send('auth-token', token);
    }
});
```

**Website Redirect:**
```javascript
// After successful login
window.location.href = `lenoir://auth?token=${authToken}`;
```

## 💳 Subscription Flow

### 1. User Subscribes on Website

**Pricing Page: `https://lenoir-browser.com/pricing`**

```html
<div class="pricing-card">
    <h3>Pro Plan</h3>
    <p>$9/month</p>
    <button onclick="subscribe('pro')">Subscribe</button>
</div>

<script>
async function subscribe(plan) {
    // Create Stripe checkout session
    const response = await fetch('/api/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan })
    });
    
    const { url } = await response.json();
    window.location.href = url; // Redirect to Stripe
}
</script>
```

### 2. Stripe Webhook Updates Database

```javascript
// server.js
app.post('/webhook/stripe', async (req, res) => {
    const event = req.body;
    
    if (event.type === 'checkout.session.completed') {
        const session = event.data.object;
        
        // Update user subscription
        await db.users.update({
            where: { id: session.client_reference_id },
            data: {
                plan: 'pro',
                credits: 500,
                subscriptionId: session.subscription
            }
        });
    }
    
    res.json({ received: true });
});
```

### 3. App Syncs Subscription

```javascript
// In Electron app
const authManager = new AuthManager();
const creditManager = new CreditManager(authManager);

// Sync subscription from server
const subscription = await authManager.getSubscription();
const credits = await creditManager.syncCredits();

console.log('Plan:', subscription.plan);
console.log('Credits:', credits);
```

## 🎯 Credit System

### Credit Costs

```javascript
const CREDIT_COSTS = {
    'gpt-3.5-turbo': 1,
    'gpt-4': 3,
    'claude-3-sonnet': 2,
    'gemini-pro': 1
};
```

### Using Credits

```javascript
// Before sending message
const cost = creditManager.getCreditCost('gpt-4'); // 3 credits

if (!creditManager.hasCredits(cost)) {
    // Show "Buy more credits" prompt
    showUpgradePrompt();
    return;
}

// Send message
const response = await aiManager.sendMessage(message);

// Deduct credits (syncs with server)
await creditManager.useCredits(cost, {
    model: 'gpt-4',
    messageId: 'msg_123'
});
```

### Auto-Sync Credits

```javascript
// Start auto-sync every 5 minutes
creditManager.startAutoSync(5);

// Credits automatically updated in background
```

## 🖥️ Server API Endpoints

### Authentication

```
POST   /api/auth/signup       - Create account
POST   /api/auth/login        - Login
POST   /api/auth/verify       - Verify token
POST   /api/auth/refresh      - Refresh token
POST   /api/auth/logout       - Logout
```

### Subscription

```
GET    /api/subscription      - Get user subscription
POST   /api/subscription/upgrade - Upgrade plan
POST   /api/subscription/cancel  - Cancel subscription
```

### Credits

```
GET    /api/credits           - Get current credits
POST   /api/credits/use       - Use credits
GET    /api/credits/history   - Get usage history
POST   /api/credits/purchase  - Buy more credits
```

### Payments

```
POST   /api/create-checkout   - Create Stripe checkout
POST   /webhook/stripe        - Stripe webhook
```

## 📱 UI Integration

### Login Screen

```javascript
// renderer.js
const { ipcRenderer } = require('electron');

// Show login button
document.getElementById('login-btn').addEventListener('click', () => {
    ipcRenderer.send('open-login-website');
});

// Receive auth token from deep link
ipcRenderer.on('auth-token', async (event, token) => {
    try {
        await authManager.loginWithToken(token);
        showDashboard();
    } catch (error) {
        showError('Login failed');
    }
});
```

### Credits Display

```html
<div class="credits-widget">
    <span class="credits-icon">💎</span>
    <span class="credits-count">250</span>
    <button onclick="buyCredits()">Buy More</button>
</div>
```

### Upgrade Prompts

```javascript
function showUpgradePrompt() {
    const modal = `
        <div class="upgrade-modal">
            <h2>Out of Credits!</h2>
            <p>You need 3 credits to use GPT-4</p>
            <p>Current balance: 0 credits</p>
            <button onclick="openSubscriptionPage()">
                Upgrade to Pro - 500 credits/month
            </button>
            <button onclick="buyCredits()">
                Buy Credits
            </button>
        </div>
    `;
    showModal(modal);
}
```

## 🔒 Security Best Practices

### 1. Token Storage
```javascript
// Tokens stored securely
const Store = require('electron-store');
const store = new Store({
    encryptionKey: 'your-secret-key',
    name: 'auth'
});
```

### 2. HTTPS Only
```javascript
// All API calls over HTTPS
const apiUrl = 'https://api.lenoir-browser.com';
```

### 3. Token Expiration
```javascript
// Tokens expire after 30 days
// Auto-refresh before expiration
if (tokenExpiresIn < 7 * 24 * 60 * 60 * 1000) {
    await authManager.refreshToken();
}
```

### 4. Rate Limiting
```javascript
// Server-side rate limiting
app.use('/api', rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
}));
```

## 💰 Pricing Tiers

### Free Tier
```json
{
    "plan": "free",
    "price": 0,
    "credits": 10,
    "renewal": "daily",
    "features": ["gpt-3.5-turbo"]
}
```

### Pro Tier
```json
{
    "plan": "pro",
    "price": 9,
    "credits": 500,
    "renewal": "monthly",
    "features": ["all-models", "priority-support"]
}
```

### Enterprise Tier
```json
{
    "plan": "enterprise",
    "price": 49,
    "credits": -1,
    "renewal": "monthly",
    "features": ["unlimited", "api-access", "white-label"]
}
```

## 📊 Analytics & Tracking

### Track Usage
```javascript
// Send usage analytics to server
await fetch('/api/analytics/usage', {
    method: 'POST',
    headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({
        model: 'gpt-4',
        credits: 3,
        timestamp: Date.now()
    })
});
```

### Dashboard Metrics
- Total messages sent
- Credits used
- Most used AI model
- Daily active usage
- Cost per user

## 🚀 Deployment

### 1. Website (Frontend)
```bash
# Deploy to Vercel/Netlify
vercel deploy
```

### 2. API Server (Backend)
```bash
# Deploy to Heroku/Railway/Render
git push heroku main
```

### 3. Database
```bash
# Use PostgreSQL/MongoDB
# Hosted on Railway/PlanetScale/MongoDB Atlas
```

### 4. Stripe Setup
```bash
# Add webhook endpoint
https://api.lenoir-browser.com/webhook/stripe
```

## 📝 Example Server Implementation

See `server-example/` folder for complete Node.js/Express server with:
- User authentication (JWT)
- Stripe integration
- Credit management
- Database schema
- API endpoints

## 🎯 Summary

**User Journey:**
1. Visit website → Sign up
2. Subscribe on website (Stripe)
3. Download Lenoir Browser
4. Login in app (deep link)
5. Credits synced automatically
6. Use AI features
7. Credits deducted in real-time
8. Buy more credits on website

**Benefits:**
- ✅ Centralized subscription management
- ✅ Secure payment processing (Stripe)
- ✅ Real-time credit sync
- ✅ Easy upgrades/downgrades
- ✅ Professional user experience
- ✅ Scalable architecture

This is how professional apps like Raycast, Superhuman, and Arc handle subscriptions! 🚀
