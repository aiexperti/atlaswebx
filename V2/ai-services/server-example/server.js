// Example Node.js/Express Server for Lenoir Browser
// This handles authentication, subscriptions, and credits

const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const app = express();
app.use(cors());
app.use(express.json());

// JWT Secret (use environment variable in production)
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this';

// In-memory database (use PostgreSQL/MongoDB in production)
const users = new Map();
const sessions = new Map();

// ==================== AUTH ENDPOINTS ====================

// Sign up
app.post('/api/auth/signup', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        if (users.has(email)) {
            return res.status(400).json({ message: 'Email already exists' });
        }
        
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = {
            id: `user_${Date.now()}`,
            email,
            password: hashedPassword,
            plan: 'free',
            credits: 10,
            createdAt: new Date()
        };
        
        users.set(email, user);
        
        const token = jwt.sign({ userId: user.id, email }, JWT_SECRET, { expiresIn: '30d' });
        
        res.json({
            success: true,
            user: {
                id: user.id,
                email: user.email,
                plan: user.plan,
                credits: user.credits
            },
            token,
            expiresIn: 30 * 24 * 60 * 60 * 1000
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Login
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        const user = users.get(email);
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        
        const token = jwt.sign({ userId: user.id, email }, JWT_SECRET, { expiresIn: '30d' });
        
        res.json({
            success: true,
            user: {
                id: user.id,
                email: user.email,
                plan: user.plan,
                credits: user.credits
            },
            token,
            expiresIn: 30 * 24 * 60 * 60 * 1000
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Verify token
app.post('/api/auth/verify', authenticateToken, (req, res) => {
    const user = users.get(req.user.email);
    res.json({
        success: true,
        user: {
            id: user.id,
            email: user.email,
            plan: user.plan,
            credits: user.credits
        },
        token: req.token,
        expiresIn: 30 * 24 * 60 * 60 * 1000
    });
});

// ==================== SUBSCRIPTION ENDPOINTS ====================

// Get subscription
app.get('/api/subscription', authenticateToken, (req, res) => {
    const user = users.get(req.user.email);
    res.json({
        plan: user.plan,
        credits: user.credits,
        status: 'active',
        renewsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    });
});

// Create Stripe checkout session
app.post('/api/create-checkout', authenticateToken, async (req, res) => {
    try {
        const { plan } = req.body;
        const user = users.get(req.user.email);
        
        const prices = {
            pro: 'price_pro_monthly', // Replace with your Stripe price ID
            enterprise: 'price_enterprise_monthly'
        };
        
        const session = await stripe.checkout.sessions.create({
            customer_email: user.email,
            client_reference_id: user.id,
            payment_method_types: ['card'],
            line_items: [{
                price: prices[plan],
                quantity: 1,
            }],
            mode: 'subscription',
            success_url: `https://lenoir-browser.com/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: 'https://lenoir-browser.com/pricing',
        });
        
        res.json({ url: session.url });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Stripe webhook
app.post('/webhook/stripe', express.raw({ type: 'application/json' }), async (req, res) => {
    const sig = req.headers['stripe-signature'];
    let event;
    
    try {
        event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    } catch (err) {
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }
    
    if (event.type === 'checkout.session.completed') {
        const session = event.data.object;
        const userId = session.client_reference_id;
        
        // Update user subscription
        for (const [email, user] of users.entries()) {
            if (user.id === userId) {
                user.plan = 'pro';
                user.credits = 500;
                user.subscriptionId = session.subscription;
                break;
            }
        }
    }
    
    res.json({ received: true });
});

// ==================== CREDITS ENDPOINTS ====================

// Get credits
app.get('/api/credits', authenticateToken, (req, res) => {
    const user = users.get(req.user.email);
    res.json({ credits: user.credits });
});

// Use credits
app.post('/api/credits/use', authenticateToken, (req, res) => {
    try {
        const { amount, metadata } = req.body;
        const user = users.get(req.user.email);
        
        if (user.credits < amount) {
            return res.status(400).json({ message: 'Insufficient credits' });
        }
        
        user.credits -= amount;
        
        // Log usage (in production, save to database)
        console.log(`User ${user.email} used ${amount} credits for ${metadata.model}`);
        
        res.json({
            success: true,
            remainingCredits: user.credits,
            used: amount
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get credit history
app.get('/api/credits/history', authenticateToken, (req, res) => {
    // In production, fetch from database
    res.json({
        history: [
            { date: new Date(), amount: -3, model: 'gpt-4', type: 'usage' },
            { date: new Date(), amount: 500, type: 'subscription' }
        ]
    });
});

// ==================== MIDDLEWARE ====================

function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
        return res.status(401).json({ message: 'No token provided' });
    }
    
    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ message: 'Invalid token' });
        }
        req.user = user;
        req.token = token;
        next();
    });
}

// ==================== START SERVER ====================

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`API: http://localhost:${PORT}/api`);
});
