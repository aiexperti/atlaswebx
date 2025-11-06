# 🔄 Cache Fix - Force New Code to Load

## Problem

Electron caches JavaScript files, so when you update the AI assistant code, the browser might still use the old cached version instead of the new code.

## Solutions

### Solution 1: Clear Cache on Startup (Recommended)

Add this to `main.js` after creating the window:

```javascript
function createWindow() {
  mainWindow = new BrowserWindow({
    // ... existing config
  });

  // Clear cache on startup to always use fresh code
  mainWindow.webContents.session.clearCache().then(() => {
    console.log('✅ Cache cleared - using fresh code');
  });

  mainWindow.loadFile('index.html');
}
```

### Solution 2: Disable Cache in Development

Add this to `main.js` for development mode:

```javascript
app.whenReady().then(() => {
  // Disable cache in development
  if (process.argv.includes('--dev')) {
    session.defaultSession.clearCache();
    session.defaultSession.clearStorageData();
    console.log('🔄 Development mode - cache disabled');
  }
  
  createWindow();
});
```

### Solution 3: Add Cache Busting to index.html

Add version parameter to script tags:

```html
<!-- AI Assistant Module with cache busting -->
<script src="ai-assistant/ai-dom-analyzer.js?v=1.0.0"></script>
<script src="ai-assistant/ai-network-monitor.js?v=1.0.0"></script>
<script src="ai-assistant/ai-storage-analyzer.js?v=1.0.0"></script>
<script src="ai-assistant/ai-treatment.js?v=1.0.0"></script>
<script src="ai-assistant/ai-router.js?v=1.0.1"></script>
<script src="ai-assistant/ai-task-manager.js?v=1.0.0"></script>
<!-- ... -->
```

Update version when you change files.

### Solution 4: Hard Reload Shortcut

Add keyboard shortcut for hard reload in `main.js`:

```javascript
const { globalShortcut } = require('electron');

app.whenReady().then(() => {
  // Register Cmd+Shift+R for hard reload
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
```

### Solution 5: Add Clear Cache Button in Settings

Add to your settings UI:

```javascript
// In settings modal
const clearCacheBtn = document.createElement('button');
clearCacheBtn.textContent = '🔄 Clear Cache & Reload';
clearCacheBtn.onclick = async () => {
  await ipcRenderer.invoke('clear-cache');
  location.reload();
};
```

And in `main.js`:

```javascript
ipcMain.handle('clear-cache', async () => {
  await session.defaultSession.clearCache();
  await session.defaultSession.clearStorageData();
  return { success: true };
});
```

## Quick Fix (Immediate)

**For immediate use of new code:**

1. **Close the app completely**
2. **Run with dev flag:**
   ```bash
   npm start -- --dev
   ```
3. **Or manually clear cache:**
   - Open DevTools (if enabled)
   - Right-click reload button
   - Select "Empty Cache and Hard Reload"

## Recommended Implementation

Combine Solution 1 + Solution 2 for best results:

```javascript
// main.js

const { app, BrowserWindow, session, globalShortcut } = require('electron');

function createWindow() {
  mainWindow = new BrowserWindow({
    // ... existing config
  });

  // Clear cache on startup (development mode)
  if (process.argv.includes('--dev')) {
    mainWindow.webContents.session.clearCache().then(() => {
      console.log('✅ Cache cleared - using fresh code');
    });
  }

  mainWindow.loadFile('index.html');
}

app.whenReady().then(() => {
  // Clear cache in development
  if (process.argv.includes('--dev')) {
    session.defaultSession.clearCache();
    console.log('🔄 Development mode - cache disabled');
  }

  // Register hard reload shortcut
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

// Add IPC handler for manual cache clear
ipcMain.handle('clear-cache', async () => {
  await session.defaultSession.clearCache();
  await session.defaultSession.clearStorageData();
  console.log('🗑️ Cache cleared manually');
  return { success: true };
});
```

## Testing

After implementing, test that new code loads:

1. Make a change to any AI file (add console.log)
2. Restart the app
3. Check console for your log message
4. If you see it → ✅ Cache fix working
5. If not → Try hard reload (Cmd+Shift+R)

## Summary

**Problem:** Electron caches JavaScript files
**Solution:** Clear cache on startup + hard reload shortcut
**Result:** Always use fresh code

---

**Status:** Ready to implement
**Impact:** Ensures new code is always loaded
