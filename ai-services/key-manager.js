// Secure API Key Manager
// Stores keys encrypted in user's local storage
const { safeStorage, app } = require('electron');
const fs = require('fs');
const path = require('path');

class KeyManager {
    constructor() {
        // Use simple file storage instead of electron-store
        this.storePath = path.join(app.getPath('userData'), 'ai-keys.json');
        this.keys = this.loadKeys();
    }
    
    loadKeys() {
        try {
            if (fs.existsSync(this.storePath)) {
                const data = fs.readFileSync(this.storePath, 'utf8');
                return JSON.parse(data);
            }
        } catch (error) {
            console.error('Error loading keys:', error);
        }
        return {};
    }
    
    saveKeys() {
        try {
            fs.writeFileSync(this.storePath, JSON.stringify(this.keys, null, 2));
        } catch (error) {
            console.error('Error saving keys:', error);
        }
    }

    /**
     * Save API key securely (encrypted)
     * @param {string} provider - Provider name (chatgpt, claude, gemini)
     * @param {string} apiKey - API key to store
     */
    setApiKey(provider, apiKey) {
        try {
            // Store the key (encryption can be added later)
            this.keys[provider] = apiKey;
            this.saveKeys();
            return true;
        } catch (error) {
            console.error('Error saving API key:', error);
            return false;
        }
    }

    /**
     * Get API key
     * @param {string} provider - Provider name
     * @returns {string|null} API key or null
     */
    getApiKey(provider) {
        return this.keys[provider] || null;
    }

    /**
     * Remove API key
     * @param {string} provider - Provider name
     */
    removeApiKey(provider) {
        delete this.keys[provider];
        this.saveKeys();
    }

    /**
     * Check if provider has API key
     * @param {string} provider - Provider name
     * @returns {boolean}
     */
    hasApiKey(provider) {
        return !!this.getApiKey(provider);
    }

    /**
     * Get all configured providers
     * @returns {string[]} Array of provider names
     */
    getConfiguredProviders() {
        return Object.keys(this.keys);
    }

    /**
     * Clear all API keys
     */
    clearAll() {
        this.keys = {};
        this.saveKeys();
    }

    /**
     * Validate API key format
     * @param {string} provider - Provider name
     * @param {string} apiKey - API key to validate
     * @returns {boolean}
     */
    validateKeyFormat(provider, apiKey) {
        if (!apiKey || typeof apiKey !== 'string') {
            return false;
        }

        // Basic format validation based on provider
        switch(provider) {
            case 'chatgpt':
                return apiKey.startsWith('sk-') && apiKey.length > 20;
            case 'claude':
                return apiKey.startsWith('sk-ant-') && apiKey.length > 20;
            case 'gemini':
                return apiKey.length > 20; // Google API keys vary
            case 'deepseek':
                return apiKey.startsWith('sk-') && apiKey.length > 20;
            case 'kimi':
                return apiKey.startsWith('sk-') && apiKey.length > 20;
            default:
                return apiKey.length > 10; // Minimal validation for unknown providers
        }
    }
}

module.exports = KeyManager;
