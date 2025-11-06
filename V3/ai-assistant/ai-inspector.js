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
    async activate(callback) {
        if (this.isActive) return;
        
        this.isActive = true;
        this.onElementSelected = callback;
        
        console.log('🎯 Inspector mode activated');
        
        // Inject inspector into page
        await this.injectInspector();
        
        return {
            success: true,
            message: 'Inspector activated'
        };
    }

    /**
     * Deactivate inspector mode
     */
    async deactivate() {
        if (!this.isActive) return;
        
        this.isActive = false;
        this.selectedElement = null;
        this.selectedSelector = null;
        
        console.log('⏹️ Inspector mode deactivated');
        
        // Remove inspector from page
        await this.removeInspector();
        
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
     * Inject Chrome-like inspector into page
     */
    async injectInspector() {
        const { ipcRenderer } = require('electron');
        
        const inspectorCode = `
            (function() {
                if (window.__aiInspectorActive) return;
                window.__aiInspectorActive = true;
                
                console.log('🎯 Chrome-like inspector injected');
                
                // Create overlay element
                const overlay = document.createElement('div');
                overlay.id = '__ai_inspector_overlay';
                overlay.style.cssText = \`
                    position: absolute;
                    pointer-events: none;
                    z-index: 2147483647;
                    background: rgba(111, 168, 220, 0.35);
                    border: 2px solid rgb(111, 168, 220);
                    display: none;
                \`;
                document.body.appendChild(overlay);
                
                // Create info tooltip
                const tooltip = document.createElement('div');
                tooltip.id = '__ai_inspector_tooltip';
                tooltip.style.cssText = \`
                    position: absolute;
                    pointer-events: none;
                    z-index: 2147483648;
                    background: rgba(0, 0, 0, 0.9);
                    color: white;
                    padding: 4px 8px;
                    border-radius: 3px;
                    font-family: monospace;
                    font-size: 11px;
                    white-space: nowrap;
                    display: none;
                \`;
                document.body.appendChild(tooltip);
                
                // Store original cursor
                const originalCursor = document.body.style.cursor;
                document.body.style.cursor = 'crosshair';
                
                let hoveredElement = null;
                
                // Generate CSS selector
                function getSelector(element) {
                    if (element.id) {
                        return '#' + element.id;
                    }
                    
                    if (element.className && typeof element.className === 'string') {
                        const classes = element.className.trim().split(/\\s+/).filter(c => c && !c.startsWith('__ai'));
                        if (classes.length > 0) {
                            return element.tagName.toLowerCase() + '.' + classes.join('.');
                        }
                    }
                    
                    return element.tagName.toLowerCase();
                }
                
                // Update overlay position
                function updateOverlay(element) {
                    if (!element || element.id === '__ai_inspector_overlay' || element.id === '__ai_inspector_tooltip') {
                        overlay.style.display = 'none';
                        tooltip.style.display = 'none';
                        return;
                    }
                    
                    const rect = element.getBoundingClientRect();
                    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
                    const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
                    
                    // Update overlay
                    overlay.style.display = 'block';
                    overlay.style.top = (rect.top + scrollTop) + 'px';
                    overlay.style.left = (rect.left + scrollLeft) + 'px';
                    overlay.style.width = rect.width + 'px';
                    overlay.style.height = rect.height + 'px';
                    
                    // Update tooltip
                    const selector = getSelector(element);
                    const tag = element.tagName.toLowerCase();
                    const dimensions = Math.round(rect.width) + ' × ' + Math.round(rect.height);
                    
                    tooltip.textContent = tag + ' ' + dimensions;
                    tooltip.style.display = 'block';
                    
                    // Position tooltip above element
                    let tooltipTop = rect.top + scrollTop - 25;
                    let tooltipLeft = rect.left + scrollLeft;
                    
                    // Keep tooltip in viewport
                    if (tooltipTop < scrollTop) {
                        tooltipTop = rect.bottom + scrollTop + 5;
                    }
                    
                    tooltip.style.top = tooltipTop + 'px';
                    tooltip.style.left = tooltipLeft + 'px';
                }
                
                // Mouse move handler
                function handleMouseMove(e) {
                    if (!window.__aiInspectorActive) return;
                    
                    // Don't update overlay if selection is locked
                    if (window.__aiInspectorLocked) return;
                    
                    hoveredElement = e.target;
                    updateOverlay(hoveredElement);
                }
                
                // Click handler
                function handleClick(e) {
                    if (!window.__aiInspectorActive) return;
                    e.preventDefault();
                    e.stopPropagation();
                    
                    const element = e.target;
                    if (element.id === '__ai_inspector_overlay' || 
                        element.id === '__ai_inspector_tooltip' ||
                        element.id === '__ai_inspector_badge') {
                        return;
                    }
                    
                    // If already locked, unlock to select new element
                    if (window.__aiInspectorLocked) {
                        window.__aiInspectorLocked = false;
                        // Reset overlay style for hover mode
                        overlay.style.background = 'rgba(111, 168, 220, 0.35)';
                        overlay.style.border = '2px solid rgb(111, 168, 220)';
                        // Hide badge
                        const badge = document.getElementById('__ai_inspector_badge');
                        if (badge) badge.style.display = 'none';
                        // Continue to select new element
                    }
                    
                    const rect = element.getBoundingClientRect();
                    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
                    const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
                    const selector = getSelector(element);
                    
                    // Store selection
                    window.__aiInspectorSelection = {
                        tag: element.tagName.toLowerCase(),
                        id: element.id,
                        classes: Array.from(element.classList).filter(c => !c.startsWith('__ai')),
                        selector: selector,
                        text: element.innerText?.substring(0, 200),
                        attributes: Array.from(element.attributes).map(attr => ({
                            name: attr.name,
                            value: attr.value
                        })),
                        html: element.outerHTML ? element.outerHTML.substring(0, 2000) : null,
                        rect: {
                            top: rect.top,
                            left: rect.left,
                            width: rect.width,
                            height: rect.height
                        }
                    };
                    
                    console.log('✅ Element selected:', window.__aiInspectorSelection);
                    
                    // Lock overlay on selected element
                    overlay.style.background = 'rgba(111, 168, 220, 0.5)';
                    overlay.style.border = '2px solid rgb(66, 133, 244)';
                    overlay.style.top = (rect.top + scrollTop) + 'px';
                    overlay.style.left = (rect.left + scrollLeft) + 'px';
                    overlay.style.width = rect.width + 'px';
                    overlay.style.height = rect.height + 'px';
                    
                    // Hide hover tooltip
                    tooltip.style.display = 'none';
                    
                    // Create persistent badge showing element info
                    let badge = document.getElementById('__ai_inspector_badge');
                    if (!badge) {
                        badge = document.createElement('div');
                        badge.id = '__ai_inspector_badge';
                        badge.style.cssText = \`
                            position: absolute;
                            pointer-events: none;
                            z-index: 2147483648;
                            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                            color: white;
                            padding: 8px 16px;
                            border-radius: 20px;
                            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                            font-size: 13px;
                            font-weight: 600;
                            white-space: nowrap;
                            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
                            display: flex;
                            align-items: center;
                            gap: 8px;
                        \`;
                        document.body.appendChild(badge);
                    }
                    
                    // Build badge content with icon
                    const icon = '🎯';
                    const displayText = element.id ? '#' + element.id : selector;
                    badge.innerHTML = icon + ' <span style="opacity: 0.9;">Selected:</span> <strong>' + displayText + '</strong>';
                    badge.style.display = 'flex';
                    
                    // Position badge at top-right of element
                    let badgeTop = rect.top + scrollTop - 40;
                    let badgeLeft = rect.right + scrollLeft - 200;
                    
                    // Keep badge in viewport
                    if (badgeTop < scrollTop) {
                        badgeTop = rect.bottom + scrollTop + 10;
                    }
                    if (badgeLeft < scrollLeft) {
                        badgeLeft = rect.left + scrollLeft;
                    }
                    
                    badge.style.top = badgeTop + 'px';
                    badge.style.left = badgeLeft + 'px';
                    
                    // Stop following mouse - selection is locked
                    window.__aiInspectorLocked = true;
                }
                
                // Attach listeners
                document.addEventListener('mousemove', handleMouseMove, true);
                document.addEventListener('click', handleClick, true);
                
                // Cleanup function
                window.__aiInspectorCleanup = function() {
                    window.__aiInspectorActive = false;
                    window.__aiInspectorLocked = false;
                    document.body.style.cursor = originalCursor;
                    document.removeEventListener('mousemove', handleMouseMove, true);
                    document.removeEventListener('click', handleClick, true);
                    overlay?.remove();
                    tooltip?.remove();
                    document.getElementById('__ai_inspector_badge')?.remove();
                    console.log('⏹️ Inspector removed');
                };
            })();
        `;
        
        try {
            await ipcRenderer.invoke('ai-execute-action', inspectorCode);
            console.log('✅ Inspector injected into page');
            
            // Start checking for selections
            this.startCheckingSelection();
        } catch (error) {
            console.error('❌ Failed to inject inspector:', error);
        }
    }

    /**
     * Remove inspector from page
     */
    async removeInspector() {
        const { ipcRenderer } = require('electron');
        
        // Stop checking for selections
        this.stopCheckingSelection();
        
        const cleanupCode = `
            if (window.__aiInspectorCleanup) {
                window.__aiInspectorCleanup();
                delete window.__aiInspectorCleanup;
                delete window.__aiInspectorActive;
                delete window.__aiInspectorSelection;
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
     * Start checking for element selection
     */
    startCheckingSelection() {
        const { ipcRenderer } = require('electron');
        
        this.selectionInterval = setInterval(async () => {
            if (!this.isActive) return;
            
            try {
                const selection = await ipcRenderer.invoke('ai-execute-action', `
                    (function() {
                        const data = window.__aiInspectorSelection;
                        if (data) {
                            window.__aiInspectorSelection = null;
                            return data;
                        }
                        return null;
                    })()
                `);
                
                if (selection && selection.selector) {
                    this.handleSelection(selection);
                }
            } catch (error) {
                // Ignore errors
            }
        }, 100);
        
        console.log('🔄 Started checking for selections');
    }

    /**
     * Stop checking for selections
     */
    stopCheckingSelection() {
        if (this.selectionInterval) {
            clearInterval(this.selectionInterval);
            this.selectionInterval = null;
            console.log('⏹️ Stopped checking for selections');
        }
    }

    /**
     * Handle element selection
     */
    handleSelection(elementInfo) {
        if (!this.isActive) return;
        
        this.selectedElement = elementInfo;
        this.selectedSelector = elementInfo.selector;
        
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
    clearSelection() {
        this.selectedElement = null;
        this.selectedSelector = null;
    }

    /**
     * Check if inspector is active
     */
    isInspectorActive() {
        return this.isActive;
    }
}

// Export for use in renderer
if (typeof window !== 'undefined') {
    window.AIInspector = AIInspector;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = AIInspector;
}
