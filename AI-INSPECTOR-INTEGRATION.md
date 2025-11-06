# 🎯 AI Inspector Integration Guide

## Overview

The **AI Inspector** allows users to:
1. Click the inspector button to activate pointer mode
2. Click any element on the page to select it
3. Element gets highlighted
4. Use AI chat to modify the selected element

## Integration in renderer.js

### Step 1: Initialize Inspector

```javascript
// Initialize AI Inspector
const aiInspector = new AIInspector();

console.log('✅ AI Inspector initialized');
```

### Step 2: Add Inspector Button Handler

```javascript
// Inspector button click handler
document.getElementById('ai-inspector-btn')?.addEventListener('click', () => {
    const inspectorBtn = document.getElementById('ai-inspector-btn');
    
    if (aiInspector.isInspectorActive()) {
        // Deactivate
        aiInspector.deactivate();
        inspectorBtn.style.color = '#888';
        inspectorBtn.style.background = 'transparent';
        inspectorBtn.title = 'Inspector Mode: Click to select elements';
        
        aiUI.addAIMessage('⏹️ Inspector mode deactivated', false);
    } else {
        // Activate
        aiInspector.activate((elementInfo) => {
            // Callback when element is selected
            console.log('✅ Element selected:', elementInfo);
            
            // Show selection in chat
            aiUI.addAIMessage(
                `✅ Selected: <code>${elementInfo.selector}</code><br>` +
                `Tag: ${elementInfo.tag}` +
                (elementInfo.text ? `<br>Text: "${elementInfo.text.substring(0, 50)}..."` : ''),
                false
            );
            
            // Auto-fill chat with context
            const aiInput = document.getElementById('ai-input');
            if (aiInput) {
                aiInput.placeholder = `Modify selected element: ${elementInfo.selector}`;
            }
        });
        
        inspectorBtn.style.color = '#4a9eff';
        inspectorBtn.style.background = '#1f2a3a';
        inspectorBtn.title = 'Inspector Mode: Active (click element to select)';
        
        aiUI.addAIMessage('🎯 Inspector mode activated - click any element on the page to select it', false);
    }
});
```

### Step 3: Listen for Messages from Page

```javascript
// Listen for inspector messages from page
window.addEventListener('message', (event) => {
    if (event.data.type === 'ai-inspector-hover') {
        // Handle hover
        aiInspector.handleHover(event.data.rect);
    } else if (event.data.type === 'ai-inspector-select') {
        // Handle selection
        aiInspector.handleSelection(event.data.element);
    }
});
```

### Step 4: Modify sendAIMessage to Use Selected Element

```javascript
async function sendAIMessage() {
    const message = aiInput.value.trim();
    if (!message) return;
    
    aiUI.addUserMessage(message);
    aiUI.clearInput();
    aiUI.showLoading();
    
    try {
        // Check if element is selected
        const selectedElement = aiInspector.getSelectedElement();
        
        let finalMessage = message;
        if (selectedElement) {
            // Add selected element context to message
            finalMessage = `For the selected element "${selectedElement.selector}": ${message}`;
            console.log('📍 Using selected element:', selectedElement.selector);
        }
        
        // Process with AI
        const result = await aiController.processMessage(finalMessage, getCurrentTab());
        
        aiUI.hideLoading();
        
        if (result.success) {
            aiUI.addAIMessage(result.message || 'Done!');
            
            // Clear selection after successful modification
            if (selectedElement) {
                aiInspector.clearSelection();
                aiInput.placeholder = 'Ask AI to modify the page...';
            }
        } else {
            aiUI.addError(result.error || 'Failed to process');
        }
        
    } catch (error) {
        aiUI.hideLoading();
        aiUI.addError(`Error: ${error.message}`);
        console.error('AI error:', error);
    }
}
```

## Complete Integration Example

