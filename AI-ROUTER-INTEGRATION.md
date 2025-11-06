# 🧭 AI Router Integration Guide

## Overview

The **AI Router** uses GPT-4o to intelligently analyze user requests and route them to the best handler:
- **Standard AI** → Simple styling and actions
- **AI Treatment (Codex)** → Complex data extraction and transformations

## Architecture

```
User Request
     ↓
GPT-4o Analysis (understands intent)
     ↓
Routing Decision
     ├─→ Standard AI (simple edits)
     └─→ AI Treatment (complex transformations)
```

## Integration in renderer.js

### Step 1: Initialize All Systems

```javascript
// Initialize AI systems
const aiController = new AIController();
const aiTreatment = new AITreatment();
const aiRouter = new AIRouter();

// Initialize router with dependencies
aiRouter.initialize(aiController, aiTreatment);

// Initialize treatment system
await aiTreatment.initialize();

console.log('✅ All AI systems initialized');
```

### Step 2: Replace sendAIMessage Function

Replace your existing `sendAIMessage` function with this smart routing version:

```javascript
async function sendAIMessage() {
    const message = aiInput.value.trim();
    if (!message) return;
    
    // Add user message to UI
    aiUI.addUserMessage(message);
    aiUI.clearInput();
    aiUI.showLoading();
    
    try {
        // Get page context
        const currentTab = tabs.find(t => t.id === activeTabId);
        const pageContext = await getPageContext(); // Your existing function
        
        // Smart route with GPT-4o
        const result = await aiRouter.smartRoute(message, pageContext, currentTab);
        
        aiUI.hideLoading();
        
        if (result.success) {
            // Show which route was used
            const routeBadge = result.route === 'treatment' ? 
                '🔬 Treatment (Codex)' : '⚡ Standard AI';
            
            aiUI.addAIMessage(`${routeBadge} • ${result.message}`);
            
            // Show analysis info
            if (result.analysis) {
                const analysisText = `
📊 Analysis:
• Type: ${result.analysis.requestType}
• Complexity: ${result.analysis.complexity}
• Confidence: ${(result.analysis.confidence * 100).toFixed(0)}%
• Reasoning: ${result.analysis.reasoning}
                `.trim();
                
                aiUI.addAIMessage(analysisText, false); // Don't save to history
            }
            
            // Handle route-specific results
            if (result.route === 'treatment') {
                // Show generated code
                if (result.generatedCode) {
                    const codeBlock = document.createElement('div');
                    codeBlock.className = 'code-block';
                    codeBlock.style.cssText = `
                        background: #1e1e1e;
                        color: #d4d4d4;
                        padding: 12px;
                        border-radius: 6px;
                        margin: 10px 0;
                        font-family: 'Monaco', 'Menlo', monospace;
                        font-size: 12px;
                        overflow-x: auto;
                        max-height: 300px;
                        overflow-y: auto;
                    `;
                    codeBlock.innerHTML = `
                        <div style="color: #888; margin-bottom: 8px;">Generated Code:</div>
                        <pre style="margin: 0;">${escapeHtml(result.generatedCode)}</pre>
                    `;
                    document.getElementById('ai-messages').appendChild(codeBlock);
                }
                
                // Show execution result
                if (result.executionResult) {
                    aiUI.addAIMessage(`Result: ${JSON.stringify(result.executionResult, null, 2)}`);
                }
            } else {
                // Standard AI - show actions
                if (result.actions?.actions?.length > 0) {
                    const domain = getCurrentDomain();
                    aiUI.addActionsDisplay(
                        result.actions.actions,
                        domain,
                        (domain, name, actions) => {
                            aiController.saveRule(domain, name, actions);
                        }
                    );
                }
            }
        } else {
            aiUI.addError(`Failed: ${result.error}`);
        }
        
    } catch (error) {
        aiUI.hideLoading();
        aiUI.addError(`Error: ${error.message}`);
        console.error('AI routing error:', error);
    }
}

// Helper function to escape HTML
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
```

### Step 3: Add Routing Stats Button (Optional)

```javascript
// Add stats button to AI header
const statsBtn = document.createElement('button');
statsBtn.id = 'routing-stats-btn';
statsBtn.innerHTML = '📊 Stats';
statsBtn.title = 'View routing statistics';
statsBtn.style.cssText = `
    padding: 6px 12px;
    background: #3b82f6;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-size: 12px;
    margin-left: 8px;
