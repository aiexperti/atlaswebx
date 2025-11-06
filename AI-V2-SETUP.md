# AI Assistant V2 - Setup Guide

## OpenAI API Key Configuration

The AI Assistant V2 uses GPT-4o and requires an OpenAI API key. The key can be configured in two ways:

### Option 1: Environment Variable (Recommended for Development)

1. The `.env` file already exists in the project root
2. Your OpenAI API key is already configured in `.env`:
   ```
   OPENAI_API_KEY=sk-proj-...
   ```
3. The key is automatically loaded when the app starts (via `dotenv` in `main.js`)
4. The `.env` file is gitignored for security

### Option 2: localStorage (User Settings)

Users can also set their API key through the browser settings:

```javascript
// In browser console or settings UI:
localStorage.setItem('ai-settings', JSON.stringify({
    openaiKey: 'sk-...'
}));
```

## Priority Order

The AI V2 Chat loads the API key in this order:
1. **localStorage** (`ai-settings.openaiKey`) - User's personal key
2. **Environment Variable** (`process.env.OPENAI_API_KEY`) - Developer key from `.env`
3. **null** - No key found (shows error message)

## How It Works

### File: `ai-v2-chat.js`

```javascript
loadAPIKey() {
    const settings = JSON.parse(localStorage.getItem('ai-settings') || '{}');
    
    // Try localStorage first, then fall back to .env
    this.apiKey = settings.openaiKey || process.env.OPENAI_API_KEY || null;
}
```

### File: `main.js`

```javascript
// Loads .env file at app startup
require('dotenv').config();
```

## Testing the Setup

1. **Start the app**: `npm start`
2. **Open AI sidebar**: Click the chat icon in the top navigation
3. **Check console**: Should see:
   ```
   ✅ AI V2 Chat initialized
   ✅ OpenAI API key loaded from: .env file
   ```
4. **Send a message**: Type "Hello" and press Enter
5. **Verify response**: Should get a response from GPT-4o

## API Key Sources

### Current Setup
- **Developer Key**: Stored in `.env` file (gitignored)
- **User Key**: Can be set via localStorage (optional)

### Security Notes
- ✅ `.env` file is in `.gitignore` - won't be committed
- ✅ API key is never exposed in client-side code
- ✅ Electron's Node.js integration allows secure access to `process.env`
- ⚠️ Don't hardcode API keys in source files

## Troubleshooting

### "No OpenAI API key found"
1. Check if `.env` file exists in project root
2. Verify `OPENAI_API_KEY=sk-...` is set in `.env`
3. Restart the app to reload environment variables

### "API request failed"
1. Verify API key is valid (check OpenAI dashboard)
2. Check internet connection
3. Verify API key has sufficient credits
4. Check console for detailed error messages

### "Failed to get response"
1. Open DevTools (View > Toggle Developer Tools)
2. Check Console tab for error details
3. Common issues:
   - Invalid API key
   - Insufficient credits
   - Network issues
   - Rate limiting

## API Usage

### Model: GPT-4o
- **Endpoint**: `https://api.openai.com/v1/chat/completions`
- **Temperature**: 0.7
- **Max Tokens**: 1000
- **Context**: Last 10 messages

### System Prompt
```
You are a helpful AI assistant integrated into the Lenoir browser. 
You can help users with browsing, answer questions, and provide assistance. 
Be concise and friendly.
```

## Features

- ✅ Chat bubble interface
- ✅ Conversation history (last 10 messages)
- ✅ Typing indicator
- ✅ Auto-resize textarea
- ✅ Message formatting (bold, italic, code)
- ✅ Error handling
- ✅ Smooth animations

## Files

- `ai-v2-chat.js` - Chat logic and OpenAI integration
- `ai-v2-styles.css` - Chat bubble styling
- `index.html` - Chat UI structure
- `.env` - API key storage (gitignored)
- `main.js` - Loads .env file

## Next Steps

To add more features:
1. **Web scraping**: Pass page content to GPT-4o
2. **DOM manipulation**: Let AI modify websites
3. **Multi-modal**: Add image analysis
4. **Voice**: Add speech-to-text
5. **Plugins**: Add custom tools/functions
