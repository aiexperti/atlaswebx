# Build Error Fix - Icon & Code Signing Issues

## Problems Fixed:

### 1. **Icon Conversion Error**
**Error**: `app-builder.exe process failed ERR_ELECTRON_BUILDER_CANNOT_EXECUTE`

**Cause**: electron-builder trying to convert icons that don't exist

**Fix**: Removed icon requirement from `package.json`

### 2. **Code Signing Error**
**Error**: Build trying to sign the executable without certificates

**Fix**: Disabled code signing with:
```json
"win": {
  "sign": false,
  "verifyUpdateCodeSignature": false
}
```

### 3. **Only Getting win-unpacked Folder**
**Problem**: Artifacts only contain unpacked files, not installer

**Fix**: Explicitly specified build targets:
```json
"win": {
  "target": [
    {
      "target": "nsis",
      "arch": ["x64"]
    },
    {
      "target": "portable",
      "arch": ["x64"]
    }
  ]
}
```

## What You'll Get Now:

After the build completes, you'll find in `dist/`:

1. **`Atlasweb Setup 1.0.0.exe`** - NSIS Installer
   - Full installation wizard
   - Creates desktop shortcut
   - Adds to Start Menu
   - Includes uninstaller

2. **`Atlasweb 1.0.0.exe`** - Portable Version
   - Single executable
   - No installation needed
   - Run from anywhere

3. **`win-unpacked/`** - Unpacked files (for debugging)
   - Raw application files
   - Not for distribution

## Build Output Structure:

```
dist/
├── Atlasweb Setup 1.0.0.exe       ← NSIS Installer (distribute this)
├── Atlasweb 1.0.0.exe              ← Portable (distribute this)
├── win-unpacked/                   ← Unpacked files (ignore)
│   ├── Atlasweb.exe
│   ├── resources/
│   └── ...
└── builder-debug.yml               ← Build info
```

## Testing Locally:

Before pushing to CircleCI, test locally:

```bash
# Install dependencies
npm install

# Build Windows version
npm run build:win

# Check output
ls -la dist/
```

## CircleCI Artifacts:

After the build, download from CircleCI:

1. Go to: https://app.circleci.com/pipelines/bitbucket/lenoir-openai/atlas2
2. Click on latest build
3. Click **"Artifacts"** tab
4. Download:
   - `windows-builds/Atlasweb Setup 1.0.0.exe`
   - `windows-builds/Atlasweb 1.0.0.exe`

## Optional: Add Icon Later

If you want to add an icon:

1. Create `icons/icon.ico` (256x256 or 512x512)
2. Update `package.json`:

```json
"win": {
  "icon": "icons/icon.ico",
  "target": [...]
}
```

You can use online tools to create .ico files:
- https://www.icoconverter.com/
- https://convertio.co/png-ico/

## Optional: Code Signing

For production releases, you can add code signing:

1. Get a code signing certificate (costs ~$100-500/year)
2. Add to CircleCI environment variables:
   - `CSC_LINK` - Base64 encoded certificate
   - `CSC_KEY_PASSWORD` - Certificate password

3. Update `package.json`:
```json
"win": {
  "sign": true,
  "certificateFile": "${CSC_LINK}",
  "certificatePassword": "${CSC_KEY_PASSWORD}"
}
```

**Note**: Code signing prevents Windows SmartScreen warnings but is optional for testing.

## Commit These Changes:

```bash
git add package.json .circleci/config.yml BUILD-FIX.md
git commit -m "Fix electron-builder: disable signing and remove icon requirement"
git push
```

## Expected Build Time:

- **Node.js installation**: ~2 minutes
- **Dependencies install**: ~3 minutes
- **Building executables**: ~2-3 minutes
- **Total**: ~7-8 minutes

## Success Indicators:

Look for these in the build log:

```
✓ Building NSIS installer
✓ Building portable executable
✓ Build completed successfully
```

---

**The fixes are ready!** Commit and push to try again. 🚀
