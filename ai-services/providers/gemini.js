// Gemini Service Provider (Google AI API)
const https = require('https');

class GeminiService {
    constructor() {
        this.apiKey = process.env.GOOGLE_AI_API_KEY || '';
        this.model = 'gemini-2.0-flash-exp'; // Latest Gemini model
        this.apiUrl = 'generativelanguage.googleapis.com';
    }

    setApiKey(apiKey) {
        this.apiKey = apiKey;
    }

    setModel(model) {
        this.model = model;
        console.log(`✅ Gemini model set to: ${model}`);
    }

    getModel() {
        return this.model;
    }

    isConfigured() {
        return !!this.apiKey;
    }

    async sendMessage(message, options = {}) {
        if (!this.isConfigured()) {
            throw new Error('Gemini API key not configured');
        }

        const contents = this.buildContents(message, options.history);

        const requestData = JSON.stringify({
            contents: contents,
            generationConfig: {
                temperature: options.temperature || 0.7,
                maxOutputTokens: options.maxTokens || 2048,
                topP: 0.95,
                topK: 40
            }
        });

        return new Promise((resolve, reject) => {
            const req = https.request({
                hostname: this.apiUrl,
                path: `/v1/models/${this.model}:generateContent?key=${this.apiKey}`,
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
                        if (response.error) {
                            reject(new Error(response.error.message));
                        } else {
                            const text = response.candidates[0]?.content?.parts[0]?.text || '';
                            resolve(text);
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
            throw new Error('Gemini API key not configured');
        }

        const contents = this.buildContents(message, options.history);

        const requestData = JSON.stringify({
            contents: contents,
            generationConfig: {
                temperature: options.temperature || 0.7,
                maxOutputTokens: options.maxTokens || 2048,
                topP: 0.95,
                topK: 40
            }
        });

        return new Promise((resolve, reject) => {
            const req = https.request({
                hostname: this.apiUrl,
                path: `/v1/models/${this.model}:streamGenerateContent?key=${this.apiKey}`,
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Content-Length': Buffer.byteLength(requestData)
                }
            }, (res) => {
                let fullResponse = '';

                res.on('data', (chunk) => {
                    const lines = chunk.toString().split('\n').filter(line => line.trim() !== '');
                    
                    for (const line of lines) {
                        try {
                            const parsed = JSON.parse(line);
                            const text = parsed.candidates?.[0]?.content?.parts?.[0]?.text || '';
                            
                            if (text) {
                                fullResponse += text;
                                onChunk(text);
                            }
                        } catch (e) {
                            // Skip invalid JSON
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

    buildContents(message, history = []) {
        const contents = [];

        // Add conversation history (last 10 messages)
        const recentHistory = history.slice(-10);
        for (const msg of recentHistory) {
            if (msg.role === 'user') {
                contents.push({
                    role: 'user',
                    parts: [{ text: msg.content }]
                });
            } else if (msg.role === 'assistant') {
                contents.push({
                    role: 'model',
                    parts: [{ text: msg.content }]
                });
            }
        }

        // Add current message
        contents.push({
            role: 'user',
            parts: [{ text: message }]
        });

        return contents;
    }
}

module.exports = GeminiService;
