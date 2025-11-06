/**
 * AI Assistant Controller
 * Main controller that handles all AI interactions
 * Keeps renderer.js clean and minimal
 */

class AIController {
    constructor() {
        this.apiHandler = null;
        this.webEditor = null;
        this.engine = null;
        this.pointerAI = null;
        this.isInitialized = false;
    }

    /**
     * Initialize all AI components
     */
    async initialize() {
        if (this.isInitialized) return;
        
        // Load dependencies
        this.apiHandler = new AIAPIHandler();
        this.webEditor = new AIWebEditor();
        
        // Initialize AI Engine (handles all advanced transformations)
        this.engine = new AIEngine();
        this.engine.initialize(this.apiHandler);
        
        // Initialize Pointer AI (handles element-specific modifications)
        this.pointerAI = new PointerAIHandler();
        this.pointerAI.initialize(this.apiHandler);
        
        this.isInitialized = true;
        console.log('✅ AI Assistant initialized with AI Engine and Pointer AI');
    }

    /**
     * Process user message
     * @param {string} message - User's instruction
     * @param {object} currentTab - Current active tab
     * @param {object} options - Options for processing
     * @returns {object} Result with AI response and actions
     */
    async processMessage(message, currentTab = null, options = {}) {
        await this.initialize();
        
        // Always use standard mode - router handles complexity routing
        console.log('💬 [STANDARD MODE] Processing message');
        return await this.processStandardMessage(message, currentTab, options);
    }

    /**
     */
    async processAdvancedMessage(message, currentTab) {
        try {
            // Get page context
            const context = await this.webEditor.getPageContext();
            if (context.error) throw new Error('Failed to get page context: ' + context.error);
            
            // Use AI Engine for all transformations (analysis + execution)
            const result = await this.engine.transform(message, context);
            
            return {
                ...result,
                mode: 'advanced'
            };
            
        } catch (error) {
            console.error('❌ AI Engine error:', error);
            return {
                success: false,
                error: error.message,
                mode: 'advanced'
            };
        }
    }

    /**
     * Process message with Standard Mode
     */
    async processStandardMessage(message, currentTab, options = {}) {
        try {
            // Get page context via IPC (no webview needed)
            let pageContext = null;
            try {
                pageContext = await this.webEditor.getPageContext({
                    skipFullScroll: !!options.skipFullScroll,
                    focusSelector: options.selectedElement?.selector || null
                });
                console.log('✅ Page context loaded:', pageContext.url, pageContext.title);
            } catch (error) {
                console.log('⚠️ No active page or failed to get context:', error.message);
            }

            // Capture selected element snapshot BEFORE building prompt
            if (pageContext && options.selectedElement?.selector) {
                try {
                    console.log('📸 Capturing snapshot of selected element:', options.selectedElement.selector);
                    const snapshot = await this.webEditor.getElementSnapshot(options.selectedElement.selector);
                    if (snapshot?.success) {
                        pageContext.selectedElementSnapshot = snapshot.data;
                        console.log('✅ Element snapshot captured:', snapshot.data.tag, snapshot.data.selector);
                    } else if (snapshot && !snapshot.success) {
                        console.log('⚠️ Unable to capture selected element snapshot:', snapshot.error);
                    }
                } catch (snapshotError) {
                    console.error('Failed to capture element snapshot:', snapshotError);
                }
            }

            // Route to appropriate AI service
            let aiResponse;
            
            if (pageContext?.selectedElementSnapshot) {
                // Use specialized Pointer AI for element-specific modifications
                console.log('🎯 Routing to Pointer AI service');
                aiResponse = await this.pointerAI.processPointerRequest(
                    message,
                    pageContext.selectedElementSnapshot,
                    pageContext
                );
            } else {
                // Use standard AI for page-wide modifications
                console.log('📝 Routing to Standard AI service');
                const prompt = pageContext ? 
                    this.webEditor.buildPrompt(message, pageContext, {
                        inspectorSelection: options.selectedElement,
                        snapshot: pageContext?.selectedElementSnapshot
                    }) : 
                    message;
                aiResponse = await this.apiHandler.callAI(prompt);
            }
            
            console.log('🤖 AI Response:', aiResponse.substring(0, 500));

            // Parse and execute actions if page context exists
            let actionData = null;

            if (pageContext) {
                actionData = this.webEditor.parseActions(aiResponse);
                console.log('📋 Parsed actions:', actionData);
                
                // Validate and fix selectors if using Pointer AI
                if (pageContext.selectedElementSnapshot && actionData.actions) {
                    const validation = this.pointerAI.validateResponse(
                        actionData,
                        pageContext.selectedElementSnapshot.selector
                    );
                    if (validation.fixed) {
                        console.log('🔧 Fixed selectors to target selected element');
                    }
                }
                
                // Execute actions
                if (actionData.actions && actionData.actions.length > 0) {
                    console.log('⚡ Executing', actionData.actions.length, 'actions...');
                    const results = await this.webEditor.executeActions(actionData);
                    console.log('✅ Execution results:', results);
                } else {
                    console.log('⚠️ No actions to execute');
                }
            }

            return {
                success: true,
                message: actionData ? actionData.explanation : aiResponse,
                actions: actionData
            };

        } catch (error) {
            console.error('AI processing error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Save rule for domain
     */
    saveRule(domain, ruleName, actions) {
        if (!this.webEditor) return;
        this.webEditor.saveRule(domain, ruleName, actions);
    }

    /**
     * Get rules for domain
     */
    getRules(domain) {
        if (!this.webEditor) return [];
        return this.webEditor.getRules(domain);
    }

    /**
     * Delete rule for domain
     */
    deleteRule(domain, ruleName) {
        if (!this.webEditor) return;
        this.webEditor.deleteRule(domain, ruleName);
    }

    /**
     * Apply rules for domain
     */
    async applyRules(domain) {
        if (!this.webEditor) return { applied: 0, total: 0 };
        
        return await this.webEditor.applyRules(domain);
    }
    
    /**
     * Check and auto-apply rules for a domain
     */
    async autoApplyRules(url) {
        try {
            // Initialize if not already done
            if (!this.isInitialized) {
                await this.initialize();
            }
            
            const domain = new URL(url).hostname;
            const rules = this.webEditor.getRules(domain);
            
            if (rules.length > 0) {
                console.log(`🔄 Auto-applying ${rules.length} rule(s) for ${domain}`);
                const result = await this.applyRules(domain);
                console.log(`✅ Applied ${result.applied} of ${result.total} rules`);
                return result;
            }
        } catch (error) {
            console.error('Failed to auto-apply rules:', error);
        }
        return { applied: 0, total: 0 };
    }
}

// Export for use in renderer
if (typeof window !== 'undefined') {
    window.AIController = AIController;
}