`;

statsBtn.addEventListener('click', () => {
    const stats = aiRouter.getStatistics();
    
    const statsModal = document.createElement('div');
    statsModal.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: white;
        padding: 24px;
        border-radius: 12px;
        box-shadow: 0 10px 40px rgba(0,0,0,0.3);
        z-index: 10000;
        max-width: 500px;
        max-height: 80vh;
        overflow-y: auto;
    `;
    
    statsModal.innerHTML = `
        <h2 style="margin-top: 0;">🧭 Routing Statistics</h2>
        
        <div style="margin: 16px 0;">
            <strong>Total Requests:</strong> ${stats.total}
        </div>
        
        <div style="margin: 16px 0;">
            <strong>By Route:</strong>
            <ul>
                <li>⚡ Standard AI: ${stats.byRoute.standard}</li>
                <li>🔬 Treatment (Codex): ${stats.byRoute.treatment}</li>
            </ul>
        </div>
        
        <div style="margin: 16px 0;">
            <strong>By Type:</strong>
            <ul>
                ${Object.entries(stats.byType).map(([type, count]) => 
                    `<li>${type}: ${count}</li>`
                ).join('')}
            </ul>
        </div>
        
        <div style="margin: 16px 0;">
            <strong>Average Confidence:</strong> ${(stats.averageConfidence * 100).toFixed(0)}%
        </div>
        
        <div style="margin: 16px 0;">
            <strong>Recent History:</strong>
            <div style="max-height: 200px; overflow-y: auto; font-size: 12px;">
                ${stats.history.map(h => `
                    <div style="padding: 8px; border-bottom: 1px solid #eee;">
                        <div><strong>${h.request}</strong></div>
                        <div style="color: #666;">
                            ${h.route === 'treatment' ? '🔬' : '⚡'} ${h.route} • 
                            ${h.type} • 
                            ${(h.confidence * 100).toFixed(0)}%
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
        
        <button onclick="this.parentElement.remove()" style="
            padding: 8px 16px;
            background: #3b82f6;
            color: white;
            border: none;
            border-radius: 6px;
            cursor: pointer;
            width: 100%;
        ">Close</button>
    `;
    
    document.body.appendChild(statsModal);
});

document.querySelector('.ai-header').appendChild(statsBtn);
```

### Step 4: Add Manual Route Override (Optional)

```javascript
// Add route selector for manual override
const routeSelector = document.createElement('select');
routeSelector.id = 'manual-route';
routeSelector.style.cssText = `
    padding: 6px;
    border-radius: 6px;
    border: 1px solid #ddd;
    font-size: 12px;
    margin-left: 8px;
`;
routeSelector.innerHTML = `
    <option value="auto">🤖 Auto Route</option>
    <option value="standard">⚡ Force Standard</option>
    <option value="treatment">🔬 Force Treatment</option>
`;

document.querySelector('.ai-header').appendChild(routeSelector);

// Modify sendAIMessage to check manual override
async function sendAIMessage() {
    const message = aiInput.value.trim();
    if (!message) return;
    
    const manualRoute = document.getElementById('manual-route').value;
    
    aiUI.addUserMessage(message);
    aiUI.clearInput();
    aiUI.showLoading();
    
    try {
        const currentTab = tabs.find(t => t.id === activeTabId);
        const pageContext = await getPageContext();
        
        let result;
        
        if (manualRoute === 'auto') {
            // Smart routing with GPT-4o
            result = await aiRouter.smartRoute(message, pageContext, currentTab);
        } else {
            // Force specific route
            result = await aiRouter.forceRoute(message, manualRoute, pageContext, currentTab);
        }
        
        // ... rest of handling
    } catch (error) {
        // ... error handling
    }
}
```

## Complete Integration Example

Here's a complete example of integrating the router into your renderer.js:

```javascript
// ============================================
// AI SYSTEMS INITIALIZATION
// ============================================

// Initialize all AI components
const aiController = new AIController();
const aiTreatment = new AITreatment();
const aiRouter = new AIRouter();
const aiUI = new AIUIHandler(
    document.getElementById('ai-messages'),
    document.getElementById('ai-input')
);

// Initialize router
aiRouter.initialize(aiController, aiTreatment);

// Initialize treatment system
(async () => {
    await aiTreatment.initialize();
    console.log('✅ AI systems ready');
})();

// ============================================
// SEND AI MESSAGE WITH SMART ROUTING
// ============================================

async function sendAIMessage() {
    const message = aiInput.value.trim();
    if (!message) return;
    
    // UI updates
    aiUI.addUserMessage(message);
    aiUI.clearInput();
    aiUI.showLoading();
    
    try {
        // Get context
        const currentTab = tabs.find(t => t.id === activeTabId);
        const pageContext = {
            url: currentTab?.url,
            title: currentTab?.title,
            scrapedData: await getScrapedData() // Your function
        };
        
        // Smart route
        const result = await aiRouter.smartRoute(message, pageContext, currentTab);
        
        aiUI.hideLoading();
        
        if (result.success) {
            // Show route badge
            const badge = result.route === 'treatment' ? '🔬 Codex' : '⚡ Standard';
            aiUI.addAIMessage(`${badge} • ${result.message}`);
            
            // Show analysis
            if (result.analysis) {
                aiUI.addAIMessage(
                    `Type: ${result.analysis.requestType} | ` +
                    `Confidence: ${(result.analysis.confidence * 100).toFixed(0)}%`,
                    false
                );
            }
            
            // Route-specific handling
            if (result.route === 'treatment') {
                handleTreatmentResult(result);
            } else {
                handleStandardResult(result);
            }
        } else {
            aiUI.addError(result.error);
        }
        
    } catch (error) {
        aiUI.hideLoading();
        aiUI.addError(error.message);
        console.error('AI error:', error);
    }
}

function handleTreatmentResult(result) {
    // Show generated code
    if (result.generatedCode) {
        const codeEl = document.createElement('div');
        codeEl.className = 'generated-code';
        codeEl.innerHTML = `<pre>${escapeHtml(result.generatedCode)}</pre>`;
        document.getElementById('ai-messages').appendChild(codeEl);
    }
    
    // Show result
    if (result.executionResult) {
        aiUI.addAIMessage(`Result: ${JSON.stringify(result.executionResult, null, 2)}`);
    }
}

function handleStandardResult(result) {
    // Show actions with save option
    if (result.actions?.actions?.length > 0) {
        const domain = getCurrentDomain();
        aiUI.addActionsDisplay(
            result.actions.actions,
            domain,
            (domain, name, actions) => {
                aiController.saveRule(domain, name, actions);
            }
        );
    }
}

// ============================================
// EVENT LISTENERS
// ============================================

// Send button
document.getElementById('ai-send-btn').addEventListener('click', sendAIMessage);

// Enter key
document.getElementById('ai-input').addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendAIMessage();
    }
});
```

