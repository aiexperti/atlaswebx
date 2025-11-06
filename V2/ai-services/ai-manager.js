// AI Manager - Handles multiple AI service providers
const ChatGPTService = require('./providers/chatgpt');
const ClaudeService = require('./providers/claude');
const GeminiService = require('./providers/gemini');
const KeyManager = require('./key-manager');

class AIManager {
    constructor() {
        this.keyManager = new KeyManager();
        
        this.providers = {
            chatgpt: new ChatGPTService(),
            claude: new ClaudeService(),
            gemini: new GeminiService()
        };
        
        // Load saved API keys
        this.loadApiKeys();
        
        this.currentProvider = 'chatgpt'; // Default provider
        this.conversationHistory = [];
    }

    // Load API keys from secure storage
    loadApiKeys() {
        for (const providerName in this.providers) {
            const apiKey = this.keyManager.getApiKey(providerName);
            if (apiKey) {
                this.providers[providerName].setApiKey(apiKey);
            }
        }
    }

    // Set active AI provider
    setProvider(providerName) {
        if (this.providers[providerName]) {
            this.currentProvider = providerName;
            console.log(`Switched to ${providerName}`);
            return true;
        }
        console.error(`Provider ${providerName} not found`);
        return false;
    }

    // Get current provider
    getCurrentProvider() {
        return this.providers[this.currentProvider];
    }

    // Send message to current AI provider
    async sendMessage(message, options = {}) {
        const provider = this.getCurrentProvider();
        
        try {
            // Add message to history
            this.conversationHistory.push({
                role: 'user',
                content: message,
                timestamp: Date.now()
            });

            // Send to provider
            const response = await provider.sendMessage(message, {
                history: this.conversationHistory,
                ...options
            });

            // Add response to history
            this.conversationHistory.push({
                role: 'assistant',
                content: response,
                timestamp: Date.now(),
                provider: this.currentProvider
            });

            return response;
        } catch (error) {
            console.error(`Error with ${this.currentProvider}:`, error);
            throw error;
        }
    }

    // Stream message (for real-time responses)
    async streamMessage(message, onChunk, options = {}) {
        const provider = this.getCurrentProvider();
        
        if (!provider.streamMessage) {
            throw new Error(`${this.currentProvider} does not support streaming`);
        }

        try {
            return await provider.streamMessage(message, onChunk, {
                history: this.conversationHistory,
                ...options
            });
        } catch (error) {
            console.error(`Error streaming with ${this.currentProvider}:`, error);
            throw error;
        }
    }

    // Clear conversation history
    clearHistory() {
        this.conversationHistory = [];
        console.log('Conversation history cleared');
    }

    // Get conversation history
    getHistory() {
        return this.conversationHistory;
    }

    // Get available providers
    getProviders() {
        return Object.keys(this.providers);
    }

    // Check if provider is configured
    isProviderConfigured(providerName) {
        const provider = this.providers[providerName];
        return provider && provider.isConfigured();
    }

    // Set API key for a provider (saves securely)
    setApiKey(providerName, apiKey) {
        const provider = this.providers[providerName];
        if (provider) {
            // Validate key format
            if (!this.keyManager.validateKeyFormat(providerName, apiKey)) {
                throw new Error(`Invalid API key format for ${providerName}`);
            }
            
            // Save to secure storage
            this.keyManager.setApiKey(providerName, apiKey);
            
            // Set in provider
            provider.setApiKey(apiKey);
            return true;
        }
        return false;
    }

    // Remove API key for a provider
    removeApiKey(providerName) {
        this.keyManager.removeApiKey(providerName);
        const provider = this.providers[providerName];
        if (provider) {
            provider.setApiKey('');
        }
    }
}


module.exports = AIManager;
