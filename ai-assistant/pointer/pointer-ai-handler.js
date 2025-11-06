/**
 * Pointer AI Handler - Specialized AI service for element-specific modifications
 * Uses a different prompt strategy optimized for targeted DOM changes
 */

class PointerAIHandler {
    constructor() {
        this.apiHandler = null;
    }

    /**
     * Initialize with API handler
     */
    initialize(apiHandler) {
        this.apiHandler = apiHandler;
        console.log('🎯 Pointer AI Handler initialized');
    }

    /**
     * Build specialized prompt for pointer-selected element modifications
     */
    buildPointerPrompt(instruction, elementSnapshot, pageContext) {
        return `You are a CSS/DOM specialist focused on modifying a SPECIFIC element that the user has selected with a pointer tool.

🎯 SELECTED ELEMENT DETAILS:
- Selector: ${elementSnapshot.selector}
- Tag: <${elementSnapshot.tag}>
- ID: ${elementSnapshot.id || 'none'}
- Classes: ${elementSnapshot.classes.join(', ') || 'none'}

📊 CURRENT COMPUTED STYLES:
- Background: ${elementSnapshot.computedStyles?.backgroundColor}
- Color: ${elementSnapshot.computedStyles?.color}
- Font: ${elementSnapshot.computedStyles?.fontSize} ${elementSnapshot.computedStyles?.fontFamily}
- Font Weight: ${elementSnapshot.computedStyles?.fontWeight}
- Padding: ${elementSnapshot.computedStyles?.padding}
- Margin: ${elementSnapshot.computedStyles?.margin}
- Border: ${elementSnapshot.computedStyles?.border}
- Border Radius: ${elementSnapshot.computedStyles?.borderRadius}
- Display: ${elementSnapshot.computedStyles?.display}
- Width: ${elementSnapshot.computedStyles?.width}
- Height: ${elementSnapshot.computedStyles?.height}
- Position: ${elementSnapshot.computedStyles?.position}

📝 ELEMENT HTML PREVIEW:
${elementSnapshot.html?.substring(0, 500)}

📄 TEXT CONTENT:
"${elementSnapshot.innerText?.substring(0, 200)}"

🌐 PAGE CONTEXT:
- URL: ${pageContext.url}
- Title: ${pageContext.title}

👤 USER REQUEST:
"${instruction}"

⚠️ CRITICAL INSTRUCTIONS:
1. You MUST ONLY modify the selected element: ${elementSnapshot.selector}
2. DO NOT apply changes to body, html, or any other element
3. Use the "css" action type with the exact selector: "${elementSnapshot.selector}"
4. Consider the current styles when making changes
5. Be precise and targeted - this is element-specific modification

📋 REQUIRED RESPONSE FORMAT (JSON only, no other text):
{
  "explanation": "Brief explanation of the change",
  "actions": [
    {
      "type": "css",
      "selector": "${elementSnapshot.selector}",
      "value": "your-css-here",
      "description": "What this does"
    }
  ],
  "saveAsRule": false
}

EXAMPLES:

User: "make background red"
Response: {"explanation":"Changing element background to red","actions":[{"type":"css","selector":"${elementSnapshot.selector}","value":"background-color: red !important;","description":"Red background"}],"saveAsRule":false}

User: "add padding"
Response: {"explanation":"Adding padding to element","actions":[{"type":"css","selector":"${elementSnapshot.selector}","value":"padding: 20px;","description":"Add padding"}],"saveAsRule":false}

User: "make text bigger"
Response: {"explanation":"Increasing font size","actions":[{"type":"css","selector":"${elementSnapshot.selector}","value":"font-size: 24px;","description":"Bigger text"}],"saveAsRule":false}

User: "hide this"
Response: {"explanation":"Hiding element","actions":[{"type":"css","selector":"${elementSnapshot.selector}","value":"display: none !important;","description":"Hide element"}],"saveAsRule":false}

Generate the JSON response now:`;
    }

    /**
     * Process pointer-mode AI request
     */
    async processPointerRequest(instruction, elementSnapshot, pageContext) {
        if (!this.apiHandler) {
            throw new Error('Pointer AI Handler not initialized');
        }

        console.log('🎯 Processing pointer-mode request:', instruction);
        console.log('🎯 Target element:', elementSnapshot.selector);

        // Build specialized prompt
        const prompt = this.buildPointerPrompt(instruction, elementSnapshot, pageContext);

        // Call AI with pointer-optimized prompt
        const aiResponse = await this.apiHandler.callAI(prompt);
        console.log('🤖 Pointer AI Response:', aiResponse.substring(0, 300));

        return aiResponse;
    }

    /**
     * Validate that AI response targets the correct element
     */
    validateResponse(parsedActions, expectedSelector) {
        if (!parsedActions.actions || parsedActions.actions.length === 0) {
            return {
                valid: false,
                error: 'No actions generated'
            };
        }

        // Check if all actions target the correct selector
        const invalidActions = parsedActions.actions.filter(action => {
            return action.selector && action.selector !== expectedSelector;
        });

        if (invalidActions.length > 0) {
            console.warn('⚠️ AI generated actions for wrong selectors:', invalidActions);
            // Fix the selectors
            parsedActions.actions.forEach(action => {
                if (action.selector && action.selector !== expectedSelector) {
                    console.log(`🔧 Fixing selector: ${action.selector} → ${expectedSelector}`);
                    action.selector = expectedSelector;
                }
            });
        }

        return {
            valid: true,
            fixed: invalidActions.length > 0
        };
    }
}

// Export for use in renderer
if (typeof window !== 'undefined') {
    window.PointerAIHandler = PointerAIHandler;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = PointerAIHandler;
}
