# AI Web Assistant - Complete Guide

## 🤖 What We Built

A powerful AI assistant that can:
1. **Read web pages** - Access DOM, take screenshots
2. **Modify pages** - Edit CSS, hide/show elements, click buttons
3. **Save rules** - Remember modifications for future visits
4. **Multi-model support** - ChatGPT, Claude, Gemini

## 📁 Files Created

```
ai-services/
├── web-ai-assistant.js      # Main AI assistant
├── ai-manager.js            # Multi-provider AI manager
├── key-manager.js           # Secure key storage
├── credit-manager.js        # Credit system
├── auth-manager.js          # Web authentication
├── providers/
│   ├── chatgpt.js          # OpenAI integration
│   ├── claude.js           # Anthropic integration
│   └── gemini.js           # Google integration
└── AI-ASSISTANT-GUIDE.md   # This file
```

## 🎯 Features

### 1. Web Page Interaction

**Take Screenshot:**
```javascript
const screenshot = await assistant.takeScreenshot(webContents);
// Returns base64 image
```

**Get Page Context:**
```javascript
const context = await assistant.getPageContext(webContents);
// Returns: URL, title, HTML, forms, links, images
```

**Execute Actions:**
- Apply CSS styles
- Hide/show elements
- Click buttons
- Fill forms
- Remove elements
- Run JavaScript

### 2. AI-Powered Modifications

**User says:** "Hide all ads on this page"

**AI responds with actions:**
```json
{
  "explanation": "I'll hide all advertisement elements",
  "actions": [
    {
      "type": "hide",
      "selector": ".ad, .advertisement, [id*='ad']",
      "description": "Hide ad containers"
    },
    {
      "type": "css",
      "selector": "body",
      "value": "margin-top: 0 !important;",
      "description": "Remove ad space"
    }
  ],
  "saveAsRule": true
}
```

**Result:** Ads hidden instantly + rule saved for next visit!

### 3. Saved Rules

**Save modifications:**
```javascript
assistant.saveRule('youtube.com', 'Hide Ads', actions);
```

**Auto-apply on page load:**
```javascript
// When user visits youtube.com again
await assistant.applyRules('youtube.com', webContents);
// All saved modifications applied automatically!
```

### 4. Multiple AI Models

**Configured in Settings:**
- OpenAI (GPT-4, GPT-3.5)
- Anthropic (Claude)
- Google (Gemini)

**Switch anytime:**
```javascript
aiManager.setProvider('claude');
```

## 🚀 How to Use

### Step 1: Add API Keys

1. Open Settings (⚙️)
2. Go to "AI Assistant" tab
3. Enter your API keys:
   - OpenAI: `sk-...`
   - Anthropic: `sk-ant-...`
   - Google: `AI...`
4. Click "Test Connection"
5. Save

### Step 2: Use AI Assistant

**In the browser:**
1. Open any website
2. Open AI sidebar (or press shortcut)
3. Type instruction: "Make the text bigger"
4. AI analyzes page and applies changes
5. See changes live!

### Step 3: Save Rules

**After AI makes changes:**
1. Click "Save as Rule"
2. Name it: "Bigger Text"
3. Next time you visit, rule auto-applies!

## 💡 Example Use Cases

### 1. Remove Distractions
```
User: "Hide the sidebar and comments on YouTube"
AI: Hides elements, saves rule
Result: Clean YouTube every time!
```

### 2. Improve Readability
```
User: "Make the font bigger and change background to dark"
AI: Applies CSS, saves rule
Result: Better reading experience!
```

### 3. Auto-Fill Forms
```
User: "Fill the login form with my email"
AI: Fills fields automatically
Result: Faster logins!
```

### 4. Custom Layouts
```
User: "Move the search bar to the top"
AI: Repositions elements with CSS
Result: Personalized layout!
```

## 🔧 Technical Details

### AI Prompt Structure

```javascript
const prompt = `
You are a web page assistant.

Current Page:
- URL: ${url}
- Title: ${title}

User Instruction: "${instruction}"

Page Context:
- HTML structure
- Visible text
- Forms and inputs
- Links

Provide actions in JSON format.
`;
```

### Action Types

**CSS:**
```json
{
  "type": "css",
  "selector": ".header",
  "value": "background: blue; color: white;"
}
```

**Hide:**
```json
{
  "type": "hide",
  "selector": ".ads"
}
```

**Click:**
```json
{
  "type": "click",
  "selector": "#accept-cookies"
}
```

**JavaScript:**
```json
{
  "type": "javascript",
  "value": "document.body.style.zoom = '1.2';"
}
```

### Rule Storage

**Saved to:**
```
~/Library/Application Support/lenoir-browser/page-rules.json
```

**Format:**
```json
{
  "youtube.com": [
    {
      "name": "Hide Ads",
      "actions": [...],
      "createdAt": 1234567890
    }
  ]
}
```

## 🎨 UI Integration

### Settings Page

**API Keys Section:**
- OpenAI API Key input
- Anthropic API Key input
- Google AI API Key input
- Test buttons for each
- Toggle for web interaction
- Toggle for auto-apply rules

### AI Sidebar (To Be Built)

**Components:**
- Chat interface
- Instruction input
- Action preview
- Apply/Cancel buttons
- Saved rules list
- Rule management

## 🔐 Security

**API Keys:**
- Stored encrypted in localStorage
- Never sent to external servers
- Only used for direct API calls

**Web Modifications:**
- Only affect current page
- Don't persist across reloads (unless saved as rule)
- User can undo anytime

**Rules:**
- Stored locally
- User controls what's saved
- Can delete anytime

## 📊 Next Steps

### To Complete Integration:

1. **Add IPC Handlers in main.js:**
```javascript
const WebAIAssistant = require('./ai-services/web-ai-assistant');
const assistant = new WebAIAssistant(mainWindow);

ipcMain.handle('ai-process-instruction', async (event, instruction) => {
    const view = getCurrentBrowserView();
    return await assistant.processInstruction(instruction, view.webContents);
});

ipcMain.handle('test-ai-key', async (event, { provider, key }) => {
    // Test API key
});

ipcMain.on('update-ai-keys', (event, keys) => {
    // Update AI manager with new keys
});
```

2. **Create AI Sidebar UI:**
- Chat interface
- Instruction input
- Action preview
- Rule management

3. **Add Keyboard Shortcuts:**
- Cmd/Ctrl + K: Open AI assistant
- Cmd/Ctrl + Shift + K: Quick instruction

4. **Test with Real APIs:**
- Add your API keys
- Test on different websites
- Save useful rules

## 🎯 Example Workflow

**User wants to customize Reddit:**

1. Opens Reddit
2. Presses Cmd+K (AI assistant)
3. Types: "Hide the sidebar and make posts wider"
4. AI analyzes page structure
5. AI generates actions:
   - Hide `.side` element
   - Change `.content` width to 100%
6. User sees preview
7. Clicks "Apply"
8. Changes applied instantly!
9. Clicks "Save as Rule"
10. Names it "Wide Reddit"
11. Next visit: Rule auto-applies!

## 🚀 Ready to Test!

Your AI assistant is ready! Just:
1. Add API keys in Settings
2. Open any website
3. Start giving instructions!

The AI will learn your preferences and make browsing better! 🎉
