// Subscription & Usage Manager
const Store = require('electron-store');

class SubscriptionManager {
    constructor() {
        this.store = new Store({ name: 'subscription' });
        this.plans = {
            free: {
                name: 'Free',
                price: 0,
                dailyLimit: 10,
                models: ['gpt-3.5-turbo'],
                features: ['basic-chat']
            },
            pro: {
                name: 'Pro',
                price: 9,
                monthlyLimit: 500,
                models: ['gpt-3.5-turbo', 'gpt-4', 'claude-3-sonnet', 'gemini-pro'],
                features: ['basic-chat', 'web-search', 'file-upload', 'priority-support']
            },
            enterprise: {
                name: 'Enterprise',
                price: 49,
                monthlyLimit: -1, // Unlimited
                models: ['all'],
                features: ['all']
            }
        };
    }

    // Get current user plan
    getCurrentPlan() {
        return this.store.get('plan', 'free');
    }

    // Set user plan
    setPlan(planName, expiresAt = null) {
        if (!this.plans[planName]) {
            throw new Error('Invalid plan');
        }

        this.store.set('plan', planName);
        this.store.set('planExpiresAt', expiresAt || Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
        this.resetUsage();
    }

    // Check if user can send message
    canSendMessage(model = 'gpt-3.5-turbo') {
        const plan = this.getCurrentPlan();
        const planDetails = this.plans[plan];

        // Check if plan expired
        if (this.isPlanExpired()) {
            return { allowed: false, reason: 'Plan expired. Please renew.' };
        }

        // Check model access
        if (!planDetails.models.includes(model) && !planDetails.models.includes('all')) {
            return { allowed: false, reason: `Upgrade to use ${model}` };
        }

        // Check usage limits
        const usage = this.getUsage();
        
        if (planDetails.dailyLimit && usage.daily >= planDetails.dailyLimit) {
            return { allowed: false, reason: 'Daily limit reached. Upgrade to Pro!' };
        }

        if (planDetails.monthlyLimit > 0 && usage.monthly >= planDetails.monthlyLimit) {
            return { allowed: false, reason: 'Monthly limit reached. Upgrade to Enterprise!' };
        }

        return { allowed: true };
    }

    // Record message usage
    recordUsage() {
        const today = new Date().toDateString();
        const thisMonth = new Date().toISOString().slice(0, 7); // YYYY-MM

        // Daily usage
        const dailyKey = `usage.daily.${today}`;
        const dailyCount = this.store.get(dailyKey, 0);
        this.store.set(dailyKey, dailyCount + 1);

        // Monthly usage
        const monthlyKey = `usage.monthly.${thisMonth}`;
        const monthlyCount = this.store.get(monthlyKey, 0);
        this.store.set(monthlyKey, monthlyCount + 1);

        // Total usage
        const totalCount = this.store.get('usage.total', 0);
        this.store.set('usage.total', totalCount + 1);
    }

    // Get current usage
    getUsage() {
        const today = new Date().toDateString();
        const thisMonth = new Date().toISOString().slice(0, 7);

        return {
            daily: this.store.get(`usage.daily.${today}`, 0),
            monthly: this.store.get(`usage.monthly.${thisMonth}`, 0),
            total: this.store.get('usage.total', 0)
        };
    }

    // Reset usage (for new billing period)
    resetUsage() {
        const thisMonth = new Date().toISOString().slice(0, 7);
        this.store.set(`usage.monthly.${thisMonth}`, 0);
    }

    // Check if plan expired
    isPlanExpired() {
        const expiresAt = this.store.get('planExpiresAt');
        if (!expiresAt) return false;
        return Date.now() > expiresAt;
    }

    // Get plan details
    getPlanDetails(planName = null) {
        const plan = planName || this.getCurrentPlan();
        return this.plans[plan];
    }

    // Get all plans (for pricing page)
    getAllPlans() {
        return this.plans;
    }

    // Check if user has feature access
    hasFeature(featureName) {
        const plan = this.getCurrentPlan();
        const planDetails = this.plans[plan];
        return planDetails.features.includes(featureName) || planDetails.features.includes('all');
    }

    // Get usage stats for display
    getUsageStats() {
        const plan = this.getCurrentPlan();
        const planDetails = this.plans[plan];
        const usage = this.getUsage();

        return {
            plan: plan,
            planName: planDetails.name,
            dailyUsed: usage.daily,
            dailyLimit: planDetails.dailyLimit || '∞',
            monthlyUsed: usage.monthly,
            monthlyLimit: planDetails.monthlyLimit > 0 ? planDetails.monthlyLimit : '∞',
            totalUsed: usage.total,
            expiresAt: this.store.get('planExpiresAt'),
            daysRemaining: this.getDaysRemaining()
        };
    }

    // Get days remaining in subscription
    getDaysRemaining() {
        const expiresAt = this.store.get('planExpiresAt');
        if (!expiresAt) return null;
        const days = Math.ceil((expiresAt - Date.now()) / (24 * 60 * 60 * 1000));
        return Math.max(0, days);
    }
}

module.exports = SubscriptionManager;
