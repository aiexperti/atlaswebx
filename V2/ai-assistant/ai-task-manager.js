/**
 * AI Task Manager - Autonomous DOM Task Execution
 * Automatically handles and executes DOM manipulation tasks
 */

class AITaskManager {
    constructor() {
        this.aiRouter = null;
        this.aiController = null;
        this.aiTreatment = null;
        this.taskQueue = [];
        this.executingTask = false;
        this.autoExecute = true; // Auto-execute by default
    }

    /**
     * Initialize with AI components
     */
    initialize(aiRouter, aiController, aiTreatment) {
        this.aiRouter = aiRouter;
        this.aiController = aiController;
        this.aiTreatment = aiTreatment;
        console.log('🤖 AI Task Manager initialized - Auto-execution enabled');
    }

    /**
     * Process user request and automatically execute
     */
    async processTask(userRequest, pageContext, currentTab) {
        console.log('🤖 AI Task Manager processing:', userRequest);

        // Add to queue
        const task = {
            id: Date.now(),
            request: userRequest,
            status: 'processing',
            timestamp: Date.now()
        };
        this.taskQueue.push(task);

        try {
            // Route and execute automatically
            const result = await this.aiRouter.smartRoute(
                userRequest,
                pageContext,
                currentTab
            );

            if (result.success) {
                task.status = 'completed';
                task.result = result;
                
                console.log('✅ Task completed:', {
                    route: result.route,
                    confidence: result.analysis?.confidence,
                    message: result.message
                });

                return {
                    success: true,
                    task: task,
                    result: result,
                    message: `✅ Task completed via ${result.route === 'treatment' ? 'Codex' : 'Standard AI'}`
                };
            } else {
                task.status = 'failed';
                task.error = result.error;
                
                console.error('❌ Task failed:', result.error);

                return {
                    success: false,
                    task: task,
                    error: result.error,
                    message: `❌ Task failed: ${result.error}`
                };
            }

        } catch (error) {
            task.status = 'failed';
            task.error = error.message;
            
            console.error('❌ Task error:', error);

            return {
                success: false,
                task: task,
                error: error.message,
                message: `❌ Error: ${error.message}`
            };
        }
    }

    /**
     * Execute multiple tasks in sequence
     */
    async processBatch(requests, pageContext, currentTab) {
        console.log(`🤖 Processing batch of ${requests.length} tasks`);

        const results = [];

        for (const request of requests) {
            const result = await this.processTask(request, pageContext, currentTab);
            results.push(result);

            // Small delay between tasks
            await new Promise(resolve => setTimeout(resolve, 500));
        }

        const successful = results.filter(r => r.success).length;
        const failed = results.filter(r => !r.success).length;

        console.log(`✅ Batch complete: ${successful} successful, ${failed} failed`);

        return {
            success: failed === 0,
            results: results,
            summary: {
                total: requests.length,
                successful: successful,
                failed: failed
            }
        };
    }

