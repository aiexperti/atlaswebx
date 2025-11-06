/**
 * AI Router - Intelligent Request Routing System
 * Uses GPT-4o to understand user requests and route to appropriate handler:
 * - Standard AI actions (simple edits)
 * - AI Treatment with Codex (complex transformations)
 */

class AIRouter {
    constructor() {
        this.aiTreatment = null;
        this.aiController = null;
        this.routingHistory = [];
    }

    /**
     * Initialize router with dependencies
     */
    initialize(aiController, aiTreatment) {
        this.aiController = aiController;
        this.aiTreatment = aiTreatment;
        console.log('🧭 AI Router initialized');
    }

    /**
     * Analyze user request with GPT-4o to determine routing
     */
    async analyzeRequest(userRequest, pageContext) {
        console.log('🔍 Analyzing request with GPT-4o:', userRequest);

        const settings = JSON.parse(localStorage.getItem('ai-settings') || '{}');
        const apiKey = settings.openaiKey;

        if (!apiKey) {
            return {
                success: false,
                error: 'OpenAI API key not configured'
            };
        }

        // Build analysis prompt
        const prompt = this.buildAnalysisPrompt(userRequest, pageContext);

        try {
            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`
                },
                body: JSON.stringify({
                    model: 'gpt-4o',
                    messages: [
                        {
                            role: 'system',
                            content: 'You are an intelligent request analyzer that determines the best way to handle user requests for web page modification.'
                        },
                        {
                            role: 'user',
                            content: prompt
                        }
                    ],
                    temperature: 0.3,
                    max_tokens: 500,
                    response_format: { type: "json_object" }
                })
            });

            if (!response.ok) {
                throw new Error(`GPT-4o API error: ${response.status}`);
            }

            const data = await response.json();
            const analysis = JSON.parse(data.choices[0].message.content);

            console.log('✅ Request analyzed:', analysis);
            return {
                success: true,
                analysis: analysis
            };

        } catch (error) {
            console.error('❌ Analysis failed:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Build prompt for GPT-4o analysis
     */
    buildAnalysisPrompt(userRequest, pageContext) {
        const hasScrapedData = pageContext?.scrapedData?.summary;
        const dataAvailable = hasScrapedData ? {
            networkRequests: pageContext.scrapedData.summary.networkRequests || 0,
            jsonData: pageContext.scrapedData.summary.jsonDataPoints || 0,
            localStorage: pageContext.scrapedData.summary.localStorageKeys || 0,
            apiEndpoints: pageContext.scrapedData.apiResponses?.length || 0
        } : null;

        return `Analyze this user request and determine the best routing strategy.

## USER REQUEST
"${userRequest}"

## PAGE CONTEXT
- URL: ${pageContext?.url || 'unknown'}
- Title: ${pageContext?.title || 'unknown'}
- Has scraped data: ${!!hasScrapedData}

${dataAvailable ? `## AVAILABLE DATA
- Network requests: ${dataAvailable.networkRequests}
- JSON data sources: ${dataAvailable.jsonData}
- API endpoints: ${dataAvailable.apiEndpoints}
- localStorage keys: ${dataAvailable.localStorage}` : ''}

## ROUTING OPTIONS

### 1. STANDARD AI (Simple Actions) ⚡
**Use for simple, predefined actions:**
- ✅ Styling changes (colors, fonts, spacing, themes)
- ✅ Hide/show/remove elements (ads, popups, sidebars)
- ✅ Basic CSS modifications
- ✅ Click buttons, fill forms
- ✅ Text replacement
- ✅ Add/remove classes

**Examples that MUST go to STANDARD:**
- "Make background dark"
- "Hide all ads" ← IMPORTANT: Simple hide action
- "Remove ads" ← IMPORTANT: Simple remove action
- "Increase font size"
- "Remove sidebar"
- "Hide popups"
- "Change colors"
- "Make text bigger"

### 2. AI TREATMENT (Complex with Codex) 🔬
**Use ONLY for complex operations requiring custom code:**
- ✅ Data extraction from APIs/JSON
- ✅ Creating dashboards/visualizations
- ✅ Complete page redesigns
- ✅ Storage management (view/export localStorage)
- ✅ Network monitoring (live API tracking)
- ✅ Framework-specific edits (React/Vue state)
- ✅ Custom UI components from scratch
- ✅ Data export/import operations

**Examples that go to TREATMENT:**
- "Extract all products from API and create table"
- "Create a dashboard from the JSON data"
- "Show me all localStorage contents"
- "Monitor API requests in real-time"
- "Export data as CSV file"
- "Redesign entire page as card layout"

## YOUR TASK

Analyze the request and respond with JSON:

{
  "route": "standard" | "treatment",
  "confidence": 0.0-1.0,
  "reasoning": "Brief explanation of why this route",
  "requestType": "styling" | "hiding" | "extraction" | "transformation" | "monitoring" | "other",
  "requiresData": boolean,
  "complexity": "simple" | "moderate" | "complex",
  "suggestedApproach": "Brief suggestion for handling"
}

## DECISION CRITERIA (IMPORTANT)

**Route to STANDARD if:**
- ✅ Simple styling/CSS changes
- ✅ Hide/show/remove elements (including ads, popups)
- ✅ Basic element manipulation
- ✅ No data extraction needed
- ✅ Predefined actions sufficient
- ✅ User wants to hide/remove something

**Route to TREATMENT if:**
- ✅ Needs to ACCESS scraped data (not just hide elements)
- ✅ Complex data extraction from APIs
- ✅ Custom code generation required
- ✅ Framework-specific operations
- ✅ Data visualization needed
- ✅ Storage/network VIEWING operations
- ✅ Complete page redesign

**KEY RULE:** If user wants to HIDE, REMOVE, or STYLE something → STANDARD
If user wants to EXTRACT, VIEW, or CREATE from data → TREATMENT

Respond with ONLY the JSON object.`;
    }

    /**
     * Route request to appropriate handler
     */
    async routeRequest(userRequest, pageContext, currentTab) {
        console.log('🧭 Routing request:', userRequest);

        // Analyze request with GPT-4o
        const analysisResult = await this.analyzeRequest(userRequest, pageContext);

        if (!analysisResult.success) {
            return {
                success: false,
                error: 'Failed to analyze request: ' + analysisResult.error,
                route: 'error'
            };
        }

        const analysis = analysisResult.analysis;

        // Store in history
        this.routingHistory.push({
            request: userRequest,
            analysis: analysis,
            timestamp: Date.now()
        });

        console.log(`📍 Routing to: ${analysis.route.toUpperCase()}`);
        console.log(`💡 Reasoning: ${analysis.reasoning}`);
        console.log(`🎯 Confidence: ${(analysis.confidence * 100).toFixed(0)}%`);

        // Route based on analysis
        if (analysis.route === 'treatment') {
            return await this.routeToTreatment(userRequest, analysis);
        } else {
            return await this.routeToStandard(userRequest, currentTab, analysis);
        }
    }

    /**
     * Route to AI Treatment (Codex)
     */
    async routeToTreatment(userRequest, analysis) {
        console.log('🔬 Routing to AI Treatment (Codex)');

        if (!this.aiTreatment) {
            return {
                success: false,
                error: 'AI Treatment not initialized',
                route: 'treatment'
            };
        }

        // Initialize if needed
        if (!this.aiTreatment.scrapedData) {
            await this.aiTreatment.initialize();
        }

        // Apply treatment
        const result = await this.aiTreatment.applyTreatment(userRequest);

        return {
            success: result.success,
            route: 'treatment',
            analysis: analysis,
            result: result,
            message: result.success ? 
                `✅ Treatment applied (${analysis.requestType})` : 
                `❌ Treatment failed: ${result.error}`,
            generatedCode: result.code,
            executionResult: result.result
        };
    }

    /**
     * Route to Standard AI (Actions)
     */
    async routeToStandard(userRequest, currentTab, analysis) {
        console.log('⚡ Routing to Standard AI (Actions)');

        if (!this.aiController) {
            return {
                success: false,
                error: 'AI Controller not initialized',
                route: 'standard'
            };
        }

        // Process with standard AI
        const result = await this.aiController.processMessage(userRequest, currentTab);

        return {
            success: result.success,
            route: 'standard',
            analysis: analysis,
            result: result,
            message: result.success ? 
                `✅ Actions applied (${analysis.requestType})` : 
                `❌ Failed: ${result.error}`,
            actions: result.actions
        };
    }

    /**
     * Smart routing with automatic fallback
     */
    async smartRoute(userRequest, pageContext, currentTab) {
        console.log('🤖 Smart routing with fallback...');

        // Try primary route
        const result = await this.routeRequest(userRequest, pageContext, currentTab);

        // If failed and confidence was low, try alternative route
        if (!result.success && result.analysis?.confidence < 0.7) {
            console.log('⚠️ Primary route failed, trying alternative...');

            const alternativeRoute = result.route === 'treatment' ? 'standard' : 'treatment';
            console.log(`🔄 Falling back to: ${alternativeRoute}`);

            if (alternativeRoute === 'treatment') {
                return await this.routeToTreatment(userRequest, {
                    route: 'treatment',
                    confidence: 0.5,
                    reasoning: 'Fallback from failed standard route'
                });
            } else {
                return await this.routeToStandard(userRequest, currentTab, {
                    route: 'standard',
                    confidence: 0.5,
                    reasoning: 'Fallback from failed treatment route'
                });
            }
        }

        return result;
    }

    /**
     * Get routing statistics
     */
    getStatistics() {
        const total = this.routingHistory.length;
        const byRoute = {
            standard: 0,
            treatment: 0
        };
        const byType = {};
        let totalConfidence = 0;

        this.routingHistory.forEach(entry => {
            byRoute[entry.analysis.route]++;
            byType[entry.analysis.requestType] = (byType[entry.analysis.requestType] || 0) + 1;
            totalConfidence += entry.analysis.confidence;
        });

        return {
            total: total,
            byRoute: byRoute,
            byType: byType,
            averageConfidence: total > 0 ? totalConfidence / total : 0,
            history: this.routingHistory.slice(-10) // Last 10
        };
    }

    /**
     * Get routing history
     */
    getHistory() {
        return this.routingHistory.map(entry => ({
            request: entry.request,
            route: entry.analysis.route,
            type: entry.analysis.requestType,
            confidence: entry.analysis.confidence,
            timestamp: new Date(entry.timestamp).toLocaleString()
        }));
    }

    /**
     * Clear history
     */
    clearHistory() {
        this.routingHistory = [];
        console.log('🗑️ Routing history cleared');
    }

    /**
     * Manual route override (for testing)
     */
    async forceRoute(userRequest, route, pageContext, currentTab) {
        console.log(`🔧 Force routing to: ${route}`);

        const analysis = {
            route: route,
            confidence: 1.0,
            reasoning: 'Manual override',
            requestType: 'manual',
            requiresData: route === 'treatment',
            complexity: 'unknown'
        };

        if (route === 'treatment') {
            return await this.routeToTreatment(userRequest, analysis);
        } else {
            return await this.routeToStandard(userRequest, currentTab, analysis);
        }
    }

    /**
     * Suggest best route without executing
     */
    async suggestRoute(userRequest, pageContext) {
        const analysisResult = await this.analyzeRequest(userRequest, pageContext);
        
        if (!analysisResult.success) {
            return {
                success: false,
                error: analysisResult.error
            };
        }

        return {
            success: true,
            suggestion: analysisResult.analysis,
            explanation: this.explainRouting(analysisResult.analysis)
        };
    }

    /**
     * Explain routing decision in user-friendly way
     */
    explainRouting(analysis) {
        const routeName = analysis.route === 'treatment' ? 
            'AI Treatment (Codex)' : 'Standard AI (Actions)';

        const confidenceText = analysis.confidence > 0.8 ? 'High' :
                              analysis.confidence > 0.6 ? 'Medium' : 'Low';

        return `
Route: ${routeName}
Confidence: ${confidenceText} (${(analysis.confidence * 100).toFixed(0)}%)
Type: ${analysis.requestType}
Complexity: ${analysis.complexity}

Reasoning: ${analysis.reasoning}

Approach: ${analysis.suggestedApproach}
        `.trim();
    }

    /**
     * Get routing recommendation
     */
    getRecommendation(userRequest) {
        // Simple heuristics for quick recommendation
        const lowerRequest = userRequest.toLowerCase();
        
        // Strong indicators for STANDARD (simple actions)
        const standardKeywords = [
            'hide', 'show', 'remove', 'delete', 'color', 'background', 'font',
            'size', 'style', 'theme', 'dark', 'light', 'center',
            'align', 'spacing', 'margin', 'padding', 'ads', 'popup', 'banner',
            'sidebar', 'bigger', 'smaller', 'change color'
        ];
        
        // Strong indicators for TREATMENT (complex operations)
        const treatmentKeywords = [
            'extract', 'data from', 'api', 'json from', 'export to', 'dashboard',
            'chart', 'graph', 'visualize', 'monitor api', 'analyze',
            'show me all', 'view storage', 'localstorage contents', 'create table from',
            'create list from', 'display data from', 'redesign as', 'rebuild'
        ];
        
        // Check for strong standard indicators first
        const hasStandardKeyword = standardKeywords.some(keyword => 
            lowerRequest.includes(keyword)
        );
        
        // Check for treatment indicators
        const hasTreatmentKeyword = treatmentKeywords.some(keyword => 
            lowerRequest.includes(keyword)
        );
        
        // Special case: "remove ads", "hide ads" should ALWAYS be standard
        if (lowerRequest.match(/\b(hide|remove|delete)\s+(all\s+)?(ads|advertisements|popups?|banners?)\b/)) {
            return {
                route: 'standard',
                confidence: 0.95,
                reason: 'Simple hide/remove action'
            };
        }
        
        // If has treatment keywords but also has standard keywords, prefer standard
        if (hasStandardKeyword && !hasTreatmentKeyword) {
            return {
                route: 'standard',
                confidence: 0.9,
                reason: 'Request contains styling/simple action keywords'
            };
        }
        
        if (hasTreatmentKeyword && !hasStandardKeyword) {
            return {
                route: 'treatment',
                confidence: 0.9,
                reason: 'Request contains data/extraction keywords'
            };
        }
        
        // Default to standard for ambiguous cases
        return {
            route: 'standard',
            confidence: 0.6,
            reason: 'Default to standard for simple requests'
        };
    }
}

// Export for use in renderer
if (typeof window !== 'undefined') {
    window.AIRouter = AIRouter;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = AIRouter;
}
