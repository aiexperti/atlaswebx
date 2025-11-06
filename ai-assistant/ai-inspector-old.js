/**
 * AI Inspector - Chrome-like Element Highlighter
 * Simple hover highlighting like Chrome DevTools inspector
 */

class AIInspector {
    constructor() {
        this.isActive = false;
        this.selectedElement = null;
        this.selectedSelector = null;
        this.onElementSelected = null;
    }

    /**
     * Activate inspector mode
     */
    activate(callback) {
        if (this.isActive) return;
        
        this.isActive = true;
        this.onElementSelected = callback;
        
        console.log('🎯 Inspector mode activated - click any element to select');
        
        // Create overlays
        this.createOverlays();
        
        // Inject inspector into active page
        this.injectInspector();
        
        // Start polling for inspector data
        this.startPolling();
        
        return {
            success: true,
            message: 'Inspector activated - click any element to select'
        };
    }

    /**
     * Deactivate inspector mode
     */
    deactivate() {
        if (!this.isActive) return;
        
        this.isActive = false;
        this.selectedElement = null;
        this.selectedSelector = null;
        
        console.log('⏹️ Inspector mode deactivated');
        
        // Stop polling
        this.stopPolling();
        
        // Remove overlays
        this.removeOverlays();
        
        // Remove inspector from page
        this.removeInspector();
        
        return {
            success: true,
            message: 'Inspector deactivated'
        };
    }

    /**
     * Toggle inspector mode
     */
    toggle(callback) {
        if (this.isActive) {
            return this.deactivate();
        } else {
            return this.activate(callback);
        }
    }

    /**
     * Create hover and selection overlays - injected into page
     */
    async createOverlays() {
        const { ipcRenderer } = require('electron');
        
        // Inject overlays into the page
        const overlayCode = `
            (function() {
                // Remove existing overlays if any
                document.getElementById('__ai_inspector_hover')?.remove();
                document.getElementById('__ai_inspector_selection')?.remove();
                
                // Create hover overlay
                const hoverOverlay = document.createElement('div');
                hoverOverlay.id = '__ai_inspector_hover';
                hoverOverlay.style.cssText = \`
                    position: fixed;
                    pointer-events: none;
                    z-index: 2147483647;
                    border: 2px dashed #4a9eff;
                    background: rgba(74, 158, 255, 0.1);
                    display: none;
                    transition: all 0.05s ease;
                    top: 0;
                    left: 0;
                \`;
                document.body.appendChild(hoverOverlay);
                
                // Create selection overlay
                const selectionOverlay = document.createElement('div');
                selectionOverlay.id = '__ai_inspector_selection';
                selectionOverlay.style.cssText = \`
                    position: fixed;
                    pointer-events: none;
                    z-index: 2147483647;
                    border: 3px solid #4a9eff;
                    background: rgba(74, 158, 255, 0.2);
                    display: none;
                    box-shadow: 0 0 20px rgba(74, 158, 255, 0.5);
                    top: 0;
                    left: 0;
                \`;
                
                // Add label
                const label = document.createElement('div');
                label.style.cssText = \`
                    position: absolute;
                    top: -30px;
                    left: 0;
                    background: #4a9eff;
                    color: white;
                    padding: 4px 12px;
                    border-radius: 4px;
                    font-size: 12px;
                    font-family: monospace;
                    white-space: nowrap;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.2);
                \`;
                label.textContent = 'Selected Element';
                selectionOverlay.appendChild(label);
                
                document.body.appendChild(selectionOverlay);
                
                console.log('✅ Inspector overlays created in page');
            })();
        `;
        
        try {
            await ipcRenderer.invoke('ai-execute-action', overlayCode);
            console.log('✅ Overlays injected into page');
        } catch (error) {
            console.error('❌ Failed to inject overlays:', error);
        }
    }

    /**
     * Remove overlays
     */
    async removeOverlays() {
        const { ipcRenderer } = require('electron');
        
        const removeCode = `
            document.getElementById('__ai_inspector_hover')?.remove();
            document.getElementById('__ai_inspector_selection')?.remove();
            console.log('✅ Inspector overlays removed');
        `;
        
        try {
            await ipcRenderer.invoke('ai-execute-action', removeCode);
        } catch (error) {
            console.error('❌ Failed to remove overlays:', error);
        }
    }

