/**
 * AI Web Editor - Handles AI-powered web page modifications
 * This module runs in the renderer process and can modify the active web page
 */

class AIWebEditor {
    constructor() {
        this.currentWebview = null;
        this.rules = this.loadRules();
        this.domAnalyzer = new AIDOMAnalyzer();
    }

    /**
     * Rewrite entire page body with provided HTML
     */
    async rewritePage(htmlString) {
        const { ipcRenderer } = require('electron');
        const htmlJson = JSON.stringify(String(htmlString || ''));
        const code = `
            (function() {
                try {
                    document.documentElement.classList.add('ai-rewritten');
                    document.body.innerHTML = ${htmlJson};
                    return { success: true };
                } catch (e) { return { success: false, error: e.message } }
            })();
        `;
        return await ipcRenderer.invoke('ai-execute-action', code);
    }

    /**
     * Extract structured data from the page
     * selector can be a container for items, and value can define fields mapping
     */
    async extractData(selector, value) {
        const { ipcRenderer } = require('electron');
        let config = {};
        if (typeof value === 'string') {
            try { config = JSON.parse(value); } catch (e) { config = {} }
        } else if (value && typeof value === 'object') {
            config = value;
        }
        const fields = config.fields || {};
        const itemSelector = (config.selectors && config.selectors[0]) || selector || 'body';
        const code = `
            (function(){
                try {
                    const items = Array.from(document.querySelectorAll('${(itemSelector||'').replace(/'/g, "\\'")}'));
                    const results = items.map(root => {
                        const obj = {};
                        const fields = ${JSON.stringify(fields)};
                        const keys = Object.keys(fields);
                        if (keys.length === 0) {
                            // fallback: return text content for each item
                            return { text: (root.innerText||'').trim() };
                        }
                        keys.forEach(k => {
                            const sel = fields[k];
                            const el = sel ? root.querySelector(sel) : null;
                            obj[k] = el ? (el.innerText || el.textContent || '').trim() : null;
                        });
                        return obj;
                    });
                    return { success: true, data: results, count: results.length };
                } catch (e) { return { success: false, error: e.message } }
            })();
        `;
        return await ipcRenderer.invoke('ai-execute-action', code);
    }
    /**
     * Ensure global style tag exists and return operation result
     */
    async ensureGlobalStyleTag() {
        const { ipcRenderer } = require('electron');
        const code = `
            (function() {
                let tag = document.getElementById('__ai_global_styles');
                if (!tag) {
                    tag = document.createElement('style');
                    tag.id = '__ai_global_styles';
                    document.head.appendChild(tag);
                }
                return { success: true };
            })();
        `;
        return await ipcRenderer.invoke('ai-execute-action', code);
    }

    /**
     * Append global CSS to persistent style tag
     */
    async applyGlobalCss(cssText) {
        const { ipcRenderer } = require('electron');
        await this.ensureGlobalStyleTag();
        const code = `
            (function() {
                try {
                    const tag = document.getElementById('__ai_global_styles');
                    tag.appendChild(document.createTextNode('\n${(cssText || '').replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/\n/g, "\\n")}\n'));
                    return { success: true };
                } catch (e) {
                    return { success: false, error: e.message };
                }
            })();
        `;
        return await ipcRenderer.invoke('ai-execute-action', code);
    }

    /**
     * Apply palette via CSS variables on :root
     */
    async applyPalette(paletteValue) {
        const { ipcRenderer } = require('electron');
        let palette = {};
        try {
            palette = typeof paletteValue === 'string' ? JSON.parse(paletteValue) : (paletteValue || {});
        } catch (e) {
            palette = {};
        }
        const entries = Object.entries(palette);
        if (entries.length === 0) {
            return { success: false, error: 'Invalid palette' };
        }
        const varsCss = entries.map(([k,v]) => `--ai-${k}: ${String(v)};`).join(' ');
        const css = `:root { ${varsCss} }\nbody { color: var(--ai-text, inherit); background: var(--ai-background, inherit); } a { color: var(--ai-link, var(--ai-primary, inherit)); }`;
        return await this.applyGlobalCss(css);
    }

