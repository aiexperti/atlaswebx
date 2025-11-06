# Environment Variables Setup

This guide explains how to set up your API keys using a `.env` file.

## Quick Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Create .env File
Copy the example file and add your API key:
```bash
cp .env.example .env
```

### 3. Add Your API Key
Open `.env` and replace the placeholder with your actual OpenAI API key:
```env
OPENAI_API_KEY=sk-proj-your-actual-api-key-here
```

### 4. Restart the App
```bash
npm start
```

## How It Works

### Priority Order
The app loads API keys in this order:
1. **Settings UI** (localStorage) - Highest priority
2. **`.env` file** - Fallback if not in settings
3. **None** - Shows error if no key found

### Console Output
When the app loads, you'll see:
```
🔑 Loading API keys: { hasOpenAI: true, source: '.env file' }
```

## Security

✅ **Safe:**
- `.env` file is in `.gitignore`
- Never committed to git
- Only stored locally

⚠️ **Important:**
- Never share your `.env` file
- Never commit it to version control
- Keep your API keys secret

## Multiple API Keys

You can add multiple API keys:
```env
OPENAI_API_KEY=sk-proj-...
ANTHROPIC_API_KEY=sk-ant-...
GOOGLE_API_KEY=AIza...
```

## Troubleshooting

### Key Not Loading?
1. Check `.env` file exists in project root
2. Verify no spaces around `=`
3. Restart the app completely
4. Check console for error messages

### Still Not Working?
- Use Settings UI instead (⚙️ icon)
- Paste key directly in settings
- Key will be saved to localStorage

## Example .env File
```env
# OpenAI API Configuration
OPENAI_API_KEY=sk-proj-abc123xyz789...

# Optional: Other AI providers
ANTHROPIC_API_KEY=sk-ant-...
GOOGLE_API_KEY=AIza...
```

## Benefits

✅ **Convenience** - Set once, works everywhere
✅ **Security** - Not committed to git
✅ **Flexibility** - Easy to change keys
✅ **Backup** - Settings UI still works
