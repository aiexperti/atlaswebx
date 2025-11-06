const { ipcRenderer } = require('electron');

// Clean up old settings on startup
function cleanupOldSettings() {
    try {
        const settings = JSON.parse(localStorage.getItem('ai-settings') || '{}');
        
        if (settings.advancedMode !== undefined || settings.aiEnhance !== undefined) {
            console.log('🧹 Cleaning up old Advanced Mode settings...');
            
            // Keep only valid settings
            const cleanSettings = {
                openaiKey: settings.openaiKey
            };
            
            localStorage.setItem('ai-settings', JSON.stringify(cleanSettings));
            console.log('✅ Old settings removed - router will handle all routing now');
        }
    } catch (e) {
        console.error('Failed to cleanup settings:', e);
    }
}

// Run cleanup immediately
cleanupOldSettings();

// State management
let tabs = [];
let activeTabId = null;
let leftSidebarCollapsed = false;
let aiSidebarVisible = false;

// Load sidebar state from localStorage
function loadSidebarState() {
    try {
        const state = JSON.parse(localStorage.getItem('sidebar-state') || '{}');
        leftSidebarCollapsed = !!state.leftCollapsed;
        
        // Default AI sidebar to visible if not explicitly set
        aiSidebarVisible = state.aiVisible !== undefined ? !!state.aiVisible : true;
        
        // Apply initial state
        if (leftSidebarCollapsed) {
            document.getElementById('left-sidebar')?.classList.add('collapsed');
        }
        if (aiSidebarVisible) {
            document.getElementById('ai-sidebar')?.classList.add('active');
        }
    } catch (e) {
        console.error('Failed to load sidebar state:', e);
        // Default to AI visible on error
        aiSidebarVisible = true;
        document.getElementById('ai-sidebar')?.classList.add('active');
    }
}

// Save sidebar state to localStorage
function saveSidebarState() {
    try {
        localStorage.setItem('sidebar-state', JSON.stringify({
            leftCollapsed: leftSidebarCollapsed,
            aiVisible: aiSidebarVisible
        }));
    } catch (e) {
        console.error('Failed to save sidebar state:', e);
    }
}

// Load state on startup
loadSidebarState();

// Inject custom dark scrollbar into websites
function injectCustomScrollbar(tabId) {
    const scrollbarCSS = `
        /* Custom Dark Scrollbar - Lenoir Style */
        ::-webkit-scrollbar {
            width: 8px;
            height: 8px;
        }
        
        ::-webkit-scrollbar-track {
            background: rgba(26, 26, 46, 0.3);
            border-radius: 10px;
        }
        
        ::-webkit-scrollbar-thumb {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border-radius: 10px;
            transition: all 0.3s ease;
        }
        
        ::-webkit-scrollbar-thumb:hover {
            background: linear-gradient(135deg, #764ba2 0%, #f093fb 100%);
            box-shadow: 0 0 10px rgba(102, 126, 234, 0.5);
        }
        
        ::-webkit-scrollbar-thumb:active {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }
        
        /* Firefox scrollbar */
        * {
            scrollbar-width: thin;
            scrollbar-color: #667eea rgba(26, 26, 46, 0.3);
        }
    `;
    
    ipcRenderer.send('inject-css', { tabId, css: scrollbarCSS });
    console.log('🎨 Custom scrollbar injected for tab:', tabId);
}

// Initialize AI Assistant (Modular system)
const aiController = new AIController();
const aiUI = new AIUIHandler(document.getElementById('ai-messages'), document.getElementById('ai-input'));
const aiInspector = new AIInspector();

// DOM Elements
const homeScreen = document.getElementById('home-screen');
const browserView = document.getElementById('browser-view');
const topNav = document.getElementById('top-nav');
const tabsContainer = document.getElementById('tabs-container');
const urlBar = document.getElementById('url-bar');
const aiSidebar = document.getElementById('ai-sidebar');
const aiMessages = document.getElementById('ai-messages');
const aiInput = document.getElementById('ai-input');
const rulesIndicator = document.getElementById('rules-indicator');

// Window Controls
document.getElementById('minimize').addEventListener('click', () => {
    ipcRenderer.send('window-minimize');
});

document.getElementById('maximize').addEventListener('click', () => {
    ipcRenderer.send('window-maximize');
});

document.getElementById('close').addEventListener('click', () => {
    ipcRenderer.send('window-close');
});

// Navigation Controls
document.getElementById('back-btn').addEventListener('click', () => {
    ipcRenderer.send('go-back');
});

document.getElementById('forward-btn').addEventListener('click', () => {
    ipcRenderer.send('go-forward');
});

document.getElementById('reload-btn').addEventListener('click', () => {
    ipcRenderer.send('reload');
});

