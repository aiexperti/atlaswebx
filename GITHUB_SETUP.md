# 📦 GitHub Repository Setup Guide

This guide will help you publish AtlaswebX to GitHub as an open source project.

## Step 1: Create a New GitHub Repository

1. Go to [github.com/new](https://github.com/new)
2. Fill in the repository details:
   - **Repository name**: `atlaswebx`
   - **Description**: `A modern AI-powered browser built with Electron`
   - **Visibility**: Public
   - **DO NOT** initialize with README, .gitignore, or license (we already have these)
3. Click "Create repository"

## Step 2: Prepare Your Local Repository

### Remove Old Git History (Optional but Recommended)
If you want a fresh start without old commit history:

```bash
# Remove existing git folder
rm -rf .git

# Initialize new git repository
git init

# Add all files
git add .

# Create initial commit
git commit -m "Initial commit: AtlaswebX v1.0.0"
```

### Or Keep Existing History
If you want to keep your commit history:

```bash
# Just ensure you're on the main branch
git branch -M main
```

## Step 3: Connect to GitHub

Replace `yourusername` with your actual GitHub username:

```bash
# Add GitHub remote
git remote add origin https://github.com/yourusername/atlaswebx.git

# Or if you prefer SSH
git remote add origin git@github.com:yourusername/atlaswebx.git

# Verify remote
git remote -v
```

## Step 4: Push to GitHub

```bash
# Push to GitHub
git push -u origin main
```

## Step 5: Configure Repository Settings

### 5.1 About Section
1. Go to your repository on GitHub
2. Click the gear icon next to "About"
3. Add:
   - **Description**: `A modern AI-powered browser built with Electron`
   - **Website**: (if you have one)
   - **Topics**: `electron`, `browser`, `ai`, `openai`, `gpt-4`, `javascript`, `nodejs`, `desktop-app`
   - Check ✅ "Releases"
   - Check ✅ "Packages"

### 5.2 Enable Features
Go to Settings → General:
- ✅ Issues
- ✅ Discussions (recommended)
- ✅ Projects (optional)
- ✅ Wiki (optional)
- ✅ Sponsorships (if you want to accept donations)

### 5.3 Branch Protection (Recommended)
Go to Settings → Branches → Add rule:
- Branch name pattern: `main`
- ✅ Require pull request reviews before merging
- ✅ Require status checks to pass before merging
- ✅ Require branches to be up to date before merging

### 5.4 GitHub Actions
Your repository already has a workflow file (`.github/workflows/build.yml`).
GitHub Actions will automatically run on push and pull requests.

### 5.5 Social Preview
Go to Settings → General → Social preview:
- Upload a preview image (1280x640px recommended)
- This appears when sharing your repo on social media

## Step 6: Create Your First Release

### 6.1 Tag Your Release
```bash
# Create and push a tag
git tag -a v1.0.0 -m "Release v1.0.0: Initial public release"
git push origin v1.0.0
```

### 6.2 Create Release on GitHub
1. Go to your repository
2. Click "Releases" → "Create a new release"
3. Choose tag: `v1.0.0`
4. Release title: `v1.0.0 - Initial Release`
5. Description: Copy from `CHANGELOG.md`
6. Attach binaries (if you have built versions)
7. Click "Publish release"

## Step 7: Update Repository URLs

Update these files with your actual GitHub username:

### README.md
Replace `yourusername` with your GitHub username in:
- Clone URL
- Issue links
- Discussion links
- Badge links

### CONTRIBUTING.md
Update fork and clone URLs

### CHANGELOG.md
Update version comparison links

### Quick way to update all files:
```bash
# Replace 'yourusername' with your actual username
find . -type f -name "*.md" -exec sed -i '' 's/yourusername/YOUR_GITHUB_USERNAME/g' {} +
```

## Step 8: Set Up GitHub Pages (Optional)

If you want to create a project website:

1. Go to Settings → Pages
2. Source: Deploy from a branch
3. Branch: `main` → `/docs` (create a docs folder)
4. Click Save

## Step 9: Enable Discussions

1. Go to Settings → General
2. Scroll to Features
3. Check ✅ Discussions
4. Go to Discussions tab
5. Create categories:
   - 💡 Ideas
   - 🙏 Q&A
   - 📣 Announcements
   - 🐛 Bug Reports
   - 💬 General

## Step 10: Add Repository Secrets (for CI/CD)

If you plan to use automated builds:

1. Go to Settings → Secrets and variables → Actions
2. Add secrets:
   - `OPENAI_API_KEY` (for testing, use a test key)
   - Any other API keys needed for CI/CD

## Step 11: Create a Project Board (Optional)

1. Go to Projects → New project
2. Choose "Board" template
3. Create columns:
   - 📋 To Do
   - 🚧 In Progress
   - ✅ Done
4. Link issues to the board

## Step 12: Set Up Automated Releases (Optional)

Create `.github/workflows/release.yml`:

```yaml
name: Release

on:
  push:
    tags:
      - 'v*'

jobs:
  release:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - run: npm ci
      - run: npm run build
      - uses: softprops/action-gh-release@v1
        with:
          files: dist/*
```

## Checklist

Before announcing your project, make sure:

- [ ] All files are committed and pushed
- [ ] README.md is complete and accurate
- [ ] LICENSE file is present
- [ ] .gitignore excludes sensitive files
- [ ] No API keys or secrets in the code
- [ ] Repository description and topics are set
- [ ] Issues and Discussions are enabled
- [ ] First release is created
- [ ] All URLs are updated with your username
- [ ] Repository is set to Public
- [ ] Social preview image is uploaded

## Promoting Your Project

Once everything is set up:

### On GitHub
- [ ] Add to GitHub Topics
- [ ] Star your own repo (yes, it's okay!)
- [ ] Share in GitHub Discussions

### Social Media
- [ ] Twitter/X with hashtags: #OpenSource #Electron #AI
- [ ] Reddit: r/opensource, r/electronjs, r/programming
- [ ] Hacker News: news.ycombinator.com
- [ ] Dev.to: Write a blog post
- [ ] LinkedIn: Share with your network

### Communities
- [ ] Electron Discord
- [ ] OpenAI Community
- [ ] Product Hunt (for more visibility)

## Maintaining Your Project

### Regular Tasks
- Respond to issues within 48 hours
- Review pull requests promptly
- Update dependencies monthly
- Release new versions regularly
- Keep documentation up to date
- Engage with the community

### Monthly
- Review and close stale issues
- Update roadmap
- Check security advisories
- Analyze usage statistics

### Quarterly
- Major version releases
- Community surveys
- Contributor recognition
- Documentation overhaul

## Getting Help

If you need help with GitHub:
- [GitHub Docs](https://docs.github.com/)
- [GitHub Community](https://github.community/)
- [GitHub Support](https://support.github.com/)

---

## Quick Command Reference

```bash
# Initialize and push
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/yourusername/atlaswebx.git
git push -u origin main

# Create and push a tag
git tag -a v1.0.0 -m "Release v1.0.0"
git push origin v1.0.0

# Update from remote
git pull origin main

# Create a new branch
git checkout -b feature/new-feature

# Push branch
git push -u origin feature/new-feature
```

---

**Congratulations!** 🎉 Your project is now open source!

Remember: Open source is about community. Be welcoming, responsive, and appreciative of contributions!
