// Kimi Service Provider (Moonshot AI API)
const https = require('https');

class KimiService {
    constructor() {
        this.apiKey = '';
        this.model = 'moonshot-v1-32k'; // Default model
        this.apiUrl = 'api.moonshot.cn';
    }

    setApiKey(apiKey) {
        this.apiKey = apiKey;
    }

    setModel(model) {
        this.model = model;
        console.log(`✅ Kimi model set to: ${model}`);
    }

    getModel() {
        return this.model;
    }

    isConfigured() {
        return !!this.apiKey;
    }

    async sendMessage(message, options = {}) {
        if (!this.isConfigured()) {
            throw new Error('Kimi API key not configured');
        }

        const messages = this.buildMessages(message, options.history);

        const requestData = JSON.stringify({
            model: this.model,
            messages: messages,
            temperature: options.temperature || 0.7,
            max_tokens: options.maxTokens || 2000,
            stream: false
        });

        return new Promise((resolve, reject) => {
            const requestOptions = {
                hostname: this.apiUrl,
                port: 443,
                path: '/v1/chat/completions',
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Length': Buffer.byteLength(requestData)
                }
            };

            const req = https.request(requestOptions, (res) => {
                let data = '';

                res.on('data', (chunk) => {
                    data += chunk;
                });

                res.on('end', () => {
                    try {
                        const response = JSON.parse(data);
                        
                        if (response.error) {
                            reject(new Error(`Kimi API error: ${response.error.message}`));
                            return;
                        }

                        if (response.choices && response.choices.length > 0) {
                            const content = response.choices[0].message.content;
                            resolve(content);
                        } else {
                            reject(new Error('Invalid response from Kimi API'));
                        }
                    } catch (error) {
                        reject(new Error(`Failed to parse Kimi response: ${error.message}`));
                    }
                });
            });

            req.on('error', (error) => {
                reject(new Error(`Kimi API request failed: ${error.message}`));
            });

            req.write(requestData);
            req.end();
        });
    }

    async streamMessage(message, onChunk, options = {}) {
        if (!this.isConfigured()) {
            throw new Error('Kimi API key not configured');
        }

        const messages = this.buildMessages(message, options.history);

        const requestData = JSON.stringify({
            model: this.model,
            messages: messages,
            temperature: options.temperature || 0.7,
            max_tokens: options.maxTokens || 2000,
            stream: true
        });

        return new Promise((resolve, reject) => {
            const requestOptions = {
                hostname: this.apiUrl,
                port: 443,
                path: '/v1/chat/completions',
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Length': Buffer.byteLength(requestData)
                }
            };

            let fullResponse = '';

            const req = https.request(requestOptions, (res) => {
                res.on('data', (chunk) => {
                    const lines = chunk.toString().split('\n');
                    
                    for (const line of lines) {
                        if (line.startsWith('data: ')) {
                            const data = line.slice(6);
                            
                            if (data === '[DONE]') {
                                resolve(fullResponse);
                                return;
                            }

                            try {
                                const parsed = JSON.parse(data);
                                
                                if (parsed.choices && parsed.choices[0].delta?.content) {
                                    const content = parsed.choices[0].delta.content;
                                    fullResponse += content;
                                    onChunk(content);
                                }
                            } catch (e) {
                                // Skip invalid JSON chunks
                            }
                        }
                    }
                });

                res.on('end', () => {
                    resolve(fullResponse);
                });
            });

            req.on('error', (error) => {
                reject(new Error(`Kimi streaming failed: ${error.message}`));
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
            content: 'You are Kimi, an AI assistant powered by Moonshot AI. You are helpful, creative, and friendly.'
        });

        // Add recent history (last 10 messages)
        const recentHistory = history.slice(-10);
        for (const msg of recentHistory) {
            messages.push({
                role: msg.role,
                content: msg.content
            });
        }

        // Add current message if not already in history
        if (!history.length || history[history.length - 1].content !== message) {
            messages.push({
                role: 'user',
                content: message
            });
        }

        return messages;
    }
}

module.exports = KimiService;
