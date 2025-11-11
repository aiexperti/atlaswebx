/**
 * AI UI Handler
 * Handles all UI interactions for the AI assistant
 * Keeps renderer.js clean
 */

class AIUIHandler {
    constructor(messagesContainer, inputElement) {
        this.aiMessages = messagesContainer;
        this.aiInput = inputElement;
        this.currentDomain = null;
        this.chatHistory = this.loadChatHistory();
        this.loadingMessage = null;
    }

    /**
     * Load chat history from localStorage
     */
    loadChatHistory() {
        try {
            const saved = localStorage.getItem('ai-chat-history');
            return saved ? JSON.parse(saved) : {};
        } catch (error) {
            console.error('Failed to load chat history:', error);
            return {};
        }
    }

    /**
     * Save chat history to localStorage
     */
    saveChatHistory() {
        try {
            localStorage.setItem('ai-chat-history', JSON.stringify(this.chatHistory));
        } catch (error) {
            console.error('Failed to save chat history:', error);
        }
    }

    /**
     * Set current domain and load its chat history
     */
    setDomain(domain) {
        if (this.currentDomain !== domain) {
            this.currentDomain = domain;
            this.loadDomainChat(domain);
        }
    }

    /**
     * Load chat for specific domain
     */
    loadDomainChat(domain) {
        this.aiMessages.innerHTML = '';

        if (this.chatHistory[domain] && this.chatHistory[domain].length > 0) {
            this.chatHistory[domain].forEach(msg => {
                if (msg.type === 'user') {
                    this.addUserMessage(msg.content, false);
                } else if (msg.type === 'ai') {
                    this.addAIMessage(msg.content, false);
                }
            });
        } else {
            this.addWelcomeMessage();
        }
    }

    /**
     * Add welcome message
     */
    addWelcomeMessage() {
        const welcome = document.createElement('div');
        welcome.className = 'ai-message assistant';
        welcome.innerHTML = `
            <div class="message-avatar">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7h1a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1v1a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-1H2a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h1a7 7 0 0 1 7-7h1V5.73c-.6-.34-1-.99-1-1.73a2 2 0 0 1 2-2z"/>
                    <circle cx="9" cy="14" r="1"/>
                    <circle cx="15" cy="14" r="1"/>
                </svg>
            </div>
            <div class="message-content">
                Hello! I'm AtlaswebX AI assistant. I can redesign this page, remove clutter, change colors, or transform any website to match your style. What would you like to create today?
            </div>
        `;
        this.aiMessages.appendChild(welcome);
    }

    /**
     * Clear chat for current domain
     */
    clearCurrentChat() {
        if (this.currentDomain) {
            delete this.chatHistory[this.currentDomain];
            this.saveChatHistory();
            this.loadDomainChat(this.currentDomain);
        }
    }

    /**
     * Add user message to chat
     */
    addUserMessage(message, saveToHistory = true) {
        const userMessage = document.createElement('div');
        userMessage.className = 'ai-message user';
        userMessage.innerHTML = `
            <div class="message-avatar">👤</div>
            <div class="message-content">${this.escapeHtml(message)}</div>
        `;
        this.aiMessages.appendChild(userMessage);
        
        // Save to history
        if (saveToHistory && this.currentDomain) {
            if (!this.chatHistory[this.currentDomain]) {
                this.chatHistory[this.currentDomain] = [];
            }
            this.chatHistory[this.currentDomain].push({ type: 'user', content: message });
            this.saveChatHistory();
        }
        
        this.scrollToBottom();
    }

