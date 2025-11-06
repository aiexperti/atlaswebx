/**
 * AI Element Selector - Chrome-like element picker for AI Assistant
 * Allows users to select elements on the page with visual highlighting
 */

class AIElementSelector {
    constructor() {
        this.isActive = false;
        this.selectedElement = null;
        this.hoveredElement = null;
        this.pointerBtn = document.getElementById('ai-pointer-btn');
        this.overlay = null;
        this.tooltip = null;
        
        this.init();
    }

    init() {
        // Create overlay and tooltip elements
        this.createOverlay();
        this.createTooltip();
        
        // Pointer button click
        this.pointerBtn?.addEventListener('click', () => this.toggle());
        
        // Listen for element selection from BrowserView (via IPC)
        const { ipcRenderer } = require('electron');
        ipcRenderer.on('element-selected', (event, data) => {
            console.log('📨 Received element-selected event:', data);
            this.handleElementSelected({ data });
        });
        
        console.log('✅ AI Element Selector initialized');
    }

    createOverlay() {
        this.overlay = document.createElement('div');
        this.overlay.id = 'ai-element-overlay';
        this.overlay.style.cssText = `
            position: fixed;
            pointer-events: none;
            z-index: 999999;
            border: 2px solid #667eea;
            background: rgba(102, 126, 234, 0.1);
            box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.3);
            transition: all 0.1s ease;
            display: none;
        `;
        document.body.appendChild(this.overlay);
    }

    createTooltip() {
        this.tooltip = document.createElement('div');
        this.tooltip.id = 'ai-element-tooltip';
        this.tooltip.style.cssText = `
            position: fixed;
            pointer-events: none;
            z-index: 1000000;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 6px 12px;
            border-radius: 6px;
            font-size: 12px;
            font-family: monospace;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
            display: none;
            white-space: nowrap;
        `;
        document.body.appendChild(this.tooltip);
    }

    toggle() {
        if (this.isActive) {
            this.deactivate();
        } else {
            this.activate();
        }
    }

    activate() {
        this.isActive = true;
        this.pointerBtn?.classList.add('active');
        
        // Inject inspector into current page
        this.injectInspector();
        
        console.log('🎯 Element selector activated');
    }

    deactivate() {
        this.isActive = false;
        this.pointerBtn?.classList.remove('active');
        
        // Remove inspector from current page
        this.removeInspector();
        
        // Clear selection
        if (this.selectedElement) {
            this.clearSelection();
        }
        
        console.log('🎯 Element selector deactivated');
    }

