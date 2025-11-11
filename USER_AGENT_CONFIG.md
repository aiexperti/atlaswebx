# Custom User Agent Configuration

## ✅ User Agent Set

The browser now uses a custom user agent string to identify itself as Chrome 142 on macOS.

## 🔧 Configuration

### User Agent String
```
Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36
```

### Breakdown
- **Browser**: Chrome 142.0.0.0
- **OS**: macOS 10.15.7 (Catalina)
- **Architecture**: Intel Mac (x86_64)
- **Rendering Engine**: WebKit/537.36 (Blink)

## 📝 Implementation

### File Modified: `main.js`

**Location**: Line 98 (in `create-tab` handler)

**Code Added**:
```javascript
// Set custom user agent
view.webContents.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36');
```

**Placement**: 
- After `view.setBounds()` (sets window position)
- Before `view.webContents.loadURL()` (loads the page)

This ensures the user agent is set before any page loads.

## 🎯 Why This Matters

### Benefits
1. **Website Compatibility**: Sites see you as Chrome 142, ensuring best compatibility
2. **Feature Support**: Websites enable Chrome-specific features
3. **No Detection**: Sites won't detect you're using a custom browser
4. **Modern Browser**: Chrome 142 is a recent version (future-proof)
5. **Consistent Experience**: All tabs use the same user agent

### Use Cases
- ✅ Access sites that require Chrome
- ✅ Bypass browser detection
- ✅ Get full feature support
- ✅ Avoid "unsupported browser" messages
- ✅ Test websites as Chrome user

## 🔍 Technical Details

### When It's Applied
- Set when each new tab is created
- Applied before page loads
- Persists for the lifetime of that tab
- All requests from that tab use this user agent

### What Websites See
When a website checks `navigator.userAgent`, they'll see:
```javascript
"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36"
```

### HTTP Headers
All HTTP requests will include:
```
User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36
```

## 🔄 Changing the User Agent

To change to a different user agent, edit line 98 in `main.js`:

### Examples

**Windows Chrome**:
```javascript
view.webContents.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36');
```

**Firefox**:
```javascript
view.webContents.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:109.0) Gecko/20100101 Firefox/119.0');
```

**Safari**:
```javascript
view.webContents.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15');
```

**Mobile (iPhone)**:
```javascript
view.webContents.setUserAgent('Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1');
```

## 📊 Comparison

### Before (Default Electron)
```
Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.6099.109 Electron/28.0.0 Safari/537.36
```
- Shows "Electron" in user agent
- Some sites may block or limit features
- Older Chrome version

### After (Custom)
```
Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36
```
- ✅ No "Electron" identifier
- ✅ Appears as standard Chrome
- ✅ Newer Chrome version (142)
- ✅ Better website compatibility

## ✨ Result

Your browser now identifies itself as Chrome 142 on macOS, providing the best compatibility and feature support across all websites!

---

**Status**: ✅ Complete
**User Agent**: Chrome 142.0.0.0 on macOS 10.15.7
**Applied To**: All browser tabs
