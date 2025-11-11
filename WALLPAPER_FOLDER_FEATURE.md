# Wallpaper Folder Feature

## ✅ Feature Implemented

Users can now choose wallpapers from the `/wallpaper` folder in Settings, with the first image set as the default wallpaper.

## 📁 Wallpaper Folder

**Location**: `/Users/aymanelakhal/Documents/lenoir/wallpaper/`

**Current Images** (6 wallpapers):
1. `pexels-arnie-chou-304906-1229042.jpg` (4.2 MB) - **DEFAULT**
2. `pexels-asadphoto-1456291.jpg` (6.3 MB)
3. `pexels-chevanon-325044.jpg` (421 KB)
4. `pexels-eberhardgross-691668.jpg` (1.9 MB)
5. `pexels-pixabay-50594.jpg` (1.5 MB)
6. `pexels-pok-rie-33563-2049422.jpg` (2.5 MB)

## 🎯 How It Works

### In Settings Page

1. **Auto-Discovery**: Settings page automatically scans the `/wallpaper` folder
2. **Dynamic Loading**: All images are loaded and displayed in the wallpaper grid
3. **Preview Thumbnails**: Each wallpaper shows a preview thumbnail
4. **Clean Names**: Filenames are cleaned up for display (removes extensions and replaces dashes/underscores with spaces)
5. **Default Selection**: First image is automatically selected as default for new users

### Wallpaper Grid Order

The wallpaper grid displays in this order:
1. **Gradient wallpapers** (built-in)
   - Purple Gradient
   - Blue Gradient
   - Sunset
   - Ocean
   - Forest
   - Dark
2. **Folder wallpapers** (from `/wallpaper` folder) ← NEW!
   - Dynamically loaded
   - Displayed with thumbnails
3. **Custom wallpaper** (user upload)
   - Always last

### On Home Screen

- Selected wallpaper is applied as the home screen background
- Covers entire screen with proper sizing
- Centered positioning

## 🔧 Technical Implementation

### Files Modified

#### 1. `settings/settings.js`

**Added: `loadWallpapersFromFolder()` function**
```javascript
async function loadWallpapersFromFolder() {
    const fs = require('fs');
    const path = require('path');
    const wallpaperDir = path.join(__dirname, '../wallpaper');
    
    // Read directory and filter image files
    const files = fs.readdirSync(wallpaperDir);
    const imageFiles = files.filter(file => {
        const ext = path.extname(file).toLowerCase();
        return ['.jpg', '.jpeg', '.png', '.webp', '.gif'].includes(ext);
    });
    
    // Create wallpaper options dynamically
    imageFiles.forEach((file, index) => {
        const wallpaperPath = path.join(wallpaperDir, file);
        const wallpaperId = `wallpaper-${index}`;
        const displayName = file.replace(/\.(jpg|jpeg|png|webp|gif)$/i, '').replace(/[-_]/g, ' ');
        
        // Create option element
        const option = document.createElement('div');
        option.className = 'wallpaper-option';
        option.setAttribute('data-wallpaper', wallpaperId);
        option.setAttribute('data-wallpaper-path', wallpaperPath);
        
        // Set first image as default
        if (index === 0 && !localStorage.getItem('atlaswebx-settings')) {
            option.classList.add('active');
        }
        
        option.innerHTML = `
            <div class="wallpaper-preview" style="background-image: url('file://${wallpaperPath}'); background-size: cover; background-position: center;"></div>
            <span>${displayName}</span>
        `;
        
        // Add click handler with auto-save
        option.addEventListener('click', () => {
            document.querySelectorAll('.wallpaper-option').forEach(opt => opt.classList.remove('active'));
            option.classList.add('active');
            autoSaveSettings();
        });
        
        wallpaperGrid.insertBefore(option, customOption);
    });
    
    return imageFiles.length > 0 ? 'wallpaper-0' : 'gradient-purple';
}
```

**Updated: `loadSettings()` function**
- Now async to wait for wallpapers to load
- Calls `loadWallpapersFromFolder()` first
- Uses returned default wallpaper if no setting exists

**Updated: `autoSaveSettings()` function**
- Saves `wallpaperId` (e.g., "wallpaper-0")
- Saves `wallpaperPath` (full file path)
- Both stored in localStorage

**Updated: Manual save button**
- Also includes wallpaper path in settings

#### 2. `renderer.js`

