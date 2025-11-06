// Web AI Assistant - AI that can interact with web pages
const AIManager = require('./ai-manager');

class WebAIAssistant {
    constructor(mainWindow) {
        this.mainWindow = mainWindow;
        this.aiManager = new AIManager();
        this.currentTask = null;
        this.rules = new Map(); // Store saved rules per domain
    }

    /**
     * Process user instruction for current web page
     */
    async processInstruction(instruction, webContents) {
        try {
            // 1. Get current page context
            const context = await this.getPageContext(webContents);
            
            // 2. Take screenshot
            const screenshot = await this.takeScreenshot(webContents);
            
            // 3. Build AI prompt with context
            const prompt = this.buildPrompt(instruction, context, screenshot);
            
            // 4. Get AI response with actions
            const response = await this.aiManager.sendMessage(prompt);
            
            // 5. Parse and execute actions
            const actions = this.parseActions(response);
            const results = await this.executeActions(actions, webContents);
            
            return {
                success: true,
                message: response,
                actions: actions,
                results: results,
                screenshot: screenshot
            };
        } catch (error) {
            console.error('AI Assistant error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Get page context (URL, title, DOM structure)
     */
    async getPageContext(webContents) {
        return await webContents.executeJavaScript(`
            (function() {
                return {
                    url: window.location.href,
                    title: document.title,
                    domain: window.location.hostname,
                    html: document.documentElement.outerHTML.substring(0, 10000), // First 10KB
                    visibleText: document.body.innerText.substring(0, 5000),
                    forms: Array.from(document.forms).map(f => ({
                        id: f.id,
                        name: f.name,
                        action: f.action,
                        fields: Array.from(f.elements).map(e => ({
                            name: e.name,
                            type: e.type,
                            id: e.id
                        }))
                    })),
                    links: Array.from(document.links).slice(0, 50).map(l => ({
                        text: l.textContent.trim(),
                        href: l.href
                    })),
                    images: Array.from(document.images).slice(0, 20).map(img => ({
                        src: img.src,
                        alt: img.alt
                    }))
                };
            })();
        `);
    }

    /**
     * Take screenshot of current page
     */
    async takeScreenshot(webContents) {
        const image = await webContents.capturePage();
        return image.toDataURL();
    }

    /**
     * Build AI prompt with page context
     */
    buildPrompt(instruction, context, screenshot) {
        return `You are a web page assistant. The user wants to modify the current web page.

Current Page:
- URL: ${context.url}
- Title: ${context.title}
- Domain: ${context.domain}

User Instruction: "${instruction}"

Page Context:
- Visible Text: ${context.visibleText.substring(0, 1000)}
- Forms: ${JSON.stringify(context.forms)}
- Links: ${JSON.stringify(context.links.slice(0, 10))}

Based on the user's instruction, provide actions to modify the page in JSON format:

{
  "explanation": "What you're going to do",
  "actions": [
    {
      "type": "css" | "javascript" | "hide" | "show" | "click" | "fill" | "remove",
      "selector": "CSS selector",
      "value": "value or code to apply",
      "description": "What this action does"
    }
  ],
  "saveAsRule": true/false
}

Available action types:
- css: Apply CSS styles
- javascript: Execute JavaScript
- hide: Hide elements
- show: Show elements
- click: Click elements
- fill: Fill form fields
- remove: Remove elements

Respond ONLY with valid JSON.`;
    }

    /**
     * Parse AI response to extract actions
     */
    parseActions(response) {
        try {
            // Try to extract JSON from response
            const jsonMatch = response.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                return JSON.parse(jsonMatch[0]);
            }
            return { actions: [] };
        } catch (error) {
            console.error('Failed to parse AI actions:', error);
            return { actions: [] };
        }
    }

    /**
     * Execute actions on the web page
     */
    async executeActions(actionData, webContents) {
        const results = [];
        
        for (const action of actionData.actions || []) {
            try {
                let result;
                
                switch (action.type) {
                    case 'css':
                        result = await this.applyCss(webContents, action.selector, action.value);
                        break;
                    case 'javascript':
                        result = await this.executeJs(webContents, action.value);
                        break;
                    case 'hide':
                        result = await this.hideElements(webContents, action.selector);
                        break;
                    case 'show':
                        result = await this.showElements(webContents, action.selector);
                        break;
                    case 'click':
                        result = await this.clickElement(webContents, action.selector);
                        break;
                    case 'fill':
                        result = await this.fillField(webContents, action.selector, action.value);
                        break;
                    case 'remove':
                        result = await this.removeElements(webContents, action.selector);
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
     * Apply CSS to elements
     */
    async applyCss(webContents, selector, cssText) {
        return await webContents.executeJavaScript(`
            (function() {
                const elements = document.querySelectorAll('${selector}');
                if (elements.length === 0) {
                    return { success: false, error: 'No elements found' };
                }
                
                elements.forEach(el => {
                    el.style.cssText += '${cssText}';
                });
                
                return { success: true, count: elements.length };
            })();
        `);
    }

    /**
     * Execute JavaScript code
     */
    async executeJs(webContents, code) {
        return await webContents.executeJavaScript(`
            (function() {
                try {
                    ${code}
                    return { success: true };
                } catch (error) {
                    return { success: false, error: error.message };
                }
            })();
        `);
    }

    /**
     * Hide elements
     */
    async hideElements(webContents, selector) {
        return await this.applyCss(webContents, selector, 'display: none !important;');
    }

    /**
     * Show elements
     */
    async showElements(webContents, selector) {
        return await this.applyCss(webContents, selector, 'display: block !important;');
    }

    /**
     * Click element
     */
    async clickElement(webContents, selector) {
        return await webContents.executeJavaScript(`
            (function() {
                const element = document.querySelector('${selector}');
                if (!element) {
                    return { success: false, error: 'Element not found' };
                }
                element.click();
                return { success: true };
            })();
        `);
    }

    /**
     * Fill form field
     */
    async fillField(webContents, selector, value) {
        return await webContents.executeJavaScript(`
            (function() {
                const element = document.querySelector('${selector}');
                if (!element) {
                    return { success: false, error: 'Element not found' };
                }
                element.value = '${value}';
                element.dispatchEvent(new Event('input', { bubbles: true }));
                element.dispatchEvent(new Event('change', { bubbles: true }));
                return { success: true };
            })();
        `);
    }

    /**
     * Remove elements
     */
    async removeElements(webContents, selector) {
        return await webContents.executeJavaScript(`
            (function() {
                const elements = document.querySelectorAll('${selector}');
                if (elements.length === 0) {
                    return { success: false, error: 'No elements found' };
                }
                elements.forEach(el => el.remove());
                return { success: true, count: elements.length };
            })();
        `);
    }

    /**
     * Save actions as a rule for this domain
     */
    saveRule(domain, ruleName, actions) {
        if (!this.rules.has(domain)) {
            this.rules.set(domain, []);
        }
        
        this.rules.get(domain).push({
            name: ruleName,
            actions: actions,
            createdAt: Date.now()
        });
        
        // Persist to file
        this.saveRulesToFile();
    }

    /**
     * Apply saved rules for a domain
     */
    async applyRules(domain, webContents) {
        const domainRules = this.rules.get(domain);
        if (!domainRules || domainRules.length === 0) {
            return { applied: 0 };
        }
        
        let applied = 0;
        for (const rule of domainRules) {
            try {
                await this.executeActions({ actions: rule.actions }, webContents);
                applied++;
            } catch (error) {
                console.error(`Failed to apply rule ${rule.name}:`, error);
            }
        }
        
        return { applied: applied, total: domainRules.length };
    }

    /**
     * Get rules for a domain
     */
    getRules(domain) {
        return this.rules.get(domain) || [];
    }

    /**
     * Delete a rule
     */
    deleteRule(domain, ruleName) {
        const domainRules = this.rules.get(domain);
        if (domainRules) {
            const filtered = domainRules.filter(r => r.name !== ruleName);
            this.rules.set(domain, filtered);
            this.saveRulesToFile();
        }
    }

    /**
     * Save rules to file
     */
    saveRulesToFile() {
        const fs = require('fs');
        const path = require('path');
        const { app } = require('electron');
        
        const rulesPath = path.join(app.getPath('userData'), 'page-rules.json');
        const rulesObj = {};
        
        for (const [domain, rules] of this.rules.entries()) {
            rulesObj[domain] = rules;
        }
        
        fs.writeFileSync(rulesPath, JSON.stringify(rulesObj, null, 2));
    }

    /**
     * Load rules from file
     */
    loadRulesFromFile() {
        const fs = require('fs');
        const path = require('path');
        const { app } = require('electron');
        
        const rulesPath = path.join(app.getPath('userData'), 'page-rules.json');
        
        if (fs.existsSync(rulesPath)) {
            const rulesObj = JSON.parse(fs.readFileSync(rulesPath, 'utf8'));
            for (const [domain, rules] of Object.entries(rulesObj)) {
                this.rules.set(domain, rules);
            }
        }
    }
}

module.exports = WebAIAssistant;