    async injectInspector() {
        const { ipcRenderer } = require('electron');
        
        try {
            await ipcRenderer.invoke('ai-execute-action', `
                (function() {
                    // Remove existing inspector if any
                    if (window.__aiInspectorActive) {
                        window.__aiInspectorCleanup && window.__aiInspectorCleanup();
                    }
                    
                    // Create overlay
                    const overlay = document.createElement('div');
                    overlay.id = '__ai-inspector-overlay';
                    overlay.style.cssText = \`
                        position: fixed;
                        pointer-events: none;
                        z-index: 2147483646;
                        border: 2px solid #667eea;
                        background: rgba(102, 126, 234, 0.1);
                        box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.3), inset 0 0 0 2px rgba(102, 126, 234, 0.3);
                        transition: all 0.05s ease;
                        display: none;
                    \`;
                    document.body.appendChild(overlay);
                    
                    // Create tooltip
                    const tooltip = document.createElement('div');
                    tooltip.id = '__ai-inspector-tooltip';
                    tooltip.style.cssText = \`
                        position: fixed;
                        pointer-events: none;
                        z-index: 2147483647;
                        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                        color: white;
                        padding: 6px 12px;
                        border-radius: 6px;
                        font-size: 12px;
                        font-family: monospace;
                        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
                        display: none;
                        white-space: nowrap;
                    \`;
                    document.body.appendChild(tooltip);
                    
                    // Selected element highlight
                    const selectedOverlay = document.createElement('div');
                    selectedOverlay.id = '__ai-inspector-selected';
                    selectedOverlay.style.cssText = \`
                        position: fixed;
                        pointer-events: none;
                        z-index: 2147483645;
                        border: 3px solid #4ade80;
                        background: rgba(74, 222, 128, 0.15);
                        box-shadow: 0 0 0 3px rgba(74, 222, 128, 0.4), inset 0 0 0 3px rgba(74, 222, 128, 0.4);
                        display: none;
                    \`;
                    document.body.appendChild(selectedOverlay);
                    
                    let hoveredElement = null;
                    let selectedElement = null;
                    
                    function getElementSelector(el) {
                        if (el.id) return '#' + el.id;
                        if (el.className && typeof el.className === 'string') {
                            const classes = el.className.trim().split(/\\s+/).slice(0, 2).join('.');
                            if (classes) return el.tagName.toLowerCase() + '.' + classes;
                        }
                        return el.tagName.toLowerCase();
                    }
                    
                    function updateOverlay(element, overlayEl) {
                        if (!element) {
                            overlayEl.style.display = 'none';
                            return;
                        }
                        
                        const rect = element.getBoundingClientRect();
                        overlayEl.style.display = 'block';
                        overlayEl.style.left = rect.left + 'px';
                        overlayEl.style.top = rect.top + 'px';
                        overlayEl.style.width = rect.width + 'px';
                        overlayEl.style.height = rect.height + 'px';
                    }
                    
                    function handleMouseMove(e) {
                        // Ignore if clicking on inspector elements
                        if (e.target.id?.startsWith('__ai-inspector')) return;
                        
                        hoveredElement = e.target;
                        updateOverlay(hoveredElement, overlay);
                        
                        // Update tooltip
                        const selector = getElementSelector(hoveredElement);
                        tooltip.textContent = selector;
                        tooltip.style.display = 'block';
                        tooltip.style.left = (e.clientX + 15) + 'px';
                        tooltip.style.top = (e.clientY + 15) + 'px';
                    }
                    
                    function handleClick(e) {
                        e.preventDefault();
                        e.stopPropagation();
                        
                        // Ignore if clicking on inspector elements
                        if (e.target.id?.startsWith('__ai-inspector')) return;
                        
                        // Toggle selection
                        if (selectedElement === e.target) {
                            // Unselect
                            selectedElement = null;
                            selectedOverlay.style.display = 'none';
                            console.log('🔓 Element unselected');
                        } else {
                            // Select
                            selectedElement = e.target;
                            updateOverlay(selectedElement, selectedOverlay);
                            console.log('🎯 Element selected:', getElementSelector(selectedElement));
                            
                            // Send selection data via console (will be captured by main process)
                            const selectionData = {
                                type: 'ai-element-selected',
                                selector: getElementSelector(selectedElement),
                                element: {
                                    tag: selectedElement.tagName.toLowerCase(),
                                    id: selectedElement.id,
                                    classes: Array.from(selectedElement.classList),
                                    text: selectedElement.textContent?.substring(0, 100)
                                }
                            };
                            
                            // Use special console message that main process will intercept
                            console.log('__AI_ELEMENT_SELECTED__', JSON.stringify(selectionData));
                        }
                    }
                    
                    function handleMouseLeave() {
                        overlay.style.display = 'none';
                        tooltip.style.display = 'none';
                    }
                    
                    // Add event listeners
                    document.addEventListener('mousemove', handleMouseMove, true);
                    document.addEventListener('click', handleClick, true);
                    document.addEventListener('mouseleave', handleMouseLeave, true);
                    
                    // Cleanup function
                    window.__aiInspectorCleanup = function() {
                        document.removeEventListener('mousemove', handleMouseMove, true);
                        document.removeEventListener('click', handleClick, true);
                        document.removeEventListener('mouseleave', handleMouseLeave, true);
                        overlay.remove();
                        tooltip.remove();
                        selectedOverlay.remove();
                        window.__aiInspectorActive = false;
                        console.log('🧹 Inspector cleaned up');
                    };
                    
                    window.__aiInspectorActive = true;
                    console.log('✅ Inspector injected into page');
                })();
            `);
            
            // Listen for element selection
            window.addEventListener('message', this.handleElementSelected.bind(this));
            
        } catch (error) {
            console.error('Failed to inject inspector:', error);
        }
    }