    /** Add class to elements */
    async addClassTo(selector, className) {
        const { ipcRenderer } = require('electron');
        const code = `
            (function(){
                try {
                    const els = document.querySelectorAll('${selector.replace(/'/g, "\\'")}');
                    els.forEach(el => el.classList.add('${String(className || '').replace(/'/g, "\\'")}'));
                    return { success: true, count: els.length };
                } catch (e) { return { success: false, error: e.message } }
            })();
        `;
        return await ipcRenderer.invoke('ai-execute-action', code);
    }

    /** Remove class from elements */
    async removeClassFrom(selector, className) {
        const { ipcRenderer } = require('electron');
        const code = `
            (function(){
                try {
                    const els = document.querySelectorAll('${selector.replace(/'/g, "\\'")}');
                    els.forEach(el => el.classList.remove('${String(className || '').replace(/'/g, "\\'")}'));
                    return { success: true, count: els.length };
                } catch (e) { return { success: false, error: e.message } }
            })();
        `;
        return await ipcRenderer.invoke('ai-execute-action', code);
    }

    /** Replace text content */
    async replaceText(selector, value) {
        const { ipcRenderer } = require('electron');
        let find = '', replace = '';
        try {
            const obj = typeof value === 'string' ? JSON.parse(value) : (value || {});
            find = String(obj.find || '');
            replace = String(obj.replace || '');
        } catch (e) {}
        const code = `
            (function(){
                try {
                    const els = document.querySelectorAll('${selector.replace(/'/g, "\\'")}');
                    let count = 0;
                    els.forEach(el => {
                        if (el.innerText && '${find.replace(/'/g, "\\'")}') {
                            const before = el.innerText;
                            el.innerText = before.split('${find.replace(/'/g, "\\'")}').join('${replace.replace(/'/g, "\\'")}');
                            if (before !== el.innerText) count++;
                        }
                    });
                    return { success: true, count };
                } catch (e) { return { success: false, error: e.message } }
            })();
        `;
        return await ipcRenderer.invoke('ai-execute-action', code);
    }

    /**
     * Set the current webview to interact with
     */
    setCurrentWebview(webview) {
        this.currentWebview = webview;
    }

    /**
     * Get snapshot of a specific element (HTML, styles, attributes)
     */
    async getElementSnapshot(selector) {
        const { ipcRenderer } = require('electron');
        const code = `
            (function() {
                try {
                    const element = document.querySelector('${selector.replace(/'/g, "\\'")}')
                    if (!element) {
                        return { success: false, error: 'Element not found' };
                    }
                    
                    // Get computed styles
                    const computedStyle = window.getComputedStyle(element);
                    const relevantStyles = {
                        backgroundColor: computedStyle.backgroundColor,
                        color: computedStyle.color,
                        fontSize: computedStyle.fontSize,
                        fontFamily: computedStyle.fontFamily,
                        fontWeight: computedStyle.fontWeight,
                        padding: computedStyle.padding,
                        margin: computedStyle.margin,
                        border: computedStyle.border,
                        borderRadius: computedStyle.borderRadius,
                        display: computedStyle.display,
                        width: computedStyle.width,
                        height: computedStyle.height,
                        position: computedStyle.position,
                        zIndex: computedStyle.zIndex
                    };
                    
                    return {
                        success: true,
                        data: {
                            selector: '${selector.replace(/'/g, "\\'")}'',
                            tag: element.tagName.toLowerCase(),
                            id: element.id,
                            classes: Array.from(element.classList),
                            html: element.outerHTML.substring(0, 2000),
                            innerText: element.innerText?.substring(0, 500),
                            attributes: Array.from(element.attributes).map(attr => ({
                                name: attr.name,
                                value: attr.value
                            })),
                            computedStyles: relevantStyles,
                            rect: element.getBoundingClientRect()
                        }
                    };
                } catch (error) {
                    return { success: false, error: error.message };
                }
            })();
        `;
        const result = await ipcRenderer.invoke('ai-execute-action', code);
        
        // Unwrap if IPC wrapped the result
        if (result && result.result) {
            return result.result;
        }
        return result;
    }

