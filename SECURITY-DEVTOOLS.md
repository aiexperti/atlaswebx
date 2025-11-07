# DevTools Security - Disabled in Production

## ✅ What Was Changed:

### 1. **DevTools Disabled in Production**
```javascript
webPreferences: {
  devTools: process.argv.includes('--dev') // Only in dev mode
}
```

### 2. **Keyboard Shortcuts Blocked**
Blocked shortcuts in production:
- ❌ **F12** - DevTools
- ❌ **Ctrl+Shift+I** - DevTools (Windows/Linux)
- ❌ **Ctrl+Shift+J** - Console (Windows/Linux)
- ❌ **Ctrl+Shift+C** - Inspect Element (Windows/Linux)
- ❌ **Cmd+Option+I** - DevTools (macOS)

### 3. **Applied to All Windows**
- ✅ Main window
- ✅ Browser tabs (BrowserView)
- ✅ Settings window
- ✅ App Store window

## 🔒 Security Benefits:

### For API Keys:
- Users **cannot** open DevTools
- Users **cannot** inspect network requests
- Users **cannot** see JavaScript code execution
- Users **cannot** intercept API calls

### Limitations:
⚠️ **This is NOT 100% secure!**

Users can still:
1. Use external tools (Wireshark, Charles Proxy)
2. Decompile the app (asar files)
3. Modify the code if they have technical skills

## 🛡️ Better Security Approach:

### Recommended: Backend Proxy

Instead of hiding the key, use a backend server:

```
User → Electron App → Your Backend → OpenAI API
                      (Key stored here)
```

**Why this is better:**
- ✅ API key never in the app
- ✅ You control usage limits
- ✅ Can add authentication
- ✅ Monitor and log requests
- ✅ Impossible to extract the key

## 🧪 Testing:

### Development Mode (DevTools Enabled):
```bash
npm run dev
# or
electron . --dev
```

### Production Mode (DevTools Disabled):
```bash
npm start
# or
electron .
```

### Test Keyboard Shortcuts:
In production mode, try:
- Press **F12** → Nothing happens ✅
- Press **Ctrl+Shift+I** → Nothing happens ✅
- Right-click → "Inspect" option missing ✅

## 📦 Building for Distribution:

When you build with electron-builder:
```bash
npm run build:win
```

The built `.exe` will have DevTools disabled by default (no `--dev` flag).

## 🔐 Additional Security Measures:

### 1. **Obfuscate Code** (Optional)
Use JavaScript obfuscation:
```bash
npm install --save-dev javascript-obfuscator
```

### 2. **Encrypt asar Archive**
```json
{
  "build": {
    "asar": true,
    "asarUnpack": ["**/*.node"]
  }
}
```

### 3. **Use Environment Variables**
Never hardcode API keys:
```javascript
const apiKey = process.env.OPENAI_API_KEY;
```

### 4. **Backend Proxy** (Best)
See `BACKEND-PROXY-EXAMPLE.md` for implementation.

## 🎯 Current Status:

✅ DevTools disabled in production
✅ Keyboard shortcuts blocked
✅ Right-click inspect disabled
✅ Works in all windows

⚠️ **Remember**: This makes it harder but not impossible to extract secrets. Use a backend proxy for real security!

---

**For development**: Use `npm run dev` to enable DevTools
**For production**: Use `npm start` or build the app
