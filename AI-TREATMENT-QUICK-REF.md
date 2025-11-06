# 🔬 AI Treatment - Quick Reference

## What is AI Treatment?

**AI Treatment** = Scraped Data + GPT-5 Codex + DOM Manipulation

Generates **custom JavaScript code** that uses all captured page data to perform complex transformations.

## Quick Start

```javascript
// Initialize
const aiTreatment = new AITreatment();
await aiTreatment.initialize();

// Apply treatment
await aiTreatment.applyTreatment("Your request here");

// Or use preset
await aiTreatment.applyPreset('extract-data');
```

## Available Presets

| Preset | Description |
|--------|-------------|
| `extract-data` | Extract API data and display in table |
| `dark-theme` | Apply modern dark theme |
| `simplify` | Remove ads and clutter |
| `reader-mode` | Clean reading view |
| `data-export` | Export data as file |
| `storage-view` | View all storage |
| `api-monitor` | Live API monitor |
| `performance` | Performance analysis |

## Common Requests

### Data Extraction
```javascript
"Extract all products from API and create a sortable grid"
"Show me all user data from the API responses"
"Create a table from the JSON data"
```

### Visualization
```javascript
"Create a dashboard with charts from API data"
"Visualize network performance metrics"
"Display storage data in a tree view"
```

### Monitoring
```javascript
"Create a live API request monitor"
"Show all failed network requests"
"Display localStorage changes in real-time"
```

### Transformation
```javascript
"Convert this page to a minimal design"
"Rebuild the layout using the API data"
"Create a custom UI from the JSON responses"
```

## Data Access in Generated Code

```javascript
// In generated code:
const scrapedData = window.__aiPageData;

// Network
scrapedData.networkRequests  // All requests
scrapedData.apiResponses     // API endpoints
scrapedData.jsonData         // JSON data

// Storage
scrapedData.localStorage     // localStorage
scrapedData.sessionStorage   // sessionStorage
scrapedData.cookies          // Cookies

// State
scrapedData.applicationState // Frameworks
```

## API Methods

```javascript
// Initialize
await aiTreatment.initialize()

// Apply treatment
await aiTreatment.applyTreatment(request)

// Use preset
await aiTreatment.applyPreset(name)

// Undo
await aiTreatment.undoTreatment()

// History
aiTreatment.getHistory()

// Data summary
aiTreatment.getDataSummary()

// Export
aiTreatment.exportTreatment(index)
```

## Integration Example

```javascript
// Add to renderer.js
const aiTreatment = new AITreatment();

// Add button
const btn = document.createElement('button');
btn.innerHTML = '🔬 Treatment';
btn.onclick = async () => {
    const request = prompt('Enter treatment request:');
    const result = await aiTreatment.applyTreatment(request);
    alert(result.success ? 'Success!' : 'Failed: ' + result.error);
};
document.querySelector('.ai-header').appendChild(btn);
```

## When to Use

### ✅ Use AI Treatment For:
- Complex data extraction
- Custom dashboards
- Data visualization
- Storage management
- Network monitoring
- Framework-specific edits

### ❌ Use Standard AI For:
- Simple styling
- Hide/show elements
- Basic CSS changes
- Quick edits

## Tips

1. **Be specific** - "Extract products with prices" not "get data"
2. **Mention sources** - "Use API data" or "From localStorage"
3. **Describe output** - "Create a grid" or "Display as table"
4. **Include styling** - "Make it modern" or "Use dark theme"

## Troubleshooting

| Issue | Solution |
|-------|----------|
| No data | Wait for page load, check `window.__aiPageData` |
| Code fails | Check console, try simpler request |
| API error | Verify API key in settings |
| No result | Check if scraper injected |

## Example Outputs

### Extract Products
```javascript
// Request: "Extract products and create grid"
// Generates code that:
- Accesses API responses
- Filters product data
- Creates grid layout
- Adds images and prices
- Makes it sortable
```

### API Monitor
```javascript
// Request: "Create API monitor"
// Generates code that:
- Reads network requests
- Creates floating panel
- Shows real-time updates
- Displays status codes
- Shows response times
```

### Storage Inspector
```javascript
// Request: "Show all storage"
// Generates code that:
- Reads localStorage/sessionStorage
- Creates modal UI
- Adds search functionality
- Implements export
- Shows data tree
```

## Files

- `ai-treatment.js` - Main module
- `AI-TREATMENT-GUIDE.md` - Full guide
- `AI-TREATMENT-COMPLETE.md` - Implementation details
- `AI-TREATMENT-QUICK-REF.md` - This file

## Status

✅ **Ready to use!**

---

**Quick Start:** `new AITreatment()` → `initialize()` → `applyTreatment()`
