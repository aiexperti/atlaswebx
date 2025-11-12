// AI Services Configuration
module.exports = {
    // Default provider
    defaultProvider: 'chatgpt',

    // Provider settings
    providers: {
        chatgpt: {
            name: 'ChatGPT',
            models: [
                'gpt-4o',
                'gpt-4o-mini',
                'gpt-4-turbo',
                'gpt-4',
                'gpt-3.5-turbo',
                'o1',
                'o1-mini',
                'o3-mini',
                'gpt-5-preview',
                'gpt-5'
            ],
            defaultModel: 'gpt-4o-mini',
            maxTokens: 4096,
            supportsStreaming: true,
            requiresApiKey: true
        },
        claude: {
            name: 'Claude',
            models: [
                'claude-3-5-sonnet-20241022',
                'claude-3-5-sonnet-20240620',
                'claude-3-opus-20240229',
                'claude-3-sonnet-20240229',
                'claude-3-haiku-20240307'
            ],
            defaultModel: 'claude-3-5-sonnet-20241022',
            maxTokens: 4096,
            supportsStreaming: true,
            requiresApiKey: true
        },
        gemini: {
            name: 'Gemini',
            models: [
                'gemini-2.0-flash-exp',
                'gemini-1.5-pro',
                'gemini-1.5-flash',
                'gemini-pro',
                'gemini-pro-vision'
            ],
            defaultModel: 'gemini-2.0-flash-exp',
            maxTokens: 8192,
            supportsStreaming: true,
            requiresApiKey: true
        },
        deepseek: {
            name: 'DeepSeek',
            models: [
                'deepseek-chat',
                'deepseek-reasoner'
            ],
            defaultModel: 'deepseek-chat',
            maxTokens: 4096,
            supportsStreaming: true,
            requiresApiKey: true,
            apiUrl: 'api.deepseek.com'
        },
        kimi: {
            name: 'Kimi',
            models: [
                'moonshot-v1-8k',
                'moonshot-v1-32k',
                'moonshot-v1-128k'
            ],
            defaultModel: 'moonshot-v1-32k',
            maxTokens: 32768,
            supportsStreaming: true,
            requiresApiKey: true,
            apiUrl: 'api.moonshot.cn'
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
