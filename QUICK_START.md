# 🚀 Quick Start Guide

Get AtlaswebX up and running in 5 minutes!

## Prerequisites Check

Before starting, make sure you have:
- ✅ Node.js (v16 or higher) - [Download](https://nodejs.org/)
- ✅ npm (comes with Node.js)
- ✅ Git - [Download](https://git-scm.com/)
- ✅ OpenAI API Key - [Get one here](https://platform.openai.com/)

## Installation Steps

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/atlaswebx.git
cd atlaswebx
```

### 2. Install Dependencies
```bash
npm install
```

This will install:
- Electron
- OpenAI SDK
- Ad blocker
- Other dependencies

### 3. Get Your OpenAI API Key
Before launching, get your API key ready:
- Visit [platform.openai.com](https://platform.openai.com/)
- Sign up or log in
- Go to API Keys section
- Create a new API key
- Copy it (you'll enter it in the app's Settings)

### 4. Run the Application
```bash
# Development mode (recommended for first run)
npm run dev

# Or production mode
npm start
```

### 5. Configure Your API Key
On first launch:
1. Click the **Settings** icon (gear icon)
2. Navigate to **AI Settings** tab
3. Paste your OpenAI API key
4. Click **Save**
5. Close Settings

Your API key is now securely stored and the AI assistant is ready to use!

## First Launch

When you first launch AtlaswebX, you'll see:

1. **Home Screen** - A beautiful dashboard with app shortcuts
2. **Left Sidebar** - Your favorites and open tabs
3. **AI Assistant** - Click the chat icon to open

## Quick Tour

### 🏠 Home Screen
- Click any app shortcut to navigate
- Use the search bar to enter URLs or search
- Click "Edit" to customize your shortcuts

### 🌐 Browser
- **Back/Forward**: Navigate through history
- **Reload**: Refresh the current page
- **URL Bar**: Type URLs or search terms
- **New Tab**: Click the + icon in the sidebar

### 🤖 AI Assistant
1. Click the chat icon in the top navigation
2. Type a message and press Enter
3. Try these commands:
   - "What is this page about?"
   - "Hide all ads"
   - "Search for latest AI news"
   - "Navigate to YouTube"

### 🎯 Element Selector
1. Open the AI Assistant
2. Click the pointer icon
3. Click any element on the page
4. Ask the AI to modify it

## Common Tasks

### Adding a New App Shortcut
1. Click "Edit" on the home screen
2. Click "Add App"
3. Enter the name and URL
4. Choose an icon
5. Click "Save"

### Changing Themes
1. Click the settings icon
2. Go to "Appearance"
3. Select your preferred theme

### Managing Tabs
- **New Tab**: Click + in sidebar
- **Switch Tab**: Click tab in sidebar
- **Close Tab**: Click X on tab or use close button

## Troubleshooting

### App won't start
```bash
# Clear node modules and reinstall
rm -rf node_modules
npm install
npm run dev
```

### AI not responding
- Go to Settings → AI Settings and verify your OpenAI API key is entered
- Make sure the key starts with `sk-` and is valid
- Ensure you have internet connection
- Check the console for error messages (press F12 in dev mode)
- Try re-entering your API key and saving again

### Build errors
```bash
# Make sure you're using the correct Node version
node --version  # Should be 16.x or higher

# Try clearing the cache
npm cache clean --force
npm install
```

## Next Steps

Now that you're up and running:

1. **Explore Features** - Try out the AI assistant and element selector
2. **Customize** - Add your favorite websites to the home screen
3. **Read Docs** - Check out [README.md](README.md) for detailed information
4. **Contribute** - See [CONTRIBUTING.md](CONTRIBUTING.md) to help improve AtlaswebX

## Getting Help

- 📖 [Full Documentation](README.md)
- 🐛 [Report Issues](https://github.com/yourusername/atlaswebx/issues)
- 💬 [Join Discussions](https://github.com/yourusername/atlaswebx/discussions)
- 📧 [Email Support](mailto:support@atlaswebx.dev)

## Useful Commands

```bash
# Development mode
npm run dev

# Production mode
npm start

# Build for Windows
npm run build:win

# Build for all platforms
npm run build

# Run tests (if available)
npm test

# Lint code (if configured)
npm run lint
```

## Tips & Tricks

### Keyboard Shortcuts
- `Ctrl/Cmd + T` - New tab
- `Ctrl/Cmd + W` - Close tab
- `Ctrl/Cmd + R` - Reload page
- `Ctrl/Cmd + L` - Focus URL bar
- `Ctrl/Cmd + [` - Back
- `Ctrl/Cmd + ]` - Forward

### AI Assistant Tips
- Be specific in your requests
- Use the element selector for precise modifications
- Ask for explanations if you don't understand something
- The AI can help with navigation and searches

### Performance Tips
- Close unused tabs to save memory
- Clear browser cache regularly
- Keep the app updated
- Disable unused features in settings

---

**Enjoy using AtlaswebX!** 🎉

If you find this project useful, please consider:
- ⭐ Starring the repository
- 🐛 Reporting bugs
- 💡 Suggesting features
- 🤝 Contributing code

Happy browsing! 🌐✨
