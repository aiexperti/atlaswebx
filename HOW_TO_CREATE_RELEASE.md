# How to Create GitHub Release

## 📦 Step-by-Step Guide

### Step 1: Create Git Tag

```bash
cd /Users/aymanelakhal/Documents/lenoir
git tag -a v1.0.0 -m "AtlaswebX v1.0.0 - First Public Release"
git push origin v1.0.0
```

### Step 2: Go to GitHub Releases

1. Open: https://github.com/aiexperti/atlaswebx/releases
2. Click **"Draft a new release"**

### Step 3: Fill in Release Details

**Choose a tag**: Select `v1.0.0` (or create new tag)

**Release title**: 
```
AtlaswebX v1.0.0 - First Public Release 🚀
```

**Description**: Copy and paste from `GITHUB_RELEASE_NOTES.md`

Or use this shorter version:

```markdown
# AtlaswebX v1.0.0 🚀

First public release of AtlaswebX - an AI-powered web browser built with Electron!

## 📦 Download

**Windows**: Download `AtlaswebX-Setup-1.0.0.exe` below

## ✨ Key Features

- 🌐 Full web browser with tabs
- 🤖 AI Assistant (GPT-4o-mini)
- 🎨 6 themes + 6 wallpapers
- ⚙️ Auto-save settings
- 🖱️ Context menu
- 🌍 Multi-language

## 🚀 Quick Start

1. Download the installer
2. Run and install
3. Launch AtlaswebX
4. (Optional) Add OpenAI API key for AI features

## 📖 Documentation

See repository for:
- Quick Start Guide
- API Key Setup
- Troubleshooting
- Full Release Notes

## 🙏 Credits

Built with Electron, Node.js, and OpenAI GPT-4o-mini

## 📄 License

MIT License - Free and open source!

---

⭐ Star the repo | 🐛 Report bugs | 💡 Suggest features

**Happy Browsing!** 🎉
```

### Step 4: Upload Files

**Attach binaries**:
- Drag and drop your `AtlaswebX-Setup-1.0.0.exe` file
- Or click "Attach binaries by dropping them here or selecting them"

**File naming**:
- `AtlaswebX-Setup-1.0.0.exe` - Windows Installer
- Or `atlaswebx-1.0.0-win-x64.exe` - Alternative naming

### Step 5: Release Options

**Check these boxes**:
- ✅ Set as the latest release
- ⬜ Set as a pre-release (leave unchecked)
- ⬜ Create a discussion (optional)

### Step 6: Publish

Click **"Publish release"** 🎉

---

## 📋 Release Checklist

Before publishing, verify:

- [ ] Tag created and pushed (`v1.0.0`)
- [ ] Release title is clear and descriptive
- [ ] Release notes are complete
- [ ] .exe file is uploaded
- [ ] File size is reasonable (~150MB)
- [ ] "Latest release" is checked
- [ ] Pre-release is NOT checked
- [ ] All links work
- [ ] No typos in description

---

## 🎯 After Publishing

### 1. Verify Release

- Visit: https://github.com/aiexperti/atlaswebx/releases
- Check that v1.0.0 shows as "Latest"
- Download the .exe and test it
- Verify file downloads correctly

### 2. Update README

Add release badge to README.md:
```markdown
![Version](https://img.shields.io/github/v/release/aiexperti/atlaswebx)
![Downloads](https://img.shields.io/github/downloads/aiexperti/atlaswebx/total)
```

### 3. Announce Release

**On GitHub**:
- Pin the release
- Create a discussion post

**Social Media**:
- Twitter/X: "🚀 Just released AtlaswebX v1.0.0 - an AI-powered browser built with Electron! Download now: [link] #Electron #JavaScript #AI"
- LinkedIn: Share with your network
- Reddit: Post to r/electronjs, r/SideProject

**Communities**:
- Hacker News: https://news.ycombinator.com/submit
- Product Hunt: https://www.producthunt.com/
- Dev.to: Write a launch post

### 4. Monitor

- Watch for download stats
- Respond to issues
- Thank early adopters
- Collect feedback

---

## 🔄 Future Releases

For v1.1.0, v1.2.0, etc.:

```bash
# Create new tag
git tag -a v1.1.0 -m "AtlaswebX v1.1.0 - Feature Update"
git push origin v1.1.0

# Create release on GitHub
# Upload new .exe
# Update release notes
```

---

## 📝 Release Notes Template

For future releases, use this structure:

```markdown
# AtlaswebX v1.X.X

## 🆕 What's New
- New feature 1
- New feature 2

## 🐛 Bug Fixes
- Fixed issue 1
- Fixed issue 2

## 🔧 Improvements
- Improved performance
- Better UI

## 📦 Download
- Windows: atlaswebx-setup-1.x.x.exe

## 🙏 Thanks
Thanks to all contributors!
```

---

## ✨ Tips

### Good Release Titles
✅ "AtlaswebX v1.0.0 - First Public Release 🚀"  
✅ "v1.1.0 - Bookmarks & Download Manager"  
✅ "v1.2.0 - Dark Mode & Performance"  

❌ "Release v1.0.0"  
❌ "New version"  
❌ "Update"  

### Good Release Notes
- Clear and concise
- List key features
- Include screenshots (optional)
- Mention breaking changes
- Thank contributors
- Link to documentation

### File Naming
- `AtlaswebX-Setup-1.0.0.exe` ✅
- `atlaswebx-1.0.0-win-x64.exe` ✅
- `setup.exe` ❌
- `installer.exe` ❌

---

## 🎊 You're Ready!

Everything is prepared. Just:
1. Create the tag
2. Go to GitHub Releases
3. Fill in the details
4. Upload your .exe
5. Publish!

**Good luck with your first release!** 🚀
