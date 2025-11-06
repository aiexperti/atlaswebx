const { app, BrowserWindow, BrowserView, ipcMain, session, Menu, shell, globalShortcut } = require('electron');
const path = require('path');
const fs = require('fs');

// Load environment variables from .env file
require('dotenv').config();

let mainWindow;
let settingsWindow = null;
let appStoreWindow = null;
let currentView = null;
const tabs = [];

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1000,
    minHeight: 600,
    frame: false,
    titleBarStyle: 'hidden',
    backgroundColor: '#1a1a1a',
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      webviewTag: true
    }
  });

  // Clear cache on startup in development mode to always use fresh code
  if (process.argv.includes('--dev')) {
    mainWindow.webContents.session.clearCache().then(() => {
      console.log('✅ Cache cleared - using fresh AI assistant code');
    });
  }

  mainWindow.loadFile('index.html');

  // Open DevTools in development
  if (process.argv.includes('--dev')) {
    mainWindow.webContents.openDevTools();
  }
}

// Handle tab creation
ipcMain.on('create-tab', (event, data) => {
  // Handle both old format (string url) and new format (object with states)
  const url = typeof data === 'string' ? data : data.url;
  const leftCollapsed = typeof data === 'object' ? data.leftCollapsed : false;
  const aiVisible = typeof data === 'object' ? data.aiVisible : false;
  
  const view = new BrowserView({
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: false, // Allow loading local files
      allowRunningInsecureContent: true
    }
  });

  const tabId = Date.now();
  tabs.push({ id: tabId, view, url });

  mainWindow.addBrowserView(view);
  
  // Position the view using current sidebar states
  const bounds = mainWindow.getContentBounds();
  const leftSidebarWidth = leftCollapsed ? 60 : 240;
  const aiSidebarWidth = aiVisible ? 360 : 0;
  const topNavHeight = 84; // 32 (titlebar) + 52 (top nav)
  
  view.setBounds({ 
    x: leftSidebarWidth, 
    y: topNavHeight, 
    width: bounds.width - leftSidebarWidth - aiSidebarWidth, 
    height: bounds.height - topNavHeight 
  });

  view.webContents.loadURL(url);
  
  // Open DevTools for debugging (in dev mode)
  if (process.argv.includes('--dev')) {
    view.webContents.openDevTools();
  }

  // Send navigation updates
  view.webContents.on('did-navigate', (event, url) => {
    mainWindow.webContents.send('tab-navigated', { tabId, url });
  });
  
  // When page finishes loading, inject monitoring and notify renderer
  view.webContents.on('did-finish-load', async () => {
    const url = view.webContents.getURL();
    
    // Inject AI page scraper for comprehensive data capture
    try {
      const scraperPath = path.join(__dirname, 'ai-assistant', 'ai-page-scraper.js');
      if (fs.existsSync(scraperPath)) {
        const scraperCode = fs.readFileSync(scraperPath, 'utf8');
        await view.webContents.executeJavaScript(scraperCode);
        console.log('✅ AI Page Scraper injected into:', url);
      }
    } catch (error) {
      console.error('Failed to inject AI Page Scraper:', error);
    }
    
    mainWindow.webContents.send('page-loaded', { tabId, url });
  });

  view.webContents.on('page-title-updated', (event, title) => {
    mainWindow.webContents.send('tab-title-updated', { tabId, title });
  });

  view.webContents.on('page-favicon-updated', (event, favicons) => {
    if (favicons && favicons.length > 0) {
      mainWindow.webContents.send('tab-favicon-updated', { tabId, favicon: favicons[0] });
    }
  });

  currentView = view;
  event.reply('tab-created', { tabId, url });
});

