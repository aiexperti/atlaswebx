// Claude Service Provider (Anthropic API)
const https = require('https');

class ClaudeService {
    constructor() {
        this.apiKey = process.env.ANTHROPIC_API_KEY || '';
        this.model = 'claude-3-5-sonnet-20241022'; // Latest Claude model
        this.apiUrl = 'api.anthropic.com';
    }

    setApiKey(apiKey) {
        this.apiKey = apiKey;
    }

    isConfigured() {
        return !!this.apiKey;
    }

    async sendMessage(message, options = {}) {
        if (!this.isConfigured()) {
            throw new Error('Claude API key not configured');
        }

        const messages = this.buildMessages(message, options.history);

        const requestData = JSON.stringify({
            model: options.model || this.model,
            messages: messages,
            max_tokens: options.maxTokens || 4096,
            temperature: options.temperature || 0.7
        });

        return new Promise((resolve, reject) => {
            const req = https.request({
                hostname: this.apiUrl,
                path: '/v1/messages',
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': this.apiKey,
                    'anthropic-version': '2023-06-01',
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
                            resolve(response.content[0].text);
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
            throw new Error('Claude API key not configured');
        }

        const messages = this.buildMessages(message, options.history);

        const requestData = JSON.stringify({
            model: options.model || this.model,
            messages: messages,
            max_tokens: options.maxTokens || 4096,
            temperature: options.temperature || 0.7,
            stream: true
        });

        return new Promise((resolve, reject) => {
            const req = https.request({
                hostname: this.apiUrl,
                path: '/v1/messages',
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': this.apiKey,
                    'anthropic-version': '2023-06-01',
                    'Content-Length': Buffer.byteLength(requestData)
                }
            }, (res) => {
                let fullResponse = '';

                res.on('data', (chunk) => {
                    const lines = chunk.toString().split('\n').filter(line => line.trim() !== '');
                    
                    for (const line of lines) {
                        if (line.startsWith('data: ')) {
                            const data = line.slice(6);

                            try {
                                const parsed = JSON.parse(data);
                                
                                if (parsed.type === 'content_block_delta') {
                                    const content = parsed.delta?.text || '';
                                    if (content) {
                                        fullResponse += content;
                                        onChunk(content);
                                    }
                                }
                                
                                if (parsed.type === 'message_stop') {
                                    resolve(fullResponse);
                                    return;
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

module.exports = ClaudeService;
