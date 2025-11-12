// AI Manager - Handles multiple AI service providers
const ChatGPTService = require('./providers/chatgpt');
const ClaudeService = require('./providers/claude');
const GeminiService = require('./providers/gemini');
const KimiService = require('./providers/kimi');
const KeyManager = require('./key-manager');

class AIManager {
    constructor() {
        this.keyManager = new KeyManager();
        this.config = require('./config');
        
        this.providers = {
            chatgpt: new ChatGPTService(),
            claude: new ClaudeService(),
            gemini: new GeminiService(),
            kimi: new KimiService()
        };
        
        // Load saved API keys
        this.loadApiKeys();
        
        this.currentProvider = 'chatgpt'; // Default provider
        this.currentModels = {}; // Store selected model for each provider
        this.conversationHistory = [];
        
        // Load saved model selections
        this.loadModelSelections();
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

    // Load saved model selections from localStorage
    loadModelSelections() {
        try {
            if (typeof localStorage !== 'undefined') {
                const saved = localStorage.getItem('ai-model-selections');
                if (saved) {
                    this.currentModels = JSON.parse(saved);
                    console.log('✅ Loaded model selections:', this.currentModels);
                }
            }
        } catch (error) {
            console.error('Failed to load model selections:', error);
        }
    }

    // Save model selections to localStorage
    saveModelSelections() {
        try {
            if (typeof localStorage !== 'undefined') {
                localStorage.setItem('ai-model-selections', JSON.stringify(this.currentModels));
                console.log('💾 Saved model selections:', this.currentModels);
            }
        } catch (error) {
            console.error('Failed to save model selections:', error);
        }
    }

    // Get current model for a provider
    getCurrentModel(providerName = null) {
        const provider = providerName || this.currentProvider;
        return this.currentModels[provider] || this.config.providers[provider]?.defaultModel;
    }

    // Set model for a provider
    setModel(providerName, modelName) {
        const providerConfig = this.config.providers[providerName];
        if (!providerConfig) {
            console.error(`Provider ${providerName} not found`);
            return false;
        }

        if (!providerConfig.models.includes(modelName)) {
            console.error(`Model ${modelName} not available for ${providerName}`);
            return false;
        }

        this.currentModels[providerName] = modelName;
        this.saveModelSelections();
        
        // Update the provider's model
        const provider = this.providers[providerName];
        if (provider && provider.setModel) {
            provider.setModel(modelName);
        }
        
        console.log(`✅ Set ${providerName} model to ${modelName}`);
        return true;
    }

    // Get available models for a provider
    getAvailableModels(providerName = null) {
        const provider = providerName || this.currentProvider;
        return this.config.providers[provider]?.models || [];
    }

    // Get all provider configurations
    getProviderConfigs() {
        return this.config.providers;
    }
}


module.exports = AIManager;