document.getElementById('close-tab-btn').addEventListener('click', () => {
    if (activeTabId) {
        closeTab(activeTabId);
    }
});

document.getElementById('home-btn').addEventListener('click', () => {
    showHomeScreen();
});

// URL Bar
urlBar.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        let url = urlBar.value.trim();
        
        // Add protocol if missing
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
            // Check if it looks like a URL
            if (url.includes('.') && !url.includes(' ')) {
                url = 'https://' + url;
            } else {
                // Treat as search query - use selected search engine
                url = getSearchUrl(url);
            }
        }
        
        if (activeTabId) {
            ipcRenderer.send('navigate', url);
        } else {
            createTab(url);
        }
    }
});

// Tab Management
document.getElementById('new-tab-btn').addEventListener('click', () => {
    createTab('https://www.google.com');
});

function createTab(url) {
    // Send current sidebar states with the create-tab request
    ipcRenderer.send('create-tab', {
        url: url,
        leftCollapsed: leftSidebarCollapsed,
        aiVisible: aiSidebarVisible
    });
}

// ===== AI Settings Helper (simplified) =====
function getAISettings() {
    try {
        const settings = JSON.parse(localStorage.getItem('ai-settings') || '{}');
        return settings;
    } catch {
        return {};
    }
}

function setAISettings(updates) {
    const current = getAISettings();
    const next = { ...current, ...updates };
    localStorage.setItem('ai-settings', JSON.stringify(next));
    return next;
}

ipcRenderer.on('tab-created', (event, { tabId, url }) => {
    const tab = {
        id: tabId,
        url: url,
        title: 'New Tab'
    };
    
    tabs.push(tab);
    activeTabId = tabId;
    
    renderTabs();
    showBrowserView();
    urlBar.value = url;
    
    // Auto-apply saved rules for this domain
    setTimeout(() => {
        try {
            const domain = new URL(url).hostname;
            if (!disabledDomains.has(domain)) {
                aiController.autoApplyRules(url);
            } else {
                console.log('⏸️ Rules disabled for', domain, '- skipping on tab-created');
            }
        } catch (error) {
            console.error('Failed to apply rules:', error);
        }
    }, 1500); // Wait 1.5 seconds for page to fully load
});

ipcRenderer.on('tab-navigated', (event, { tabId, url }) => {
    const tab = tabs.find(t => t.id === tabId);
    if (tab) {
        tab.url = url;
        if (tabId === activeTabId) {
            urlBar.value = url;
            
            // Show/hide AI sidebar based on URL
            updateAISidebarVisibility(url);
            
            // Inject custom scrollbar style
            injectCustomScrollbar(tabId);
            
            // Auto-apply rules if enabled
            try {
                const settings = JSON.parse(localStorage.getItem('ai-settings') || '{}');
                const autoRules = settings.autoRules;
                const disabledDomains = new Set(JSON.parse(localStorage.getItem('ai-rules-disabled-domains') || '[]'));
                const domain = new URL(url).hostname;
                
                if (autoRules && !disabledDomains.has(domain)) {
                    aiController.autoApplyRules(url);
                } else {
                    console.log('⏸️ Rules disabled for', domain, '- skipping on tab-navigated');
                }
            } catch (error) {
                console.error('Failed to apply rules:', error);
            }
        }
    }
    
    // Update tab element
    const tabElement = document.querySelector(`.tab[data-tab-id="${tabId}"]`);
    if (tabElement) {
        const tabTitle = tabElement.querySelector('.tab-title');
        try {
            const urlObj = new URL(url);
            tabTitle.textContent = urlObj.hostname || 'New Tab';
        } catch {
            tabTitle.textContent = 'New Tab';
        }
    }
});

ipcRenderer.on('tab-title-updated', (event, { tabId, title }) => {
    const tab = tabs.find(t => t.id === tabId);
    if (tab) {
        tab.title = title;
        renderTabs();
    }
});

ipcRenderer.on('tab-favicon-updated', (event, { tabId, favicon }) => {
    const tab = tabs.find(t => t.id === tabId);
    if (tab) {
        tab.favicon = favicon;
        renderTabs();
    }
});

// Update AI chat when switching tabs
ipcRenderer.on('tab-navigated', (event, { tabId, url }) => {
    if (tabId === activeTabId) {
        updateAIChatForDomain(url);
    }
});

// Create twin tab (from Advanced Mode)
ipcRenderer.on('create-twin-tab', (event, { url, title }) => {
    console.log('🪟 Creating twin tab:', title, url);
    createTab(url);
});

// Update AI chat for domain
function updateAIChatForDomain(url) {
    try {
        const domain = new URL(url).hostname;
        aiUI.setDomain(domain);
    } catch (error) {
        console.error('Failed to update AI chat:', error);
    }
}