    /**
     * Get page context (DOM, screenshot, etc.)
     */
    async getPageContext(options = {}) {
        // Use IPC to get raw HTML from BrowserView in main process
        const { ipcRenderer } = require('electron');
        const rawContext = await ipcRenderer.invoke('ai-get-page-context', options);
        
        if (rawContext.error) {
            throw new Error(rawContext.error);
        }
        
        // Use the master DOM analyzer
        const analyzed = this.domAnalyzer.analyzeHTML(rawContext.html || rawContext.bodyHtml);
        const pageType = this.domAnalyzer.detectPageType(analyzed);
        
        return { 
            ...rawContext, 
            ...analyzed,
            pageType,
            // Legacy compatibility - flatten some common fields
            buttons: analyzed.interactive.buttons,
            links: analyzed.interactive.links,
            images: analyzed.media.images,
            videos: analyzed.media.videos,
            headings: analyzed.content.headings,
            forms: analyzed.interactive.forms
        };
    }


    /**
     * Take screenshot of current page
     */
    async takeScreenshot() {
        if (!this.currentWebview) {
            throw new Error('No active webview');
        }

        return new Promise((resolve) => {
            this.currentWebview.capturePage().then(image => {
                resolve(image.toDataURL());
            });
        });
    }

    /**
     * Format scraped data for AI prompt
     */
    formatScrapedData(scrapedData) {
        if (!scrapedData) return 'No scraped data available';
        
        const summary = scrapedData.summary || {};
        let formatted = '\n🔍 COMPREHENSIVE PAGE DATA CAPTURED:\n';
        
        // Network requests summary
        if (summary.networkRequests > 0) {
            formatted += `\n📡 Network Activity (${summary.networkRequests} requests):\n`;
            formatted += `  - XHR: ${summary.xhrRequests}\n`;
            formatted += `  - Fetch: ${summary.fetchRequests}\n`;
            formatted += `  - WebSockets: ${summary.websockets}\n`;
            formatted += `  - JSON APIs: ${summary.jsonDataPoints}\n`;
            
            // Include API endpoints
            if (scrapedData.apiResponses && scrapedData.apiResponses.length > 0) {
                formatted += `\n  API Endpoints:\n`;
                scrapedData.apiResponses.slice(0, 5).forEach(api => {
                    formatted += `    - ${api.method} ${api.url}\n`;
                });
            }
        }
        
        // Storage summary
        formatted += `\n💾 Browser Storage:\n`;
        formatted += `  - localStorage: ${summary.localStorageKeys} keys\n`;
        formatted += `  - sessionStorage: ${summary.sessionStorageKeys} keys\n`;
        formatted += `  - Cookies: ${summary.cookies}\n`;
        formatted += `  - IndexedDB: ${summary.indexedDBs} databases\n`;
        
        // Application state
        if (scrapedData.applicationState && Object.keys(scrapedData.applicationState).length > 0) {
            formatted += `\n🎯 Detected Frameworks:\n`;
            Object.entries(scrapedData.applicationState).forEach(([key, value]) => {
                if (value.detected) {
                    formatted += `  - ${key}: ${value.version || 'detected'}\n`;
                }
            });
        }
        
        // JSON data samples
        if (scrapedData.jsonData && scrapedData.jsonData.length > 0) {
            formatted += `\n📊 JSON Data Available (${scrapedData.jsonData.length} sources):\n`;
            scrapedData.jsonData.slice(0, 3).forEach((item, idx) => {
                formatted += `  ${idx + 1}. Source: ${item.source} from ${item.url || 'inline'}\n`;
            });
        }
        
        return formatted;
    }

