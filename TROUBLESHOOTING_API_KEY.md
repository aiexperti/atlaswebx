# Troubleshooting: API Key Not Working

## Issue
Getting "Please set your OpenAI API key in settings first" even after setting the key in Settings.

## ✅ Solution Applied

The issue has been fixed with the following changes:

### 1. **Auto-reload API Key** (`ai-v2-chat.js`)
- The AI chat now reloads the API key from localStorage every time you send a message
- This ensures that if you just set the key in Settings, it will be picked up immediately

### 2. **Enhanced Debugging**
- Added detailed console logging to help diagnose API key loading issues
- You can now see exactly what's happening when the key is loaded

## 🔍 How to Verify the Fix

### Step 1: Open Developer Console
Press `F12` or `Cmd+Option+I` (Mac) to open DevTools

### Step 2: Set Your API Key
1. Click Settings (gear icon)
2. Go to AI Settings tab
3. Enter your OpenAI API key (starts with `sk-`)
4. Click **Save**
5. Close Settings

### Step 3: Check Console Logs
Look for these messages in the console:
```
💾 Saving AI settings to localStorage: { hasOpenAI: true, openaiKeyLength: 51, ... }
✅ AI settings saved to localStorage
🔑 AI keys updated from settings: { hasOpenAI: true, ... }
🔄 AI keys updated, reloading...
✅ AI Router reinitialized with new key
```

### Step 4: Try Sending a Message
1. Open AI Assistant (chat icon)
2. Type a message
3. Press Enter

You should see:
```
🔍 Loading API key from localStorage: { hasAiSettings: true, hasOpenAIKey: true, keyLength: 51 }
✅ OpenAI API key loaded from settings (length: 51)
✅ AI Router initialized with GPT-4o-mini
```

## 🐛 If It Still Doesn't Work

### Check 1: Verify localStorage
Open DevTools Console and run:
```javascript
JSON.parse(localStorage.getItem('ai-settings'))
```

You should see:
```javascript
{
  openaiKey: "sk-...",
  anthropicKey: "",
  googleKey: "",
  webInteraction: false,
  autoRules: false
}
```

### Check 2: Verify Key Format
Your OpenAI API key should:
- Start with `sk-`
- Be at least 40 characters long
- Not have any spaces or line breaks

### Check 3: Clear Cache and Reload
If the key is saved but not loading:
1. Press `Cmd+Shift+R` (Mac) or `Ctrl+Shift+R` (Windows) for hard reload
2. Or close and restart the app

### Check 4: Re-enter the Key
Sometimes copy-paste can add hidden characters:
1. Go to Settings → AI Settings
2. Clear the API key field completely
3. Manually type or paste your key again
4. Make sure there are no spaces before or after
5. Click Save

## 🔧 Manual Fix (If Needed)

If the automatic reload doesn't work, you can manually reload:

1. Open DevTools Console
2. Run this command:
```javascript
if (window.aiV2Chat) {
    window.aiV2Chat.loadAPIKey();
    console.log('API key reloaded manually');
}
```

## 📋 Common Issues

### Issue: "AIV2Router is not defined"
**Solution**: This means the scripts loaded in the wrong order. Restart the app.

### Issue: Key saves but doesn't load
**Solution**: 
1. Check if you're using the correct localStorage key: `ai-settings`
2. The old key was `lenoir-settings` - if you have old data, it won't be read
3. Re-enter your API key in the new Settings UI

### Issue: Settings window doesn't save
**Solution**:
1. Make sure you click the **Save** button
2. Check console for any error messages
3. Try closing and reopening Settings

## 🎯 Expected Behavior

After the fix:
1. ✅ Set API key in Settings → Save
2. ✅ Close Settings
3. ✅ Open AI Assistant
4. ✅ Send a message
5. ✅ API key is automatically reloaded
6. ✅ Message is sent to OpenAI

## 🔍 Debug Commands

Run these in the DevTools Console to check your setup:

```javascript
// Check if AI chat is initialized
console.log('AI Chat:', window.aiV2Chat);

// Check API key
const settings = JSON.parse(localStorage.getItem('ai-settings') || '{}');
console.log('Has API Key:', !!settings.openaiKey);
console.log('Key Length:', settings.openaiKey?.length || 0);

// Check router
console.log('Router:', window.aiV2Chat?.router);

// Manually reload
if (window.aiV2Chat) {
    window.aiV2Chat.loadAPIKey();
}
```

## 📝 What Changed

### Before
- API key was loaded once on page load
- If you set the key after the page loaded, it wouldn't be picked up
- You had to reload the entire app

### After
- API key is reloaded every time you send a message
- IPC event listener updates the key when Settings are saved
- Better error messages with instructions
- Detailed console logging for debugging

## ✨ Result

The API key should now work immediately after setting it in Settings, without needing to reload the app!

---

**Last Updated**: November 11, 2024  
**Status**: ✅ Fixed
