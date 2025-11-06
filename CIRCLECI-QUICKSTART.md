# CircleCI Quick Start - Build Windows Version

## 🎯 Goal
Automatically build Windows executables for Atlasweb using CircleCI pipeline.

## ✅ What's Been Set Up

1. **`.circleci/config.yml`** - Pipeline configuration
2. **`package.json`** - Build scripts added
3. **Build targets**: NSIS installer + Portable .exe

## 🚀 Quick Start (3 Steps)

### Step 1: Push to Bitbucket
```bash
git add .
git commit -m "Add CircleCI pipeline for Windows builds"
git push
```

### Step 2: Connect CircleCI
1. Go to: **https://circleci.com**
2. Click **"Sign Up with Bitbucket"**
3. Authorize CircleCI
4. In CircleCI dashboard:
   - Click **"Projects"**
   - Find **`lenoir-openai/atlas2`**
   - Click **"Set Up Project"**
   - Click **"Start Building"**

### Step 3: Download Your Build
1. Wait for build to complete (~5-10 minutes)
2. Go to: **Artifacts** tab
3. Download:
   - `Atlasweb-Setup-1.0.0.exe` (installer)
   - `Atlasweb-1.0.0.exe` (portable)

## 📦 What You'll Get

### Windows Installer (NSIS)
- Full installation wizard
- Start menu shortcuts
- Uninstaller
- File: `Atlasweb-Setup-1.0.0.exe`

### Portable Version
- No installation needed
- Run from USB drive
- File: `Atlasweb-1.0.0.exe`

## 🔄 Automatic Builds

Every time you push to Bitbucket, CircleCI will:
1. ✅ Detect the push
2. ✅ Build Windows version
3. ✅ Create executables
4. ✅ Store as downloadable artifacts

## 💰 Free Tier

CircleCI Free Plan includes:
- **2,500 credits/week**
- **1 concurrent job**
- **Unlimited users**
- Perfect for this project!

## 📊 Monitor Builds

**Dashboard**: https://app.circleci.com/pipelines/bitbucket/lenoir-openai/atlas2

## 🛠️ Local Testing (Optional)

Test builds locally before pushing:

```bash
# Install dependencies
npm install

# Build Windows version (requires Windows or Wine)
npm run build:win
```

## 📝 Build Configuration

Located in `package.json`:
```json
"build": {
  "appId": "com.atlasweb.browser",
  "productName": "Atlasweb",
  "win": {
    "target": ["nsis", "portable"]
  }
}
```

## 🎓 Full Documentation

See **`CIRCLECI-SETUP.md`** for:
- Advanced configuration
- Code signing
- Multi-platform builds
- Troubleshooting

---

**Ready?** Run `./setup-circleci.sh` to get started! 🚀