// Clear chat button
document.getElementById('clear-chat-btn').addEventListener('click', () => {
    aiUI.clearCurrentChat();
    console.log('🗑️ Chat cleared for current domain');
});

// Clear rules button
document.getElementById('clear-rules-btn').addEventListener('click', () => {
    const currentTab = tabs.find(t => t.id === activeTabId);
    if (currentTab && currentTab.url) {
        try {
            const domain = new URL(currentTab.url).hostname;
            const rules = aiController.getRules(domain);
            
            if (rules.length > 0) {
                // Delete all rules for this domain
                rules.forEach(rule => {
                    aiController.deleteRule(domain, rule.name);
                });
                
                console.log(`🗑️ Cleared ${rules.length} rule(s) for ${domain}`);
                rulesIndicator.style.display = 'none';
                
                // Reload page
                ipcRenderer.send('reload-tab', activeTabId);
            } else {
                console.log('⚠️ No rules to clear for', domain);
            }
        } catch (error) {
            console.error('Failed to clear rules:', error);
        }
    }
});

// Inspector button - Point and click element selection
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
            
            // Update input placeholder
            aiInput.placeholder = `Modify: ${elementInfo.selector}`;
        });
        
        inspectorBtn.style.color = '#4a9eff';
        inspectorBtn.style.background = '#1f2a3a';
        inspectorBtn.title = 'Inspector Mode: Active (click element to select)';
        
        aiUI.addAIMessage('🎯 Inspector mode activated - click any element on the page to select it', false);
    }
});

// Listen for inspector messages from page
window.addEventListener('message', (event) => {
    if (event.data.type === 'ai-inspector-hover') {
        aiInspector.handleHover(event.data.rect);
    } else if (event.data.type === 'ai-inspector-select') {
        aiInspector.handleSelection(event.data.element);
    }
});

// When page finishes loading, auto-apply rules
ipcRenderer.on('page-loaded', (event, { tabId, url }) => {
    console.log('📄 Page loaded:', url);
    if (tabId === activeTabId) {
        // Apply rules after a short delay to ensure page is fully rendered
        setTimeout(async () => {
            try {
                const domain = new URL(url).hostname;
                
                // Check if rules are disabled for this domain
                if (disabledDomains.has(domain)) {
                    console.log('⏸️ Rules disabled for', domain, '- skipping auto-apply');
                    updateRulesIndicator(url, { applied: 0, total: 0 });
                    return;
                }
                
                const result = await aiController.autoApplyRules(url);
                updateRulesIndicator(url, result);
            } catch (error) {
                console.error('Failed to apply rules:', error);
            }
        }, 500);
    }
});

// Update rules indicator in address bar
function updateRulesIndicator(url, result) {
    try {
        const domain = new URL(url).hostname;
        const rules = aiController.getRules(domain);
        
        if (rules.length > 0) {
            rulesIndicator.querySelector('.rules-count').textContent = rules.length;
            rulesIndicator.style.display = 'flex';
            
            // Check if disabled
            if (disabledDomains.has(domain)) {
                rulesIndicator.style.background = '#666';
                rulesIndicator.title = `${rules.length} AI rule(s) disabled - Click to enable`;
            } else {
                rulesIndicator.style.background = '#0066ff';
                rulesIndicator.title = `${rules.length} AI rule(s) active - Click to disable`;
            }
        } else {
            rulesIndicator.style.display = 'none';
        }
    } catch (error) {
        rulesIndicator.style.display = 'none';
    }
}

// Track disabled domains (load from localStorage)
let disabledDomains = new Set(JSON.parse(localStorage.getItem('disabled-domains') || '[]'));

// Save disabled domains to localStorage
function saveDisabledDomains() {
    localStorage.setItem('disabled-domains', JSON.stringify([...disabledDomains]));
    console.log('💾 Disabled domains saved:', [...disabledDomains]);
}

// Handle rules indicator click - toggle rules on/off
rulesIndicator.addEventListener('click', () => {
    const currentTab = tabs.find(t => t.id === activeTabId);
    if (currentTab && currentTab.url) {
        try {
            const domain = new URL(currentTab.url).hostname;
            
            if (disabledDomains.has(domain)) {
                // Enable rules
                disabledDomains.delete(domain);
                saveDisabledDomains();
                rulesIndicator.style.background = '#0066ff';
                rulesIndicator.title = 'AI Rules Active - Click to disable';
                console.log('✅ Rules enabled for', domain);
            } else {
                // Disable rules
                disabledDomains.add(domain);
                saveDisabledDomains();
                rulesIndicator.style.background = '#666';
                rulesIndicator.title = 'AI Rules Disabled - Click to enable';
                console.log('⏸️ Rules disabled for', domain);
            }
            
            // Reload page to apply/remove rules
            console.log('🔄 Reloading page to apply changes...');
            ipcRenderer.send('reload-tab', activeTabId);
        } catch (error) {
            console.error('Failed to toggle rules:', error);
        }
    }
});