    /**
     * Inject inspector into active page
     */
    async injectInspector() {
        const { ipcRenderer } = require('electron');
        
        const inspectorCode = `
            (function() {
                if (window.__aiInspectorActive) return;
                window.__aiInspectorActive = true;
                
                console.log('🎯 AI Inspector injected into page');
                
                // Store original cursor
                const originalCursor = document.body.style.cursor;
                document.body.style.cursor = 'crosshair';
                
                // Hover handler
                function handleMouseOver(e) {
                    if (!window.__aiInspectorActive) return;
                    e.stopPropagation();
                    
                    const element = e.target;
                    const rect = element.getBoundingClientRect();
                    
                    // Store hover data globally for polling
                    window.__aiInspectorHoverData = {
                        top: rect.top,
                        left: rect.left,
                        width: rect.width,
                        height: rect.height
                    };
                }
                
                // Click handler
                function handleClick(e) {
                    if (!window.__aiInspectorActive) return;
                    e.preventDefault();
                    e.stopPropagation();
                    
                    const element = e.target;
                    const rect = element.getBoundingClientRect();
                    
                    // Generate selector
                    const selector = generateSelector(element);
                    
                    // Get element info
                    const info = {
                        tag: element.tagName.toLowerCase(),
                        id: element.id,
                        classes: Array.from(element.classList),
                        text: element.innerText?.substring(0, 100),
                        selector: selector,
                        rect: {
                            top: rect.top,
                            left: rect.left,
                            width: rect.width,
                            height: rect.height
                        }
                    };
                    
                    console.log('✅ Element selected:', info);
                    
                    // Store selection data globally for polling
                    window.__aiInspectorSelectedElement = info;
                }
                
                // Generate CSS selector for element
                function generateSelector(element) {
                    if (element.id) {
                        return '#' + element.id;
                    }
                    
                    if (element.className && typeof element.className === 'string') {
                        const classes = element.className.trim().split(/\\s+/).filter(c => c);
                        if (classes.length > 0) {
                            return element.tagName.toLowerCase() + '.' + classes.join('.');
                        }
                    }
                    
                    // Use nth-child if no id or class
                    const parent = element.parentElement;
                    if (parent) {
                        const siblings = Array.from(parent.children);
                        const index = siblings.indexOf(element) + 1;
                        return generateSelector(parent) + ' > ' + element.tagName.toLowerCase() + ':nth-child(' + index + ')';
                    }
                    
                    return element.tagName.toLowerCase();
                }
                
                // Attach listeners
                document.addEventListener('mouseover', handleMouseOver, true);
                document.addEventListener('click', handleClick, true);
                
                // Cleanup function
                window.__aiInspectorCleanup = function() {
                    window.__aiInspectorActive = false;
                    document.body.style.cursor = originalCursor;
                    document.removeEventListener('mouseover', handleMouseOver, true);
                    document.removeEventListener('click', handleClick, true);
                    console.log('⏹️ AI Inspector removed from page');
                };
            })();
        `;
        
        try {
            await ipcRenderer.invoke('ai-execute-action', inspectorCode);
            console.log('✅ Inspector injected into page');
        } catch (error) {
            console.error('❌ Failed to inject inspector:', error);
        }
    }

    /**
     * Remove inspector from page
     */
    async removeInspector() {
        const { ipcRenderer } = require('electron');
        
        const cleanupCode = `
            if (window.__aiInspectorCleanup) {
                window.__aiInspectorCleanup();
                delete window.__aiInspectorCleanup;
                delete window.__aiInspectorActive;
            }
        `;
        
        try {
            await ipcRenderer.invoke('ai-execute-action', cleanupCode);
            console.log('✅ Inspector removed from page');
        } catch (error) {
            console.error('❌ Failed to remove inspector:', error);
        }
    }

    /**
     * Handle hover event from page
     */
    async handleHover(rect) {
        if (!this.isActive) return;
        
        const { ipcRenderer } = require('electron');
        
        const updateCode = `
            (function() {
                const overlay = document.getElementById('__ai_inspector_hover');
                if (overlay) {
                    overlay.style.display = 'block';
                    overlay.style.top = '${rect.top}px';
                    overlay.style.left = '${rect.left}px';
                    overlay.style.width = '${rect.width}px';
                    overlay.style.height = '${rect.height}px';
                }
            })();
        `;
        
        try {
            await ipcRenderer.invoke('ai-execute-action', updateCode);
        } catch (error) {
            // Ignore errors during hover updates
        }
    }