    async removeInspector() {
        const { ipcRenderer } = require('electron');
        
        try {
            await ipcRenderer.invoke('ai-execute-action', `
                if (window.__aiInspectorCleanup) {
                    window.__aiInspectorCleanup();
                }
            `);
        } catch (error) {
            console.error('Failed to remove inspector:', error);
        }
    }

    handleElementSelected(event) {
        console.log('🔍 handleElementSelected called with:', event);
        
        if (event.data?.type === 'ai-element-selected') {
            this.selectedElement = event.data;
            console.log('✅ Element selected:', this.selectedElement);
            
            // Show indicator
            this.showSelectedIndicator();
            
            // Add message to chat with HTML preview
            if (window.aiV2Chat) {
                console.log('💬 Adding message to chat');
                
                const element = this.selectedElement.element;
                const textPreview = element.text ? `\n**Text:** ${element.text.substring(0, 100)}${element.text.length > 100 ? '...' : ''}` : '';
                const idInfo = element.id ? `\n**ID:** ${element.id}` : '';
                const classInfo = element.classes && element.classes.length > 0 ? `\n**Classes:** ${element.classes.join(', ')}` : '';
                
                window.aiV2Chat.addAssistantMessage(
                    `✅ Element selected: **${this.selectedElement.selector}**\n\n` +
                    `**Tag:** <${element.tag}>${idInfo}${classInfo}${textPreview}\n\n` +
                    `What would you like to do with this element?`
                );
            } else {
                console.warn('⚠️ aiV2Chat not available');
            }
        } else {
            console.warn('⚠️ Invalid event data:', event.data);
        }
    }

    showSelectedIndicator() {
        const indicator = document.getElementById('ai-selected-indicator');
        const text = document.getElementById('selected-element-text');
        const clearBtn = document.getElementById('clear-selection-btn');
        const input = document.getElementById('ai-input-v2');
        
        if (indicator && text && this.selectedElement) {
            // Get a clean element name
            const elementName = this.getElementDisplayName(this.selectedElement);
            
            text.textContent = `Selected: ${this.selectedElement.selector}`;
            indicator.style.display = 'flex';
            
            // Update input placeholder with element name
            if (input) {
                input.placeholder = `${elementName} - Ask anything`;
            }
            
            // Clear button handler
            clearBtn.onclick = () => {
                this.clearSelection();
                this.hideSelectedIndicator();
                this.removeInspector();
                
                // Reset placeholder
                if (input) {
                    input.placeholder = 'Ask me anything...';
                }
            };
        }
    }

    getElementDisplayName(selectedElement) {
        const element = selectedElement.element;
        
        // Priority: ID > First class > Tag name
        if (element.id) {
            return `#${element.id}`;
        } else if (element.classes && element.classes.length > 0) {
            return `.${element.classes[0]}`;
        } else {
            return element.tag || 'element';
        }
    }

    hideSelectedIndicator() {
        const indicator = document.getElementById('ai-selected-indicator');
        if (indicator) {
            indicator.style.display = 'none';
        }
    }

    clearSelection() {
        this.selectedElement = null;
    }
}

// Initialize when DOM is ready
if (typeof window !== 'undefined') {
    window.aiElementSelector = null;
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            window.aiElementSelector = new AIElementSelector();
        });
    } else {
        window.aiElementSelector = new AIElementSelector();
    }
}