// Handle new tab requests from links
ipcRenderer.on('open-new-tab', (event, url) => {
    console.log('Opening new tab for:', url);
    createTab(url);
});

function renderTabs() {
    tabsContainer.innerHTML = '';
    
    tabs.forEach(tab => {
        const tabElement = document.createElement('div');
        tabElement.className = 'tab' + (tab.id === activeTabId ? ' active' : '');
        tabElement.title = tab.title || tab.url; // Tooltip on hover
        
        // Get favicon URL
        const faviconUrl = tab.favicon || getFaviconUrl(tab.url);
        
        tabElement.innerHTML = `
            <div class="tab-favicon">
                <img src="${faviconUrl}" alt="" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                <div class="tab-favicon-fallback" style="display: none;">${getInitial(tab.title || tab.url)}</div>
            </div>
            <div class="tab-title">${escapeHtml(tab.title || 'New Tab')}</div>
            <button class="tab-close">
                <svg width="12" height="12" viewBox="0 0 12 12">
                    <path d="M2 2 L10 10 M10 2 L2 10" stroke="currentColor" stroke-width="1.5"/>
                </svg>
            </button>
        `;
        
        tabElement.addEventListener('click', (e) => {
            if (!e.target.closest('.tab-close')) {
                switchTab(tab.id);
            }
        });
        
        const closeBtn = tabElement.querySelector('.tab-close');
        closeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            closeTab(tab.id);
        });
        
        tabsContainer.appendChild(tabElement);
    });
}

function getFaviconUrl(url) {
    try {
        const urlObj = new URL(url);
        return `https://www.google.com/s2/favicons?domain=${urlObj.hostname}&sz=32`;
    } catch (e) {
        return '';
    }
}

function getInitial(text) {
    if (!text) return '•';
    const cleaned = text.replace(/^https?:\/\//, '').replace(/^www\./, '');
    return cleaned.charAt(0).toUpperCase();
}

function switchTab(tabId) {
    if (activeTabId === tabId) {
        // If clicking the same tab, just ensure browser view is shown
        showBrowserView();
        return;
    }
    
    activeTabId = tabId;
    
    // Send current sidebar states with tab switch
    ipcRenderer.send('switch-tab', {
        tabId: tabId,
        leftCollapsed: leftSidebarCollapsed,
        aiVisible: aiSidebarVisible
    });
    
    const tab = tabs.find(t => t.id === tabId);
    if (tab) {
        urlBar.value = tab.url;
    }
    
    renderTabs();
    showBrowserView();
}

function closeTab(tabId) {
    const index = tabs.findIndex(t => t.id === tabId);
    if (index === -1) return;
    
    // Determine which tab to switch to BEFORE removing the tab
    let newActiveTabId = null;
    
    if (activeTabId === tabId && tabs.length > 1) {
        // Switch to the tab on the left (previous), or right (next) if it's the first tab
        if (index > 0) {
            // Switch to previous tab (left)
            newActiveTabId = tabs[index - 1].id;
        } else {
            // First tab, switch to next tab (right)
            newActiveTabId = tabs[index + 1].id;
        }
    }
    
    // Send close-tab to main process
    ipcRenderer.send('close-tab', tabId);
    
    // Remove the tab from array
    tabs.splice(index, 1);
    
    // Switch to the new active tab or show home screen
    if (activeTabId === tabId) {
        if (newActiveTabId) {
            // Force switch to the new tab
            activeTabId = newActiveTabId;
            
            // Send switch-tab with sidebar states
            ipcRenderer.send('switch-tab', {
                tabId: newActiveTabId,
                leftCollapsed: leftSidebarCollapsed,
                aiVisible: aiSidebarVisible
            });
            
            // Update URL bar
            const tab = tabs.find(t => t.id === newActiveTabId);
            if (tab) {
                urlBar.value = tab.url;
            }
            
            showBrowserView();
        } else {
            activeTabId = null;
            showHomeScreen();
        }
    }
    
    renderTabs();
}

ipcRenderer.on('tab-switched', (event, tabId) => {
    activeTabId = tabId;
    renderTabs();
});

// Home Screen
function showHomeScreen() {
    homeScreen.classList.remove('hidden');
    browserView.classList.remove('active');
    
    // Hide top navigation bar on home screen
    topNav.style.display = 'none';
    
    // Tell main process to hide current browser view
    ipcRenderer.send('show-home');
    activeTabId = null;
    renderTabs();
}

function showBrowserView() {
    homeScreen.classList.add('hidden');
    browserView.classList.add('active');
    
    // Show top navigation bar when browsing
    topNav.style.display = 'flex';
}

// Home Search Bar
const homeSearchInput = document.getElementById('home-search-input');
homeSearchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        let url = homeSearchInput.value.trim();
        
        if (!url) return;
        
        // Add protocol if missing
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
            if (url.includes('.') && !url.includes(' ')) {
                url = 'https://' + url;
            } else {
                // Use selected search engine
                url = getSearchUrl(url);
            }
        }
        
        createTab(url);
        homeSearchInput.value = '';
    }
});