```javascript
// ===== AI Inspector Integration =====

// Initialize
const aiInspector = new AIInspector();

// Inspector button handler
document.getElementById('ai-inspector-btn')?.addEventListener('click', () => {
    const inspectorBtn = document.getElementById('ai-inspector-btn');
    
    if (aiInspector.isInspectorActive()) {
        // Deactivate
        aiInspector.deactivate();
        inspectorBtn.style.color = '#888';
        inspectorBtn.style.background = 'transparent';
        inspectorBtn.title = 'Inspector Mode: Click to select elements';
        aiUI.addAIMessage('⏹️ Inspector mode deactivated', false);
    } else {
        // Activate
        aiInspector.activate((elementInfo) => {
            console.log('✅ Element selected:', elementInfo);
            
            // Show in chat
            aiUI.addAIMessage(
                `✅ Selected: <code>${elementInfo.selector}</code><br>` +
                `Tag: ${elementInfo.tag}` +
                (elementInfo.text ? `<br>Text: "${elementInfo.text.substring(0, 50)}..."` : ''),
                false
            );
            
            // Update input placeholder
            const aiInput = document.getElementById('ai-input');
            if (aiInput) {
                aiInput.placeholder = `Modify: ${elementInfo.selector}`;
            }
        });
        
        inspectorBtn.style.color = '#4a9eff';
        inspectorBtn.style.background = '#1f2a3a';
        inspectorBtn.title = 'Inspector Mode: Active';
        aiUI.addAIMessage('🎯 Inspector activated - click any element', false);
    }
});

// Listen for messages from page
window.addEventListener('message', (event) => {
    if (event.data.type === 'ai-inspector-hover') {
        aiInspector.handleHover(event.data.rect);
    } else if (event.data.type === 'ai-inspector-select') {
        aiInspector.handleSelection(event.data.element);
    }
});

// Modify sendAIMessage
async function sendAIMessage() {
    const message = aiInput.value.trim();
    if (!message) return;
    
    aiUI.addUserMessage(message);
    aiUI.clearInput();
    aiUI.showLoading();
    
    try {
        const selectedElement = aiInspector.getSelectedElement();
        
        let finalMessage = message;
        if (selectedElement) {
            finalMessage = `For element "${selectedElement.selector}": ${message}`;
        }
        
        const result = await aiController.processMessage(finalMessage, getCurrentTab());
        
        aiUI.hideLoading();
        
        if (result.success) {
            aiUI.addAIMessage(result.message || 'Done!');
            
            if (selectedElement) {
                aiInspector.clearSelection();
                aiInput.placeholder = 'Ask AI to modify the page...';
            }
        } else {
            aiUI.addError(result.error || 'Failed');
        }
        
    } catch (error) {
        aiUI.hideLoading();
        aiUI.addError(`Error: ${error.message}`);
    }
}
```

## Usage Flow

### 1. Activate Inspector
```
User clicks inspector button
  ↓
Inspector mode activated
  ↓
Cursor changes to crosshair
  ↓
Hover shows blue dashed outline
```

### 2. Select Element
```
User clicks element
  ↓
Element highlighted with solid blue border
  ↓
Element info shown in chat
  ↓
Input placeholder updated
```

### 3. Modify with AI
```
User types: "make it red"
  ↓
AI receives: "For element '.button': make it red"
  ↓
AI applies change to selected element
  ↓
Selection cleared
```

## Features

### Visual Feedback
- **Hover**: Blue dashed outline
- **Selected**: Solid blue border with label
- **Cursor**: Crosshair when active

### Element Info
- CSS selector
- Tag name
- ID and classes
- Text content
- Position and size

### Smart Context
- Selected element automatically included in AI prompt
- Precise targeting for modifications
- Clear visual feedback

## API Methods

```javascript
// Activate inspector
aiInspector.activate(callback)

// Deactivate inspector
aiInspector.deactivate()

// Toggle inspector
aiInspector.toggle(callback)

// Get selected element
const element = aiInspector.getSelectedElement()

// Get selected selector
const selector = aiInspector.getSelectedSelector()

// Clear selection
aiInspector.clearSelection()

// Check if active
const isActive = aiInspector.isInspectorActive()

// Handle events
aiInspector.handleHover(rect)
aiInspector.handleSelection(elementInfo)
```

## Styling

The inspector button should highlight when active:

```css
#ai-inspector-btn.active {
    color: #4a9eff !important;
    background: #1f2a3a !important;
}
```

## Example Usage

### Example 1: Change Color
```
1. Click inspector button
2. Click a button element
3. Type: "make it red"
4. AI applies: color: red to selected button
```

### Example 2: Hide Element
```
1. Click inspector button
2. Click an ad element
3. Type: "hide this"
4. AI applies: display: none
```

### Example 3: Modify Text
```
1. Click inspector button
2. Click a heading
3. Type: "change text to 'Hello World'"
4. AI updates innerText
```

## Benefits

- ✅ **Visual selection** - See what you're modifying
- ✅ **Precise targeting** - Exact CSS selectors
- ✅ **Easy to use** - Just point and click
- ✅ **Smart context** - AI knows what to modify
- ✅ **No typing selectors** - Visual selection

## Summary

The **AI Inspector** provides a visual way to select elements for AI modification:
1. Click inspector button to activate
2. Click any element to select it
3. Element gets highlighted
4. Use AI chat to modify selected element

**Point, click, and modify!** 🎯

---

**Module:** ai-inspector.js  
**Button:** Added to AI sidebar  
**Status:** Ready to integrate
