# V1 Backup - Lenoir Browser

**Created:** October 26, 2025

## Backed Up Files

This folder contains a working backup of the Lenoir Browser core files.

### Files Included:

#### Core Files:

1. **index.html** (25KB)
   - Main application HTML structure
   - Home screen layout
   - Browser view container

2. **main.js** (8KB)
   - Electron main process
   - Window management
   - IPC handlers
   - App Store and Settings window creation

3. **app-manager.js** (17KB)
   - App grid management
   - App installation logic
   - Page management (15 apps per page)
   - Event handlers for app clicks

4. **renderer.js** (25KB)
   - Main renderer process
   - Tab management
   - Browser view controls
   - IPC communication

5. **translations.js** (20KB)
   - Multi-language support
   - Translation strings
   - Language switching logic

6. **styles.css** (22KB)
   - All application styles
   - Home screen grid
   - Browser interface
   - Animations and effects

#### App Store Folder:

7. **appstore/appstore.html** (12KB)
   - App Store interface
   - Category buttons
   - Search bar
   - App grid layout

8. **appstore/appstore.js** (22KB)
   - App Store logic
   - iTunes API integration
   - Search functionality
   - App details modal
   - Installation handler

9. **appstore/appstore.css** (11KB)
   - App Store styling
   - Card layouts
   - Modal styles
   - Responsive design

10. **appstore/README.md**
    - App Store documentation

#### Settings Folder:

11. **settings/settings.html** (16KB)
    - Settings interface
    - Preferences panels
    - Language selector

12. **settings/settings.js** (8KB)
    - Settings logic
    - Preference management
    - Language switching

13. **settings/settings.css** (7KB)
    - Settings window styling
    - Panel layouts

## Features in This Version

### Working Features:
- ✅ Home screen with app grid (5×3 layout)
- ✅ App installation from App Store
- ✅ Automatic page creation (15 apps max per page)
- ✅ Long app name truncation with ellipsis
- ✅ Clickable apps that open URLs
- ✅ Browser tabs and navigation
- ✅ Settings window
- ✅ App Store with categories
- ✅ Search functionality
- ✅ Multi-language support

### App Store:
- Top Free Apps (RSS feed, no ratings)
- Category search (Productivity, Social, Music, etc.)
- iTunes Search API integration
- App details modal with full information
- Install to home screen

### Window Controls:
- macOS controls (left): Close, Minimize, Maximize
- Windows controls (right): Minimize, Maximize, Close
- Centered window titles

## How to Restore

If you need to restore these files:

```bash
# From the lenoir directory

# Restore core files
cp V1/index.html .
cp V1/main.js .
cp V1/app-manager.js .
cp V1/renderer.js .
cp V1/translations.js .
cp V1/styles.css .

# Restore folders
cp -r V1/appstore .
cp -r V1/settings .
```

Or restore individual files/folders as needed:

```bash
# Restore just App Store
cp -r V1/appstore .

# Restore just one file
cp V1/main.js .
```

## Notes

- This backup was created after implementing the App Store with category-based search
- All files are fully functional and tested
- Keep this folder as a safe restore point