// Handle tab switching
ipcMain.on('switch-tab', (event, data) => {
  // Handle both old format (number tabId) and new format (object with states)
  const tabId = typeof data === 'number' ? data : data.tabId;
  const leftCollapsed = typeof data === 'object' ? data.leftCollapsed : false;
  const aiVisible = typeof data === 'object' ? data.aiVisible : false;
  
  const tab = tabs.find(t => t.id === tabId);
  if (tab) {
    if (currentView) {
      mainWindow.removeBrowserView(currentView);
    }
    mainWindow.addBrowserView(tab.view);
    
    const bounds = mainWindow.getContentBounds();
    const leftSidebarWidth = leftCollapsed ? 60 : 240;
    const aiSidebarWidth = aiVisible ? 360 : 0;
    const topNavHeight = 84;
    
    tab.view.setBounds({ 
      x: leftSidebarWidth, 
      y: topNavHeight, 
      width: bounds.width - leftSidebarWidth - aiSidebarWidth, 
      height: bounds.height - topNavHeight 
    });
    
    currentView = tab.view;
  }
});

// Handle tab reload
ipcMain.on('reload-tab', (event, tabId) => {
  const tab = tabs.find(t => t.id === tabId);
  if (tab && tab.view) {
    console.log('🔄 Reloading tab:', tabId);
    tab.view.webContents.reload();
  }
});

// Handle tab closing
ipcMain.on('close-tab', (event, tabId) => {
  const tabIndex = tabs.findIndex(t => t.id === tabId);
  if (tabIndex !== -1) {
    const tab = tabs[tabIndex];
    
    // Remove from window if it's the current view
    if (currentView === tab.view) {
      mainWindow.removeBrowserView(tab.view);
      currentView = null;
    }
    
    // Properly destroy the BrowserView to free resources
    try {
      tab.view.webContents.destroy();
    } catch (e) {
      console.error('Error destroying webContents:', e);
    }
    
    // Remove from tabs array
    tabs.splice(tabIndex, 1);
    
    // Switch to another tab if available
    if (tabs.length > 0 && currentView === null) {
      const newTab = tabs[tabs.length - 1];
      mainWindow.addBrowserView(newTab.view);
      currentView = newTab.view;
      event.reply('tab-switched', newTab.id);
    }
  }
});

// Handle navigation
ipcMain.on('navigate', (event, url) => {
  if (currentView) {
    currentView.webContents.loadURL(url);
  }
});

ipcMain.on('go-back', () => {
  if (currentView && currentView.webContents.canGoBack()) {
    currentView.webContents.goBack();
  }
});

ipcMain.on('go-forward', () => {
  if (currentView && currentView.webContents.canGoForward()) {
    currentView.webContents.goForward();
  }
});

ipcMain.on('reload', () => {
  if (currentView) {
    currentView.webContents.reload();
  }
});

// Handle sidebar state changes
ipcMain.on('sidebar-state-changed', (event, { leftCollapsed, aiVisible }) => {
  if (currentView) {
    const bounds = mainWindow.getContentBounds();
    const leftSidebarWidth = leftCollapsed ? 60 : 240;
    const aiSidebarWidth = aiVisible ? 360 : 0;
    
    currentView.setBounds({
      x: leftSidebarWidth,
      y: 88,
      width: bounds.width - leftSidebarWidth - aiSidebarWidth,
      height: bounds.height - 88
    });
  }
});

// Handle CSS injection into tabs
ipcMain.on('inject-css', (event, { tabId, css }) => {
  const tab = tabs.find(t => t.id === tabId);
  if (tab && tab.view) {
    tab.view.webContents.insertCSS(css)
      .then(() => {
        console.log('✅ CSS injected into tab:', tabId);
      })
      .catch(err => {
        console.error('❌ Failed to inject CSS:', err);
      });
  }
});

// Handle home screen
ipcMain.on('show-home', () => {
  if (currentView) {
    mainWindow.removeBrowserView(currentView);
    currentView = null;
  }
});

// Handle window controls
ipcMain.on('window-minimize', () => {
  mainWindow.minimize();
});

ipcMain.on('window-maximize', () => {
  if (mainWindow.isMaximized()) {
    mainWindow.unmaximize();
  } else {
    mainWindow.maximize();
  }
});

