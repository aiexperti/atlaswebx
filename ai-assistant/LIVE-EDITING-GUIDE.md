# 🎨 Live Website Editing with AI - Complete Guide

## Overview

The AI Assistant now has **comprehensive page understanding** capabilities that enable it to edit even the most complex websites. It captures and analyzes:

- 📄 Complete HTML/DOM structure
- 📡 All network requests (XHR, Fetch, WebSocket)
- 💾 Browser storage (localStorage, sessionStorage, IndexedDB, cookies)
- 🎯 Application state and frameworks
- 📊 JSON data from APIs
- 🖼️ All images and media (including lazy-loaded)
- 🔗 All links and interactive elements

## How It Works

### 1. Automatic Page Analysis

When you load any website, the system automatically:

1. **Injects monitoring script** into the page
2. **Scrolls through entire page** to trigger lazy loading
3. **Captures all network requests** made by the page
4. **Extracts storage data** (localStorage, cookies, etc.)
5. **Detects frameworks** (React, Vue, Angular, etc.)
6. **Takes a screenshot** for visual context
7. **Analyzes DOM structure** with precise selectors

### 2. AI Understanding

The AI receives comprehensive context:

```
Current Page: https://example.com
Title: Example Website
Viewport: 1920x1080

🔍 COMPREHENSIVE PAGE DATA CAPTURED:

📡 Network Activity (25 requests):
  - XHR: 8
  - Fetch: 15
  - JSON APIs: 12
  
  API Endpoints:
    - GET https://api.example.com/products
    - POST https://api.example.com/cart

💾 Browser Storage:
  - localStorage: 15 keys
  - sessionStorage: 5 keys
  - Cookies: 10

🎯 Detected Frameworks:
  - react: 18.2.0
  - redux: detected

📊 JSON Data Available (12 sources)
```

## Use Cases & Examples

### 1. Simple Styling Changes

**User:** "Make the background dark"

**AI Response:**
```json
{
  "explanation": "Applying dark theme",
  "actions": [
    {
      "type": "css",
      "selector": "body",
      "value": "background-color: #1a1a1a; color: #ffffff;",
      "description": "Dark background"
    }
  ],
  "saveAsRule": true
}
```

### 2. Complex SPA Editing

**User:** "Extract all product data and create a clean list"

**AI Response:**
```json
{
  "explanation": "Extracting product data from API responses and creating clean layout",
  "actions": [
    {
      "type": "extractData",
      "selector": ".product-card",
      "value": "{\"fields\":{\"name\":\".product-title\",\"price\":\".price\",\"image\":\"img[src]\"}}",
      "description": "Extract product information"
    },
    {
      "type": "rewritePage",
      "value": "<div style='max-width:1200px;margin:0 auto;padding:40px'><h1>Products</h1><div id='product-list'></div></div>",
      "description": "Create clean layout"
    },
    {
      "type": "javascript",
      "value": "const products = [...]; products.forEach(p => { /* render */ });",
      "description": "Render extracted data"
    }
  ],
  "saveAsRule": false
}
```

### 3. YouTube Video Grid Redesign

**User:** "Redesign YouTube homepage as a minimal grid"

The AI can:
- Access `youtubeData.videos` with thumbnails, titles, links
- Extract all video information including lazy-loaded content
- Create a completely new layout
- Apply modern styling

**AI Response:**
```json
{
  "explanation": "Complete YouTube redesign with minimal grid",
  "actions": [
    {
      "type": "extractData",
      "selector": "ytd-video-renderer",
      "value": "{\"fields\":{\"title\":\"#video-title\",\"thumbnail\":\"img[src]\",\"link\":\"a[href]\"}}",
      "description": "Extract video data"
    },
    {
      "type": "palette",
      "value": "{\"background\":\"#f5f5f5\",\"surface\":\"#ffffff\",\"text\":\"#1a1a1a\",\"primary\":\"#ff0000\"}",
      "description": "Minimal color scheme"
    },
    {
      "type": "rewritePage",
      "value": "<div style='max-width:1400px;margin:0 auto;padding:40px'><h1 style='font-size:2.5em;margin-bottom:30px'>Videos</h1><div style='display:grid;grid-template-columns:repeat(auto-fill,minmax(320px,1fr));gap:24px'></div></div>",
      "description": "Minimal grid layout"
    }
  ],
  "saveAsRule": true
}
```

### 4. E-commerce Site Enhancement

**User:** "Show me all products with prices under $50"

The AI can:
- Access API responses with product data
- Filter based on criteria
- Create custom views

### 5. Social Media Feed Customization

**User:** "Hide sponsored posts and reorganize feed"

The AI can:
- Detect sponsored content patterns
- Access feed data from network requests
- Reorganize based on user preferences

### 6. News Site Reader Mode

**User:** "Convert this news site to a clean reader view"

**AI Response:**
```json
{
  "explanation": "Extracting article content and creating reader view",
  "actions": [
    {
      "type": "extractData",
      "selector": "article",
      "value": "{\"fields\":{\"title\":\"h1\",\"content\":\".article-body\",\"image\":\"img:first-of-type\"}}",
      "description": "Extract article"
    },
    {
      "type": "rewritePage",
      "value": "<div style='max-width:700px;margin:60px auto;padding:30px;font-family:Georgia,serif;line-height:1.8'><h1 style='font-size:2.8em;margin-bottom:20px'></h1><div style='font-size:1.15em'></div></div>",
      "description": "Reader layout"
    },
    {
      "type": "globalCss",
      "value": "img { max-width: 100%; height: auto; margin: 20px 0; }",
      "description": "Image styling"
    }
  ],
  "saveAsRule": true
}
```

