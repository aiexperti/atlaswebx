# Installation Guide

Complete guide to installing AtlaswebX on Windows.

## 📦 System Requirements

### Minimum Requirements
- **OS**: Windows 10 (64-bit) or Windows 11
- **RAM**: 4GB
- **Disk Space**: 200MB
- **Internet**: Required for browsing and AI features

### Recommended Requirements
- **OS**: Windows 11 (64-bit)
- **RAM**: 8GB or more
- **Disk Space**: 500MB
- **Internet**: Broadband connection

## 🚀 Installation Steps

### Step 1: Download

1. Go to [Releases Page](https://github.com/aiexperti/atlaswebx/releases/latest)
2. Download `AtlaswebX-Setup-1.0.0.exe`
3. Save to your Downloads folder

### Step 2: Run Installer

1. Double-click `AtlaswebX-Setup-1.0.0.exe`
2. Windows SmartScreen may show a warning (see below)
3. Follow the installation wizard
4. Choose installation location (default: `C:\Program Files\AtlaswebX`)
5. Click "Install"

### Step 3: First Launch

1. Launch AtlaswebX from:
   - Desktop shortcut
   - Start Menu → AtlaswebX
   - Installation folder
2. Welcome screen appears
3. Start browsing!

## 🛡️ Windows SmartScreen Warning

### What You'll See

```
Windows protected your PC
Microsoft Defender SmartScreen prevented an unrecognized app from starting.
Running this app might put your PC at risk.

[More info]  [Don't run]  [Run anyway]
```

### Why This Happens

AtlaswebX is not code-signed (requires expensive certificate). This is **normal** for open source software.

### How to Install

1. Click **"More info"**
2. Click **"Run anyway"**
3. Installation continues normally

### Is It Safe?

✅ **Yes!** AtlaswebX is:
- Open source (code is public)
- Scanned by antivirus engines
- Community reviewed
- No malware or tracking

## 📁 Installation Locations

### Default Paths

**Program Files**:
```
C:\Program Files\AtlaswebX\
```

**User Data**:
```
C:\Users\[YourName]\AppData\Roaming\atlaswebx\
```

**Settings**:
```
C:\Users\[YourName]\AppData\Roaming\atlaswebx\settings\
```

## 🔧 Post-Installation

### Optional: Set Up AI Assistant

1. Get OpenAI API key from https://platform.openai.com/api-keys
2. Open AtlaswebX
3. Click Settings (gear icon)
4. Go to AI Settings
5. Enter your API key
6. Click Save

See [API Key Setup](API-Key-Setup) for detailed instructions.

### Optional: Customize

1. Open Settings
2. Choose wallpaper
3. Select theme
4. Change language
5. Set homepage

See [Customization](Customization) for more options.

## 🔄 Updating

### Automatic Updates (Future)

Auto-update feature coming in v1.1.0

### Manual Update

1. Download new installer
2. Run installer
3. Install over existing version
4. Settings are preserved

## 🗑️ Uninstallation

### Windows 10/11

1. Open Settings
2. Go to Apps → Installed apps
3. Find "AtlaswebX"
4. Click three dots → Uninstall
5. Confirm

### Alternative Method

1. Open Control Panel
2. Programs → Uninstall a program
3. Select AtlaswebX
4. Click Uninstall

### Clean Uninstall

To remove all data:

1. Uninstall AtlaswebX (above)
2. Delete user data folder:
   ```
   C:\Users\[YourName]\AppData\Roaming\atlaswebx\
   ```

## 🐛 Installation Issues

### Installer Won't Run

**Problem**: Double-click does nothing

**Solution**:
- Right-click installer → Run as administrator
- Check antivirus isn't blocking it
- Re-download installer (may be corrupted)

### SmartScreen Blocks Installation

**Problem**: Can't click "Run anyway"

**Solution**:
- Click "More info" first
- Then "Run anyway" appears
- Or temporarily disable SmartScreen

### Installation Fails

**Problem**: Error during installation

**Solution**:
- Close all programs
- Run as administrator
- Check disk space (need 200MB)
- Disable antivirus temporarily

### App Won't Launch

**Problem**: Installed but won't open

**Solution**:
- Check Windows Event Viewer for errors
- Reinstall
- Check antivirus logs
- Report issue on GitHub

## 💡 Tips

### Portable Version

Download `AtlaswebX-1.0.0-win.exe` for portable version:
- No installation required
- Run from USB drive
- Settings stored in app folder

### Multiple Installations

You can install multiple versions:
- Install to different folders
- Each has separate settings
- Useful for testing

### Network Installation

For IT administrators:
- Use silent install: `/S` flag
- Deploy via Group Policy
- Centralized configuration possible

## 🆘 Need Help?

- **[Troubleshooting](Troubleshooting)** - Common issues
- **[FAQ](FAQ)** - Frequently asked questions
- **[GitHub Issues](https://github.com/aiexperti/atlaswebx/issues)** - Report problems
- **[Discussions](https://github.com/aiexperti/atlaswebx/discussions)** - Ask questions

---

**Next Steps**: [Quick Start Guide](Quick-Start)
