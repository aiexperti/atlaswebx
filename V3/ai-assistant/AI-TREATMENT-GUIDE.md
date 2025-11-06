# 🔬 AI Treatment System - Complete Guide

## Overview

**AI Treatment** is an advanced DOM manipulation system that combines:
- 📊 **Scraped page data** (network, storage, APIs, frameworks)
- 🤖 **GPT-5 Codex** (code generation AI)
- ⚡ **Direct DOM manipulation** (executable JavaScript)

Unlike the standard AI assistant that generates actions, AI Treatment generates **complete JavaScript code** that intelligently uses all captured data to modify the page.

## How It Works

```
1. User makes request
   ↓
2. System gathers comprehensive context:
   - Scraped network data
   - Storage data
   - DOM analysis
   - Framework detection
   ↓
3. GPT-5 Codex generates JavaScript code
   ↓
4. Code executed in page context
   ↓
5. DOM modified with full data access
```

## Key Differences from Standard AI Assistant

| Feature | Standard AI | AI Treatment |
|---------|-------------|--------------|
| **Output** | JSON actions | JavaScript code |
| **Data Access** | Limited context | Full scraped data |
| **Flexibility** | Predefined actions | Any DOM manipulation |
| **Complexity** | Simple edits | Complex transformations |
| **Code Quality** | Template-based | AI-generated custom code |

## Installation

Already included! Just make sure `ai-treatment.js` is loaded in `index.html`:

```html
<script src="ai-assistant/ai-treatment.js"></script>
```

## Basic Usage

### Initialize Treatment System

```javascript
// In renderer.js or your code
const aiTreatment = new AITreatment();

// Initialize (gets scraped data and analyzes DOM)
await aiTreatment.initialize();
```

### Apply Treatment

```javascript
// Simple request
const result = await aiTreatment.applyTreatment(
    "Extract all product data and create a sortable table"
);

if (result.success) {
    console.log('✅ Treatment applied!');
    console.log('Generated code:', result.code);
    console.log('Result:', result.result);
}
```

### Use Presets

```javascript
// Quick presets for common tasks
await aiTreatment.applyPreset('extract-data');
await aiTreatment.applyPreset('dark-theme');
await aiTreatment.applyPreset('reader-mode');
await aiTreatment.applyPreset('data-export');
await aiTreatment.applyPreset('storage-view');
await aiTreatment.applyPreset('api-monitor');
```

## Advanced Usage

### Access Scraped Data in Treatment

The generated code has full access to scraped data:

```javascript
// Request: "Show me all API endpoints that were called"
// Generated code will access:

const scrapedData = window.__aiPageData;
const apiCalls = scrapedData.apiResponses;

// Create UI to display them
const modal = document.createElement('div');
modal.innerHTML = `
    <h2>API Endpoints (${apiCalls.length})</h2>
    <ul>
        ${apiCalls.map(api => `
            <li>${api.method} ${api.url}</li>
        `).join('')}
    </ul>
`;
document.body.appendChild(modal);
```

### Custom Treatment with Context

```javascript
const result = await aiTreatment.applyTreatment(`
    Use the JSON data from API responses to create a dashboard.
    Include:
    - Total items count
    - Data visualization
    - Filter controls
    Make it look modern with Tailwind-style CSS.
`);
```

## Example Use Cases

### 1. Extract & Display API Data

```javascript
await aiTreatment.applyTreatment(
    "Extract all product data from API responses and display in a grid with images, prices, and ratings"
);
```

**What GPT-5 Codex generates:**
```javascript
(async function() {
    try {
        const scrapedData = window.__aiPageData;
        const products = scrapedData.jsonData
            .filter(item => item.source === 'fetch' || item.source === 'xhr')
            .flatMap(item => item.data.products || []);
        
        // Create grid
        const grid = document.createElement('div');
        grid.style.cssText = 'display:grid;grid-template-columns:repeat(auto-fill,minmax(250px,1fr));gap:20px;padding:20px;';
        
        products.forEach(product => {
            const card = document.createElement('div');
            card.innerHTML = `
                <img src="${product.image}" style="width:100%;height:200px;object-fit:cover;">
                <h3>${product.name}</h3>
                <p>$${product.price}</p>
                <p>⭐ ${product.rating}/5</p>
            `;
            grid.appendChild(card);
        });
        
        document.body.innerHTML = '';
        document.body.appendChild(grid);
        
        return { success: true, message: `Displayed ${products.length} products` };
    } catch (error) {
        return { success: false, error: error.message };
    }
})();
```

### 2. Storage Inspector

```javascript
await aiTreatment.applyTreatment(
    "Create a floating panel showing all localStorage and sessionStorage data with search and export functionality"
);
```

