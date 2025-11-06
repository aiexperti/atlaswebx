// AI Services Configuration
module.exports = {
    // Default provider
    defaultProvider: 'chatgpt',

    // Provider settings
    providers: {
        chatgpt: {
            name: 'ChatGPT',
            models: ['gpt-4', 'gpt-3.5-turbo', 'gpt-4-turbo'],
            defaultModel: 'gpt-4',
            maxTokens: 4096,
            supportsStreaming: true,
            requiresApiKey: true
        },
        claude: {
            name: 'Claude',
            models: ['claude-3-5-sonnet-20241022', 'claude-3-opus-20240229', 'claude-3-sonnet-20240229'],
            defaultModel: 'claude-3-5-sonnet-20241022',
            maxTokens: 4096,
            supportsStreaming: true,
            requiresApiKey: true
        },
        gemini: {
            name: 'Gemini',
            models: ['gemini-pro', 'gemini-pro-vision'],
            defaultModel: 'gemini-pro',
            maxTokens: 2048,
            supportsStreaming: true,
            requiresApiKey: true
        }
    },

    // Generation settings
    generation: {
        temperature: 0.7,
        maxTokens: 2000,
        topP: 0.95,
        topK: 40
    },

    // Conversation settings
    conversation: {
        maxHistoryLength: 20, // Maximum messages to keep in history
        autoSave: true,
        saveInterval: 30000 // Save every 30 seconds
    }
};
