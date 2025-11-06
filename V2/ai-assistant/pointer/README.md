# Pointer AI Service

Specialized AI service for element-specific modifications when pointer mode is active.

## Purpose

When users activate the inspector pointer and select a specific element, this service provides:
- **Targeted prompts** optimized for single-element modifications
- **Validation** to ensure AI targets the correct selector
- **Auto-correction** if AI tries to modify wrong elements

## Architecture

```
User selects element with pointer
        ↓
renderer.js detects selection
        ↓
PointerAIHandler.processPointerRequest()
        ↓
Specialized prompt with element context
        ↓
AI generates targeted CSS actions
        ↓
Validation & auto-fix selectors
        ↓
Execute on selected element only
```

## Key Features

1. **Element-focused prompts** - Includes current computed styles, HTML structure, and explicit instructions to target only the selected element

2. **Selector validation** - Checks that all generated actions use the correct selector and auto-fixes if needed

3. **Style-aware** - Provides current CSS values so AI can make informed modifications (e.g., "make darker" needs to know current color)

## Usage

```javascript
// Initialize
const pointerAI = new PointerAIHandler();
pointerAI.initialize(apiHandler);

// Process request
const response = await pointerAI.processPointerRequest(
    "make background red",
    elementSnapshot,
    pageContext
);

// Validate response
const validation = pointerAI.validateResponse(
    parsedActions,
    elementSnapshot.selector
);
```

## Integration Points

- **renderer.js** - Detects pointer mode and routes to PointerAIHandler
- **ai-controller.js** - Switches between standard and pointer AI services
- **ai-web-editor.js** - Executes validated actions

## Prompt Strategy

The pointer prompt is optimized for:
- Single element modifications
- Style-aware changes (knows current values)
- Precise selector targeting
- No page-wide side effects

Unlike the standard AI prompt which handles full-page modifications, the pointer prompt focuses exclusively on the selected element.