    /**
     * Build AI prompt with page context
     */
    buildPrompt(instruction, context, options = {}) {
        const selectedElement = options.inspectorSelection;
        const snapshot = options.snapshot;
        
        let selectedElementContext = '';
        if (selectedElement && snapshot) {
            selectedElementContext = `

🎯 SELECTED ELEMENT (User has specifically selected this element with the pointer):
- Selector: ${snapshot.selector}
- Tag: <${snapshot.tag}>
- ID: ${snapshot.id || 'none'}
- Classes: ${snapshot.classes.join(', ') || 'none'}
- Current Styles:
  * Background: ${snapshot.computedStyles?.backgroundColor}
  * Color: ${snapshot.computedStyles?.color}
  * Font: ${snapshot.computedStyles?.fontSize} ${snapshot.computedStyles?.fontFamily}
  * Padding: ${snapshot.computedStyles?.padding}
  * Margin: ${snapshot.computedStyles?.margin}
  * Border: ${snapshot.computedStyles?.border}
- HTML Preview: ${snapshot.html?.substring(0, 300)}...
- Text Content: "${snapshot.innerText?.substring(0, 200)}..."

⚠️ IMPORTANT: The user wants to modify THIS SPECIFIC ELEMENT. Your actions MUST target the selector "${snapshot.selector}" directly. Do NOT apply page-wide changes unless explicitly requested.`;
        }
        
        const baseContext = `Current Page Being Viewed:
- URL: ${context.url}
- Title: ${context.title}
- Domain: ${context.domain}
- Viewport: ${context.viewport?.width}x${context.viewport?.height}

Screenshot: ${context.screenshot ? 'INCLUDED - analyze current layout and design' : 'not available'}

${this.formatScrapedData(context.scrapedData)}${selectedElementContext}`;

        // Unified prompt (router handles routing to Treatment for complex cases)
        return `You are a web page modification assistant with the ability to directly modify the current web page using CSS and JavaScript. You MUST respond with executable actions, NOT instructions for the user.

IMPORTANT: You CAN and MUST modify the page directly. Do NOT give instructions to the user. Generate actions that will be executed automatically.

${baseContext}

DOM STRUCTURE (visible elements with precise selectors):
${context.domStructure ? context.domStructure.slice(0, 30).map(el => 
    `${'  '.repeat(el.depth)}${el.selector} [${el.tag}] ${el.text ? '- "' + el.text.substring(0, 50) + '"' : ''}`
).join('\n') : 'Not available'}

INTERACTIVE ELEMENTS (with exact selectors):
Buttons: ${JSON.stringify(context.buttons?.slice(0, 10).map(b => ({selector: b.selector, text: b.text.substring(0, 30)})))}
Links: ${JSON.stringify(context.links?.slice(0, 10).map(l => ({selector: l.selector, text: l.text.substring(0, 30), href: l.href})))}
Headers: ${JSON.stringify(context.headers?.map(h => ({selector: h.selector, text: h.text.substring(0, 50)})))}
Sidebars: ${JSON.stringify(context.sidebars?.map(s => ({selector: s.selector})))}

User wants: "${instruction}"

IMPORTANT: Use the EXACT selectors provided above. Prefer high-level modifications (globalCss, palette) for page-wide changes.

You MUST respond with ONLY a JSON object (no other text) in this exact format:
{
  "explanation": "Brief explanation of what you'll do",
  "actions": [
    {
      "type": "css|globalCss|palette|hide|show|click|fill|remove|addClass|removeClass|replaceText|rewritePage|extractData|javascript",
      "selector": "CSS selector for the element (omit or use '*' for globalCss/palette)",
      "value": "CSS styles or value to apply (for palette, provide JSON with keys like primary, background, surface, text, link)",
      "description": "What this action does"
    }
  ],
  "saveAsRule": true/false
}

Action types you can use:
- css: Apply inline CSS styles to matched elements (value = "color: red; font-size: 20px;")
- globalCss: Append CSS to a persistent <style id="__ai_global_styles"> in <head> (value = raw CSS rules)
- palette: Apply a theme by setting CSS variables on :root (value = JSON, e.g. {"background":"#111","text":"#eee","primary":"#4a9eff","link":"#4a9eff"})
- addClass: Add a class to matched elements (value = class name)
- removeClass: Remove a class from matched elements (value = class name)
- replaceText: Replace innerText that matches (value = JSON {"find":"old","replace":"new"})
- rewritePage: Replace the entire page body with provided HTML (value = full HTML string)
- extractData: Extract structured data (value = JSON {"selectors":["img","video","h1"], "fields": {"title":"h1","image":"img[src]","video":"video[src]"}})
- hide: Hide elements (selector only)
- show: Show elements (selector only)
- click: Click an element (selector only)
- fill: Fill form field (value = text to fill)
- remove: Remove elements from DOM (selector only)
- javascript: Execute custom JavaScript (value = JS code)

EXAMPLES:
User: "make background dark" (no element selected)
Response: {"explanation":"Applying dark background","actions":[{"type":"css","selector":"body","value":"background-color: #1a1a1a; color: #ffffff;","description":"Dark background"}],"saveAsRule":true}

User: "make background red" (with div.header selected)
Response: {"explanation":"Changing header background to red","actions":[{"type":"css","selector":"div.header","value":"background-color: red;","description":"Red background for selected header"}],"saveAsRule":false}

User: "hide ads"
Response: {"explanation":"Hiding advertisements","actions":[{"type":"hide","selector":".ad, .advertisement, [class*='ad-']","description":"Hide ad elements"}],"saveAsRule":true}

Be specific with selectors. Use IDs, classes, or element types.
${selectedElement && snapshot ? `\n⚠️ CRITICAL: A specific element is selected (${snapshot.selector}). You MUST use this exact selector in your actions, NOT body or any other selector.` : ''}
Respond with ONLY the JSON object, no other text before or after.`;
    }