// App Shortcuts
document.querySelectorAll('.app-shortcut').forEach(shortcut => {
    shortcut.addEventListener('click', () => {
        const url = shortcut.getAttribute('data-url');
        const action = shortcut.getAttribute('data-action');
        
        if (action === 'app-store') {
            // Open a modal or page for app management
            alert('App Store - Coming soon! Here you can add custom apps and shortcuts.');
        } else if (action === 'settings') {
            // Open settings page
            ipcRenderer.send('open-settings');
        } else if (url) {
            createTab(url);
        }
    });
});

// Favorite Items
document.querySelectorAll('.favorite-item').forEach(favorite => {
    favorite.addEventListener('click', () => {
        const url = favorite.getAttribute('data-url');
        const action = favorite.getAttribute('data-action');
        
        if (action === 'settings') {
            // Open settings
            ipcRenderer.send('open-settings');
        } else if (action === 'appstore') {
            // Open App Store
            ipcRenderer.send('open-appstore');
        } else if (action === 'ai-assistant') {
            // Toggle AI assistant
            toggleAISidebar();
        } else if (url) {
            // Open URL in new tab
            createTab(url);
        }
    });
});

// Left Sidebar Toggle
document.getElementById('toggle-left-sidebar').addEventListener('click', () => {
    leftSidebarCollapsed = !leftSidebarCollapsed;
    const leftSidebar = document.getElementById('left-sidebar');
    leftSidebar.classList.toggle('collapsed', leftSidebarCollapsed);
    
    // Save state
    saveSidebarState();
    
    // Notify main process to adjust BrowserView
    ipcRenderer.send('sidebar-state-changed', {
        leftCollapsed: leftSidebarCollapsed,
        aiVisible: aiSidebarVisible
    });
});

// AI Sidebar Toggle (from sidebar header)
document.getElementById('toggle-ai-sidebar').addEventListener('click', () => {
    toggleAISidebar();
});

// AI Sidebar Toggle (from top nav bar)
document.getElementById('ai-toggle-top-btn').addEventListener('click', () => {
    toggleAISidebar();
});

/**
 * Update AI sidebar visibility based on URL
 * Hide on home page, show on websites (respecting user toggle state)
 */
function updateAISidebarVisibility(url) {
    const isHomePage = !url || url === 'about:blank' || url.includes('lenoir://home');
    const aiSidebar = document.getElementById('ai-sidebar');
    
    if (isHomePage) {
        // Hide AI sidebar on home page
        aiSidebar.classList.remove('active');
        console.log('🏠 Home page - hiding AI sidebar');
    } else {
        // Show AI sidebar on websites (if user hasn't manually hidden it)
        const savedState = JSON.parse(localStorage.getItem('sidebar-state') || '{}');
        const shouldShow = savedState.aiVisible !== false; // Default to true
        
        if (shouldShow) {
            aiSidebar.classList.add('active');
            aiSidebarVisible = true;
            console.log('🌐 Website loaded - showing AI sidebar');
        } else {
            console.log('🌐 Website loaded - AI sidebar manually hidden by user');
        }
    }
    
    // Notify main process
    ipcRenderer.send('sidebar-state-changed', {
        leftCollapsed: leftSidebarCollapsed,
        aiVisible: aiSidebar.classList.contains('active')
    });
}

function toggleAISidebar() {
    aiSidebarVisible = !aiSidebarVisible;
    const aiSidebar = document.getElementById('ai-sidebar');
    aiSidebar.classList.toggle('active', aiSidebarVisible);
    
    // Save state
    saveSidebarState();
    
    // Notify main process to adjust BrowserView
    ipcRenderer.send('sidebar-state-changed', {
        leftCollapsed: leftSidebarCollapsed,
        aiVisible: aiSidebarVisible
    });
}

// AI Suggestions
document.querySelectorAll('.ai-suggestion').forEach(suggestion => {
    suggestion.addEventListener('click', () => {
        const text = suggestion.querySelector('span').textContent;
        aiInput.value = text;
        sendAIMessage();
    });
});

// AI Chat
document.getElementById('ai-send').addEventListener('click', () => {
    sendAIMessage();
});

aiInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        sendAIMessage();
    }
});