**Updated: `applySettings()` function**
```javascript
function applySettings(settings) {
    const homeBackground = document.querySelector('.home-background');
    
    if (settings.wallpaper === 'custom') {
        // Custom uploaded wallpaper
        const customImage = localStorage.getItem('custom-wallpaper');
        if (customImage) {
            homeBackground.style.background = `url(${customImage})`;
            homeBackground.style.backgroundSize = 'cover';
            homeBackground.style.backgroundPosition = 'center';
        }
    } else if (settings.wallpaperPath) {
        // Wallpaper from folder ← NEW!
        homeBackground.style.background = `url('file://${settings.wallpaperPath}')`;
        homeBackground.style.backgroundSize = 'cover';
        homeBackground.style.backgroundPosition = 'center';
    } else if (wallpapers[settings.wallpaper]) {
        // Built-in gradient wallpaper
        homeBackground.style.background = wallpapers[settings.wallpaper];
    }
}
```

## 📊 Data Structure

### localStorage: `atlaswebx-settings`
```json
{
  "siteName": "AtlaswebX",
  "homepage": "https://www.google.com",
  "wallpaper": "wallpaper-0",
  "wallpaperPath": "/Users/aymanelakhal/Documents/lenoir/wallpaper/pexels-arnie-chou-304906-1229042.jpg",
  "searchEngine": "google",
  "aiModel": "gpt-4",
  "language": "en"
}
```

### Wallpaper ID Format
- Built-in gradients: `gradient-purple`, `gradient-blue`, etc.
- Folder wallpapers: `wallpaper-0`, `wallpaper-1`, `wallpaper-2`, etc.
- Custom upload: `custom`

## 🎨 User Experience

### For New Users
1. Open app for the first time
2. Home screen shows **first wallpaper from folder** (pexels-arnie-chou-304906-1229042.jpg)
3. Can change in Settings → Appearance → Wallpaper

### For Existing Users
1. Their selected wallpaper is preserved
2. New folder wallpapers appear in Settings
3. Can switch to any wallpaper

### Changing Wallpaper
1. Open Settings
2. Go to Appearance section
3. See all wallpapers (gradients + folder images + custom)
4. Click any wallpaper
5. ✅ Auto-saved immediately
6. Applied to home screen

## 🔄 Adding New Wallpapers

To add more wallpapers:
1. Copy image files to `/wallpaper` folder
2. Supported formats: `.jpg`, `.jpeg`, `.png`, `.webp`, `.gif`
3. Restart app or reload Settings
4. New wallpapers appear automatically

## ✨ Features

- ✅ **Auto-Discovery**: Scans folder automatically
- ✅ **Default Wallpaper**: First image is default
- ✅ **Dynamic Loading**: No hardcoding needed
- ✅ **Preview Thumbnails**: See before selecting
- ✅ **Auto-Save**: Changes save immediately
- ✅ **Clean Names**: Readable display names
- ✅ **Full Path Storage**: Reliable file access
- ✅ **Backwards Compatible**: Gradients still work

## 🎯 Benefits

1. **Easy Management**: Just add/remove files from folder
2. **No Code Changes**: Add wallpapers without editing code
3. **User Choice**: More wallpaper options
4. **Professional Look**: High-quality images
5. **Default Set**: New users see nice wallpaper immediately

## 📝 Example Workflow

### Adding a New Wallpaper
```bash
# 1. Copy image to wallpaper folder
cp ~/Downloads/my-wallpaper.jpg /Users/aymanelakhal/Documents/lenoir/wallpaper/

# 2. Restart app or reload Settings
# 3. New wallpaper appears in Settings automatically
```

### Setting as Default
The first wallpaper in the folder (alphabetically) is the default. To change:
1. Rename files to control order (e.g., `01-default.jpg`, `02-other.jpg`)
2. Or modify code to use a specific file as default

## 🔍 Technical Details

### File Loading
- Uses Node.js `fs.readdirSync()` to read folder
- Filters by extension: `.jpg`, `.jpeg`, `.png`, `.webp`, `.gif`
- Creates DOM elements dynamically

### Path Handling
- Stores full absolute path in settings
- Uses `file://` protocol for local files
- Works with Electron's file access

### Performance
- Loads on Settings page open (not on app startup)
- Thumbnails use CSS background-image
- No performance impact on main app

## ✅ Result

Users can now choose from 6 beautiful wallpapers in the `/wallpaper` folder, with the first one set as default for new users. The system is fully dynamic and easy to extend!

---

**Status**: ✅ Complete
**Default Wallpaper**: pexels-arnie-chou-304906-1229042.jpg
**Total Wallpapers**: 6 from folder + 6 gradients + 1 custom = 13 options