    /**
     * Parse AI response to extract actions
     */
    parseActions(aiResponse) {
        try {
            if (!aiResponse) {
                return { explanation: 'Empty AI response', actions: [], saveAsRule: false };
            }

            // Already structured object
            if (typeof aiResponse === 'object') {
                return this.normalizeActions(aiResponse);
            }

            let text = String(aiResponse).trim();

            // Strip code fences ```json ... ``` or ``` ... ```
            if (text.startsWith('```')) {
                const fenceEnd = text.lastIndexOf('```');
                if (fenceEnd > 2) {
                    const lines = text.split('\n');
                    lines.shift();
                    if (lines.length && lines[lines.length - 1].trim() === '```') lines.pop();
                    text = lines.join('\n');
                }
            }

            // Extract first JSON object between { ... }
            const objMatch = text.match(/\{[\s\S]*\}/);
            if (objMatch) {
                const candidate = objMatch[0];
                const parsed = JSON.parse(candidate);
                return this.normalizeActions(parsed);
            }

            // Fallback: treat raw JS string as a javascript action
            if (text) {
                return this.normalizeActions({ code: text });
            }

            return { explanation: 'Could not parse AI response', actions: [], saveAsRule: false };
        } catch (error) {
            console.error('Failed to parse AI actions:', error, '\nRaw:', aiResponse);
            return { explanation: 'Error parsing response', actions: [], saveAsRule: false };
        }
    }

    /**
     * Normalize different AI payload shapes into standard action objects
     */
    normalizeActions(data) {
        if (!data) {
            return { explanation: 'Empty AI response', actions: [], saveAsRule: false };
        }

        // If data already contains an actions array, ensure structure
        if (Array.isArray(data.actions)) {
            return {
                explanation: data.explanation || 'Executing actions',
                actions: data.actions,
                saveAsRule: data.saveAsRule === true
            };
        }

        // Sometimes model returns an array directly
        if (Array.isArray(data)) {
            return {
                explanation: 'Executing actions',
                actions: data,
                saveAsRule: false
            };
        }

        // Handle { action: "run", code: "..." } shape
        if (typeof data === 'object') {
            const codePayload = data.code || data.javascript || data.js;
            const actionType = (data.action || '').toLowerCase();

            if (codePayload && (actionType === 'run' || !actionType || actionType === 'javascript')) {
                return {
                    explanation: data.explanation || 'Execute generated JavaScript',
                    actions: [
                        {
                            type: 'javascript',
                            value: String(codePayload),
                            description: data.description || 'Run generated JavaScript on the page'
                        }
                    ],
                    saveAsRule: false
                };
            }

            // Generic object without actions - attempt to wrap string values
            if (codePayload) {
                return {
                    explanation: 'Execute generated JavaScript',
                    actions: [
                        {
                            type: 'javascript',
                            value: String(codePayload),
                            description: 'Run generated JavaScript on the page'
                        }
                    ],
                    saveAsRule: false
                };
            }
        }

        return {
            explanation: data.explanation || 'No actionable instructions returned',
            actions: [],
            saveAsRule: false
        };
    }

