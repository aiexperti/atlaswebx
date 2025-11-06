// Basic AI Services Usage Example
const AIManager = require('../ai-manager');

async function main() {
    // Create AI manager
    const aiManager = new AIManager();

    // Set API keys (replace with your actual keys)
    aiManager.setApiKey('chatgpt', process.env.OPENAI_API_KEY || 'your-key-here');
    aiManager.setApiKey('claude', process.env.ANTHROPIC_API_KEY || 'your-key-here');
    aiManager.setApiKey('gemini', process.env.GOOGLE_AI_API_KEY || 'your-key-here');

    console.log('Available providers:', aiManager.getProviders());
    console.log('Current provider:', aiManager.currentProvider);

    // Example 1: Basic message with ChatGPT
    console.log('\n--- Example 1: ChatGPT ---');
    try {
        const response1 = await aiManager.sendMessage('What is the capital of France?');
        console.log('Response:', response1);
    } catch (error) {
        console.error('Error:', error.message);
    }

    // Example 2: Switch to Claude
    console.log('\n--- Example 2: Claude ---');
    aiManager.setProvider('claude');
    try {
        const response2 = await aiManager.sendMessage('Explain quantum computing in simple terms');
        console.log('Response:', response2);
    } catch (error) {
        console.error('Error:', error.message);
    }

    // Example 3: Switch to Gemini
    console.log('\n--- Example 3: Gemini ---');
    aiManager.setProvider('gemini');
    try {
        const response3 = await aiManager.sendMessage('Write a haiku about coding');
        console.log('Response:', response3);
    } catch (error) {
        console.error('Error:', error.message);
    }

    // Example 4: Streaming response
    console.log('\n--- Example 4: Streaming (ChatGPT) ---');
    aiManager.setProvider('chatgpt');
    try {
        await aiManager.streamMessage('Tell me a short story about a robot', (chunk) => {
            process.stdout.write(chunk);
        });
        console.log('\n');
    } catch (error) {
        console.error('Error:', error.message);
    }

    // Example 5: Conversation with history
    console.log('\n--- Example 5: Conversation ---');
    aiManager.clearHistory();
    
    const msg1 = await aiManager.sendMessage('My name is John');
    console.log('AI:', msg1);
    
    const msg2 = await aiManager.sendMessage('What is my name?');
    console.log('AI:', msg2);

    // Example 6: Custom options
    console.log('\n--- Example 6: Custom Options ---');
    const response6 = await aiManager.sendMessage('Write a creative poem', {
        temperature: 0.9,
        maxTokens: 500
    });
    console.log('Response:', response6);

    // Show conversation history
    console.log('\n--- Conversation History ---');
    console.log('Messages:', aiManager.getHistory().length);
}

// Run examples
main().catch(console.error);