    /**
     * Handle selection event from page
     */
    async handleSelection(elementInfo) {
        if (!this.isActive) return;
        
        this.selectedElement = elementInfo;
        this.selectedSelector = elementInfo.selector;
        
        const { ipcRenderer } = require('electron');
        
        const updateCode = `
            (function() {
                // Update selection overlay
                const selectionOverlay = document.getElementById('__ai_inspector_selection');
                if (selectionOverlay) {
                    selectionOverlay.style.display = 'block';
                    selectionOverlay.style.top = '${elementInfo.rect.top}px';
                    selectionOverlay.style.left = '${elementInfo.rect.left}px';
                    selectionOverlay.style.width = '${elementInfo.rect.width}px';
                    selectionOverlay.style.height = '${elementInfo.rect.height}px';
                    
                    // Update label
                    const label = selectionOverlay.querySelector('div');
                    if (label) {
                        label.textContent = '${elementInfo.selector.replace(/'/g, "\\'")}';
                    }
                }
                
                // Hide hover overlay
                const hoverOverlay = document.getElementById('__ai_inspector_hover');
                if (hoverOverlay) {
                    hoverOverlay.style.display = 'none';
                }
            })();
        `;
        
        try {
            await ipcRenderer.invoke('ai-execute-action', updateCode);
        } catch (error) {
            console.error('❌ Failed to update selection overlay:', error);
        }
        
        console.log('✅ Element selected:', elementInfo);
        
        // Call callback
        if (this.onElementSelected) {
            this.onElementSelected(elementInfo);
        }
    }

    /**
     * Get selected element info
     */
    getSelectedElement() {
        return this.selectedElement;
    }

    /**
     * Get selected selector
     */
    getSelectedSelector() {
        return this.selectedSelector;
    }

    /**
     * Clear selection
     */
    async clearSelection() {
        this.selectedElement = null;
        this.selectedSelector = null;
        
        const { ipcRenderer } = require('electron');
        
        const clearCode = `
            const selectionOverlay = document.getElementById('__ai_inspector_selection');
            if (selectionOverlay) {
                selectionOverlay.style.display = 'none';
            }
        `;
        
        try {
            await ipcRenderer.invoke('ai-execute-action', clearCode);
        } catch (error) {
            // Ignore errors
        }
    }

    /**
     * Check if inspector is active
     */
    isInspectorActive() {
        return this.isActive;
    }

    /**
     * Start polling for inspector data from page
     */
    startPolling() {
        const { ipcRenderer } = require('electron');
        
        this.pollingInterval = setInterval(async () => {
            if (!this.isActive) return;
            
            try {
                // Poll for hover data
                const hoverData = await ipcRenderer.invoke('ai-execute-action', `
                    window.__aiInspectorHoverData
                `);
                
                if (hoverData && typeof hoverData === 'object' && hoverData.top !== undefined) {
                    this.handleHover(hoverData);
                }
                
                // Poll for selection data
                const selectionData = await ipcRenderer.invoke('ai-execute-action', `
                    (function() {
                        const data = window.__aiInspectorSelectedElement;
                        if (data) {
                            window.__aiInspectorSelectedElement = null; // Clear after reading
                            return data;
                        }
                        return null;
                    })()
                `);
                
                if (selectionData && typeof selectionData === 'object' && selectionData.selector) {
                    this.handleSelection(selectionData);
                }
            } catch (error) {
                // Ignore errors during polling
            }
        }, 100); // Poll every 100ms
        
        console.log('🔄 Started polling for inspector events');
    }

    /**
     * Stop polling
     */
    stopPolling() {
        if (this.pollingInterval) {
            clearInterval(this.pollingInterval);
            this.pollingInterval = null;
            console.log('⏹️ Stopped polling for inspector events');
        }
    }
}

// Export for use in renderer
if (typeof window !== 'undefined') {
    window.AIInspector = AIInspector;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = AIInspector;
}