    /**
     * Execute actions on the web page
     */
    async executeActions(actionData) {
        // No webview check needed - uses IPC now
        const results = [];
        
        for (const action of actionData.actions || []) {
            try {
                let result;
                
                switch (action.type) {
                    case 'css':
                        result = await this.applyCss(action.selector, action.value);
                        break;
                    case 'globalCss':
                        result = await this.applyGlobalCss(action.value);
                        break;
                    case 'palette':
                        result = await this.applyPalette(action.value);
                        break;
                    case 'hide':
                        result = await this.hideElements(action.selector);
                        break;
                    case 'show':
                        result = await this.showElements(action.selector);
                        break;
                    case 'click':
                        result = await this.clickElement(action.selector);
                        break;
                    case 'fill':
                        result = await this.fillField(action.selector, action.value);
                        break;
                    case 'remove':
                        result = await this.removeElements(action.selector);
                        break;
                    case 'addClass':
                        result = await this.addClassTo(action.selector, action.value);
                        break;
                    case 'removeClass':
                        result = await this.removeClassFrom(action.selector, action.value);
                        break;
                    case 'replaceText':
                        result = await this.replaceText(action.selector, action.value);
                        break;
                    case 'rewritePage':
                        result = await this.rewritePage(action.value);
                        break;
                    case 'extractData':
                        result = await this.extractData(action.selector, action.value);
                        break;
                    case 'javascript':
                        result = await this.executeJavaScript(action.value);
                        break;
                    default:
                        result = { success: false, error: 'Unknown action type' };
                }
                
                results.push({
                    action: action,
                    result: result
                });
            } catch (error) {
                results.push({
                    action: action,
                    result: { success: false, error: error.message }
                });
            }
        }
        
        return results;
    }

    /**
     * Apply CSS styles to elements
     */
    async applyCss(selector, cssText) {
        const { ipcRenderer } = require('electron');
        console.log('🎨 Applying CSS:', selector, cssText);
        const code = `
            (function() {
                try {
                    const elements = document.querySelectorAll('${selector.replace(/'/g, "\\'")}');
                    console.log('Found elements:', elements.length);
                    if (elements.length === 0) {
                        return { success: false, error: 'No elements found' };
                    }
                    
                    elements.forEach(el => {
                        el.style.cssText += '${cssText.replace(/'/g, "\\'")}';
                        // Visual confirmation
                        console.log('Modified element:', el.tagName, el.className);
                    });
                    
                    return { success: true, count: elements.length };
                } catch (error) {
                    return { success: false, error: error.message };
                }
            })();
        `;
        const result = await ipcRenderer.invoke('ai-execute-action', code);
        console.log('🎨 CSS result:', JSON.stringify(result));
        
        // Check if it's the actual result or wrapped
        if (result && result.result) {
            console.log('🎨 Unwrapped result:', JSON.stringify(result.result));
            return result.result;
        }
        return result;
    }

    /**
     * Hide elements
     */
    async hideElements(selector) {
        return this.applyCss(selector, 'display: none !important;');
    }

    /**
     * Show elements
     */
    async showElements(selector) {
        return this.applyCss(selector, 'display: block !important;');
    }

    /**
     * Click element
     */
    async clickElement(selector) {
        const { ipcRenderer } = require('electron');
        const code = `
            (function() {
                try {
                    const element = document.querySelector('${selector.replace(/'/g, "\\'")}');
                    if (!element) {
                        return { success: false, error: 'Element not found' };
                    }
                    element.click();
                    return { success: true };
                } catch (error) {
                    return { success: false, error: error.message };
                }
            })();
        `;
        return await ipcRenderer.invoke('ai-execute-action', code);
    }

    /**
     * Fill form field
     */
    async fillField(selector, value) {
        const { ipcRenderer } = require('electron');
        const code = `
            (function() {
                try {
                    const element = document.querySelector('${selector.replace(/'/g, "\\'")}');
                    if (!element) {
                        return { success: false, error: 'Element not found' };
                    }
                    element.value = '${value.replace(/'/g, "\\'")}';
                    element.dispatchEvent(new Event('input', { bubbles: true }));
                    element.dispatchEvent(new Event('change', { bubbles: true }));
                    return { success: true };
                } catch (error) {
                    return { success: false, error: error.message };
                }
            })();
        `;
        return await ipcRenderer.invoke('ai-execute-action', code);
    }

