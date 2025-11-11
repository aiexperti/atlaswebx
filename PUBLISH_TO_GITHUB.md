# Publish AtlaswebX to GitHub

## 🚀 Quick Publish Guide

Follow these steps to publish your project to GitHub.

## 📋 Prerequisites

1. **GitHub Account**: Make sure you have a GitHub account
2. **Git Installed**: Git is already set up in your project
3. **GitHub CLI (Optional)**: For easier repository creation

## 🔧 Step-by-Step Instructions

### Step 1: Create a New GitHub Repository

#### Option A: Using GitHub Website
1. Go to https://github.com/new
2. Repository name: `atlaswebx` (or your preferred name)
3. Description: `AtlaswebX - AI-Powered Web Browser built with Electron`
4. Choose **Public** or **Private**
5. **DO NOT** initialize with README, .gitignore, or license (we already have these)
6. Click **Create repository**

#### Option B: Using GitHub CLI
```bash
gh repo create atlaswebx --public --description "AtlaswebX - AI-Powered Web Browser built with Electron"
```

### Step 2: Prepare Your Local Repository

Run these commands in your terminal:

```bash
# Navigate to project directory
cd /Users/aymanelakhal/Documents/lenoir

# Add all changes
git add .

# Commit all changes
git commit -m "Initial commit: AtlaswebX Browser with AI features

- Complete browser with tabs and navigation
- AI Assistant powered by GPT-4o-mini
- Custom wallpapers from folder
- Auto-save settings
- Context menu with essential actions
- Custom user agent
- Comprehensive documentation"

# Check current remote
git remote -v
```

### Step 3: Change Remote from Bitbucket to GitHub

```bash
# Remove old Bitbucket remote
git remote remove origin

# Add new GitHub remote (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/atlaswebx.git

# Verify new remote
git remote -v
```

### Step 4: Push to GitHub

```bash
# Push to GitHub (first time)
git push -u origin v4

# Or if you want to push to main branch
git branch -M main
git push -u origin main
```

## 📝 Alternative: Keep Both Remotes

If you want to keep both Bitbucket and GitHub:

```bash
# Rename current remote to bitbucket
git remote rename origin bitbucket

# Add GitHub as new remote
git remote add github https://github.com/YOUR_USERNAME/atlaswebx.git

# Push to both
git push bitbucket v4
git push github v4
```

## 🎯 Quick Script

Save this as `publish-to-github.sh`:

```bash
#!/bin/bash

echo "🚀 Publishing AtlaswebX to GitHub..."

# Check if GitHub username is provided
if [ -z "$1" ]; then
    echo "❌ Error: Please provide your GitHub username"
    echo "Usage: ./publish-to-github.sh YOUR_GITHUB_USERNAME"
    exit 1
fi

GITHUB_USERNAME=$1
REPO_NAME="atlaswebx"

echo "📦 Adding all changes..."
git add .

echo "💾 Committing changes..."
git commit -m "Initial commit: AtlaswebX Browser with AI features

- Complete browser with tabs and navigation
- AI Assistant powered by GPT-4o-mini
- Custom wallpapers from folder
- Auto-save settings
- Context menu with essential actions
- Custom user agent
- Comprehensive documentation"

echo "🔗 Updating remote..."
git remote remove origin 2>/dev/null || true
git remote add origin https://github.com/$GITHUB_USERNAME/$REPO_NAME.git

echo "⬆️ Pushing to GitHub..."
git push -u origin v4

echo "✅ Done! Your project is now on GitHub:"
echo "   https://github.com/$GITHUB_USERNAME/$REPO_NAME"
```

Make it executable and run:
```bash
chmod +x publish-to-github.sh
./publish-to-github.sh YOUR_GITHUB_USERNAME
```

## 📚 What Will Be Published

### Included Files
✅ All source code (`.js`, `.css`, `.html`)
✅ Documentation (`.md` files)
✅ Configuration files (`package.json`, `.env.example`)
✅ Wallpaper images
✅ GitHub Actions workflows (`.github/`)
✅ License and contributing guidelines

### Excluded Files (via .gitignore)
❌ `node_modules/` - Dependencies
❌ `.env` - Environment variables
❌ `git-config.json` - Credentials
❌ Build outputs (`dist/`, `build/`)
❌ OS files (`.DS_Store`)
❌ IDE files (`.vscode/`, `.idea/`)

## 🔐 Security Checklist

Before publishing, verify:

- [ ] No API keys in code
- [ ] No passwords or tokens
- [ ] `.env` file is in `.gitignore`
- [ ] `git-config.json` is in `.gitignore`
- [ ] No personal information
- [ ] No hardcoded credentials

## 📖 After Publishing

### 1. Update Repository Settings
- Add topics/tags: `electron`, `browser`, `ai`, `gpt-4`, `javascript`
- Add a description
- Add a website URL (if you have one)
- Enable Issues and Discussions

### 2. Add Repository Badges
Add to your README.md:
```markdown
![License](https://img.shields.io/github/license/YOUR_USERNAME/atlaswebx)
![Stars](https://img.shields.io/github/stars/YOUR_USERNAME/atlaswebx)
![Forks](https://img.shields.io/github/forks/YOUR_USERNAME/atlaswebx)
![Issues](https://img.shields.io/github/issues/YOUR_USERNAME/atlaswebx)
```

### 3. Create a Release
```bash
git tag -a v1.0.0 -m "First release of AtlaswebX"
git push origin v1.0.0
```

Then create a release on GitHub with release notes.

### 4. Set Up GitHub Pages (Optional)
If you want a project website:
1. Go to Settings → Pages
2. Source: Deploy from branch
3. Branch: main (or v4) → /docs folder
4. Save

## 🌟 Promote Your Project

### Add to GitHub Topics
- electron
- browser
- web-browser
- ai-assistant
- gpt-4
- javascript
- nodejs
- chromium

### Share On
- Reddit: r/electronjs, r/javascript
- Twitter/X: #Electron #JavaScript #AI
- Hacker News
- Product Hunt
- Dev.to

## 📊 Repository Structure

Your GitHub repo will look like:
```
atlaswebx/
├── .github/              # GitHub Actions workflows
├── ai-assistant/         # AI features
├── ai-services/          # AI service providers
├── settings/             # Settings page
├── wallpaper/           # Wallpaper images
├── *.js                 # Main application files
├── *.css                # Stylesheets
├── *.html               # HTML pages
├── *.md                 # Documentation
├── package.json         # Dependencies
├── LICENSE              # MIT License
└── README.md            # Main documentation
```

## 🔄 Future Updates

To push updates:
```bash
git add .
git commit -m "Description of changes"
git push origin v4
```

## 🆘 Troubleshooting

### Error: Remote already exists
```bash
git remote remove origin
git remote add origin https://github.com/YOUR_USERNAME/atlaswebx.git
```

### Error: Permission denied
```bash
# Use SSH instead
git remote set-url origin git@github.com:YOUR_USERNAME/atlaswebx.git
```

### Error: Large files
If you have files over 100MB:
```bash
# Use Git LFS
git lfs install
git lfs track "*.jpg"
git add .gitattributes
```

## ✨ Success!

Once published, your repository will be at:
```
https://github.com/YOUR_USERNAME/atlaswebx
```

Share it with the world! 🎉

---

**Need Help?**
- GitHub Docs: https://docs.github.com
- Git Basics: https://git-scm.com/book/en/v2
- Electron Apps: https://www.electronjs.org/apps
