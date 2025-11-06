const { ipcRenderer } = require('electron');

// State management
let tabs = [];
let activeTabId = null;
let leftSidebarCollapsed = false;
let aiSidebarVisible = false;

// DOM Elements
const homeScreen = document.getElementById('home-screen');
const browserView = document.getElementById('browser-view');
const topNav = document.getElementById('top-nav');
const tabsContainer = document.getElementById('tabs-container');
const urlBar = document.getElementById('url-bar');
const aiSidebar = document.getElementById('ai-sidebar');
const aiMessages = document.getElementById('ai-messages');
const aiInput = document.getElementById('ai-input');

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
});

ipcRenderer.on('tab-navigated', (event, { tabId, url }) => {
    const tab = tabs.find(t => t.id === tabId);
    if (tab) {
        tab.url = url;
        if (tabId === activeTabId) {
            urlBar.value = url;
        }
        renderTabs();
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
    ipcRenderer.send('close-tab', tabId);
    
    const index = tabs.findIndex(t => t.id === tabId);
    if (index !== -1) {
        tabs.splice(index, 1);
    }
    
    if (activeTabId === tabId) {
        if (tabs.length > 0) {
            activeTabId = tabs[tabs.length - 1].id;
            switchTab(activeTabId);
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

function toggleAISidebar() {
    aiSidebarVisible = !aiSidebarVisible;
    aiSidebar.classList.toggle('active', aiSidebarVisible);
    
    // Update top button active state
    const topBtn = document.getElementById('ai-toggle-top-btn');
    topBtn.classList.toggle('active', aiSidebarVisible);
    
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

function sendAIMessage() {
    const message = aiInput.value.trim();
    if (!message) return;
    
    // Add user message
    const userMessage = document.createElement('div');
    userMessage.className = 'ai-message user';
    userMessage.innerHTML = `
        <div class="message-avatar">👤</div>
        <div class="message-content">${escapeHtml(message)}</div>
    `;
    aiMessages.appendChild(userMessage);
    
    // Clear input
    aiInput.value = '';
    
    // Scroll to bottom
    aiMessages.scrollTop = aiMessages.scrollHeight;
    
    // Simulate AI response (replace with actual AI integration)
    setTimeout(() => {
        const aiMessage = document.createElement('div');
        aiMessage.className = 'ai-message assistant';
        aiMessage.innerHTML = `
            <div class="message-avatar">🤖</div>
            <div class="message-content">I understand you're asking about "${escapeHtml(message)}". This is a placeholder response. To integrate a real AI assistant, you would connect to an API like OpenAI, Claude, or a local LLM.</div>
        `;
        aiMessages.appendChild(aiMessage);
        aiMessages.scrollTop = aiMessages.scrollHeight;
    }, 1000);
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