### 3. Network Monitor

```javascript
await aiTreatment.applyTreatment(
    "Create a live network monitor that shows all XHR/Fetch requests in real-time with status codes and response times"
);
```

### 4. Framework-Aware Editing

```javascript
await aiTreatment.applyTreatment(
    "This is a React app. Access the Redux store and display the current state in a debug panel"
);
```

### 5. Data Transformation

```javascript
await aiTreatment.applyTreatment(
    "Take the JSON data from the /api/users endpoint and create a CSV download link"
);
```

### 6. Performance Analysis

```javascript
await aiTreatment.applyTreatment(
    "Analyze all network requests and create a performance report showing slowest endpoints and total load time"
);
```

## Integration with Renderer

### Add Treatment Button to AI Sidebar

```javascript
// In renderer.js

// Initialize treatment system
const aiTreatment = new AITreatment();

// Add button to AI header
const treatmentBtn = document.createElement('button');
treatmentBtn.id = 'treatment-mode-btn';
treatmentBtn.innerHTML = '🔬 Treatment';
treatmentBtn.title = 'AI Treatment Mode (GPT-5 Codex)';
treatmentBtn.style.cssText = 'padding:6px 12px;background:#8b5cf6;color:white;border:none;border-radius:6px;cursor:pointer;';

document.querySelector('.ai-header').appendChild(treatmentBtn);

// Toggle treatment mode
let treatmentMode = false;
treatmentBtn.addEventListener('click', () => {
    treatmentMode = !treatmentMode;
    treatmentBtn.style.background = treatmentMode ? '#7c3aed' : '#8b5cf6';
    treatmentBtn.innerHTML = treatmentMode ? '🔬 Treatment ON' : '🔬 Treatment';
});

// Modify send function
async function sendAIMessage() {
    const message = aiInput.value.trim();
    if (!message) return;
    
    aiUI.addUserMessage(message);
    aiUI.clearInput();
    aiUI.showLoading();
    
    if (treatmentMode) {
        // Use AI Treatment
        const result = await aiTreatment.applyTreatment(message);
        
        aiUI.hideLoading();
        
        if (result.success) {
            aiUI.addAIMessage('✅ Treatment applied successfully!');
            
            // Show generated code
            const codeBlock = document.createElement('div');
            codeBlock.style.cssText = 'background:#1e1e1e;color:#d4d4d4;padding:12px;border-radius:6px;margin:10px 0;font-family:monospace;font-size:12px;overflow-x:auto;';
            codeBlock.innerHTML = `<pre>${result.code}</pre>`;
            document.getElementById('ai-messages').appendChild(codeBlock);
            
            // Show result
            if (result.result) {
                aiUI.addAIMessage(`Result: ${JSON.stringify(result.result, null, 2)}`);
            }
        } else {
            aiUI.addError(`Treatment failed: ${result.error}`);
        }
    } else {
        // Use standard AI assistant
        const result = await aiController.processMessage(message, currentTab);
        // ... standard handling
    }
}
```

### Add Treatment Presets Menu

```javascript
// Create presets dropdown
const presetsMenu = document.createElement('select');
presetsMenu.id = 'treatment-presets';
presetsMenu.innerHTML = `
    <option value="">Quick Treatments...</option>
    <option value="extract-data">📊 Extract Data</option>
    <option value="dark-theme">🌙 Dark Theme</option>
    <option value="simplify">✨ Simplify Page</option>
    <option value="reader-mode">📖 Reader Mode</option>
    <option value="data-export">💾 Export Data</option>
    <option value="storage-view">🗄️ View Storage</option>
    <option value="api-monitor">📡 API Monitor</option>
    <option value="performance">⚡ Performance</option>
`;

presetsMenu.addEventListener('change', async (e) => {
    if (e.target.value) {
        aiUI.showLoading();
        const result = await aiTreatment.applyPreset(e.target.value);
        aiUI.hideLoading();
        
        if (result.success) {
            aiUI.addAIMessage(`✅ ${e.target.value} applied!`);
        } else {
            aiUI.addError(`Failed: ${result.error}`);
        }
        
        e.target.value = '';
    }
});

document.querySelector('.ai-header').appendChild(presetsMenu);
```

## API Reference

### Constructor

```javascript
const aiTreatment = new AITreatment();
```

### Methods

#### `initialize()`
Initialize the treatment system with scraped data and DOM analysis.

```javascript
const result = await aiTreatment.initialize();
// Returns: { success: boolean, dataAvailable: boolean, domAnalyzed: boolean }
```

#### `applyTreatment(userRequest)`
Apply a treatment based on user request.