// AI Message Handler - Minimal code using modular system
async function sendAIMessage() {
    const message = aiInput.value.trim();
    if (!message) return;
    
    // Check if element is selected with inspector
    const selectedElement = aiInspector.getSelectedElement();
    let finalMessage = message;
    
    if (selectedElement) {
        // Add selected element context to message
        finalMessage = `For the selected element "${selectedElement.selector}": ${message}`;
        console.log('📍 Using selected element:', selectedElement.selector);
        console.log('📝 Modified message:', finalMessage);
    }
    
    // UI: Add user message (original message)
    aiUI.addUserMessage(message);
    aiUI.clearInput();
    aiUI.showLoading();
    
    // Get current tab and webview
    const currentTab = tabs.find(t => t.id === activeTabId);
    console.log('🔍 Current tab:', currentTab);
    console.log('🔍 Active tab ID:', activeTabId);
    
    const webview = currentTab ? document.querySelector(`webview[data-tab-id="${activeTabId}"]`) : null;
    console.log('🔍 Webview found:', !!webview);
    
    if (!webview && currentTab) {
        console.log('⚠️ Webview not found! Trying alternative selector...');
        // Try finding any webview
        const allWebviews = document.querySelectorAll('webview');
        console.log('📊 Total webviews:', allWebviews.length);
    }
    
    // Process with AI Controller (use modified message with element context)
    const options = selectedElement ? {
        selectedElement: selectedElement,
        skipFullScroll: true
    } : {};
    const result = await aiController.processMessage(finalMessage, currentTab, options);
    
    // UI: Remove loading
    aiUI.hideLoading();
    
    // UI: Show result
    if (result.success) {
        aiUI.addAIMessage(result.message);
        
        // Show actions if any
        if (result.actions && result.actions.actions && result.actions.actions.length > 0) {
            const domain = getCurrentDomain();
            console.log('🌐 Current domain for saving:', domain);
            aiUI.addActionsDisplay(result.actions.actions, domain, (domain, name, actions) => {
                console.log('💾 Save button clicked! Domain:', domain, 'Name:', name, 'Actions:', actions.length);
                aiController.saveRule(domain, name, actions);
            });
        }
        
        // Clear selection after successful modification
        if (selectedElement) {
            aiInspector.clearSelection();
            aiInput.placeholder = 'Ask AI to modify the page...';
            console.log('✅ Selection cleared after modification');
        }
    } else {
        aiUI.addError(result.error);
    }
}

function getCurrentDomain() {
    const currentTab = tabs.find(t => t.id === activeTabId);
    if (currentTab && currentTab.url) {
        try {
            return new URL(currentTab.url).hostname;
        } catch (e) {
            return '';
        }
    }
    return '';
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Update time
function updateTime() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const timeString = `${hours}:${minutes}`;
    
    document.querySelector('.titlebar-time').textContent = timeString;
    
    const homeTime = document.querySelector('.home-time');
    if (homeTime) {
        homeTime.textContent = timeString;
    }
    
    // Update date with translation
    const lang = getCurrentLanguage();
    updateDateTranslation(lang);
}

function updateDateTranslation(lang) {
    const now = new Date();
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const months = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'];
    
    const dayName = t(`day.${days[now.getDay()]}`, lang);
    const monthName = t(`month.${months[now.getMonth()]}`, lang);
    const date = now.getDate();
    
    const homeDate = document.querySelector('.home-date');
    if (homeDate) {
        homeDate.textContent = `${dayName}, ${monthName} ${date}`;
    }
}

updateTime();
setInterval(updateTime, 1000);

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    updateTime();
    setInterval(updateTime, 1000);
});

// Listen for app installation from App Store via IPC
ipcRenderer.on('install-app', (event, appData) => {
    console.log('Received install-app message:', appData);
    installAppToHomeScreen(appData);
});

// Install app to home screen
function installAppToHomeScreen(appData) {
    console.log('Installing app to home screen:', appData);
    
    // Create new app object
    const newApp = {
        id: `app-${Date.now()}`,
        name: appData.name,
        url: appData.url,
        icon: `<img src="${appData.icon}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 18px;">`,
        iconStyle: 'background: #fff; padding: 0;',
        page: 0, // Add to first page
        order: 999 // Add at end
    };
    
    // Send to app-manager to add
    if (typeof window.addAppToGrid === 'function') {
        window.addAppToGrid(newApp);
    } else {
        console.error('addAppToGrid function not found');
    }
}

// Swipe functionality for home screen pages
let currentPage = 0;
const totalPages = 2; // Now we have 2 pages
let startX = 0;
let currentX = 0;
let isDragging = false;

const appPagesContainer = document.querySelector('.app-pages-container');
const appPages = document.getElementById('app-pages');
const pageDots = document.querySelectorAll('.page-dot');

