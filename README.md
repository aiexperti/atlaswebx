# Atlasweb

A modern AI-powered browser built with Electron, featuring an integrated AI assistant sidebar inspired by ChatGPT Atlas, Perplexity Comet, and Dia Browser.

## Features

- 🏠 **Beautiful Home Screen** - Quick access to your favorite apps and services
- 🌐 **Full Web Browser** - Complete browsing experience with tab management
- 🤖 **AI Assistant Sidebar** - Toggleable AI helper for page content analysis
- 📑 **Tab Management** - Multiple tabs with easy switching
- 🎨 **Modern Dark UI** - Sleek, professional interface
- 💻 **Cross-Platform** - Works on both Windows and macOS

## Installation

1. Install dependencies:
```bash
npm install
```

## Usage

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

## UI Components

### Home Screen
- Large clock display
- App shortcuts grid with popular trading and crypto platforms
- News widget with stock information
- Clean, modern design

### Browser View
- Navigation controls (back, forward, reload, home)
- URL bar with search functionality
- Tab bar for managing multiple pages
- Full web browsing capabilities

### AI Assistant Sidebar
- Toggle on/off from the navigation bar
- Contextual suggestions
- Chat interface for asking questions
- Placeholder for AI integration (OpenAI, Claude, etc.)

## Customization

### Adding App Shortcuts
Edit the `index.html` file and add new app shortcuts in the `.app-grid` section:

```html
<div class="app-shortcut" data-url="https://example.com">
    <div class="app-icon" style="background: linear-gradient(135deg, #FF0000 0%, #CC0000 100%);">
        <span>EX</span>
    </div>
    <div class="app-name">Example App</div>
</div>
```

### Integrating Real AI
Replace the placeholder AI response in `renderer.js` (line ~260) with your AI API integration:

```javascript
// Example with OpenAI
async function sendAIMessage() {
    const message = aiInput.value.trim();
    if (!message) return;
    
    // Add user message to UI
    addUserMessage(message);
    
    // Call your AI API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${YOUR_API_KEY}`
        },
        body: JSON.stringify({
            model: 'gpt-4',
            messages: [{ role: 'user', content: message }]
        })
    });
    
    const data = await response.json();
    addAIMessage(data.choices[0].message.content);
}
```

## Building for Production

To package the app for distribution:

```bash
# Install electron-builder
npm install --save-dev electron-builder

# Add to package.json scripts:
"build": "electron-builder"

# Build for current platform
npm run build
```

## Architecture

- **main.js** - Electron main process, handles window management and IPC
- **index.html** - Main UI structure
- **styles.css** - All styling and theming
- **renderer.js** - Frontend logic, tab management, AI interaction

## Future Enhancements

- [ ] Real AI integration (OpenAI, Claude, local LLM)
- [ ] Bookmarks management
- [ ] History tracking
- [ ] Download manager
- [ ] Extensions support
- [ ] Sync across devices
- [ ] Custom themes
- [ ] Voice commands

## License

MIT
