const { app, BrowserWindow, ipcMain, BrowserView } = require('electron');
const path = require('path');

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
      contextIsolation: true
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

  // Send navigation updates
  view.webContents.on('did-navigate', (event, url) => {
    mainWindow.webContents.send('tab-navigated', { tabId, url });
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
    const topNavHeight = 84;
    
    currentView.setBounds({ 
      x: leftSidebarWidth, 
      y: topNavHeight, 
      width: bounds.width - leftSidebarWidth - aiSidebarWidth, 
      height: bounds.height - topNavHeight 
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

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
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
