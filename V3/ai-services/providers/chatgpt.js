// ChatGPT Service Provider (OpenAI API)
const https = require('https');

class ChatGPTService {
    constructor() {
        this.apiKey = process.env.OPENAI_API_KEY || '';
        this.model = 'gpt-4'; // or 'gpt-3.5-turbo'
        this.apiUrl = 'api.openai.com';
    }

    setApiKey(apiKey) {
        this.apiKey = apiKey;
    }

    isConfigured() {
        return !!this.apiKey;
    }

    async sendMessage(message, options = {}) {
        if (!this.isConfigured()) {
            throw new Error('ChatGPT API key not configured');
        }

        const messages = this.buildMessages(message, options.history);

        const requestData = JSON.stringify({
            model: options.model || this.model,
            messages: messages,
            temperature: options.temperature || 0.7,
            max_tokens: options.maxTokens || 2000
        });

        return new Promise((resolve, reject) => {
            const req = https.request({
                hostname: this.apiUrl,
                path: '/v1/chat/completions',
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiKey}`,
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
                        if (response.error) {
                            reject(new Error(response.error.message));
                        } else {
                            resolve(response.choices[0].message.content);
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

    async streamMessage(message, onChunk, options = {}) {
        if (!this.isConfigured()) {
            throw new Error('ChatGPT API key not configured');
        }

        const messages = this.buildMessages(message, options.history);

        const requestData = JSON.stringify({
            model: options.model || this.model,
            messages: messages,
            temperature: options.temperature || 0.7,
            max_tokens: options.maxTokens || 2000,
            stream: true
        });

        return new Promise((resolve, reject) => {
            const req = https.request({
                hostname: this.apiUrl,
                path: '/v1/chat/completions',
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Length': Buffer.byteLength(requestData)
                }
            }, (res) => {
                let fullResponse = '';

                res.on('data', (chunk) => {
                    const lines = chunk.toString().split('\n').filter(line => line.trim() !== '');
                    
                    for (const line of lines) {
                        if (line.startsWith('data: ')) {
                            const data = line.slice(6);
                            
                            if (data === '[DONE]') {
                                resolve(fullResponse);
                                return;
                            }

                            try {
                                const parsed = JSON.parse(data);
                                const content = parsed.choices[0]?.delta?.content || '';
                                
                                if (content) {
                                    fullResponse += content;
                                    onChunk(content);
                                }
                            } catch (e) {
                                // Skip invalid JSON
                            }
                        }
                    }
                });

                res.on('end', () => {
                    resolve(fullResponse);
                });
            });

            req.on('error', (error) => {
                reject(error);
            });

            req.write(requestData);
            req.end();
        });
    }

    buildMessages(message, history = []) {
        const messages = [];

        // Add system message
        messages.push({
            role: 'system',
            content: 'You are a helpful AI assistant integrated into a web browser.'
        });

        // Add conversation history (last 10 messages)
        const recentHistory = history.slice(-10);
        for (const msg of recentHistory) {
            if (msg.role === 'user' || msg.role === 'assistant') {
                messages.push({
                    role: msg.role,
                    content: msg.content
                });
            }
        }

        // Add current message
        messages.push({
            role: 'user',
            content: message
        });

        return messages;
    }
}

module.exports = ChatGPTService;
