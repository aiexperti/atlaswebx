/**
 * AI Treatment - Advanced DOM Manipulation using Scraped Data + GPT-5 Codex
 * Uses comprehensive page data to generate intelligent, context-aware DOM modifications
 */

class AITreatment {
    constructor() {
        this.scrapedData = null;
        this.domAnalysis = null;
        this.treatments = [];
        this.activeTreatment = null;
    }

    /**
     * Initialize treatment system with scraped data
     */
    async initialize() {
        console.log('🔬 Initializing AI Treatment System...');
        
        // Get comprehensive scraped data
        this.scrapedData = await this.getScrapedData();
        
        // Analyze DOM structure
        this.domAnalysis = await this.analyzeDOMStructure();
        
        console.log('✅ AI Treatment System ready');
        console.log('📊 Scraped data:', this.scrapedData?.summary);
        console.log('🏗️ DOM analysis complete');
        
        return {
            success: true,
            dataAvailable: !!this.scrapedData,
            domAnalyzed: !!this.domAnalysis
        };
    }

    /**
     * Get scraped data from page
     */
    async getScrapedData() {
        const { ipcRenderer } = require('electron');
        
        try {
            const result = await ipcRenderer.invoke('ai-execute-action', `
                (function() {
                    if (window.__aiPageScraper) {
                        return window.__aiPageScraper.getData();
                    }
                    return null;
                })();
            `);
            
            return result.success ? result.result : null;
        } catch (error) {
            console.error('Failed to get scraped data:', error);
            return null;
        }
    }

    /**
     * Analyze DOM structure for treatment
     */
    async analyzeDOMStructure() {
        const { ipcRenderer } = require('electron');
        
        try {
            const result = await ipcRenderer.invoke('ai-execute-action', `
                (function() {
                    const analysis = {
                        totalElements: document.querySelectorAll('*').length,
                        interactiveElements: {
                            buttons: document.querySelectorAll('button, [role="button"]').length,
                            links: document.querySelectorAll('a[href]').length,
                            inputs: document.querySelectorAll('input, textarea, select').length,
                            forms: document.querySelectorAll('form').length
                        },
                        contentElements: {
                            headings: document.querySelectorAll('h1, h2, h3, h4, h5, h6').length,
                            paragraphs: document.querySelectorAll('p').length,
                            lists: document.querySelectorAll('ul, ol').length,
                            images: document.querySelectorAll('img').length,
                            videos: document.querySelectorAll('video').length
                        },
                        layoutElements: {
                            containers: document.querySelectorAll('div, section, article').length,
                            headers: document.querySelectorAll('header, [role="banner"]').length,
                            navs: document.querySelectorAll('nav, [role="navigation"]').length,
                            footers: document.querySelectorAll('footer, [role="contentinfo"]').length,
                            sidebars: document.querySelectorAll('aside, [role="complementary"]').length
                        },
                        complexity: {
                            maxDepth: 0,
                            avgChildrenPerElement: 0
                        }
                    };
                    
                    // Calculate max depth
                    function getDepth(element) {
                        let depth = 0;
                        let current = element;
                        while (current.parentElement) {
                            depth++;
                            current = current.parentElement;
                        }
                        return depth;
                    }
                    
                    const allElements = document.querySelectorAll('*');
                    let totalDepth = 0;
                    allElements.forEach(el => {
                        const depth = getDepth(el);
                        if (depth > analysis.complexity.maxDepth) {
                            analysis.complexity.maxDepth = depth;
                        }
                        totalDepth += depth;
                    });
                    
                    analysis.complexity.avgDepth = totalDepth / allElements.length;
                    
                    return analysis;
                })();
            `);
            
            return result.success ? result.result : null;
        } catch (error) {
            console.error('Failed to analyze DOM:', error);
            return null;
        }
    }

    /**
     * Build comprehensive context for GPT-5 Codex
     */
    buildCodexContext(userRequest) {
        const context = {
            request: userRequest,
            page: {
                url: window.location?.href || 'unknown',
                title: document.title || 'unknown'
            },
            scrapedData: {
                summary: this.scrapedData?.summary || {},
                networkRequests: this.scrapedData?.networkRequests?.length || 0,
                apiEndpoints: this.scrapedData?.apiResponses?.slice(0, 5).map(api => ({
                    method: api.method,
                    url: api.url,
                    hasData: !!api.data
                })) || [],
                storage: {
                    localStorage: Object.keys(this.scrapedData?.localStorage || {}).length,
                    sessionStorage: Object.keys(this.scrapedData?.sessionStorage || {}).length,
                    cookies: this.scrapedData?.cookies?.length || 0
                },
                frameworks: Object.keys(this.scrapedData?.applicationState || {}).filter(key => 
                    this.scrapedData?.applicationState[key]?.detected
                ),
                jsonData: this.scrapedData?.jsonData?.slice(0, 3).map(item => ({
                    source: item.source,
                    url: item.url
                })) || []
            },
            domAnalysis: this.domAnalysis || {},
            availableData: {
                hasNetworkData: (this.scrapedData?.networkRequests?.length || 0) > 0,
                hasStorageData: Object.keys(this.scrapedData?.localStorage || {}).length > 0,
                hasJsonData: (this.scrapedData?.jsonData?.length || 0) > 0,
                hasApiResponses: (this.scrapedData?.apiResponses?.length || 0) > 0
            }
        };
        
        return context;
    }

