# GitHub Actions - Automated Builds

## ✅ Setup Complete!

Your repository is now configured to automatically build Electron apps on GitHub Actions for Windows, macOS, and Linux!

## 🔧 What Was Configured

### 1. GitHub Actions Workflow
**File**: `.github/workflows/build.yml`

**Triggers**:
- Push to `v4` or `main` branch
- Pull requests to `v4` or `main`
- Tags starting with `v` (e.g., `v1.0.0`)

**Builds**:
- ✅ **Windows**: `.exe` installer and portable
- ✅ **macOS**: `.dmg` and `.zip` (Intel + Apple Silicon)
- ✅ **Linux**: `.AppImage`, `.deb`, `.rpm`

### 2. Package.json Scripts
Added build commands:
```json
"build": "electron-builder"
"build:win": "electron-builder --win"
"build:mac": "electron-builder --mac"
"build:linux": "electron-builder --linux"
"dist": "electron-builder"
"dist:win": "electron-builder --win"
"dist:mac": "electron-builder --mac"
"dist:linux": "electron-builder --linux"
```

### 3. Build Configurations
- **Windows**: NSIS installer + Portable
- **macOS**: DMG + ZIP (x64 + arm64)
- **Linux**: AppImage + DEB + RPM

## 🚀 How It Works

### Automatic Builds on Push

Every time you push to `v4` or `main`:
1. GitHub Actions starts
2. Builds for all 3 platforms in parallel
3. Uploads artifacts (available for 7 days)
4. You can download builds from Actions tab

### Automatic Releases on Tag

When you create a tag (e.g., `v1.0.0`):
1. Builds all platforms
2. Creates a GitHub Release automatically
3. Uploads all installers to the release
4. Generates release notes

## 📝 Usage

### Method 1: Push Changes (Testing)

```bash
# Make changes
git add .
git commit -m "Update feature"
git push origin v4

# Check builds at:
# https://github.com/aiexperti/atlaswebx/actions
```

### Method 2: Create Release (Production)

```bash
# Create and push tag
git tag -a v1.0.1 -m "Release v1.0.1"
git push origin v1.0.1

# GitHub will:
# 1. Build all platforms
# 2. Create release automatically
# 3. Upload all installers
```

## 📦 What Gets Built

### Windows
- `AtlaswebX-Setup-1.0.0.exe` - NSIS Installer
- `AtlaswebX-1.0.0-win.exe` - Portable version

### macOS
- `AtlaswebX-1.0.0-mac-x64.dmg` - Intel Mac
- `AtlaswebX-1.0.0-mac-arm64.dmg` - Apple Silicon
- `AtlaswebX-1.0.0-mac-x64.zip` - Intel Mac (zip)
- `AtlaswebX-1.0.0-mac-arm64.zip` - Apple Silicon (zip)

### Linux
- `AtlaswebX-1.0.0-x86_64.AppImage` - Universal Linux
- `atlaswebx_1.0.0_amd64.deb` - Debian/Ubuntu
- `atlaswebx-1.0.0.x86_64.rpm` - Fedora/RedHat

## 🔍 Monitoring Builds

### View Build Status

1. Go to: https://github.com/aiexperti/atlaswebx/actions
2. Click on the latest workflow run
3. See build progress for each platform
4. Download artifacts when complete

### Build Badge

Add to your README.md:
```markdown
![Build Status](https://github.com/aiexperti/atlaswebx/workflows/Build%20Electron%20App/badge.svg)
```

## 📥 Downloading Builds

### From Actions (Testing)

1. Go to Actions tab
2. Click on a workflow run
3. Scroll to "Artifacts" section
4. Download:
   - `windows-build`
   - `macos-build`
   - `linux-build`

### From Releases (Production)

1. Go to: https://github.com/aiexperti/atlaswebx/releases
2. Click on a release (e.g., v1.0.0)
3. Download installers under "Assets"

## ⚙️ Configuration

### Workflow File Location
`.github/workflows/build.yml`

### Key Settings

**Node Version**: 20.x
```yaml
node-version: '20.x'
```

**Build Command**:
```yaml
run: npm run dist -- --win
```

**Artifact Retention**: 7 days
```yaml
retention-days: 7
```