    /**
     * Remove elements
     */
    async removeElements(selector) {
        const { ipcRenderer } = require('electron');
        const code = `
            (function() {
                try {
                    const elements = document.querySelectorAll('${selector.replace(/'/g, "\\'")}');
                    if (elements.length === 0) {
                        return { success: false, error: 'No elements found' };
                    }
                    elements.forEach(el => el.remove());
                    return { success: true, count: elements.length };
                } catch (error) {
                    return { success: false, error: error.message };
                }
            })();
        `;
        return await ipcRenderer.invoke('ai-execute-action', code);
    }

    /**
     * Execute custom JavaScript
     */
    async executeJavaScript(code) {
        const { ipcRenderer } = require('electron');
        const wrappedCode = `
            (function() {
                try {
                    ${code}
                    return { success: true };
                } catch (error) {
                    return { success: false, error: error.message };
                }
            })();
        `;
        return await ipcRenderer.invoke('ai-execute-action', wrappedCode);
    }

    /**
     * Save actions as a rule for this domain
     */
    saveRule(domain, ruleName, actions) {
        if (!this.rules[domain]) {
            this.rules[domain] = [];
        }
        
        this.rules[domain].push({
            name: ruleName,
            actions: actions,
            createdAt: new Date().toISOString()
        });
        
        this.saveRulesToStorage();
        console.log(`💾 Saved rule "${ruleName}" for ${domain} (${actions.length} actions)`);
        console.log(`📊 Total rules for ${domain}: ${this.rules[domain].length}`);
    }

    /**
     * Get rules for a domain
     */
    getRules(domain) {
        return this.rules[domain] || [];
    }

    /**
     * Delete a rule
     */
    deleteRule(domain, ruleName) {
        if (this.rules[domain]) {
            this.rules[domain] = this.rules[domain].filter(r => r.name !== ruleName);
            this.saveRulesToStorage();
        }
    }

    /**
     * Apply saved rules for a domain
     */
    async applyRules(domain) {
        const domainRules = this.getRules(domain);
        console.log(`📋 Rules for ${domain}:`, domainRules);
        
        if (domainRules.length === 0) {
            console.log('⚠️ No rules found for', domain);
            return { applied: 0, total: 0 };
        }
        
        let applied = 0;
        for (const rule of domainRules) {
            try {
                console.log(`⚡ Applying rule: ${rule.name} (${rule.actions.length} actions)`);
                await this.executeActions({ actions: rule.actions });
                applied++;
                console.log(`✅ Rule "${rule.name}" applied successfully`);
            } catch (error) {
                console.error(`❌ Failed to apply rule ${rule.name}:`, error);
            }
        }
        
        return { applied: applied, total: domainRules.length };
    }

    /**
     * Load rules from localStorage
     */
    loadRules() {
        try {
            const saved = localStorage.getItem('ai-page-rules');
            const rules = saved ? JSON.parse(saved) : {};
            const ruleCount = Object.keys(rules).reduce((sum, domain) => sum + rules[domain].length, 0);
            console.log(`📚 Loaded ${ruleCount} saved rule(s) for ${Object.keys(rules).length} domain(s)`);
            return rules;
        } catch (error) {
            console.error('Failed to load rules:', error);
            return {};
        }
    }

    /**
     * Save rules to localStorage
     */
    saveRulesToStorage() {
        try {
            const rulesJson = JSON.stringify(this.rules);
            localStorage.setItem('ai-page-rules', rulesJson);
            console.log('💾 Rules saved to localStorage:', rulesJson.substring(0, 200));
            
            // Verify it was saved
            const verified = localStorage.getItem('ai-page-rules');
            console.log('✅ Verified saved:', !!verified);
        } catch (error) {
            console.error('Failed to save rules:', error);
        }
    }
}

// Export for use in renderer
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AIWebEditor;
}
