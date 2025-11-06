// Authentication Manager - Web-based login
const Store = require('electron-store');
const https = require('https');

class AuthManager {
    constructor() {
        this.store = new Store({ name: 'auth' });
        this.apiUrl = 'api.lenoir-browser.com'; // Your API server
        // For development: 'localhost:3000'
    }

    /**
     * Check if user is logged in
     */
    isLoggedIn() {
        const token = this.getToken();
        const expiresAt = this.store.get('tokenExpiresAt');
        
        if (!token || !expiresAt) return false;
        if (Date.now() > expiresAt) {
            this.logout();
            return false;
        }
        
        return true;
    }

    /**
     * Get stored auth token
     */
    getToken() {
        return this.store.get('authToken');
    }

    /**
     * Get user info
     */
    getUser() {
        return this.store.get('user');
    }

    /**
     * Login with email/password
     */
    async login(email, password) {
        const requestData = JSON.stringify({ email, password });

        return new Promise((resolve, reject) => {
            const req = https.request({
                hostname: this.apiUrl,
                path: '/api/auth/login',
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
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
                            this.saveAuth(response);
                            resolve(response.user);
                        } else {
                            reject(new Error(response.message || 'Login failed'));
                        }
                    } catch (error) {
                        reject(error);
                    }
                });
            });

            req.on('error', (error) => {
                reject(error);
            });

            req.write(requestData);
            req.end();
        });
    }

    /**
     * Login with OAuth token (from website)
     */
    async loginWithToken(token) {
        return new Promise((resolve, reject) => {
            const req = https.request({
                hostname: this.apiUrl,
                path: '/api/auth/verify',
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
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
                            this.saveAuth(response);
                            resolve(response.user);
                        } else {
                            reject(new Error(response.message || 'Token verification failed'));
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
     * Save authentication data
     */
    saveAuth(authData) {
        this.store.set('authToken', authData.token);
        this.store.set('user', authData.user);
        this.store.set('tokenExpiresAt', Date.now() + (authData.expiresIn || 30 * 24 * 60 * 60 * 1000)); // 30 days
        
        console.log('User logged in:', authData.user.email);
    }

    /**
     * Logout
     */
    logout() {
        this.store.delete('authToken');
        this.store.delete('user');
        this.store.delete('tokenExpiresAt');
        console.log('User logged out');
    }

    /**
     * Refresh token
     */
    async refreshToken() {
        const token = this.getToken();
        if (!token) throw new Error('Not logged in');

        return new Promise((resolve, reject) => {
            const req = https.request({
                hostname: this.apiUrl,
                path: '/api/auth/refresh',
                method: 'POST',
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
                            this.saveAuth(response);
                            resolve(response);
                        } else {
                            reject(new Error(response.message || 'Token refresh failed'));
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
     * Get user subscription info from server
     */
    async getSubscription() {
        const token = this.getToken();
        if (!token) throw new Error('Not logged in');

        return new Promise((resolve, reject) => {
            const req = https.request({
                hostname: this.apiUrl,
                path: '/api/subscription',
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
                            // Cache subscription data
                            this.store.set('subscription', response);
                            resolve(response);
                        } else {
                            reject(new Error(response.message || 'Failed to get subscription'));
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
     * Get cached subscription (offline)
     */
    getCachedSubscription() {
        return this.store.get('subscription');
    }

    /**
     * Open website for login/signup
     */
    openWebsite(page = 'login') {
        const { shell } = require('electron');
        const url = `https://lenoir-browser.com/${page}`;
        shell.openExternal(url);
    }

    /**
     * Open subscription management page
     */
    openSubscriptionPage() {
        const { shell } = require('electron');
        const token = this.getToken();
        const url = `https://lenoir-browser.com/subscription?token=${token}`;
        shell.openExternal(url);
    }
}

module.exports = AuthManager;
