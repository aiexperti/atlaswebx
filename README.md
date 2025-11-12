<div align="center">

# ![alt](https://atlaswebx.com/android-chrome-192x192.png) AtlaswebX

**A Modern AI-Powered Browser Built with Electron**
![alt](https://atlaswebx.com/screenshot.png)

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Electron](https://img.shields.io/badge/Electron-27.0.0-47848F?logo=electron)](https://www.electronjs.org/)
[![OpenAI](https://img.shields.io/badge/OpenAI-GPT--4o--mini-412991?logo=openai)](https://openai.com/)

*An intelligent browsing experience with integrated AI assistant, inspired by ChatGPT Atlas, Perplexity Comet, and Dia Browser*

[Features](#-features) • [Installation](#-installation) • [Usage](#-usage) • [Architecture](#-architecture) • [Contributing](#-contributing)

</div>

---

## ✨ Features

### 🏠 Beautiful Home Screen
- **Dynamic Clock & Date** - Real-time display with elegant typography
- **App Shortcuts Grid** - Quick access to your favorite websites
- **Customizable Layout** - Drag-and-drop app organization
- **Modern Glass-morphism UI** - Sleek, translucent design elements

### 🌐 Full-Featured Web Browser
- **Multi-Tab Management** - Seamless switching between multiple pages
- **Navigation Controls** - Back, forward, reload, and home buttons
- **Smart URL Bar** - Search or enter URLs with autocomplete
- **Ad Blocker** - Built-in ad blocking powered by @cliqz/adblocker-electron
- **Collapsible Sidebars** - Maximize your browsing space

### 🤖 AI Assistant Sidebar
- **GPT-4o-mini Integration** - Powered by OpenAI's latest model
- **Element Selector** - Click to select and interact with page elements
- **Contextual Analysis** - Analyze page content and answer questions
- **Web Modifications** - AI-powered page editing and customization
- **Smart Routing** - Intelligent command interpretation and execution
- **Chat Interface** - Natural conversation with your AI assistant

### 🎨 Modern UI/UX
- **Dark Mode** - Professional dark theme optimized for extended use
- **Custom Title Bar** - Native-like window controls
- **Smooth Animations** - Polished transitions and interactions
- **Responsive Design** - Adapts to different window sizes
- **Font Awesome Icons** - Beautiful, scalable vector icons

### 🔧 Developer Features
- **Electron Store** - Persistent settings and data storage
- **Environment Variables** - Secure API key management with dotenv
- **Modular Architecture** - Clean separation of concerns
- **Translation Support** - Multi-language ready with translations.js
- **Theme Manager** - Easy theme customization

---

## 📦 Installation

### Prerequisites
- **Node.js** (v16 or higher)
- **npm** or **yarn**
- **Git**

### Clone the Repository
```bash
git clone https://github.com/aiexperti/atlaswebx.git
cd atlaswebx
```

### Install Dependencies
```bash
npm install
```

### Configure API Keys
API keys are managed through the application's Settings UI (no `.env` file needed):

1. Launch AtlaswebX
2. Click the Settings icon (gear icon)
3. Navigate to **AI Settings**
4. Enter your OpenAI API key
5. Click **Save**

> **Note:** You can get an OpenAI API key from [platform.openai.com](https://platform.openai.com/)
> 
> Your API keys are securely stored in the application's local storage and are never committed to version control.

---

## 🚀 Usage

### Development Mode
Run the app in development mode with hot reload:
```bash
npm run dev
```

### Production Mode
Start the app in production mode:
```bash
npm start
```

### Building for Distribution
Build the app for your platform:

**Windows:**
```bash
npm run build:win
```

**All Platforms:**
```bash
npm run build
```

The built application will be available in the `dist/` directory.

---

## 🏗️ Architecture

### Project Structure
```
atlaswebx/
├── main.js                 # Electron main process
├── renderer.js             # Main renderer logic
├── index.html              # Main UI structure
├── styles.css              # Core styling
├── themes.css              # Theme definitions
├── ai-v2-router.js         # AI command routing
├── ai-v2-chat.js           # AI chat interface
├── ai-v2-styles.css        # AI sidebar styling
├── ai-element-selector.js  # Element selection tool
├── app-manager.js          # App shortcuts manager
├── theme-manager.js        # Theme switching logic
├── translations.js         # Internationalization
├── backend/                # Backend services
│   └── server.js           # Express server for AI proxy
├── ai-services/            # AI service integrations
└── settings/               # Settings management
```

### Key Components

#### Main Process (`main.js`)
- Window management and lifecycle
- IPC communication with renderer
- Native menu and system integration
- Session management and security

#### Renderer Process (`renderer.js`)
- Tab management and navigation
- WebView integration
- UI event handling
- Browser controls

#### AI System
- **Router** (`ai-v2-router.js`) - Interprets user commands and routes to appropriate handlers
- **Chat** (`ai-v2-chat.js`) - Manages conversation with OpenAI API
- **Element Selector** (`ai-element-selector.js`) - Interactive page element selection
- **Services** (`ai-services/`) - Modular AI service implementations

---

## 🎯 Usage Guide

### Using the AI Assistant

1. **Open AI Sidebar** - Click the chat icon in the top navigation
2. **Ask Questions** - Type your query and press Enter
3. **Select Elements** - Click the pointer icon to select page elements
4. **Modify Pages** - Ask the AI to change colors, hide elements, etc.
5. **Search the Web** - Request web searches and get summarized results

### Example AI Commands
```
"What is this page about?"
"Hide all ads on this page"
"Change the background color to dark blue"
"Search for the latest news on AI"
"Navigate to YouTube"
"Summarize this article"
```

### Customizing App Shortcuts

Edit `index.html` to add custom shortcuts:
```html
<div class="app-shortcut" data-url="https://example.com">
    <div class="app-icon app-icon-glass" style="background: linear-gradient(135deg, rgba(255, 0, 0, 0.15) 0%, rgba(204, 0, 0, 0.15) 100%);">
        <i class="fa-brands fa-example" style="color: #FF0000; font-size: 36px;"></i>
    </div>
    <div class="app-name">Example</div>
</div>
```

---

## 🔒 Security

- **API Keys** - Managed through Settings UI and stored in local storage (never in code or `.env` files)
- **Content Security** - Electron security best practices implemented
- **Sandboxing** - WebViews run in isolated contexts
- **HTTPS** - Secure connections enforced where possible
- **No Hardcoded Secrets** - All sensitive data is user-provided through the Settings interface

---

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for details.

### Development Workflow
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Style
- Use consistent indentation (2 spaces)
- Follow existing naming conventions
- Comment complex logic
- Test your changes thoroughly

---

## 📝 Roadmap

- [ ] **Enhanced AI Features**
  - [ ] Local LLM support (Ollama, LM Studio)
  - [ ] Voice commands and speech-to-text
  - [ ] AI-powered bookmarks organization
  
- [ ] **Browser Features**
  - [ ] Bookmarks manager with sync
  - [ ] History tracking and search
  - [ ] Download manager
  - [ ] Extensions/plugins support
  
- [ ] **UI/UX Improvements**
  - [ ] Custom theme creator
  - [ ] Multiple layout options
  - [ ] Gesture controls
  - [ ] Picture-in-picture mode

- [ ] **Platform Support**
  - [ ] macOS builds
  - [ ] Linux builds
  - [ ] Mobile companion app

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- Inspired by [ChatGPT Atlas](https://openai.com/), [Perplexity Comet](https://www.perplexity.ai/), and [Dia Browser](https://dia.so/)
- Built with [Electron](https://www.electronjs.org/)
- Powered by [OpenAI GPT-4o-mini](https://openai.com/)
- Icons by [Font Awesome](https://fontawesome.com/)
- Ad blocking by [Cliqz Adblocker](https://github.com/cliqz-oss/adblocker)

---

## 📧 Contact & Support

- **Issues:** [GitHub Issues](https://github.com/aiexperti/atlaswebx/issues)
- **Discussions:** [GitHub Discussions](https://github.com/aiexperti/atlaswebx/discussions)
- **Email:** contact@atlaswebx.com

---

<div align="center">

**Made with ❤️ by the AtlaswebX Community**

⭐ Star us on GitHub — it helps!

[Report Bug](https://github.com/aiexperti/atlaswebx/issues) • [Request Feature](https://github.com/aiexperti/atlaswebx/issues) • [Documentation](https://github.com/aiexperti/atlaswebx/wiki)

</div>