## API Reference

### AIRouter Methods

```javascript
// Initialize
aiRouter.initialize(aiController, aiTreatment)

// Smart routing (with fallback)
await aiRouter.smartRoute(userRequest, pageContext, currentTab)

// Manual routing
await aiRouter.routeRequest(userRequest, pageContext, currentTab)

// Force specific route
await aiRouter.forceRoute(userRequest, 'standard|treatment', pageContext, currentTab)

// Get suggestion without executing
await aiRouter.suggestRoute(userRequest, pageContext)

// Statistics
aiRouter.getStatistics()
aiRouter.getHistory()
aiRouter.clearHistory()

// Quick recommendation
aiRouter.getRecommendation(userRequest)
```

## Routing Logic

### GPT-4o Analyzes:
1. **Request intent** - What user wants to do
2. **Complexity** - Simple vs complex operation
3. **Data requirements** - Needs scraped data?
4. **Best approach** - Which handler fits better

### Routes to Standard AI if:
- ✅ Simple styling (colors, fonts, spacing)
- ✅ Basic element manipulation (hide/show/remove)
- ✅ Predefined actions sufficient
- ✅ No data extraction needed

### Routes to Treatment (Codex) if:
- ✅ Data extraction from APIs
- ✅ Complex transformations
- ✅ Storage/network operations
- ✅ Custom code generation needed
- ✅ Framework-specific edits

## Example Routing Decisions

| Request | Route | Reasoning |
|---------|-------|-----------|
| "Make background dark" | Standard | Simple CSS change |
| "Extract all products from API" | Treatment | Data extraction needed |
| "Hide all ads" | Standard | Simple element hiding |
| "Create dashboard from JSON data" | Treatment | Complex transformation |
| "Increase font size" | Standard | Simple styling |
| "Show me all localStorage" | Treatment | Storage access needed |
| "Remove sidebar" | Standard | Simple DOM manipulation |
| "Monitor API requests" | Treatment | Network monitoring |

## Benefits

### 1. Intelligent Routing
- GPT-4o understands user intent
- Routes to best handler automatically
- High accuracy with confidence scores

### 2. Automatic Fallback
- If primary route fails, tries alternative
- Ensures requests are handled
- Improves success rate

### 3. Better User Experience
- Users don't need to choose mode
- System picks best approach
- Transparent routing decisions

### 4. Analytics
- Track routing patterns
- Understand usage
- Optimize over time

## Troubleshooting

### Router not working
- Check GPT-4o API key configured
- Verify aiController and aiTreatment initialized
- Check console for errors

### Wrong route chosen
- Review routing decision in stats
- Check confidence score
- Use manual override if needed

### Low confidence scores
- Request might be ambiguous
- Rephrase more clearly
- Use manual route selector

## Testing

```javascript
// Test routing without execution
const suggestion = await aiRouter.suggestRoute(
    "Extract all products",
    pageContext
);
console.log(suggestion);

// Test specific route
const result = await aiRouter.forceRoute(
    "Make background dark",
    'standard',
    pageContext,
    currentTab
);

// View statistics
console.log(aiRouter.getStatistics());
```

## Performance

- **GPT-4o Analysis**: ~1-2s
- **Routing Decision**: < 10ms
- **Total Overhead**: ~1-2s per request
- **Worth it**: Much better results!

## Summary

The AI Router provides:
- ✅ Intelligent request analysis with GPT-4o
- ✅ Automatic routing to best handler
- ✅ Fallback for failed routes
- ✅ Analytics and statistics
- ✅ Manual override option
- ✅ Better user experience

All AI requests now go through smart routing for optimal results! 🎯