    /**
     * Show loading indicator
     */
    showLoading() {
        this.loadingMessage = document.createElement('div');
        this.loadingMessage.className = 'ai-message assistant loading';
        this.loadingMessage.innerHTML = `
            <div class="message-avatar">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7h1a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1v1a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-1H2a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h1a7 7 0 0 1 7-7h1V5.73c-.6-.34-1-.99-1-1.73a2 2 0 0 1 2-2z"/>
                    <circle cx="9" cy="14" r="1"/>
                    <circle cx="15" cy="14" r="1"/>
                </svg>
            </div>
            <div class="message-content">
                <div class="typing-indicator">
                    <span></span><span></span><span></span>
                </div>
            </div>
        `;
        this.aiMessages.appendChild(this.loadingMessage);
        this.scrollToBottom();
    }

    /**
     * Remove loading indicator
     */
    hideLoading() {
        if (this.loadingMessage) {
            this.loadingMessage.remove();
            this.loadingMessage = null;
        }
    }

    /**
     * Add AI response message
     */
    addAIMessage(message, saveToHistory = true) {
        const aiMessage = document.createElement('div');
        aiMessage.className = 'ai-message assistant';
        aiMessage.innerHTML = `
            <div class="message-avatar">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7h1a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1v1a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-1H2a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h1a7 7 0 0 1 7-7h1V5.73c-.6-.34-1-.99-1-1.73a2 2 0 0 1 2-2z"/>
                    <circle cx="9" cy="14" r="1"/>
                    <circle cx="15" cy="14" r="1"/>
                </svg>
            </div>
            <div class="message-content">${this.escapeHtml(message)}</div>
        `;
        this.aiMessages.appendChild(aiMessage);
        
        // Save to history
        if (saveToHistory && this.currentDomain) {
            if (!this.chatHistory[this.currentDomain]) {
                this.chatHistory[this.currentDomain] = [];
            }
            this.chatHistory[this.currentDomain].push({ type: 'ai', content: message });
            this.saveChatHistory();
        }
        
        this.scrollToBottom();
    }

    /**
     * Add actions display
     */
    addActionsDisplay(actions, domain, onSaveRule) {
        const actionsMessage = document.createElement('div');
        actionsMessage.className = 'ai-message assistant actions';
        actionsMessage.innerHTML = `
            <div class="message-avatar">⚡</div>
            <div class="message-content">
                <div class="actions-header">Applied ${actions.length} modification(s):</div>
                <ul class="actions-list">
                    ${actions.map(action => `
                        <li>${this.escapeHtml(action.description || action.type)}</li>
                    `).join('')}
                </ul>
                <div class="save-rule-btn" style="cursor: pointer; padding: 8px 12px; background: #0066ff; border-radius: 4px; margin-top: 10px; text-align: center; user-select: none;">💾 Save as Rule</div>
            </div>
        `;
        this.aiMessages.appendChild(actionsMessage);
        
        // Add save rule handler
        const saveBtn = actionsMessage.querySelector('.save-rule-btn');
        console.log('🔘 Save button element:', saveBtn);
        if (saveBtn) {
            console.log('✅ Attaching click handler to save button');
            saveBtn.addEventListener('click', () => {
                console.log('🖱️ Save button clicked!');
                
                // Auto-generate rule name based on first action
                const firstAction = actions[0];
                const ruleName = `${firstAction.type} - ${new Date().toLocaleString()}`;
                
                onSaveRule(domain, ruleName, actions);
                saveBtn.textContent = '✅ Rule Saved!';
                saveBtn.style.opacity = '0.5';
                saveBtn.style.pointerEvents = 'none';
                
                this.addNotification(`Rule saved for ${domain}. It will auto-apply on future visits!`);
            });
        }
        
        this.scrollToBottom();
    }

    /**
     * Add notification message
     */
    addNotification(message) {
        const notification = document.createElement('div');
        notification.className = 'ai-message assistant';
        notification.innerHTML = `
            <div class="message-avatar">💾</div>
            <div class="message-content">${this.escapeHtml(message)}</div>
        `;
        this.aiMessages.appendChild(notification);
        this.scrollToBottom();
    }

