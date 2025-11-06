# Lenoir Browser - V2 Backup

This folder contains a complete backup of the Lenoir Browser project with all AI assistant enhancements.

## Backup Date
November 3, 2025 - 1:31 AM UTC

## What's Included

### Core Files
- `main.js` - Electron main process with IPC handlers
- `index.html` - Main application HTML
- `renderer.js` - Renderer process logic
- `styles.css` - Application styles
- `package.json` - Dependencies and scripts

### AI Assistant System (`ai-assistant/`)
Complete modular AI assistant with:

#### Core Modules
- `ai-controller.js` - Main controller orchestrating all AI services
- `ai-api-handler.js` - OpenAI API integration
- `ai-web-editor.js` - DOM manipulation and action execution
- `ai-ui-handler.js` - Chat UI management

#### Inspector & Pointer System
- `ai-inspector.js` - Chrome-like element highlighter
- `pointer/pointer-ai-handler.js` - Specialized AI for element-specific modifications
- `pointer/README.md` - Pointer system documentation
- `pointer/INTEGRATION.md` - Integration guide

#### Advanced Features
- `ai-engine.js` - Advanced transformations
- `ai-treatment.js` - GPT-5 Codex integration
- `ai-router.js` - Smart routing between AI services
- `ai-task-manager.js` - Autonomous task execution

#### Analysis & Data
- `ai-dom-analyzer.js` - Master HTML/DOM analysis
- `ai-page-scraper.js` - Comprehensive data capture
- `ai-advanced-mode.js` - Complex modification handling

#### UI Components
- `ai-popup.js` - Popup UI management
- `ai-enhancer.js` - UI enhancements

### Additional Services
- `app-manager.js` - Application management
- `ai-services/` - Additional AI service modules

## Key Features Implemented

### 1. Pointer Mode (Element Selection)
- Chrome-like inspector with hover highlighting
- Click to select specific elements
- Locked selection with persistent badge
- Skip page scrolling when pointer active
- Element snapshot capture (HTML, CSS, attributes)

### 2. Dual AI Services
- **Standard AI**: Page-wide modifications, theme changes, global CSS
- **Pointer AI**: Element-specific modifications with validation

### 3. Smart Routing
- Automatic detection of pointer mode
- Route to appropriate AI service
- Selector validation and auto-correction

### 4. Action System
- CSS application (inline and global)
- JavaScript execution
- Element manipulation (hide, show, remove)
- Text replacement
- Class management
- Palette/theme application

### 5. Context-Aware Processing
- Element snapshot with computed styles
- Page context with DOM structure
- Screenshot capture
- Scraped data integration

## Architecture

```
User Input
    ↓
Inspector (optional) → Element Selection
    ↓
Renderer.js → Detect mode & prepare options
    ↓
AIController → Route to service
    ↓
    ├─→ PointerAI (element selected)
    │   └─→ Specialized prompt + validation
    │
    └─→ Standard AI (no selection)
        └─→ Page-wide prompt
    ↓
Parse Actions → Validate → Execute
    ↓
DOM Updated
```

## Recent Changes

### Pointer Mode Implementation
1. Added `skipFullScroll` option to prevent page jumping
2. Created `getElementSnapshot()` to capture element context
3. Built specialized `PointerAIHandler` with element-focused prompts
4. Integrated validation to ensure correct selector targeting
5. Added auto-correction for wrong selectors

### Prompt Improvements
- Element-specific context with current styles
- Explicit examples for selected elements
- Critical reminders to target correct selector
- Style-aware modifications

### IPC Enhancements
- Options parameter for `ai-get-page-context`
- Conditional scrolling based on pointer mode
- Result unwrapping for `getElementSnapshot`

## Usage

### Standard Mode
```javascript
// User types: "make background dark"
// AI applies to body/page-wide
```

### Pointer Mode
```javascript
// 1. Click inspector button
// 2. Click element (e.g., div.header)
// 3. Type: "make background red"
// AI applies ONLY to selected element
```

## Testing

```bash
# Install dependencies
npm install

# Run in development
npm start

# Test pointer mode
1. Navigate to any website
2. Click inspector button (pointer icon)
3. Click on an element
4. Type modification command
5. Check console logs for routing
```

## Console Logs

### Pointer Mode Active
```
📸 Capturing snapshot of selected element: div.header
✅ Element snapshot captured: div div.header
🎯 Routing to Pointer AI service
🎯 Processing pointer-mode request: make background red
🤖 Pointer AI Response: {"explanation":"...
📋 Parsed actions: {...}
⚡ Executing 1 actions...
✅ Execution results: [...]
```

### Standard Mode
```
📝 Routing to Standard AI service
🤖 AI Response: {"explanation":"...
📋 Parsed actions: {...}
⚡ Executing actions...
```

## File Structure

```
V2/
├── main.js                 # Electron main process
├── index.html              # Application HTML
├── renderer.js             # Renderer process
├── styles.css              # Application styles
├── package.json            # Dependencies
├── app-manager.js          # App management
├── ai-services/            # Additional services
└── ai-assistant/           # AI assistant system
    ├── ai-controller.js
    ├── ai-api-handler.js
    ├── ai-web-editor.js
    ├── ai-ui-handler.js
    ├── ai-inspector.js
    ├── ai-engine.js
    ├── ai-treatment.js
    ├── ai-router.js
    ├── ai-task-manager.js
    ├── ai-dom-analyzer.js
    ├── ai-page-scraper.js
    ├── ai-advanced-mode.js
    ├── ai-popup.js
    ├── ai-enhancer.js
    └── pointer/
        ├── pointer-ai-handler.js
        ├── README.md
        └── INTEGRATION.md
```

## Notes

- This backup represents the complete working state with pointer mode
- All IPC handlers are functional
- Pointer AI service is fully integrated
- Validation and auto-correction are active
- No breaking changes from V1

## Restoration

To restore from this backup:
```bash
# Copy files back to main directory
cp -r V2/* /path/to/lenoir/

# Reinstall dependencies
npm install

# Run
npm start
```

## Next Steps

Potential enhancements:
1. Multi-element selection
2. Undo/Redo for pointer modifications
3. Style suggestions based on current CSS
4. Copy styles between elements
5. Element relationship modifications (parent/siblings)
6. Visual style editor UI
7. Preset modification templates
