// Credit Manager - Manages user credits from website subscription
const Store = require('electron-store');
const https = require('https');

class CreditManager {
    constructor(authManager) {
        this.authManager = authManager;
        this.store = new Store({ name: 'credits' });
        this.apiUrl = 'api.lenoir-browser.com';
    }

    /**
     * Sync credits from server
     */
    async syncCredits() {
        const token = this.authManager.getToken();
        if (!token) throw new Error('Not logged in');

        return new Promise((resolve, reject) => {
            const req = https.request({
                hostname: this.apiUrl,
                path: '/api/credits',
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            }, (res) => {
                let data = '';

                res.on('data', (chunk) => {
                    data += chunk;
                });

                res.on('end', () => {
                    try {
                        const response = JSON.parse(data);
                        
                        if (res.statusCode === 200) {
                            this.store.set('credits', response.credits);
                            this.store.set('lastSync', Date.now());
                            resolve(response.credits);
                        } else {
                            reject(new Error(response.message || 'Failed to sync credits'));
                        }
                    } catch (error) {
                        reject(error);
                    }
                });
            });

            req.on('error', (error) => {
                reject(error);
            });

            req.end();
        });
    }

    /**
     * Get current credits (cached)
     */
    getCredits() {
        return this.store.get('credits', 0);
    }

    /**
     * Check if user has enough credits
     */
    hasCredits(amount = 1) {
        return this.getCredits() >= amount;
    }

    /**
     * Use credits (deduct and sync with server)
     */
    async useCredits(amount, metadata = {}) {
        const token = this.authManager.getToken();
        if (!token) throw new Error('Not logged in');

        const currentCredits = this.getCredits();
        if (currentCredits < amount) {
            throw new Error('Insufficient credits');
        }

        // Optimistic update
        this.store.set('credits', currentCredits - amount);

        // Sync with server
        const requestData = JSON.stringify({
            amount,
            metadata
        });

        return new Promise((resolve, reject) => {
            const req = https.request({
                hostname: this.apiUrl,
                path: '/api/credits/use',
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                    'Content-Length': Buffer.byteLength(requestData)
                }
            }, (res) => {
                let data = '';

                res.on('data', (chunk) => {
                    data += chunk;
                });

                res.on('end', () => {
                    try {
                        const response = JSON.parse(data);
                        
                        if (res.statusCode === 200) {
                            // Update with server's authoritative value
                            this.store.set('credits', response.remainingCredits);
                            resolve(response);
                        } else {
                            // Rollback on error
                            this.store.set('credits', currentCredits);
                            reject(new Error(response.message || 'Failed to use credits'));
                        }
                    } catch (error) {
                        // Rollback on error
                        this.store.set('credits', currentCredits);
                        reject(error);
                    }
                });
            });

            req.on('error', (error) => {
                // Rollback on error
                this.store.set('credits', currentCredits);
                reject(error);
            });

            req.write(requestData);
            req.end();
        });
    }

    /**
     * Get credit cost for AI model
     */
    getCreditCost(model) {
        const costs = {
            'gpt-3.5-turbo': 1,
            'gpt-4': 3,
            'gpt-4-turbo': 2,
            'claude-3-sonnet': 2,
            'claude-3-opus': 4,
            'claude-3-5-sonnet': 3,
            'gemini-pro': 1,
            'gemini-pro-vision': 2
        };

        return costs[model] || 1;
    }

    /**
     * Get credit history
     */
    async getCreditHistory() {
        const token = this.authManager.getToken();
        if (!token) throw new Error('Not logged in');

        return new Promise((resolve, reject) => {
            const req = https.request({
                hostname: this.apiUrl,
                path: '/api/credits/history',
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            }, (res) => {
                let data = '';

                res.on('data', (chunk) => {
                    data += chunk;
                });

                res.on('end', () => {
                    try {
                        const response = JSON.parse(data);
                        
                        if (res.statusCode === 200) {
                            resolve(response.history);
                        } else {
                            reject(new Error(response.message || 'Failed to get history'));
                        }
                    } catch (error) {
                        reject(error);
                    }
                });
            });

            req.on('error', (error) => {
                reject(error);
            });

            req.end();
        });
    }

    /**
     * Auto-sync credits periodically
     */
    startAutoSync(intervalMinutes = 5) {
        this.syncInterval = setInterval(async () => {
            try {
                await this.syncCredits();
                console.log('Credits synced:', this.getCredits());
            } catch (error) {
                console.error('Auto-sync failed:', error.message);
            }
        }, intervalMinutes * 60 * 1000);
    }

    /**
     * Stop auto-sync
     */
    stopAutoSync() {
        if (this.syncInterval) {
            clearInterval(this.syncInterval);
            this.syncInterval = null;
        }
    }

    /**
     * Get time since last sync
     */
    getLastSyncTime() {
        return this.store.get('lastSync');
    }

    /**
     * Check if sync is needed
     */
    needsSync() {
        const lastSync = this.getLastSyncTime();
        if (!lastSync) return true;
        
        const fiveMinutes = 5 * 60 * 1000;
        return Date.now() - lastSync > fiveMinutes;
    }
}

module.exports = CreditManager;