    /**
     * Add error message
     */
    addError(error) {
        const errorMessage = document.createElement('div');
        errorMessage.className = 'ai-message assistant error';
        errorMessage.innerHTML = `
            <div class="message-avatar">⚠️</div>
            <div class="message-content">${this.escapeHtml(error)}</div>
        `;
        this.aiMessages.appendChild(errorMessage);
        this.scrollToBottom();
    }

    /**
     * Clear input
     */
    clearInput() {
        this.aiInput.value = '';
    }

    /**
     * Scroll to bottom
     */
    scrollToBottom() {
        this.aiMessages.scrollTop = this.aiMessages.scrollHeight;
    }

    /**
     * Show custom input dialog (since prompt() doesn't work in Electron)
     */
    showInputDialog(message, callback) {
        console.log('📝 Creating input dialog:', message);
        // Create overlay
        const overlay = document.createElement('div');
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.8);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 999999;
        `;
        
        // Create dialog
        const dialog = document.createElement('div');
        dialog.style.cssText = `
            background: #2a2a2a;
            border-radius: 8px;
            padding: 20px;
            min-width: 300px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
        `;
        
        dialog.innerHTML = `
            <div style="color: #fff; margin-bottom: 15px; font-size: 14px;">${message}</div>
            <input type="text" id="rule-name-input" style="
                width: 100%;
                padding: 8px;
                border: 1px solid #444;
                border-radius: 4px;
                background: #1a1a1a;
                color: #fff;
                font-size: 14px;
                box-sizing: border-box;
            " placeholder="e.g., Dark Mode">
            <div style="display: flex; gap: 10px; margin-top: 15px; justify-content: flex-end;">
                <button id="cancel-btn" style="
                    padding: 8px 16px;
                    border: 1px solid #444;
                    border-radius: 4px;
                    background: #333;
                    color: #fff;
                    cursor: pointer;
                    font-size: 14px;
                ">Cancel</button>
                <button id="save-btn" style="
                    padding: 8px 16px;
                    border: none;
                    border-radius: 4px;
                    background: #0066ff;
                    color: #fff;
                    cursor: pointer;
                    font-size: 14px;
                ">Save</button>
            </div>
        `;
        
        overlay.appendChild(dialog);
        document.body.appendChild(overlay);
        console.log('✅ Dialog added to body');
        console.log('🔍 Body element:', document.body);
        console.log('🔍 Overlay parent:', overlay.parentElement);
        console.log('🔍 Overlay computed style:', window.getComputedStyle(overlay).display);
        
        const input = dialog.querySelector('#rule-name-input');
        const saveBtn = dialog.querySelector('#save-btn');
        const cancelBtn = dialog.querySelector('#cancel-btn');
        
        console.log('🔍 Dialog elements:', {input, saveBtn, cancelBtn});
        
        // Force visibility
        overlay.style.display = 'flex';
        overlay.style.visibility = 'visible';
        overlay.style.opacity = '1';
        
        // Make dialog even more visible with a border
        dialog.style.border = '3px solid #0066ff';
        dialog.style.boxShadow = '0 0 50px rgba(0, 102, 255, 0.5)';
        
        console.log('👀 Dialog should be visible now! Check the main window.');
        
        // Focus input
        setTimeout(() => {
            input.focus();
            input.select();
            console.log('⌨️ Input focused and selected');
        }, 100);
        
        // Handle save
        const handleSave = () => {
            const value = input.value.trim();
            overlay.remove();
            callback(value);
        };
        
        // Handle cancel
        const handleCancel = () => {
            overlay.remove();
            callback(null);
        };
        
        saveBtn.addEventListener('click', handleSave);
        cancelBtn.addEventListener('click', handleCancel);
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') handleSave();
            if (e.key === 'Escape') handleCancel();
        });
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) handleCancel();
        });
    }

    /**
     * Escape HTML
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Export for use in renderer
if (typeof window !== 'undefined') {
    window.AIUIHandler = AIUIHandler;
}