ipcMain.on('window-close', () => {
  mainWindow.close();
});

app.whenReady().then(() => {
  // Clear cache in development mode
  if (process.argv.includes('--dev')) {
    session.defaultSession.clearCache().then(() => {
      console.log('🔄 Development mode - cache cleared on startup');
    });
  }

  // Register hard reload shortcut (Cmd/Ctrl + Shift + R)
  globalShortcut.register('CommandOrControl+Shift+R', () => {
    if (mainWindow) {
      mainWindow.webContents.session.clearCache().then(() => {
        mainWindow.reload();
        console.log('🔄 Hard reload - cache cleared');
      });
    }
  });

  createWindow();
});

app.on('window-all-closed', () => {
  // Unregister shortcuts
  globalShortcut.unregisterAll();
  
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// Handle settings window
ipcMain.on('open-settings', () => {
  if (settingsWindow) {
    settingsWindow.focus();
    return;
  }

  settingsWindow = new BrowserWindow({
    width: 1000,
    height: 700,
    minWidth: 900,
    minHeight: 600,
    parent: mainWindow,
    modal: false,
    frame: false,
    titleBarStyle: 'hidden',
    backgroundColor: '#1a1a1a',
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  settingsWindow.loadFile('settings/settings.html');

  settingsWindow.on('closed', () => {
    settingsWindow = null;
  });
});

// Handle settings updates
ipcMain.on('settings-updated', (event, settings) => {
  // Send settings to main window
  if (mainWindow) {
    mainWindow.webContents.send('apply-settings', settings);
  }
});

// Handle settings window controls
ipcMain.on('settings-window-minimize', () => {
  if (settingsWindow) {
    settingsWindow.minimize();
  }
});

ipcMain.on('settings-window-close', () => {
  if (settingsWindow) {
    settingsWindow.close();
  }
});

// Handle App Store window
ipcMain.on('open-appstore', () => {
  if (appStoreWindow) {
    appStoreWindow.focus();
    return;
  }

  appStoreWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1000,
    minHeight: 700,
    parent: mainWindow,
    modal: false,
    frame: false,
    titleBarStyle: 'hidden',
    backgroundColor: '#1a1a2e',
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  appStoreWindow.loadFile('appstore/appstore.html');

  // Open DevTools in development
  if (process.argv.includes('--dev')) {
    appStoreWindow.webContents.openDevTools();
  }

  appStoreWindow.on('closed', () => {
    appStoreWindow = null;
  });
});

// Handle app installation from App Store
ipcMain.on('install-app', (event, appData) => {
  console.log('Installing app to home screen:', appData);
  
  // Send to main window
  if (mainWindow) {
    mainWindow.webContents.send('install-app', appData);
  }
});

// Handle App Store window controls
ipcMain.on('appstore-window-minimize', () => {
  if (appStoreWindow) {
    appStoreWindow.minimize();
  }
});

ipcMain.on('appstore-window-maximize', () => {
  if (appStoreWindow) {
    if (appStoreWindow.isMaximized()) {
      appStoreWindow.unmaximize();
    } else {
      appStoreWindow.maximize();
    }
  }
});

// AI Assistant - Get page context for analysis
ipcMain.handle('ai-get-page-context', async (event, options = {}) => {
  try {
    if (!currentView) {
      return { error: 'No active page' };
    }

    // Get basic page info
    const url = currentView.webContents.getURL();
    const title = currentView.webContents.getTitle();

    const skipFullScroll = options.skipFullScroll || false;
    const focusSelector = options.focusSelector || null;

    // Execute script to get COMPLETE page HTML and context
    const context = await currentView.webContents.executeJavaScript(`
      (async function() {
        try {
          // Save original scroll position
          const originalScrollY = window.scrollY;
          
          const skipFullScroll = ${skipFullScroll};
          const focusSelector = ${JSON.stringify(focusSelector)};
          
          if (!skipFullScroll) {
            console.log('🔄 Starting full page scroll...');
            
            // Scroll incrementally to trigger ALL lazy loading
            const scrollHeight = document.body.scrollHeight;
            const viewportHeight = window.innerHeight;
            const scrollSteps = Math.ceil(scrollHeight / viewportHeight);
            
            console.log('📏 Page height:', scrollHeight, 'Steps:', scrollSteps);
            
            // Scroll down in steps
            for (let i = 0; i <= scrollSteps; i++) {
              const scrollTo = (viewportHeight * i);
              window.scrollTo(0, scrollTo);
              await new Promise(resolve => setTimeout(resolve, 200));
            }
            
            // Final scroll to absolute bottom
            window.scrollTo(0, document.body.scrollHeight);
            await new Promise(resolve => setTimeout(resolve, 500));
          } else {
            console.log('⏭️ Skipping full page scroll (pointer mode active)');
          }
          
          if (!skipFullScroll) {
            console.log('✅ Scroll complete, getting HTML...');
          }
          
          // Get the complete HTML after all content loaded
          const finalHtml = document.documentElement.outerHTML;
          
          // Extract ALL images and links for better data extraction
          const allImages = Array.from(document.querySelectorAll('img')).map(img => ({
            src: img.src || img.getAttribute('data-src') || img.getAttribute('data-thumb') || '',
            alt: img.alt || img.getAttribute('aria-label') || '',
            width: img.width,
            height: img.height
          })).filter(img => img.src && img.src.startsWith('http'));
          
          const allLinks = Array.from(document.querySelectorAll('a[href]')).map(link => ({
            href: link.href,
            text: link.textContent?.trim() || link.getAttribute('aria-label') || '',
            title: link.getAttribute('title') || ''
          })).filter(link => link.href && link.text);
          
          console.log('📦 Extracted', allImages.length, 'images and', allLinks.length, 'links');
          
          // Extract YouTube-specific data if on YouTube
          let youtubeData = null;
          if (window.location.hostname.includes('youtube.com')) {
            console.log('🎬 Extracting YouTube data...');
            
            // Find all video containers
            const videoContainers = document.querySelectorAll('ytd-video-renderer, ytd-grid-video-renderer, ytd-rich-item-renderer, ytd-compact-video-renderer');
            console.log('🎬 Found', videoContainers.length, 'video containers');
            
            youtubeData = {
              videos: Array.from(videoContainers).map((el, index) => {
                // Find ALL images in this container
                const images = el.querySelectorAll('img');
                let thumbnail = '';
                
                for (const img of images) {
                  const src = img.src || img.getAttribute('data-src') || '';
                  if (src && (src.includes('i.ytimg.com') || src.includes('yt3.ggpht.com'))) {
                    thumbnail = src;
                    break;
                  }
                }
                
                // Find title
                const titleElement = el.querySelector('#video-title, h3 a, #video-title-link, yt-formatted-string[id="video-title"]');
                const title = titleElement?.textContent?.trim() || titleElement?.getAttribute('title') || titleElement?.getAttribute('aria-label') || '';
                
                // Find link
                const linkElement = el.querySelector('a#thumbnail, a#video-title, a#video-title-link, a[href*="/watch"]');
                const link = linkElement?.href || '';
                
                // Find views/metadata
                const metadataElement = el.querySelector('#metadata-line span, .ytd-video-meta-block span');
                const views = metadataElement?.textContent?.trim() || '';
                
                if (thumbnail && title) {
                  console.log('✅ Video', index, ':', title.substring(0, 30), '| Thumb:', thumbnail.substring(0, 50));
                }
                
                return { thumbnail, title, link, views };
              }).filter(v => v.title && v.thumbnail)
            };
            console.log('🎬 Extracted', youtubeData.videos.length, 'YouTube videos with thumbnails');
          }
          
          // Scroll back to original position
          window.scrollTo(0, originalScrollY);
          
          console.log('📦 HTML size:', finalHtml.length, 'characters');
          
          // Capture comprehensive data from AI Page Scraper
          let scrapedData = null;
          if (window.__aiPageScraper) {
            try {
              scrapedData = window.__aiPageScraper.getData();
              console.log('📊 Scraped data captured:', scrapedData.summary);
            } catch (e) {
              console.error('Failed to get scraped data:', e);
            }
          }
          
          return {
            url: window.location.href,
            title: document.title,
            bodyHtml: document.body.innerHTML,
            html: finalHtml,
            scrollHeight: document.body.scrollHeight,
            viewportHeight: window.innerHeight,
            youtubeData: youtubeData,
            allImages: allImages,
            allLinks: allLinks,
            scrapedData: scrapedData
          };
        } catch (err) {
          return { error: 'Failed to get page data: ' + err.message };
        }
      })();
    `);
    // Check if context extraction had an error
    if (context && context.error) {
      return context;
    }
    
    // Capture a screenshot of the current view to give AI layout awareness
    try {
      const image = await currentView.webContents.capturePage();
      const screenshot = image.toDataURL();
      return { ...context, screenshot };
    } catch (sErr) {
      return { ...context, screenshot: null, screenshotError: String(sErr && sErr.message || sErr) };
    }
  } catch (error) {
    console.error('IPC ai-get-page-context error:', error);
    return { error: error.message };
  }
});

// Listen for analysis window events
ipcMain.on('analysis-next', (event) => {
  console.log('📊 Analysis Next clicked');
  // Forward to main window
  if (mainWindow && mainWindow.webContents) {
    mainWindow.webContents.send('analysis-next');
  }
});

ipcMain.on('analysis-redo', (event) => {
  console.log('🔄 Analysis Redo clicked');
  // Forward to main window
  if (mainWindow && mainWindow.webContents) {
    mainWindow.webContents.send('analysis-redo');
  }
});

// Listen for extracted data window events
ipcMain.on('extracted-data-next', (event) => {
  console.log('📦 Extracted Data Next clicked');
  // Forward to main window
  if (mainWindow && mainWindow.webContents) {
    mainWindow.webContents.send('extracted-data-next');
  }
});

ipcMain.on('extracted-data-back', (event) => {
  console.log('⬅️ Extracted Data Back clicked');
  // Forward to main window
  if (mainWindow && mainWindow.webContents) {
    mainWindow.webContents.send('extracted-data-back');
  }
});

ipcMain.on('extracted-data-enhance', (event) => {
  console.log('✨ AI Enhance clicked');
  // Forward to main window
  if (mainWindow && mainWindow.webContents) {
    mainWindow.webContents.send('extracted-data-enhance');
  }
});

// AI Assistant - Show analysis window
ipcMain.handle('ai-show-analysis', async (event, analysisData) => {
  try {
    const analysisWindow = new BrowserWindow({
      width: 700,
      height: 600,
      parent: mainWindow,
      modal: false,
      show: false,
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: false
      },
      backgroundColor: '#ffffff',
      titleBarStyle: 'hiddenInset',
      roundedCorners: true
    });

    // Create HTML content
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 20px;
          }
          .container {
            background: white;
            border-radius: 16px;
            padding: 32px;
            max-height: calc(100vh - 40px);
            overflow-y: auto;
          }
          h1 {
            font-size: 28px;
            color: #1f2937;
            margin-bottom: 24px;
            display: flex;
            align-items: center;
            gap: 12px;
          }
          .section {
            margin-bottom: 24px;
            padding: 20px;
            background: #f9fafb;
            border-radius: 12px;
            border-left: 4px solid #667eea;
          }
          .section-title {
            font-size: 16px;
            font-weight: 700;
            color: #374151;
            margin-bottom: 12px;
          }
          .info-row {
            display: flex;
            justify-content: space-between;
            padding: 8px 0;
            border-bottom: 1px solid #e5e7eb;
          }
          .info-row:last-child { border-bottom: none; }
          .label { color: #6b7280; font-weight: 600; }
          .value { color: #1f2937; font-weight: 700; }
          .tags {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
            margin-top: 12px;
          }
          .tag {
            padding: 6px 12px;
            background: #dbeafe;
            color: #1e40af;
            border-radius: 6px;
            font-size: 13px;
            font-weight: 600;
          }
          .buttons {
            display: flex;
            gap: 12px;
            margin-top: 32px;
          }
          button {
            flex: 1;
            padding: 14px 24px;
            border: none;
            border-radius: 10px;
            font-size: 15px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s;
          }
          .btn-primary {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
          }
          .btn-primary:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 20px rgba(102, 126, 234, 0.4);
          }
          .btn-secondary {
            background: white;
            color: #6b7280;
            border: 2px solid #e5e7eb;
          }
          .btn-secondary:hover {
            background: #f9fafb;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>📊 Page Analysis</h1>
          
          <div class="section">
            <div class="section-title">Page Information</div>
            <div class="info-row">
              <span class="label">Page Type:</span>
              <span class="value">${analysisData.pageType?.join(', ') || 'Generic'}</span>
            </div>
            <div class="info-row">
              <span class="label">Primary Content:</span>
              <span class="value">${analysisData.primaryContent || 'Mixed'}</span>
            </div>
            <div class="info-row">
              <span class="label">Items Found:</span>
              <span class="value">${analysisData.itemCount || 0} items</span>
            </div>
          </div>

          <div class="section">
            <div class="section-title">Content Types</div>
            <div class="tags">
              ${analysisData.contentTypes?.map(type => `<span class="tag">${type}</span>`).join('') || '<span class="tag">Standard</span>'}
            </div>
          </div>

          <div class="section">
            <div class="section-title">Layout Patterns</div>
            <div class="tags">
              ${analysisData.layoutPatterns?.map(pattern => `<span class="tag">${pattern}</span>`).join('') || '<span class="tag">Standard</span>'}
            </div>
          </div>

          <div class="buttons">
            <button class="btn-secondary" onclick="redo()">🔄 Redo Analysis</button>
            <button class="btn-primary" onclick="next()">Next Step →</button>
          </div>
        </div>

        <script>
          const { ipcRenderer } = require('electron');
          function next() {
            ipcRenderer.send('analysis-next');
            window.close();
          }
          function redo() {
            ipcRenderer.send('analysis-redo');
            window.close();
          }
        </script>
      </body>
      </html>
    `;

    analysisWindow.loadURL('data:text/html;charset=utf-8,' + encodeURIComponent(html));
    analysisWindow.once('ready-to-show', () => {
      analysisWindow.show();
    });

    return { success: true };
  } catch (error) {
    console.error('Failed to show analysis window:', error);
    return { success: false, error: error.message };
  }
});

// AI Assistant - Show enhanced HTML window
ipcMain.on('show-enhanced-html', (event, { html, metadata, title }) => {
  try {
    console.log('🎨 Creating enhanced HTML window...');
    
    const htmlWindow = new BrowserWindow({
      width: 1200,
      height: 800,
      parent: mainWindow,
      modal: false,
      show: false,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        sandbox: true
      },
      backgroundColor: '#1a1a2e',
      titleBarStyle: 'hiddenInset',
      roundedCorners: true,
      title: title || '✨ Enhanced Content'
    });

    // Load the HTML directly
    htmlWindow.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(html)}`);
    
    htmlWindow.once('ready-to-show', () => {
      htmlWindow.show();
      console.log('✅ Enhanced HTML window displayed');
    });

    htmlWindow.on('closed', () => {
      console.log('🗑️ Enhanced HTML window closed');
    });

  } catch (error) {
    console.error('❌ Failed to show enhanced HTML:', error);
  }
});

// AI Assistant - Show extracted data window
ipcMain.handle('ai-show-extracted-data', async (event, { extractedData, analysis }) => {
  try {
    const dataWindow = new BrowserWindow({
      width: 900,
      height: 700,
      parent: mainWindow,
      modal: false,
      show: false,
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: false
      },
      backgroundColor: '#ffffff',
      titleBarStyle: 'hiddenInset',
      roundedCorners: true
    });

    // Organize data by categories
    const categories = {
      images: extractedData.filter(item => item.image && item.image.length > 0),
      links: extractedData.filter(item => item.link && item.link.length > 0),
      text: extractedData.filter(item => item.title && item.title.length > 0),
      other: extractedData.filter(item => !item.image && !item.link && !item.title)
    };

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 20px;
          }
          .container {
            background: white;
            border-radius: 16px;
            padding: 32px;
            max-height: calc(100vh - 40px);
            overflow-y: auto;
          }
          h1 {
            font-size: 28px;
            color: #1f2937;
            margin-bottom: 8px;
          }
          .subtitle {
            color: #6b7280;
            margin-bottom: 24px;
            font-size: 14px;
          }
          .category {
            margin-bottom: 28px;
            background: #f9fafb;
            padding: 20px;
            border-radius: 12px;
            border-left: 4px solid #667eea;
          }
          .category-header {
            display: flex;
            align-items: center;
            gap: 10px;
            margin-bottom: 16px;
          }
          .category-title {
            font-size: 18px;
            font-weight: 700;
            color: #374151;
          }
          .category-count {
            background: #667eea;
            color: white;
            padding: 4px 10px;
            border-radius: 12px;
            font-size: 12px;
            font-weight: 700;
          }
          .items-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
            gap: 12px;
          }
          .item {
            background: white;
            padding: 12px;
            border-radius: 8px;
            border: 1px solid #e5e7eb;
            font-size: 13px;
            overflow: hidden;
          }
          .item-image {
            width: 100%;
            height: 100px;
            object-fit: cover;
            border-radius: 6px;
            margin-bottom: 8px;
            background: #f3f4f6;
          }
          .item-title {
            font-weight: 600;
            color: #1f2937;
            margin-bottom: 4px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }
          .item-link {
            color: #667eea;
            font-size: 11px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }
          .buttons {
            display: flex;
            gap: 12px;
            margin-top: 32px;
            padding-top: 24px;
            border-top: 2px solid #e5e7eb;
          }
          button {
            flex: 1;
            padding: 14px 24px;
            border: none;
            border-radius: 10px;
            font-size: 15px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s;
          }
          .btn-primary {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
          }
          .btn-primary:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 20px rgba(102, 126, 234, 0.4);
          }
          .btn-secondary {
            background: white;
            color: #6b7280;
            border: 2px solid #e5e7eb;
          }
          .btn-secondary:hover {
            background: #f9fafb;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>📦 Extracted Content</h1>
          <p class="subtitle">Total: ${extractedData.length} items organized by category</p>
          
          ${categories.images.length > 0 ? `
            <div class="category">
              <div class="category-header">
                <span class="category-title">🖼️ Images</span>
                <span class="category-count">${categories.images.length}</span>
              </div>
              <div class="items-grid">
                ${categories.images.slice(0, 12).map(item => `
                  <div class="item">
                    <img src="${item.image}" class="item-image" onerror="this.style.display='none'">
                    <div class="item-title">${item.title || 'Untitled'}</div>
                  </div>
                `).join('')}
              </div>
            </div>
          ` : ''}

          ${categories.text.length > 0 ? `
            <div class="category">
              <div class="category-header">
                <span class="category-title">📝 Text Content</span>
                <span class="category-count">${categories.text.length}</span>
              </div>
              <div class="items-grid">
                ${categories.text.slice(0, 12).map(item => `
                  <div class="item">
                    <div class="item-title">${item.title}</div>
                    ${item.description ? `<div style="color: #6b7280; font-size: 11px; margin-top: 4px;">${item.description.substring(0, 60)}...</div>` : ''}
                  </div>
                `).join('')}
              </div>
            </div>
          ` : ''}

          ${categories.links.length > 0 ? `
            <div class="category">
              <div class="category-header">
                <span class="category-title">🔗 Links</span>
                <span class="category-count">${categories.links.length}</span>
              </div>
              <div class="items-grid">
                ${categories.links.slice(0, 12).map(item => `
                  <div class="item">
                    <div class="item-title">${item.title || 'Link'}</div>
                    <div class="item-link">${item.link}</div>
                  </div>
                `).join('')}
              </div>
            </div>
          ` : ''}

          <div class="buttons">
            <button class="btn-secondary" onclick="back()">← Back</button>
            <button class="btn-secondary" onclick="enhance()" style="background: linear-gradient(135deg, #f59e0b 0%, #ef4444 100%); color: white; border: none;">
              ✨ AI Enhance
            </button>
            <button class="btn-primary" onclick="next()">Continue to Design →</button>
          </div>
        </div>

        <script>
          const { ipcRenderer } = require('electron');
          function next() {
            ipcRenderer.send('extracted-data-next');
            window.close();
          }
          function back() {
            ipcRenderer.send('extracted-data-back');
            window.close();
          }
          function enhance() {
            ipcRenderer.send('extracted-data-enhance');
            window.close();
          }
        </script>
      </body>
      </html>
    `;

    dataWindow.loadURL('data:text/html;charset=utf-8,' + encodeURIComponent(html));
    dataWindow.once('ready-to-show', () => {
      dataWindow.show();
    });

    return { success: true };
  } catch (error) {
    console.error('Failed to show extracted data window:', error);
    return { success: false, error: error.message };
  }
});

// AI Assistant - Create twin tab with transformed HTML
ipcMain.handle('ai-create-twin-tab', async (event, { html, title }) => {
  try {
    const fs = require('fs');
    const path = require('path');
    const os = require('os');
    
    // Create temp file
    const tempDir = os.tmpdir();
    const fileName = `ai-twin-${Date.now()}.html`;
    const filePath = path.join(tempDir, fileName);
    
    // Write HTML to temp file
    fs.writeFileSync(filePath, html, 'utf8');
    console.log('📝 Wrote twin HTML to:', filePath);
    
    // Create file URL (now allowed with webSecurity: false)
    const fileUrl = 'file://' + filePath;
    
    // Trigger tab creation
    if (mainWindow && mainWindow.webContents) {
      mainWindow.webContents.send('create-twin-tab', { url: fileUrl, title });
    }
    
    return { success: true, filePath, url: fileUrl };
  } catch (error) {
    console.error('Failed to create twin tab:', error);
    return { success: false, error: error.message };
  }
});

// AI Assistant - Execute JavaScript on current BrowserView
ipcMain.handle('ai-execute-action', async (event, code) => {
  console.log('🔧 ai-execute-action called');
  console.log('🔧 currentView exists:', !!currentView);
  
  if (!currentView) {
    return { success: false, error: 'No active page' };
  }
  
  try {
    console.log('🔧 Executing on URL:', currentView.webContents.getURL());
    
    // First, test with an alert to confirm we're on the right page
    await currentView.webContents.executeJavaScript(`
      console.log('🎯 JavaScript is executing on:', window.location.href);
    `);
    
    const result = await currentView.webContents.executeJavaScript(code);
    console.log('🔧 Execution result:', result);
    return { success: true, result };
  } catch (error) {
    console.error('🔧 Execution error:', error);
    return { success: false, error: error.message };
  }
});

// Clear cache handler (for manual cache clearing)
ipcMain.handle('clear-cache', async () => {
  try {
    await session.defaultSession.clearCache();
    await session.defaultSession.clearStorageData();
    console.log('🗑️ Cache cleared manually');
    return { success: true, message: 'Cache cleared successfully' };
  } catch (error) {
    console.error('❌ Failed to clear cache:', error);
    return { success: false, error: error.message };
  }
});