    /**
     * Build GPT-5 Codex prompt for DOM manipulation
     */
    buildCodexPrompt(userRequest) {
        const context = this.buildCodexContext(userRequest);
        
        const prompt = `You are an expert JavaScript/DOM manipulation specialist using GPT-5 Codex. You have access to comprehensive page data and must generate executable JavaScript code to modify the DOM.

## CURRENT PAGE CONTEXT

**URL:** ${context.page.url}
**Title:** ${context.page.title}

## AVAILABLE DATA

### Network Activity
- Total Requests: ${context.scrapedData.networkRequests}
- API Endpoints: ${context.scrapedData.apiEndpoints.length}
${context.scrapedData.apiEndpoints.map(api => `  - ${api.method} ${api.url}`).join('\n')}

### Browser Storage
- localStorage: ${context.scrapedData.storage.localStorage} keys
- sessionStorage: ${context.scrapedData.storage.sessionStorage} keys
- Cookies: ${context.scrapedData.storage.cookies}

### Detected Frameworks
${context.scrapedData.frameworks.length > 0 ? context.scrapedData.frameworks.map(f => `- ${f}`).join('\n') : '- None detected'}

### JSON Data Sources
${context.scrapedData.jsonData.length > 0 ? context.scrapedData.jsonData.map((item, i) => `${i + 1}. ${item.source} from ${item.url || 'inline'}`).join('\n') : '- No JSON data captured'}

### DOM Structure
- Total Elements: ${context.domAnalysis.totalElements}
- Interactive: ${context.domAnalysis.interactiveElements?.buttons} buttons, ${context.domAnalysis.interactiveElements?.links} links
- Content: ${context.domAnalysis.contentElements?.headings} headings, ${context.domAnalysis.contentElements?.paragraphs} paragraphs
- Complexity: Max depth ${context.domAnalysis.complexity?.maxDepth}, Avg depth ${context.domAnalysis.complexity?.avgDepth?.toFixed(1)}

## USER REQUEST
"${userRequest}"

## YOUR TASK

Generate a complete, executable JavaScript function that:
1. **Accesses scraped data** from window.__aiPageData if needed
2. **Manipulates the DOM** to fulfill the user's request
3. **Uses modern JavaScript** (ES6+, async/await)
4. **Handles errors gracefully**
5. **Returns a result object** with success status and details

## AVAILABLE SCRAPED DATA ACCESS

\`\`\`javascript
// Access scraped data:
const scrapedData = window.__aiPageData;

// Network requests
const allRequests = scrapedData.networkRequests;
const jsonAPIs = scrapedData.apiResponses;

// Storage
const storage = scrapedData.localStorage;
const session = scrapedData.sessionStorage;
const cookies = scrapedData.cookies;

// JSON data from APIs
const jsonData = scrapedData.jsonData;

// Application state
const frameworks = scrapedData.applicationState;
\`\`\`

## CODE REQUIREMENTS

1. **Wrap in IIFE** (Immediately Invoked Function Expression)
2. **Use try-catch** for error handling
3. **Return result object**: { success: boolean, message: string, data?: any }
4. **Comment your code** to explain what you're doing
5. **Be efficient** - minimize DOM queries

## EXAMPLE STRUCTURE

\`\`\`javascript
(async function() {
    try {
        // 1. Access scraped data if needed
        const scrapedData = window.__aiPageData;
        
        // 2. Perform DOM manipulation
        // ... your code here ...
        
        // 3. Return success
        return {
            success: true,
            message: "Treatment applied successfully",
            data: { /* any relevant data */ }
        };
    } catch (error) {
        return {
            success: false,
            message: "Treatment failed: " + error.message,
            error: error.toString()
        };
    }
})();
\`\`\`

## RESPONSE FORMAT

Respond with ONLY the JavaScript code, no explanations before or after. The code will be executed directly in the page context.

Generate the code now:`;

        return prompt;
    }