if (appPagesContainer && appPages) {
    // Mouse events
    appPagesContainer.addEventListener('mousedown', (e) => {
        // Don't swipe in edit mode
        if (document.getElementById('home-screen').classList.contains('edit-mode')) {
            return;
        }
        isDragging = true;
        startX = e.pageX;
        currentX = e.pageX;
    });

    appPagesContainer.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        // Don't swipe in edit mode
        if (document.getElementById('home-screen').classList.contains('edit-mode')) {
            return;
        }
        e.preventDefault();
        currentX = e.pageX;
        const diff = currentX - startX;
        const containerWidth = appPagesContainer.offsetWidth;
        appPages.classList.add('dragging');
        appPages.style.transform = `translateX(${-currentPage * containerWidth + diff}px)`;
    });

    appPagesContainer.addEventListener('mouseup', (e) => {
        if (!isDragging) return;
        isDragging = false;
        appPages.classList.remove('dragging');
        
        // Don't swipe in edit mode
        if (document.getElementById('home-screen').classList.contains('edit-mode')) {
            goToPage(currentPage);
            return;
        }
        
        const diff = currentX - startX;
        const threshold = appPagesContainer.offsetWidth * 0.2;
        
        if (diff < -threshold && currentPage < totalPages - 1) {
            goToPage(currentPage + 1);
        } else if (diff > threshold && currentPage > 0) {
            goToPage(currentPage - 1);
        } else {
            goToPage(currentPage);
        }
    });

    appPagesContainer.addEventListener('mouseleave', () => {
        if (isDragging) {
            isDragging = false;
            appPages.classList.remove('dragging');
            goToPage(currentPage);
        }
    });

    // Touch events
    appPagesContainer.addEventListener('touchstart', (e) => {
        // Don't swipe in edit mode
        if (document.getElementById('home-screen').classList.contains('edit-mode')) {
            return;
        }
        isDragging = true;
        startX = e.touches[0].pageX;
        currentX = e.touches[0].pageX;
    });

    appPagesContainer.addEventListener('touchmove', (e) => {
        if (!isDragging) return;
        // Don't swipe in edit mode
        if (document.getElementById('home-screen').classList.contains('edit-mode')) {
            return;
        }
        currentX = e.touches[0].pageX;
        const diff = currentX - startX;
        const containerWidth = appPagesContainer.offsetWidth;
        appPages.classList.add('dragging');
        appPages.style.transform = `translateX(${-currentPage * containerWidth + diff}px)`;
    });

    appPagesContainer.addEventListener('touchend', (e) => {
        if (!isDragging) return;
        isDragging = false;
        appPages.classList.remove('dragging');
        
        // Don't swipe in edit mode
        if (document.getElementById('home-screen').classList.contains('edit-mode')) {
            goToPage(currentPage);
            return;
        }
        
        const diff = currentX - startX;
        const threshold = appPagesContainer.offsetWidth * 0.2;
        
        if (diff < -threshold && currentPage < totalPages - 1) {
            goToPage(currentPage + 1);
        } else if (diff > threshold && currentPage > 0) {
            goToPage(currentPage - 1);
        } else {
            goToPage(currentPage);
        }
    });

    // Mouse wheel and trackpad support for page swiping
    let wheelTimeout;
    let trackpadDeltaX = 0;
    let trackpadDeltaY = 0;
    
    appPagesContainer.addEventListener('wheel', (e) => {
        // Don't swipe in edit mode
        if (document.getElementById('home-screen').classList.contains('edit-mode')) {
            return;
        }

        e.preventDefault();
        
        // Detect trackpad horizontal swipe (macOS)
        // Trackpad has smaller deltaX/Y values and ctrlKey is false
        const isTrackpadHorizontal = Math.abs(e.deltaX) > Math.abs(e.deltaY) && Math.abs(e.deltaX) > 4;
        const isTrackpadVertical = Math.abs(e.deltaY) > Math.abs(e.deltaX) && Math.abs(e.deltaY) > 4;
        
        if (isTrackpadHorizontal) {
            // Horizontal trackpad swipe
            trackpadDeltaX += e.deltaX;
            
            clearTimeout(wheelTimeout);
            wheelTimeout = setTimeout(() => {
                if (trackpadDeltaX > 40) {
                    // Swipe left = next page
                    if (currentPage < totalPages - 1) {
                        goToPage(currentPage + 1);
                    }
                } else if (trackpadDeltaX < -40) {
                    // Swipe right = previous page
                    if (currentPage > 0) {
                        goToPage(currentPage - 1);
                    }
                }
                trackpadDeltaX = 0;
            }, 100);
        } else if (isTrackpadVertical || e.deltaY !== 0) {
            // Vertical scroll (mouse wheel or trackpad)
            trackpadDeltaY += e.deltaY;
            
            clearTimeout(wheelTimeout);
            wheelTimeout = setTimeout(() => {
                if (trackpadDeltaY > 30) {
                    // Scroll down = next page
                    if (currentPage < totalPages - 1) {
                        goToPage(currentPage + 1);
                    }
                } else if (trackpadDeltaY < -30) {
                    // Scroll up = previous page
                    if (currentPage > 0) {
                        goToPage(currentPage - 1);
                    }
                }
                trackpadDeltaY = 0;
            }, 100);
        }
    }, { passive: false });
}

