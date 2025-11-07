/**
 * AI Assistant V2 - Chat Interface with GPT-4o
 * Handles chat bubbles, message sending, and OpenAI API integration
 */

class AIV2Chat {
    constructor() {
        this.messagesWrapper = document.getElementById('ai-messages-wrapper');
        this.input = document.getElementById('ai-input-v2');
        this.sendBtn = document.getElementById('ai-send-btn');
        this.closeBtn = document.getElementById('ai-close-btn');
        
        this.apiKey = null;
        this.conversationHistory = [];
        this.router = null;
        
        this.init();
    }

    init() {
        // Load API key from settings
        this.loadAPIKey();
        
        // Event listeners
        this.sendBtn?.addEventListener('click', () => this.sendMessage());
        this.input?.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });
        
        this.closeBtn?.addEventListener('click', () => {
            if (typeof toggleAISidebar === 'function') {
                toggleAISidebar();
            }
        });
        
        // Auto-resize textarea
        this.input?.addEventListener('input', () => this.autoResizeTextarea());
        
        console.log('✅ AI V2 Chat initialized');
    }

    loadAPIKey() {
        try {
            const settings = JSON.parse(localStorage.getItem('ai-settings') || '{}');
            
            // Try localStorage first, then fall back to environment variable
            this.apiKey = settings.openaiKey || process.env.OPENAI_API_KEY || null;
            
            if (!this.apiKey) {
                console.warn('⚠️ No OpenAI API key found in settings or .env file');
            } else {
                const source = settings.openaiKey ? 'localStorage' : '.env file';
                console.log('✅ OpenAI API key loaded from:', source);
                
                // Initialize router with API key
                if (typeof AIV2Router !== 'undefined') {
                    this.router = new AIV2Router(this.apiKey);
                    console.log('✅ AI Router initialized with GPT-4o-mini');
                }
            }
        } catch (error) {
            console.error('Failed to load API key:', error);
        }
    }

    autoResizeTextarea() {
        if (!this.input) return;
        
        this.input.style.height = 'auto';
        this.input.style.height = Math.min(this.input.scrollHeight, 120) + 'px';
    }

    async sendMessage() {
        const message = this.input.value.trim();
        if (!message) return;
        
        if (!this.apiKey || !this.router) {
            this.addErrorMessage('Please set your OpenAI API key in settings first.');
            return;
        }
        
        // Add user message to chat
        this.addUserMessage(message);
        
        // Clear input
        this.input.value = '';
        this.autoResizeTextarea();
        
        // Show typing indicator
        this.showTypingIndicator();
        
        // Add to conversation history
        this.conversationHistory.push({
            role: 'user',
            content: message
        });
        
        try {
            // Get current page context
            const pageContext = await this.getCurrentPageContext();
            
            // Add selected element to context if available
            if (window.aiElementSelector?.selectedElement) {
                pageContext.selectedElement = window.aiElementSelector.selectedElement;
            }
            
            // Route request through AI router (uses GPT-4o-mini)
            const result = await this.router.routeRequest(message, pageContext);
            
            // Remove typing indicator
            this.removeTypingIndicator();
            
            // Handle different response types
            if (result.action === 'search') {
                // Open search in new tab
                this.addAssistantMessage(result.response);
                const { ipcRenderer } = require('electron');
                ipcRenderer.send('create-tab', { url: result.url });
            } else if (result.action === 'navigate') {
                // Navigate to URL
                this.addAssistantMessage(result.response);
                const { ipcRenderer } = require('electron');
                ipcRenderer.send('create-tab', { url: result.url });
            } else {
                // Add AI response
                this.addAssistantMessage(result.response);
            }
            
            // Add to conversation history
            this.conversationHistory.push({
                role: 'assistant',
                content: result.response
            });
            
        } catch (error) {
            this.removeTypingIndicator();
            this.addErrorMessage('Failed to get response: ' + error.message);
            console.error('AI Error:', error);
        }
    }
    
    async getCurrentPageContext() {
        try {
            const { ipcRenderer } = require('electron');
            const tabs = window.tabs || [];
            const activeTabId = window.activeTabId;
            const currentTab = tabs.find(t => t.id === activeTabId);
            
            return {
                url: currentTab?.url || null,
                title: currentTab?.title || null
            };
        } catch (error) {
            console.error('Failed to get page context:', error);
            return null;
        }
    }

    async callGPT4o(userMessage) {
        // HARDCODED API KEY - Replace with your actual key
        const apiKey = 'sk-YOUR-API-KEY-HERE';
        
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: 'gpt-4o-mini',
                messages: [
                    {
                        role: 'system',
                        content: 'You are a helpful AI assistant integrated into the Atlasweb browser. You can help users with browsing, answer questions, and provide assistance. Be concise and friendly.'
                    },
                    ...this.conversationHistory.slice(-10), // Keep last 10 messages for context
                    {
                        role: 'user',
                        content: userMessage
                    }
                ],
                temperature: 0.7,
                max_tokens: 1000
            })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error?.message || 'API request failed');
        }

        const data = await response.json();
        return data.choices[0].message.content;
    }

    addUserMessage(text) {
        const messageEl = document.createElement('div');
        messageEl.className = 'ai-message ai-message-user';
        messageEl.innerHTML = `
            <div class="ai-message-avatar">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                    <circle cx="12" cy="7" r="4"/>
                </svg>
            </div>
            <div class="ai-message-bubble">
                <div class="ai-message-content">${this.escapeHtml(text)}</div>
            </div>
        `;
        
        this.messagesWrapper.appendChild(messageEl);
        this.scrollToBottom();
    }

    addAssistantMessage(text) {
        const messageEl = document.createElement('div');
        messageEl.className = 'ai-message ai-message-assistant';
        messageEl.innerHTML = `
            <div class="ai-message-avatar">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"/>
                    <path d="M12 16v-4M12 8h.01"/>
                </svg>
            </div>
            <div class="ai-message-bubble">
                <div class="ai-message-content">${this.formatMessage(text)}</div>
            </div>
        `;
        
        this.messagesWrapper.appendChild(messageEl);
        this.scrollToBottom();
    }

    addErrorMessage(text) {
        const messageEl = document.createElement('div');
        messageEl.className = 'ai-message ai-message-assistant';
        messageEl.innerHTML = `
            <div class="ai-message-avatar" style="background: linear-gradient(135deg, #ff4444 0%, #cc0000 100%);">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="12" y1="8" x2="12" y2="12"/>
                    <line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
            </div>
            <div class="ai-message-bubble">
                <div class="ai-message-content" style="background: rgba(255, 68, 68, 0.1); border-color: rgba(255, 68, 68, 0.3); color: #ff9999;">
                    ${this.escapeHtml(text)}
                </div>
            </div>
        `;
        
        this.messagesWrapper.appendChild(messageEl);
        this.scrollToBottom();
    }

    showTypingIndicator() {
        const indicator = document.createElement('div');
        indicator.className = 'ai-typing-indicator';
        indicator.id = 'typing-indicator';
        indicator.innerHTML = `
            <div class="ai-message-avatar">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"/>
                    <path d="M12 16v-4M12 8h.01"/>
                </svg>
            </div>
            <div class="ai-message-bubble">
                <div class="typing-dot"></div>
                <div class="typing-dot"></div>
                <div class="typing-dot"></div>
            </div>
        `;
        
        this.messagesWrapper.appendChild(indicator);
        this.scrollToBottom();
    }

    removeTypingIndicator() {
        const indicator = document.getElementById('typing-indicator');
        if (indicator) {
            indicator.remove();
        }
    }

    scrollToBottom() {
        const container = document.getElementById('ai-chat-container');
        if (container) {
            setTimeout(() => {
                container.scrollTop = container.scrollHeight;
            }, 100);
        }
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    formatMessage(text) {
        // Basic markdown-like formatting
        let formatted = this.escapeHtml(text);
        
        // Bold **text**
        formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        
        // Italic *text*
        formatted = formatted.replace(/\*(.*?)\*/g, '<em>$1</em>');
        
        // Code `text`
        formatted = formatted.replace(/`(.*?)`/g, '<code style="background: rgba(74, 158, 255, 0.2); padding: 2px 6px; border-radius: 4px; font-family: monospace;">$1</code>');
        
        // Line breaks
        formatted = formatted.replace(/\n/g, '<br>');
        
        return formatted;
    }

    clearChat() {
        this.conversationHistory = [];
        this.messagesWrapper.innerHTML = `
            <div class="ai-message ai-message-assistant">
                <div class="ai-message-avatar">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="12" r="10"/>
                        <path d="M12 16v-4M12 8h.01"/>
                    </svg>
                </div>
                <div class="ai-message-bubble">
                    <div class="ai-message-content">
                        Hello! I'm your AI assistant powered by GPT-4o. I can help you browse, modify websites, and answer questions. How can I help you today?
                    </div>
                </div>
            </div>
        `;
    }
}

// Initialize when DOM is ready
if (typeof window !== 'undefined') {
    window.aiV2Chat = null;
    
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            window.aiV2Chat = new AIV2Chat();
        });
    } else {
        window.aiV2Chat = new AIV2Chat();
    }
}