```javascript
const result = await aiTreatment.applyTreatment("Your request here");
// Returns: { success: boolean, result: any, code: string, message: string }
```

#### `applyPreset(presetName)`
Apply a predefined treatment preset.

```javascript
const result = await aiTreatment.applyPreset('extract-data');
// Available presets: extract-data, dark-theme, simplify, reader-mode, 
//                    data-export, performance, storage-view, api-monitor
```

#### `undoTreatment()`
Undo the last treatment by reloading the page.

```javascript
await aiTreatment.undoTreatment();
```

#### `getHistory()`
Get treatment history.

```javascript
const history = aiTreatment.getHistory();
// Returns: Array of { request, timestamp, success }
```

#### `getDataSummary()`
Get summary of available scraped data.

```javascript
const summary = aiTreatment.getDataSummary();
// Returns: { available: boolean, summary: object, capabilities: object }
```

#### `exportTreatment(index)`
Export a treatment as reusable code.

```javascript
const treatment = aiTreatment.exportTreatment(0);
// Returns: { request, code, timestamp }
```

## Generated Code Structure

GPT-5 Codex generates code following this pattern:

```javascript
(async function() {
    try {
        // 1. Access scraped data
        const scrapedData = window.__aiPageData;
        
        // 2. Extract needed data
        const data = scrapedData.jsonData;
        const apis = scrapedData.apiResponses;
        const storage = scrapedData.localStorage;
        
        // 3. Perform DOM manipulation
        // ... custom code based on request ...
        
        // 4. Return success
        return {
            success: true,
            message: "Description of what was done",
            data: { /* any relevant data */ }
        };
    } catch (error) {
        return {
            success: false,
            message: "Error description",
            error: error.toString()
        };
    }
})();
```

## Best Practices

### 1. Be Specific with Requests
❌ "Do something with the data"
✅ "Extract product names and prices from API responses and create a sortable table"

### 2. Mention Data Sources
✅ "Use the data from localStorage to..."
✅ "Take the JSON from the /api/users endpoint and..."
✅ "Access the React state and..."

### 3. Describe Desired Output
✅ "Create a floating panel with..."
✅ "Display as a grid with..."
✅ "Export as CSV file..."

### 4. Specify Styling
✅ "Make it look modern with dark theme"
✅ "Use Tailwind-style CSS"
✅ "Match the existing page design"

## Troubleshooting

### No Data Available
```javascript
const summary = aiTreatment.getDataSummary();
if (!summary.available) {
    console.log('Wait for page to load and data to be captured');
}
```

### Code Execution Failed
- Check browser console for errors
- Verify scraped data exists: `window.__aiPageData`
- Try simpler request first
- Check API key is configured

### Generated Code Not Working
- GPT-5 Codex might need more context
- Rephrase request with more details
- Check if page has security restrictions
- Try preset first to verify system works

## Security Considerations

### Code Execution
- Generated code runs in page context
- Has access to all page data and APIs
- Can modify any DOM element
- Review generated code before execution in production

### Data Access
- Full access to scraped data
- Can read localStorage/sessionStorage
- Can access cookies
- Can read API responses

### Best Practices
- Review generated code
- Test on non-sensitive pages first
- Don't use on banking/payment pages
- Clear sensitive data after use

## Examples Gallery

### E-commerce Product Grid
```javascript
await aiTreatment.applyTreatment(
    "Extract all products from API and create a modern grid with filters for price range and category"
);
```

### Social Media Feed Cleaner
```javascript
await aiTreatment.applyTreatment(
    "Remove all sponsored posts and ads, keep only organic content from friends"
);
```

### Data Dashboard
```javascript
await aiTreatment.applyTreatment(
    "Create a dashboard showing: total API calls, average response time, failed requests, and a chart of requests over time"
);
```

### Storage Manager
```javascript
await aiTreatment.applyTreatment(
    "Create a storage manager UI that shows all localStorage items with ability to edit, delete, and export"
);
```

### API Debugger
```javascript
await aiTreatment.applyTreatment(
    "Create an API debugger panel showing all requests with request/response bodies, headers, and timing"
);
```

## Future Enhancements

- [ ] Visual code editor for generated code
- [ ] Code optimization suggestions
- [ ] Treatment templates library
- [ ] Collaborative treatment sharing
- [ ] A/B testing capabilities
- [ ] Performance profiling
- [ ] Automated testing generation

## Support

For issues or questions:
1. Check console for errors
2. Verify scraped data is available
3. Try simpler requests first
4. Review generated code
5. Check API key configuration

---

**Ready to use AI Treatment!** 🔬

Start with a simple request or try a preset to see the power of GPT-5 Codex + scraped data!
