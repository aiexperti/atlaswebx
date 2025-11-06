# AI Services

Multi-provider AI integration for the Lenoir Browser. Supports ChatGPT, Claude, and Gemini.

## Structure

```
ai-services/
├── ai-manager.js          # Main AI manager
├── config.js              # Configuration
├── providers/
│   ├── chatgpt.js        # OpenAI ChatGPT
│   ├── claude.js         # Anthropic Claude
│   └── gemini.js         # Google Gemini
└── README.md             # This file
```

## Supported Providers

### 1. ChatGPT (OpenAI)
- **Models:** GPT-4, GPT-3.5-turbo, GPT-4-turbo
- **Features:** Streaming, conversation history
- **API Key:** Required (OPENAI_API_KEY)

### 2. Claude (Anthropic)
- **Models:** Claude 3.5 Sonnet, Claude 3 Opus, Claude 3 Sonnet
- **Features:** Streaming, long context
- **API Key:** Required (ANTHROPIC_API_KEY)

### 3. Gemini (Google)
- **Models:** Gemini Pro, Gemini Pro Vision
- **Features:** Streaming, multimodal support
- **API Key:** Required (GOOGLE_AI_API_KEY)

## Usage

### Basic Setup

```javascript
const AIManager = require('./ai-services/ai-manager');

// Create AI manager instance
const aiManager = new AIManager();

// Set API keys
aiManager.setApiKey('chatgpt', 'your-openai-api-key');
aiManager.setApiKey('claude', 'your-anthropic-api-key');
aiManager.setApiKey('gemini', 'your-google-api-key');
```

### Sending Messages

```javascript
// Use default provider (ChatGPT)
const response = await aiManager.sendMessage('Hello, how are you?');
console.log(response);

// Switch provider
aiManager.setProvider('claude');
const claudeResponse = await aiManager.sendMessage('Explain quantum computing');
console.log(claudeResponse);
```

### Streaming Responses

```javascript
// Stream response in real-time
await aiManager.streamMessage('Write a story', (chunk) => {
    process.stdout.write(chunk); // Print each chunk as it arrives
});
```

### Managing Conversation

```javascript
// Get conversation history
const history = aiManager.getHistory();

// Clear history
aiManager.clearHistory();

// Check if provider is configured
if (aiManager.isProviderConfigured('chatgpt')) {
    console.log('ChatGPT is ready!');
}
```

### Advanced Options

```javascript
// Send with custom options
const response = await aiManager.sendMessage('Explain AI', {
    temperature: 0.9,
    maxTokens: 1000,
    model: 'gpt-4-turbo'
});
```

## Environment Variables

Set these in your `.env` file or environment:

```bash
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
GOOGLE_AI_API_KEY=AI...
```

## API Keys

### Get API Keys:

1. **OpenAI (ChatGPT)**
   - Visit: https://platform.openai.com/api-keys
   - Create account and generate API key

2. **Anthropic (Claude)**
   - Visit: https://console.anthropic.com/
   - Sign up and get API key

3. **Google (Gemini)**
   - Visit: https://makersuite.google.com/app/apikey
   - Create API key

## Features

### ✅ Implemented
- Multiple AI provider support
- Conversation history management
- Streaming responses
- Provider switching
- Error handling
- API key management

### 🚧 Planned
- Image generation
- Vision/multimodal support
- Function calling
- Custom system prompts
- Rate limiting
- Cost tracking
- Conversation persistence

## Integration with Browser

To integrate with the browser's AI sidebar:

```javascript
// In renderer.js
const { ipcRenderer } = require('electron');

// Send message to AI
ipcRenderer.send('ai-message', {
    message: 'Hello AI',
    provider: 'chatgpt'
});

// Receive response
ipcRenderer.on('ai-response', (event, response) => {
    displayMessage(response);
});
```

## Error Handling

```javascript
try {
    const response = await aiManager.sendMessage('Hello');
} catch (error) {
    if (error.message.includes('API key')) {
        console.error('Please configure API key');
    } else if (error.message.includes('rate limit')) {
        console.error('Rate limit exceeded');
    } else {
        console.error('AI error:', error);
    }
}
```

## Best Practices

1. **Always check if provider is configured before use**
2. **Handle errors gracefully**
3. **Clear history periodically to save memory**
4. **Use streaming for long responses**
5. **Set appropriate temperature and token limits**
6. **Store API keys securely (never in code)**

## Examples

See `examples/` folder for complete usage examples.
