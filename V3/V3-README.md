# Lenoir AI Browser - Version 3

This is Version 3 of the Lenoir AI Browser, copied from the main development version.

## 📁 Directory Structure

```
V3/
├── index.html              # Main HTML entry point
├── styles.css              # Main application styles
├── ai-v2-styles.css        # AI assistant styles
├── main.js                 # Electron main process
├── renderer.js             # Main renderer process
├── app-manager.js          # Application state management
├── translations.js         # i18n translations
├── ai-v2-router.js         # AI routing logic
├── ai-v2-chat.js           # AI chat interface
├── ai-element-selector.js  # DOM element selection tool
├── package.json            # Node.js dependencies
├── .env                    # Environment variables (API keys)
├── .env.example            # Environment template
├── .gitignore              # Git ignore rules
│
├── ai-assistant/           # AI assistant modules
│   ├── ai-engine.js
│   ├── ai-router.js
│   ├── ai-treatment.js
│   ├── ai-web-editor.js
│   └── ... (20+ modules)
│
├── ai-services/            # AI service integrations
│   ├── ai-manager.js
│   ├── auth-manager.js
│   ├── credit-manager.js
│   ├── providers/
│   └── web-ai-assistant.js
│
├── settings/               # Settings page
│   ├── settings.html
│   ├── settings.css
│   └── settings.js
│
├── appstore/              # App store interface
│   ├── appstore.html
│   ├── appstore.css
│   └── appstore.js
│
└── icons/                 # Application icons
```

## 🚀 Quick Start

1. **Install dependencies:**
   ```bash
   cd V3
   npm install
   ```

2. **Configure environment:**
   ```bash
   cp .env.example .env
   # Edit .env and add your API keys
   ```

3. **Run the application:**
   ```bash
   npm start
   ```

## 🔑 Key Features

- **AI Assistant (GPT-4o-mini)**: Integrated ChatGPT-powered assistant
- **Element Selector**: Visual DOM element selection
- **Web Editor**: Live page modification capabilities
- **Treatment System**: AI-powered page transformations
- **Settings Management**: Comprehensive configuration
- **App Store**: Extension/plugin system
- **Multi-language Support**: i18n ready

## 📦 Dependencies

Main dependencies from `package.json`:
- Electron (if applicable)
- OpenAI API integration
- DOM manipulation libraries
- Web scraping tools

## 🔧 Configuration

Environment variables in `.env`:
- `OPENAI_API_KEY`: Your OpenAI API key
- Additional service configurations

## 📚 Documentation

- `README.md`: General project overview
- `QUICK-START.md`: Quick start guide
- `SYSTEM-ARCHITECTURE.md`: Detailed architecture documentation
- `ai-assistant/README.md`: AI assistant module documentation
- `ai-services/README.md`: AI services documentation

## 🔄 Version History

**V3** - Current snapshot
- Complete AI assistant integration
- Element selector functionality
- Web editing capabilities
- Settings and app store modules

## 📝 Notes

This version includes all core files and dependencies needed to run the Lenoir AI Browser independently. All subdirectories (ai-assistant, ai-services, settings, appstore) have been copied with their complete file structures.

---

Created: $(date)