    /**
     * Apply treatment using GPT-5 Codex
     */
    async applyTreatment(userRequest) {
        console.log('🔬 Applying AI Treatment:', userRequest);
        
        // Initialize if not already done
        if (!this.scrapedData) {
            await this.initialize();
        }
        
        // Build Codex prompt
        const prompt = this.buildCodexPrompt(userRequest);
        
        // Get API settings
        const settings = JSON.parse(localStorage.getItem('ai-settings') || '{}');
        const apiKey = settings.openaiKey;
        
        if (!apiKey) {
            return {
                success: false,
                error: 'OpenAI API key not configured'
            };
        }
        
        try {
            // Call GPT-5 Codex via OpenAI API
            console.log('🤖 Calling GPT-5 Codex...');
            
            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`
                },
                body: JSON.stringify({
                    model: 'gpt-4', // Use gpt-4 or gpt-5 when available
                    messages: [
                        {
                            role: 'system',
                            content: 'You are an expert JavaScript/DOM manipulation specialist. Generate clean, executable code.'
                        },
                        {
                            role: 'user',
                            content: prompt
                        }
                    ],
                    temperature: 0.2, // Lower temperature for more precise code
                    max_tokens: 2000
                })
            });
            
            if (!response.ok) {
                throw new Error(`API error: ${response.status} ${response.statusText}`);
            }
            
            const data = await response.json();
            const generatedCode = data.choices[0].message.content;
            
            console.log('✅ Code generated by GPT-5 Codex');
            console.log('📝 Code length:', generatedCode.length, 'characters');
            
            // Extract code from markdown if present
            let cleanCode = generatedCode;
            if (cleanCode.includes('```javascript')) {
                const match = cleanCode.match(/```javascript\n([\s\S]*?)\n```/);
                if (match) {
                    cleanCode = match[1];
                }
            } else if (cleanCode.includes('```')) {
                const match = cleanCode.match(/```\n([\s\S]*?)\n```/);
                if (match) {
                    cleanCode = match[1];
                }
            }
            
            // Execute the generated code
            console.log('⚡ Executing generated code...');
            const result = await this.executeGeneratedCode(cleanCode);
            
            // Store treatment
            this.treatments.push({
                request: userRequest,
                code: cleanCode,
                result: result,
                timestamp: Date.now()
            });
            
            this.activeTreatment = this.treatments[this.treatments.length - 1];
            
            return {
                success: true,
                result: result,
                code: cleanCode,
                message: 'Treatment applied successfully'
            };
            
        } catch (error) {
            console.error('❌ Treatment failed:', error);
            return {
                success: false,
                error: error.message,
                message: 'Failed to apply treatment'
            };
        }
    }

    /**
     * Execute generated code in page context
     */
    async executeGeneratedCode(code) {
        const { ipcRenderer } = require('electron');
        
        try {
            const result = await ipcRenderer.invoke('ai-execute-action', code);
            
            if (result.success) {
                console.log('✅ Code executed successfully');
                console.log('📊 Result:', result.result);
                return result.result;
            } else {
                console.error('❌ Code execution failed:', result.error);
                return {
                    success: false,
                    error: result.error
                };
            }
        } catch (error) {
            console.error('❌ Failed to execute code:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Quick treatment presets
     */
    async applyPreset(presetName) {
        const presets = {
            'extract-data': 'Extract all data from API responses and display it in a clean table',
            'dark-theme': 'Apply a modern dark theme using the page\'s color scheme',
            'simplify': 'Simplify the page by removing ads, popups, and unnecessary elements',
            'reader-mode': 'Convert to a clean reader mode focusing on main content',
            'data-export': 'Export all captured JSON data as downloadable file',
            'performance': 'Analyze and display page performance metrics from network data',
            'storage-view': 'Display all localStorage and sessionStorage data in a modal',
            'api-monitor': 'Create a live API request monitor showing all network activity'
        };
        
        const request = presets[presetName];
        if (!request) {
            return {
                success: false,
                error: `Unknown preset: ${presetName}`
            };
        }
        
        return await this.applyTreatment(request);
    }

    /**
     * Undo last treatment
     */
    async undoTreatment() {
        const { ipcRenderer } = require('electron');
        
        // Reload the page to undo changes
        await ipcRenderer.invoke('ai-execute-action', `
            window.location.reload();
        `);
        
        return {
            success: true,
            message: 'Page reloaded to undo treatment'
        };
    }

    /**
     * Get treatment history
     */
    getHistory() {
        return this.treatments.map(t => ({
            request: t.request,
            timestamp: new Date(t.timestamp).toLocaleString(),
            success: t.result?.success
        }));
    }

    /**
     * Export treatment as reusable code
     */
    exportTreatment(index) {
        const treatment = this.treatments[index];
        if (!treatment) {
            return null;
        }
        
        return {
            request: treatment.request,
            code: treatment.code,
            timestamp: treatment.timestamp
        };
    }

    /**
     * Get available data summary
     */
    getDataSummary() {
        if (!this.scrapedData) {
            return {
                available: false,
                message: 'No data captured yet'
            };
        }
        
        return {
            available: true,
            summary: this.scrapedData.summary,
            capabilities: {
                canAccessAPIs: (this.scrapedData.apiResponses?.length || 0) > 0,
                canAccessStorage: Object.keys(this.scrapedData.localStorage || {}).length > 0,
                canAccessJSON: (this.scrapedData.jsonData?.length || 0) > 0,
                hasFrameworks: Object.keys(this.scrapedData.applicationState || {}).length > 0
            }
        };
    }
}

// Export for use in renderer
if (typeof window !== 'undefined') {
    window.AITreatment = AITreatment;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = AITreatment;
}
