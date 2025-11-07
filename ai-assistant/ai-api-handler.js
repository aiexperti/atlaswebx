/**
 * AI API Handler
 * Handles all API calls to different AI providers
 * Separate from main logic
 */

class AIAPIHandler {
    constructor() {
        this.settings = this.loadSettings();
    }

    /**
     * Resolve OpenAI model to use.
     * If user selected gpt-5, we will call the Responses API with model 'gpt-5'.
     */
    getOpenAIModel() {
        return this.settings.selectedModel || 'gpt-5';
    }

    /**
     * Load AI settings from localStorage with .env fallback
     */
    loadSettings() {
        const aiSettings = JSON.parse(localStorage.getItem('ai-settings') || '{}');
        const generalSettings = JSON.parse(localStorage.getItem('lenoir-settings') || '{}');
        
        // Check localStorage first, then fall back to environment variables
        const openaiKey = aiSettings.openaiKey || generalSettings.openaiKey || process.env.OPENAI_API_KEY || '';
        const anthropicKey = aiSettings.anthropicKey || generalSettings.anthropicKey || process.env.ANTHROPIC_API_KEY || '';
        const googleKey = aiSettings.googleKey || generalSettings.googleKey || process.env.GOOGLE_API_KEY || '';
        
        console.log('🔑 Loading API keys:', {
            hasOpenAI: !!openaiKey,
            source: aiSettings.openaiKey ? 'localStorage' : (process.env.OPENAI_API_KEY ? '.env file' : 'none'),
            hasAnthropic: !!anthropicKey,
            hasGoogle: !!googleKey,
            openaiKeyLength: openaiKey.length
        });
        
        return {
            openaiKey: openaiKey,
            anthropicKey: anthropicKey,
            googleKey: googleKey,
            advancedMode: !!aiSettings.advancedMode,
            selectedModel: (aiSettings.advancedMode ? 'gpt-5' : (generalSettings.aiModel || 'gpt-5'))
        };
    }

    /**
     * Check if any API key is configured
     */
    hasApiKey() {
        return !!(this.settings.openaiKey || this.settings.anthropicKey || this.settings.googleKey);
    }

    /**
     * Call AI API with the given prompt
     * @param {string} prompt - The prompt to send
     * @param {object} options - Optional parameters (model, temperature, response_format)
     * @returns {string} AI response
     */
    async callAI(prompt, options = {}) {
        // Reload settings in case they changed
        this.settings = this.loadSettings();

        if (!this.hasApiKey()) {
            throw new Error('No API key configured. Please add your API key in Settings.');
        }

        const model = options.model || this.settings.selectedModel;

        if (model.includes('gpt')) {
            return await this.callOpenAI(prompt, options);
        } else if (model.includes('claude')) {
            return await this.callClaude(prompt);
        } else {
            throw new Error('Unknown AI model: ' + model);
        }
    }

    /**
     * Call GPT-5 Codex specifically (Responses API)
     */
    async callGPT5Codex(prompt, options = {}) {
        const apiKey = this.settings.openaiKey;
        if (!apiKey) {
            throw new Error('OpenAI API key not configured');
        }

        console.log('🧠 Using GPT-5 Codex Responses API');
        
        try {
            const OpenAI = require('openai');
            const OpenAIClient = OpenAI && OpenAI.default ? OpenAI.default : OpenAI;
            const client = new OpenAIClient({ 
                apiKey,
                dangerouslyAllowBrowser: true
            });
            
            const requestParams = {
                model: 'gpt-5-codex',
                input: prompt,
                reasoning: {
                    effort: options.reasoning_effort || 'medium',
                    summary: options.reasoning_summary || 'auto'
                },
                text: {
                    format: { type: 'json_object' }
                },
                max_output_tokens: options.max_tokens || 4000,
                store: true,
                include: [
                    'reasoning.encrypted_content',
                    'web_search_call.action.sources'
                ]
            };
            
            console.log('🔄 Calling GPT-5 Codex with:', {
                model: requestParams.model,
                reasoning: requestParams.reasoning,
                max_tokens: requestParams.max_output_tokens
            });
            
            const response = await client.responses.create(requestParams);
            console.log('✅ GPT-5 Codex response received');
            
            // Extract text from response
            if (response.output_text) {
                return response.output_text;
            }
            
            if (response.output && Array.isArray(response.output)) {
                const textParts = [];
                for (const item of response.output) {
                    if (item.content && Array.isArray(item.content)) {
                        for (const contentItem of item.content) {
                            if (contentItem.type === 'output_text' && contentItem.text) {
                                textParts.push(contentItem.text);
                            } else if (contentItem.text) {
                                textParts.push(contentItem.text);
                            }
                        }
                    } else if (item.text) {
                        textParts.push(item.text);
                    }
                }
                if (textParts.length) {
                    return textParts.join('\n');
                }
            }
            
            throw new Error('Could not extract text from GPT-5 Codex response');
            
        } catch (error) {
            console.error('❌ GPT-5 Codex error:', error);
            throw new Error('GPT-5 Codex failed: ' + error.message);
        }
    }