## Advanced Features

### 1. Framework Detection

The AI knows what frameworks are running:

```javascript
// Detected: React 18.2.0, Redux
"Modify the Redux store to change theme"
"Access React component state"
"Inject Vue DevTools"
```

### 2. API Data Access

The AI can access JSON from network requests:

```javascript
"Show me the data from the /api/users endpoint"
"Create a chart from the analytics API response"
"Export all API data as CSV"
```

### 3. Storage Manipulation

The AI can read and modify storage:

```javascript
"Show me what's stored in localStorage"
"Clear all cookies"
"Change the theme preference in storage"
"Export my saved settings"
```

### 4. Network Analysis

The AI can analyze network patterns:

```javascript
"Which API calls are failing?"
"Show me all external requests"
"List the slowest network requests"
"What data is being sent to analytics?"
```

## Action Types Reference

### Basic Actions

- **css**: Apply inline styles
  ```json
  {"type": "css", "selector": "body", "value": "background: #000;"}
  ```

- **hide**: Hide elements
  ```json
  {"type": "hide", "selector": ".ad, .popup"}
  ```

- **show**: Show hidden elements
  ```json
  {"type": "show", "selector": ".hidden-content"}
  ```

- **remove**: Remove from DOM
  ```json
  {"type": "remove", "selector": ".unwanted"}
  ```

### Advanced Actions

- **globalCss**: Add persistent CSS
  ```json
  {"type": "globalCss", "value": "body { font-size: 18px; }"}
  ```

- **palette**: Apply color theme
  ```json
  {"type": "palette", "value": "{\"background\":\"#111\",\"text\":\"#eee\"}"}
  ```

- **rewritePage**: Complete page rebuild
  ```json
  {"type": "rewritePage", "value": "<div>New HTML</div>"}
  ```

- **extractData**: Extract structured data
  ```json
  {"type": "extractData", "selector": ".item", "value": "{\"fields\":{\"title\":\"h2\"}}"}
  ```

- **addClass/removeClass**: Modify classes
  ```json
  {"type": "addClass", "selector": ".card", "value": "highlighted"}
  ```

- **replaceText**: Find and replace text
  ```json
  {"type": "replaceText", "selector": "p", "value": "{\"find\":\"old\",\"replace\":\"new\"}"}
  ```

- **javascript**: Execute custom code
  ```json
  {"type": "javascript", "value": "console.log('Hello');"}
  ```

## Tips for Best Results

### 1. Be Specific
❌ "Make it better"
✅ "Make the text larger and add more spacing between paragraphs"

### 2. Describe the Goal
❌ "Change the CSS"
✅ "Create a dark theme with blue accents"

### 3. Reference Visible Elements
✅ "Hide the sidebar on the left"
✅ "Make the header sticky"
✅ "Center the main content"

### 4. Use Advanced Mode for Complex Changes
- Enable Advanced Mode in AI settings
- Better for complete redesigns
- Uses GPT-5 for more sophisticated understanding

### 5. Save Rules for Repeated Changes
- Click "Save as Rule" after successful edits
- Rules auto-apply on future visits
- Toggle rules on/off with address bar button

## Troubleshooting

### AI Can't Find Elements
- The page might use dynamic IDs/classes
- Try describing the element by position: "the button in the top right"
- Use Advanced Mode for better element detection

### Changes Don't Apply
- Check if the page uses Shadow DOM
- Try using `javascript` action type for complex cases
- Refresh the page to re-inject monitoring

### Slow Performance
- Large pages take longer to analyze
- Disable rules for specific domains if needed
- Use targeted selectors instead of broad ones

### Data Not Captured
- Ensure page has finished loading
- Some sites block script injection
- Check browser console for errors

## Privacy & Security

### What Data is Captured?
- HTML structure and content
- Network requests and responses
- Browser storage (localStorage, cookies, etc.)
- Application state and framework info

### Where is Data Stored?
- **Locally only** - in browser memory
- Cleared on page navigation
- Never sent to external servers (except AI API)

### Sensitive Data
- Passwords are never captured
- API keys in storage are visible to AI
- Consider sanitizing before complex queries

### Best Practices
1. Don't use on sensitive pages (banking, etc.)
2. Clear rules after use if they contain sensitive data
3. Review actions before saving as rules
4. Use incognito mode for testing

## Examples by Website Type

### YouTube
```
"Create a minimal video grid"
"Hide all shorts"
"Show only subscribed channels"
"Extract all video titles and links"
```

### Twitter/X
```
"Hide promoted tweets"
"Show only text posts"
"Create a reading mode"
"Extract all tweets to text file"
```

### Reddit
```
"Hide all awards and badges"
"Create a clean reading view"
"Show only text posts"
"Extract post data"
```

### News Sites
```
"Remove all ads and popups"
"Create reader mode"
"Extract article text"
"Show only headlines"
```

### E-commerce
```
"Show only products under $50"
"Create a comparison table"
"Extract all product data"
"Hide out-of-stock items"
```

## Keyboard Shortcuts

- **Ctrl/Cmd + K**: Focus AI input
- **Ctrl/Cmd + Enter**: Send message
- **Ctrl/Cmd + L**: Clear chat
- **Ctrl/Cmd + R**: Reload with rules

## Getting Help

1. Check the console for errors
2. Try rephrasing your request
3. Use Advanced Mode for complex tasks
4. Review the README.md for technical details
5. Check if the page blocks script injection

## What's Next?

Future enhancements planned:
- Visual element selector (click to select)
- Undo/redo for changes
- Change history and diff viewer
- Export/import rules
- Collaborative rule sharing
- Performance profiling
- A/B testing capabilities