### Customization

**Change Node Version**:
```yaml
node-version: '18.x'  # or '16.x', '20.x'
```

**Change Branches**:
```yaml
branches: [ v4, main, develop ]
```

**Change Retention**:
```yaml
retention-days: 30  # Keep artifacts for 30 days
```

## 🔐 Secrets

GitHub Actions uses `GITHUB_TOKEN` automatically (no setup needed).

For code signing (optional):
1. Go to Settings → Secrets → Actions
2. Add secrets:
   - `CSC_LINK` - Certificate file (base64)
   - `CSC_KEY_PASSWORD` - Certificate password
   - `APPLE_ID` - Apple ID (for macOS notarization)
   - `APPLE_ID_PASSWORD` - App-specific password

## 🐛 Troubleshooting

### Build Fails

**Check logs**:
1. Go to Actions tab
2. Click failed workflow
3. Click on failed job
4. Read error messages

**Common issues**:
- Missing dependencies: Run `npm ci` locally
- Build script error: Test `npm run dist` locally
- Icon missing: Ensure `icon.png` exists

### Artifacts Not Uploaded

**Check paths**:
```yaml
path: |
  dist/*.exe  # Make sure this matches your output
```

**Verify dist folder**:
- Build locally: `npm run dist`
- Check `dist/` folder contents
- Update paths in workflow if needed

### Release Not Created

**Check tag format**:
- Must start with `v`: `v1.0.0` ✅
- Wrong format: `1.0.0` ❌

**Check permissions**:
- Workflow needs write access to releases
- Go to Settings → Actions → General
- Enable "Read and write permissions"

## 📊 Build Times

Approximate build times:
- **Windows**: 5-10 minutes
- **macOS**: 10-15 minutes
- **Linux**: 5-10 minutes
- **Total**: ~15-20 minutes (parallel)

## 🎯 Best Practices

### 1. Test Locally First
```bash
npm run dist:win   # Test Windows build
npm run dist:mac   # Test macOS build
npm run dist:linux # Test Linux build
```

### 2. Use Semantic Versioning
- `v1.0.0` - Major release
- `v1.1.0` - Minor update
- `v1.0.1` - Patch/bugfix

### 3. Create Pre-releases
```bash
git tag -a v1.0.0-beta.1 -m "Beta release"
git push origin v1.0.0-beta.1
```

Then mark as pre-release on GitHub.

### 4. Keep Artifacts Clean
- Artifacts auto-delete after 7 days
- Only releases are permanent
- Don't rely on artifacts for distribution

## 🔄 Workflow Steps

### Build Job
1. ✅ Checkout code
2. ✅ Setup Node.js 20.x
3. ✅ Install dependencies (`npm ci`)
4. ✅ Build for platform
5. ✅ Upload artifacts

### Release Job (on tag)
1. ✅ Download all artifacts
2. ✅ Create GitHub Release
3. ✅ Upload all installers
4. ✅ Generate release notes

## ✨ Benefits

### Automated
- ✅ No manual building
- ✅ Consistent builds
- ✅ All platforms at once

### Reliable
- ✅ Clean environment
- ✅ Same every time
- ✅ No local issues

### Fast
- ✅ Parallel builds
- ✅ Cached dependencies
- ✅ 15-20 minutes total

### Professional
- ✅ Automatic releases
- ✅ All platforms supported
- ✅ Easy distribution

## 🎊 You're All Set!

Your repository now has automated builds! Every push and tag will trigger builds for all platforms.

### Next Steps

1. **Commit changes**:
```bash
git add .github/workflows/build.yml package.json
git commit -m "Add GitHub Actions automated builds"
git push origin v4
```

2. **Watch first build**:
   - Go to Actions tab
   - See builds in progress
   - Download artifacts when done

3. **Create release**:
```bash
git tag -a v1.0.1 -m "Release v1.0.1"
git push origin v1.0.1
```

4. **Check release**:
   - Go to Releases tab
   - See automatic release
   - Download installers

---

**Workflow**: `.github/workflows/build.yml`  
**Status**: ✅ Ready  
**Platforms**: Windows, macOS, Linux  
**Automation**: Full
