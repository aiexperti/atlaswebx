# 🧹 Cleanup Old Settings - Remove Advanced Mode

## Problem

The old `advancedMode` setting in localStorage is still triggering the AI Engine instead of using the new router system.

## What Needs Cleanup

### Old Settings Structure
```javascript
{
  "ai-settings": {
    "openaiKey": "sk-...",
    "advancedMode": true,  // ❌ This is causing the issue
    "aiEnhance": true      // ❌ Also removed
  }
}
```

### New Settings Structure
```javascript
{
  "ai-settings": {
    "openaiKey": "sk-..."  // ✅ Only API key needed
  }
}
```

## How to Clean Up

### Option 1: Manual Cleanup (Quick)

Open DevTools Console and run:
```javascript
// Get current settings
const settings = JSON.parse(localStorage.getItem('ai-settings') || '{}');

// Remove old properties
delete settings.advancedMode;
delete settings.aiEnhance;

// Save cleaned settings
localStorage.setItem('ai-settings', JSON.stringify(settings));

console.log('✅ Settings cleaned:', settings);

// Reload page
location.reload();
```

### Option 2: Add Cleanup Script to renderer.js

Add this at the top of renderer.js:
```javascript
// Clean up old settings on startup
function cleanupOldSettings() {
    try {
        const settings = JSON.parse(localStorage.getItem('ai-settings') || '{}');
        
        if (settings.advancedMode !== undefined || settings.aiEnhance !== undefined) {
            console.log('🧹 Cleaning up old settings...');
            
            // Keep only valid settings
            const cleanSettings = {
                openaiKey: settings.openaiKey
            };
            
            localStorage.setItem('ai-settings', JSON.stringify(cleanSettings));
            console.log('✅ Old settings removed');
        }
    } catch (e) {
        console.error('Failed to cleanup settings:', e);
    }
}

// Run cleanup on load
cleanupOldSettings();
```

### Option 3: Clear All Settings (Nuclear Option)

```javascript
// Clear everything and start fresh
localStorage.removeItem('ai-settings');
console.log('🗑️ All settings cleared');

// You'll need to re-enter your API key
```

## Why This Happened

The old code checked for `advancedMode` in localStorage:
```javascript
// OLD CODE (removed)
const settings = JSON.parse(localStorage.getItem('ai-settings') || '{}');
advancedModeEnabled = !!settings.advancedMode;

if (advancedModeEnabled) {
    // Use AI Engine (old system)
}
```

This setting persisted even after we removed the UI buttons.

## What Was Fixed

### ai-controller.js
**Before:**
```javascript
// Check if Advanced Mode is enabled
let advancedModeEnabled = false;
try {
    const settings = JSON.parse(localStorage.getItem('ai-settings') || '{}');
    advancedModeEnabled = !!settings.advancedMode;
} catch {}

// Route to AI Engine if Advanced Mode enabled
if (advancedModeEnabled) {
    console.log('🎨 [AI ENGINE] Processing...');
    return await this.processAdvancedMessage(message, currentTab);
}
```

**After:**
```javascript
// Always use standard mode - router handles complexity routing
console.log('💬 [STANDARD MODE] Processing message');
return await this.processStandardMessage(message, currentTab);
```

## Expected Behavior After Cleanup

### Before Cleanup
```
User: "remove ads"
  ↓
ai-controller checks advancedMode: true
  ↓
Routes to AI Engine
  ↓
❌ Complex analysis (wrong!)
```

### After Cleanup
```
User: "remove ads"
  ↓
ai-controller: Standard mode
  ↓
Router analyzes with GPT-4o
  ↓
Routes to Standard AI
  ↓
✅ Simple hide action (correct!)
```

## Verification

After cleanup, check console logs:
```
✅ Should see: "💬 [STANDARD MODE] Processing message"
❌ Should NOT see: "🎨 [AI ENGINE] Processing with advanced design workflow"
```

## Quick Test

1. **Clean settings:**
   ```javascript
   localStorage.removeItem('ai-settings');
   location.reload();
   ```

2. **Re-enter API key** in settings

3. **Test request:**
   ```
   "remove ads"
   ```

4. **Check console:**
   - Should see: `💬 [STANDARD MODE]`
   - Should NOT see: `🎨 [AI ENGINE]`

## Files Modified

- **ai-controller.js** - Removed advancedMode check
- **CLEANUP-OLD-SETTINGS.md** - This guide

## Summary

**Problem:** Old `advancedMode` setting in localStorage was triggering AI Engine

**Solution:** 
1. Remove advancedMode check from ai-controller.js ✅
2. Clean up localStorage settings
3. Router now handles all routing

**Result:** Requests go through proper routing system

---

**Status:** Code fixed, settings cleanup needed  
**Action Required:** Clear old localStorage settings  
**Impact:** Proper routing will work after cleanup
