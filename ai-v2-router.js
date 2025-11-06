/**
 * AI V2 Request Router
 * Classifies user requests and delegates to appropriate handlers
 * Uses GPT-4o-mini for fast classification and routing
 */

class AIV2Router {
    constructor(apiKey) {
        this.apiKey = apiKey;
        this.handlers = {
            'page_analysis': this.handlePageAnalysis.bind(this),
            'page_modification': this.handlePageModification.bind(this),
            'web_search': this.handleWebSearch.bind(this),
            'general_chat': this.handleGeneralChat.bind(this),
            'navigation': this.handleNavigation.bind(this),
            'screenshot': this.handleScreenshot.bind(this)
        };
    }

    /**
     * Classify user request using GPT-4o-mini (fast and cheap)
     */
    async classifyRequest(userMessage, pageContext = null) {
        const classificationPrompt = `You are a request classifier for a browser AI assistant. Classify the user's request into ONE of these categories:

Categories:
1. "page_analysis" - User asks about current page content, what's on the page, summarize page, extract data
2. "page_modification" - User wants to modify the page (change colors, hide elements, add CSS, etc.)
3. "web_search" - User wants to search the web or find information online
4. "navigation" - User wants to go to a URL or navigate somewhere
5. "screenshot" - User wants to capture or analyze a screenshot
6. "general_chat" - General conversation, questions not related to browsing

Context:
- Current URL: ${pageContext?.url || 'none'}
- Page Title: ${pageContext?.title || 'none'}

User Message: "${userMessage}"

Respond with ONLY the category name (e.g., "page_analysis"). No explanation.`;

        try {
            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiKey}`
                },
                body: JSON.stringify({
                    model: 'gpt-4o-mini',
                    messages: [{ role: 'user', content: classificationPrompt }],
                    temperature: 0.3,
                    max_tokens: 20
                })
            });

            if (!response.ok) throw new Error('Classification failed');

            const data = await response.json();
            const category = data.choices[0].message.content.trim().toLowerCase();
            
            console.log('🎯 Request classified as:', category);
            return category;
        } catch (error) {
            console.error('Classification error:', error);
            return 'general_chat'; // Default fallback
        }
    }

    /**
     * Route request to appropriate handler
     */
    async routeRequest(userMessage, pageContext = null) {
        const category = await this.classifyRequest(userMessage, pageContext);
        const handler = this.handlers[category] || this.handlers['general_chat'];
        
        return await handler(userMessage, pageContext);
    }

    /**
     * Handler: Analyze current page content
     */
    async handlePageAnalysis(userMessage, pageContext) {
        console.log('📊 Handling page analysis request');
        
        // Get page content via IPC
        const { ipcRenderer } = require('electron');
        let pageData = null;
        
        try {
            pageData = await ipcRenderer.invoke('ai-get-page-context', { skipFullScroll: true });
        } catch (error) {
            console.error('Failed to get page context:', error);
        }

        if (!pageData || pageData.error) {
            return {
                response: "I'm sorry, but I can't access the current page content. Please make sure you're on a valid webpage.",
                category: 'page_analysis'
            };
        }

        // Extract visible text content (not scripts/styles)
        const visibleContent = await this.extractVisibleContent(pageData);
        
        // Use GPT-4o-mini for fast analysis
        const analysisPrompt = `You are analyzing a webpage for the user. Focus on VISIBLE CONTENT only (headlines, articles, text, images).

Page Information:
- URL: ${pageData.url}
- Title: ${pageData.title}
- Main Headlines: ${visibleContent.headlines.join(', ')}
- Article Count: ${visibleContent.articleCount}
- Image Count: ${visibleContent.imageCount}
- Links: ${visibleContent.linkCount}
- Visible Text Preview: ${visibleContent.textPreview}

User Question: "${userMessage}"

Provide a concise, helpful answer about what the USER can SEE and READ on this page. Focus on:
- Main topics/headlines
- Type of content (news, blog, product page, etc.)
- Key information visible to the user
- What they can do on this page

DO NOT mention scripts, code, or technical implementation details.`;

        const response = await this.callGPT4oMini(analysisPrompt);
        
        return {
            response,
            category: 'page_analysis',
            pageData
        };
    }

    /**
     * Extract visible content from page data
     */
    async extractVisibleContent(pageData) {
        const { ipcRenderer } = require('electron');
        
        try {
            const content = await ipcRenderer.invoke('ai-execute-action', `
                (function() {
                    // Extract headlines
                    const headlines = Array.from(document.querySelectorAll('h1, h2, h3, .headline, [class*="title"], [class*="heading"]'))
                        .map(el => el.textContent.trim())
                        .filter(text => text.length > 0 && text.length < 200)
                        .slice(0, 10);
                    
                    // Count articles
                    const articles = document.querySelectorAll('article, [class*="article"], [class*="post"], [class*="story"]').length;
                    
                    // Count images
                    const images = document.querySelectorAll('img[src]').length;
                    
                    // Count links
                    const links = document.querySelectorAll('a[href]').length;
                    
                    // Get visible text (exclude scripts, styles, hidden elements)
                    const textElements = Array.from(document.querySelectorAll('p, span, div, article, section'))
                        .filter(el => {
                            const style = window.getComputedStyle(el);
                            return style.display !== 'none' && style.visibility !== 'hidden' && el.offsetParent !== null;
                        })
                        .map(el => el.textContent.trim())
                        .filter(text => text.length > 50 && text.length < 500)
                        .slice(0, 5);
                    
                    return {
                        headlines,
                        articleCount: articles,
                        imageCount: images,
                        linkCount: links,
                        textPreview: textElements.join(' ').substring(0, 1000)
                    };
                })();
            `);
            
            if (content.success && content.result) {
                return content.result;
            }
        } catch (error) {
            console.error('Failed to extract visible content:', error);
        }
        
        // Fallback
        return {
            headlines: [],
            articleCount: 0,
            imageCount: 0,
            linkCount: 0,
            textPreview: pageData.bodyHtml?.substring(0, 1000) || ''
        };
    }

    /**
     * Handler: Modify current page
     */
    async handlePageModification(userMessage, pageContext) {
        console.log('🎨 Handling page modification request');
        
        // Check if a specific element is selected
        const selectedElement = pageContext?.selectedElement;
        const targetSelector = selectedElement?.selector || 'document.body';
        
        // Use GPT-4o-mini to generate modification code
        let modificationPrompt;
        
        if (selectedElement) {
            // Modification for specific selected element
            modificationPrompt = `You are a web page modification assistant. Generate JavaScript code to modify a SPECIFIC SELECTED element.

🎯 SELECTED ELEMENT:
- Selector: ${selectedElement.selector}
- Tag: ${selectedElement.element?.tag}
- ID: ${selectedElement.element?.id || 'none'}
- Classes: ${selectedElement.element?.classes?.join(', ') || 'none'}

Current Page: ${pageContext?.url || 'unknown'}
User Request: "${userMessage}"

⚠️ CRITICAL: You MUST modify ONLY the selected element using this exact selector: "${selectedElement.selector}"

Generate ONLY executable JavaScript code. No explanations, no markdown, just pure JavaScript.

Examples:
- "make background red" → document.querySelector('${selectedElement.selector}').style.backgroundColor = 'red';
- "hide this" → document.querySelector('${selectedElement.selector}').style.display = 'none';
- "make text bigger" → document.querySelector('${selectedElement.selector}').style.fontSize = '24px';
- "add border" → document.querySelector('${selectedElement.selector}').style.border = '2px solid blue';

Code:`;
        } else {
            // General page modification
            modificationPrompt = `You are a web page modification assistant. Generate JavaScript code to modify the current page based on the user's request.

Current Page: ${pageContext?.url || 'unknown'}
User Request: "${userMessage}"

Generate ONLY executable JavaScript code. No explanations, no markdown, just pure JavaScript.
Use document.querySelector, document.querySelectorAll, and DOM manipulation.

Examples:
- "make background dark" → document.body.style.backgroundColor = '#1a1a1a';
- "hide all images" → document.querySelectorAll('img').forEach(img => img.style.display = 'none');
- "make text bigger" → document.body.style.fontSize = '18px';

Code:`;
        }

        const code = await this.callGPT4oMini(modificationPrompt);
        
        // Execute the code
        const { ipcRenderer } = require('electron');
        try {
            const result = await ipcRenderer.invoke('ai-execute-action', code);
            
            const targetInfo = selectedElement 
                ? `to **${selectedElement.selector}**` 
                : 'to page';
            
            return {
                response: `✅ Page modified successfully!\n\nApplied "${userMessage}" ${targetInfo}`,
                category: 'page_modification',
                code,
                result,
                targetElement: selectedElement?.selector
            };
        } catch (error) {
            return {
                response: `❌ Failed to modify page: ${error.message}`,
                category: 'page_modification',
                error: error.message
            };
        }
    }

    /**
     * Handler: Web search
     */
    async handleWebSearch(userMessage, pageContext) {
        console.log('🔍 Handling web search request');
        
        // Extract search query
        const searchQuery = userMessage.replace(/search for|find|look up|google/gi, '').trim();
        
        return {
            response: `I'll help you search for "${searchQuery}". Opening search results...`,
            category: 'web_search',
            action: 'search',
            query: searchQuery,
            url: `https://www.google.com/search?q=${encodeURIComponent(searchQuery)}`
        };
    }

    /**
     * Handler: Navigation
     */
    async handleNavigation(userMessage, pageContext) {
        console.log('🧭 Handling navigation request');
        
        // Extract URL
        const urlMatch = userMessage.match(/(?:go to|open|visit|navigate to)\s+([^\s]+)/i);
        const url = urlMatch ? urlMatch[1] : null;
        
        if (url) {
            return {
                response: `Opening ${url}...`,
                category: 'navigation',
                action: 'navigate',
                url: url.startsWith('http') ? url : `https://${url}`
            };
        }
        
        return {
            response: "I couldn't find a URL in your request. Please specify where you'd like to go.",
            category: 'navigation'
        };
    }

    /**
     * Handler: Screenshot
     */
    async handleScreenshot(userMessage, pageContext) {
        console.log('📸 Handling screenshot request');
        
        return {
            response: "Screenshot functionality will be available soon!",
            category: 'screenshot'
        };
    }

    /**
     * Handler: General chat
     */
    async handleGeneralChat(userMessage, pageContext) {
        console.log('💬 Handling general chat');
        
        const response = await this.callGPT4oMini(userMessage);
        
        return {
            response,
            category: 'general_chat'
        };
    }

    /**
     * Call GPT-4o-mini (fast and cost-effective)
     */
    async callGPT4oMini(prompt, conversationHistory = []) {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.apiKey}`
            },
            body: JSON.stringify({
                model: 'gpt-4o-mini',
                messages: [
                    {
                        role: 'system',
                        content: 'You are a helpful AI assistant integrated into the Lenoir browser. Be concise, friendly, and helpful.'
                    },
                    ...conversationHistory.slice(-6), // Keep last 6 messages
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                temperature: 0.7,
                max_tokens: 800
            })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error?.message || 'API request failed');
        }

        const data = await response.json();
        return data.choices[0].message.content;
    }
}

// Export for use in other modules
if (typeof window !== 'undefined') {
    window.AIV2Router = AIV2Router;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = AIV2Router;
}