function goToPage(pageIndex) {
    currentPage = pageIndex;
    const containerWidth = appPagesContainer.offsetWidth;
    appPages.style.transform = `translateX(-${currentPage * containerWidth}px)`;
    
    // Update page indicators
    const dots = document.querySelectorAll('.page-dot');
    dots.forEach((dot, index) => {
        dot.classList.toggle('active', index === currentPage);
    });
}

// Page indicator click handlers
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('page-dot')) {
        const pageIndex = parseInt(e.target.getAttribute('data-page'));
        if (!isNaN(pageIndex)) {
            goToPage(pageIndex);
        }
    }
});

// Apply Settings
ipcRenderer.on('apply-settings', (event, settings) => {
    applySettings(settings);
});

function applySettings(settings) {
    // Apply wallpaper
    if (settings.wallpaper) {
        const wallpapers = {
            'gradient-purple': 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
            'gradient-blue': 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
            'gradient-sunset': 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
            'gradient-ocean': 'linear-gradient(135deg, #2e3192 0%, #1bffff 100%)',
            'gradient-forest': 'linear-gradient(135deg, #134e5e 0%, #71b280 100%)',
            'gradient-dark': 'linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%)'
        };
        
        const homeBackground = document.querySelector('.home-background');
        if (homeBackground) {
            if (settings.wallpaper === 'custom') {
                // Apply custom wallpaper from localStorage
                const customImage = localStorage.getItem('custom-wallpaper');
                if (customImage) {
                    homeBackground.style.background = `url(${customImage})`;
                    homeBackground.style.backgroundSize = 'cover';
                    homeBackground.style.backgroundPosition = 'center';
                }
            } else if (wallpapers[settings.wallpaper]) {
                // Apply gradient wallpaper
                homeBackground.style.background = wallpapers[settings.wallpaper];
                homeBackground.style.backgroundSize = '';
                homeBackground.style.backgroundPosition = '';
            }
        }
    }
    
    // Apply site name to title
    if (settings.siteName) {
        document.title = settings.siteName;
    }
    
    // Apply language
    if (settings.language) {
        translateUI(settings.language);
    }
    
    // Store settings for use
    window.lenoirSettings = settings;
}

// Translation function
function translateUI(lang) {
    // Translate all elements with data-i18n attribute
    document.querySelectorAll('[data-i18n]').forEach(element => {
        const key = element.getAttribute('data-i18n');
        element.textContent = t(key, lang);
    });
    
    // Translate placeholders
    document.querySelectorAll('[data-i18n-placeholder]').forEach(element => {
        const key = element.getAttribute('data-i18n-placeholder');
        element.placeholder = t(key, lang);
    });
    
    // Translate titles (tooltips)
    document.querySelectorAll('[data-i18n-title]').forEach(element => {
        const key = element.getAttribute('data-i18n-title');
        element.title = t(key, lang);
    });
    
    // Set language attribute (but keep LTR layout for all languages)
    document.documentElement.setAttribute('lang', lang);
    document.documentElement.setAttribute('dir', 'ltr'); // Always LTR to keep layout consistent
    
    // Update date display
    updateDateTranslation(lang);
    
    console.log(`UI translated to: ${lang}`);
}

// Load settings on startup
function loadAndApplySettings() {
    const settings = JSON.parse(localStorage.getItem('lenoir-settings') || '{}');
    if (Object.keys(settings).length > 0) {
        applySettings(settings);
    }
}

// URL Bar - Use selected search engine
function getSearchUrl(query, searchEngine = 'google') {
    const settings = window.lenoirSettings || JSON.parse(localStorage.getItem('lenoir-settings') || '{}');
    const engine = settings.searchEngine || searchEngine;
    
    const searchEngines = {
        'google': `https://www.google.com/search?q=${encodeURIComponent(query)}`,
        'bing': `https://www.bing.com/search?q=${encodeURIComponent(query)}`,
        'duckduckgo': `https://duckduckgo.com/?q=${encodeURIComponent(query)}`,
        'brave': `https://search.brave.com/search?q=${encodeURIComponent(query)}`
    };
    
    return searchEngines[engine] || searchEngines['google'];
}

// Initialize
loadAndApplySettings();
showHomeScreen();