    /**
     * Smart task breakdown - Break complex requests into steps
     */
    async processComplexTask(userRequest, pageContext, currentTab) {
        console.log('🧠 Analyzing complex task:', userRequest);

        // Use GPT-4o to break down into steps
        const settings = JSON.parse(localStorage.getItem('ai-settings') || '{}');
        const apiKey = settings.openaiKey;

        if (!apiKey) {
            return {
                success: false,
                error: 'API key not configured'
            };
        }

        try {
            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`
                },
                body: JSON.stringify({
                    model: 'gpt-4o',
                    messages: [{
                        role: 'system',
                        content: 'You break down complex web page modification tasks into sequential steps.'
                    }, {
                        role: 'user',
                        content: `Break down this task into sequential steps:

"${userRequest}"

Page: ${pageContext?.url || 'unknown'}

Respond with JSON:
{
  "steps": [
    "Step 1 description",
    "Step 2 description",
    ...
  ],
  "reasoning": "Why these steps"
}`
                    }],
                    temperature: 0.3,
                    max_tokens: 500,
                    response_format: { type: "json_object" }
                })
            });

            const data = await response.json();
            const breakdown = JSON.parse(data.choices[0].message.content);

            console.log('📋 Task breakdown:', breakdown);

            // Execute steps in sequence
            return await this.processBatch(breakdown.steps, pageContext, currentTab);

        } catch (error) {
            console.error('❌ Task breakdown failed:', error);
            
            // Fallback: execute as single task
            return await this.processTask(userRequest, pageContext, currentTab);
        }
    }

    /**
     * Auto-execute with natural language understanding
     */
    async handleNaturalLanguage(userMessage, pageContext, currentTab) {
        console.log('💬 Processing natural language:', userMessage);

        // Detect if it's a question or a command
        const isQuestion = /^(what|how|why|when|where|who|can you|could you|would you|is|are|do|does)\b/i.test(userMessage.trim());
        const isCommand = /^(please |could you |can you )?(.+)/i.test(userMessage.trim());

        if (isQuestion) {
            // Handle as informational query
            return {
                success: true,
                type: 'question',
                message: 'This appears to be a question. I can help with page modifications.',
                suggestion: 'Try commands like: "hide ads", "make background dark", "extract data"'
            };
        }

        // Extract command from polite phrases
        let command = userMessage
            .replace(/^(please |could you |can you |would you )/i, '')
            .trim();

        // Auto-execute the command
        return await this.processTask(command, pageContext, currentTab);
    }

    /**
     * Continuous monitoring mode - Execute tasks as they come
     */
    startContinuousMode() {
        this.autoExecute = true;
        console.log('🔄 Continuous mode enabled - Tasks will auto-execute');
    }

    stopContinuousMode() {
        this.autoExecute = false;
        console.log('⏸️ Continuous mode disabled');
    }

    /**
     * Get task history
     */
    getTaskHistory() {
        return this.taskQueue.map(task => ({
            id: task.id,
            request: task.request,
            status: task.status,
            timestamp: new Date(task.timestamp).toLocaleString(),
            route: task.result?.route,
            confidence: task.result?.analysis?.confidence
        }));
    }

    /**
     * Clear task history
     */
    clearHistory() {
        this.taskQueue = [];
        console.log('🗑️ Task history cleared');
    }

    /**
     * Get task statistics
     */
    getStatistics() {
        const total = this.taskQueue.length;
        const completed = this.taskQueue.filter(t => t.status === 'completed').length;
        const failed = this.taskQueue.filter(t => t.status === 'failed').length;
        const processing = this.taskQueue.filter(t => t.status === 'processing').length;

        return {
            total: total,
            completed: completed,
            failed: failed,
            processing: processing,
            successRate: total > 0 ? (completed / total * 100).toFixed(1) + '%' : '0%'
        };
    }

    /**
     * Smart suggestions based on page content
     */
    async getSuggestions(pageContext) {
        const suggestions = [];

        // Analyze page and suggest tasks
        if (pageContext?.scrapedData) {
            const data = pageContext.scrapedData;

            // Suggest based on what's available
            if (data.summary?.networkRequests > 0) {
                suggestions.push({
                    task: 'Show me all API requests',
                    reason: `Found ${data.summary.networkRequests} network requests`,
                    complexity: 'moderate'
                });
            }

            if (data.summary?.jsonDataPoints > 0) {
                suggestions.push({
                    task: 'Extract and display the JSON data',
                    reason: `Found ${data.summary.jsonDataPoints} JSON data sources`,
                    complexity: 'complex'
                });
            }

            if (data.summary?.localStorageKeys > 0) {
                suggestions.push({
                    task: 'Show me localStorage contents',
                    reason: `Found ${data.summary.localStorageKeys} localStorage items`,
                    complexity: 'simple'
                });
            }
        }

        // Common suggestions
        suggestions.push(
            { task: 'Hide all ads', reason: 'Clean up the page', complexity: 'simple' },
            { task: 'Make background dark', reason: 'Apply dark theme', complexity: 'simple' },
            { task: 'Increase font size', reason: 'Improve readability', complexity: 'simple' }
        );

        return suggestions;
    }

    /**
     * Execute suggested task
     */
    async executeSuggestion(suggestion, pageContext, currentTab) {
        console.log('💡 Executing suggestion:', suggestion.task);
        return await this.processTask(suggestion.task, pageContext, currentTab);
    }
}

// Export for use in renderer
if (typeof window !== 'undefined') {
    window.AITaskManager = AITaskManager;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = AITaskManager;
}