    /**
     * Call OpenAI API
     */
    async callOpenAI(prompt, options = {}) {
        // HARDCODED API KEY - Replace with your actual key
        const apiKey = 'sk-YOUR-API-KEY-HERE';
        
        if (!apiKey || apiKey === 'sk-YOUR-API-KEY-HERE') {
            throw new Error('Please add your OpenAI API key in ai-api-handler.js line 165');
        }

        const model = options.model || this.getOpenAIModel();
        const temperature = options.temperature !== undefined ? options.temperature : 0.7;
        const responseFormat = options.response_format;
        
        // Route to GPT-5 Codex handler if specified
        if (model === 'gpt-5-codex') {
            return await this.callGPT5Codex(prompt, options);
        }
        
        let response;
        if ((model || '').toLowerCase().startsWith('gpt-5')) {
            console.log('🚀 Using GPT-5 Responses API with model:', model);
            // Prefer SDK when available in Electron renderer
            let sdkResult = null;
            try {
                console.log('📦 Attempting OpenAI SDK...');
                const OpenAI = require('openai');
                const OpenAIClient = OpenAI && OpenAI.default ? OpenAI.default : OpenAI;
                const client = new OpenAIClient({ 
                    apiKey,
                    dangerouslyAllowBrowser: true // Required for Electron renderer
                });
                
                // Build request based on options
                const requestParams = {
                    model: model,
                    input: prompt
                };
                
                // Add reasoning parameters
                if (options.reasoning_effort || options.reasoning_summary) {
                    requestParams.reasoning = {
                        effort: options.reasoning_effort || 'low',
                        summary: options.reasoning_summary || 'auto'
                    };
                }
                
                // Add text format for JSON
                if (options.json_format) {
                    requestParams.text = {
                        format: { type: 'json_object' }
                    };
                } else {
                    requestParams.text = { verbosity: 'low' };
                }
                
                // Add max tokens
                requestParams.max_output_tokens = options.max_tokens || 4000;
                
                // Add store and include if specified
                if (model.includes('codex')) {
                    requestParams.store = true;
                    requestParams.include = [
                        'reasoning.encrypted_content',
                        'web_search_call.action.sources'
                    ];
                }
                
                console.log('🔄 Calling client.responses.create with params:', {
                    model: requestParams.model,
                    reasoning: requestParams.reasoning,
                    text: requestParams.text,
                    max_output_tokens: requestParams.max_output_tokens
                });
                
                sdkResult = await client.responses.create(requestParams);
                console.log('✅ SDK response received:', sdkResult);
            } catch (e) {
                console.warn('⚠️ SDK failed, falling back to REST:', e.message);
            }

            if (sdkResult) {
                // Normalize SDK result to the same return path below
                const data = sdkResult;
                console.log('📊 SDK data structure:', Object.keys(data));
                
                // Try output_text first
                if (data.output_text) {
                    console.log('✅ Found output_text:', data.output_text.substring(0, 100));
                    return data.output_text;
                }
                
                // Try output array with content
                if (data.output && Array.isArray(data.output)) {
                    console.log('📋 Found output array, length:', data.output.length);
                    const textParts = [];
                    
                    for (const item of data.output) {
                        // Check for content array
                        if (item.content && Array.isArray(item.content)) {
                            for (const contentItem of item.content) {
                                if (contentItem.type === 'output_text' && contentItem.text) {
                                    textParts.push(contentItem.text);
                                } else if (typeof contentItem === 'string') {
                                    textParts.push(contentItem);
                                } else if (contentItem.text) {
                                    textParts.push(contentItem.text);
                                }
                            }
                        }
                        // Check for direct text
                        else if (item.text) {
                            textParts.push(item.text);
                        }
                    }
                    
                    if (textParts.length) {
                        console.log('✅ Extracted', textParts.length, 'text parts from output array');
                        return textParts.join('\n');
                    }
                }
                
                // Fallback: try content directly
                const content = data.content || [];
                if (Array.isArray(content) && content.length) {
                    const textParts = [];
                    for (const part of content) {
                        if (typeof part === 'string') textParts.push(part);
                        else if (part?.type === 'output_text' && part?.text) textParts.push(part.text);
                        else if (part?.text) textParts.push(part.text);
                    }
                    if (textParts.length) {
                        console.log('✅ Extracted text parts from content:', textParts.length);
                        return textParts.join('\n');
                    }
                }
                
                console.error('❌ Could not extract text from SDK response. Keys:', Object.keys(data));
                console.error('Full data:', JSON.stringify(data).substring(0, 1000));
                return '';
            }

            // REST fallback - Direct to OpenAI
            console.log('🌐 Calling OpenAI directly for GPT-5');
            response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`
                },
                body: JSON.stringify({
                    model: 'gpt-4o-mini',
                    messages: [
                        { role: 'system', content: 'You are a web page modification assistant.' },
                        { role: 'user', content: prompt }
                    ],
                    temperature: 0.3,
                    max_tokens: 1200
                })
            });
            console.log('📡 OpenAI response status:', response.status);
        } else {
            // Direct OpenAI call with gpt-4o-mini
            console.log('🌐 Calling OpenAI directly for', model);
            response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`
                },
                body: JSON.stringify({
                    model: 'gpt-4o-mini',
                    messages: [
                        { role: 'system', content: 'You are a web page modification assistant. You can directly modify web pages using CSS and JavaScript. When given page context, respond with JSON actions to execute. When no page context, respond normally.' },
                        { role: 'user', content: prompt }
                    ],
                    temperature: 0.3,
                    max_tokens: 1000
                })
            });
        }

        // Handle errors
        if (!response.ok) {
            let body = '';
            try { body = await response.text(); } catch {}
            throw new Error(`OpenAI API error: ${response.status} ${response.statusText}${body ? ' — ' + body : ''}`);
        }

        const data = await response.json();
        console.log('📦 Response data keys:', Object.keys(data));
        console.log('📦 Full response data:', JSON.stringify(data).substring(0, 500));
        
        // Try various shapes: SDK exposes output_text; REST may use content arrays
        if (data.output_text) {
            console.log('✅ Found output_text');
            return data.output_text;
        }
        if (data.choices?.[0]?.message?.content) {
            console.log('✅ Found choices[0].message.content');
            return data.choices[0].message.content;
        }
        // Responses API raw shape
        const content = data.output?.[0]?.content || data.content || data.data || [];
        console.log('📋 Content to parse:', content);
        
        if (Array.isArray(content)) {
            const textParts = [];
            for (const part of content) {
                if (typeof part === 'string') textParts.push(part);
                else if (part?.type === 'output_text' && part?.text) textParts.push(part.text);
                else if (part?.text) textParts.push(part.text);
            }
            if (textParts.length) {
                console.log('✅ Extracted', textParts.length, 'text parts');
                return textParts.join('\n');
            }
        }
        
        console.error('❌ Could not extract text from response. Full data:', JSON.stringify(data));
        return '';
    }

    /**
     * Call Anthropic Claude API
     */
    async callClaude(prompt) {
        const apiKey = this.settings.anthropicKey;
        if (!apiKey) {
            throw new Error('Anthropic API key not configured');
        }

        const response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': apiKey,
                'anthropic-version': '2023-06-01'
            },
            body: JSON.stringify({
                model: 'claude-3-5-sonnet-20241022',
                messages: [{ role: 'user', content: prompt }],
                max_tokens: 1000
            })
        });

        if (!response.ok) {
            throw new Error(`Claude API error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        return data.content[0].text;
    }

    /**
     * Call Google Gemini API
     */
    async callGemini(prompt) {
        const apiKey = this.settings.googleKey;
        if (!apiKey) {
            throw new Error('Google AI API key not configured');
        }

        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${apiKey}`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }]
                })
            }
        );

        if (!response.ok) {
            throw new Error(`Gemini API error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        return data.candidates[0].content.parts[0].text;
    }
}

// Export for use in renderer
if (typeof window !== 'undefined') {
    window.AIAPIHandler = AIAPIHandler;
}
