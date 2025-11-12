/**
 * AI Model Switcher - Handles provider and model selection
 * Integrates with AIManager to switch between ChatGPT, Claude, Gemini, DeepSeek
 */

class AIModelSwitcher {
    constructor() {
        this.providerSelect = document.getElementById('ai-provider-select');
        this.modelSelect = document.getElementById('ai-model-select');
        this.modelBadge = document.querySelector('.ai-model-badge');
        
        // Model configurations from config.js
        this.modelConfigs = {
            chatgpt: {
                name: 'ChatGPT',
                models: [
                    { value: 'gpt-4o', label: 'GPT-4o' },
                    { value: 'gpt-4o-mini', label: 'GPT-4o-mini' },
                    { value: 'gpt-4-turbo', label: 'GPT-4 Turbo' },
                    { value: 'gpt-4', label: 'GPT-4' },
                    { value: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo' },
                    { value: 'o1', label: 'O1' },
                    { value: 'o1-mini', label: 'O1-mini' },
                    { value: 'o3-mini', label: 'O3-mini' },
                    { value: 'gpt-5-preview', label: 'GPT-5 Preview' },
                    { value: 'gpt-5', label: 'GPT-5' }
                ]
            },
            claude: {
                name: 'Claude',
                models: [
                    { value: 'claude-3-5-sonnet-20241022', label: 'Claude 3.5 Sonnet (Latest)' },
                    { value: 'claude-3-5-sonnet-20240620', label: 'Claude 3.5 Sonnet' },
                    { value: 'claude-3-opus-20240229', label: 'Claude 3 Opus' },
                    { value: 'claude-3-sonnet-20240229', label: 'Claude 3 Sonnet' },
                    { value: 'claude-3-haiku-20240307', label: 'Claude 3 Haiku' }
                ]
            },
            gemini: {
                name: 'Gemini',
                models: [
                    { value: 'gemini-2.0-flash-exp', label: 'Gemini 2.0 Flash (Latest)' },
                    { value: 'gemini-1.5-pro', label: 'Gemini 1.5 Pro' },
                    { value: 'gemini-1.5-flash', label: 'Gemini 1.5 Flash' },
                    { value: 'gemini-pro', label: 'Gemini Pro' },
                    { value: 'gemini-pro-vision', label: 'Gemini Pro Vision' }
                ]
            },
            deepseek: {
                name: 'DeepSeek',
                models: [
                    { value: 'deepseek-chat', label: 'DeepSeek Chat' },
                    { value: 'deepseek-reasoner', label: 'DeepSeek Reasoner' }
                ]
            },
            kimi: {
                name: 'Kimi',
                models: [
                    { value: 'moonshot-v1-8k', label: 'Moonshot v1 8K' },
                    { value: 'moonshot-v1-32k', label: 'Moonshot v1 32K' },
                    { value: 'moonshot-v1-128k', label: 'Moonshot v1 128K' }
                ]
            }
        };
        
        this.init();
    }

    init() {
        // Load saved selections
        this.loadSavedSelections();
        
        // Event listeners
        this.providerSelect?.addEventListener('change', () => this.onProviderChange());
        this.modelSelect?.addEventListener('change', () => this.onModelChange());
        
        console.log('✅ AI Model Switcher initialized');
    }

    loadSavedSelections() {
        try {
            const saved = JSON.parse(localStorage.getItem('ai-model-selections') || '{}');
            const currentProvider = localStorage.getItem('ai-current-provider') || 'chatgpt';
            
            // Set provider
            if (this.providerSelect && this.modelConfigs[currentProvider]) {
                this.providerSelect.value = currentProvider;
            }
            
            // Update models dropdown for current provider
            this.updateModelsDropdown(currentProvider);
            
            // Set saved model for this provider
            if (saved[currentProvider] && this.modelSelect) {
                this.modelSelect.value = saved[currentProvider];
            }
            
            // Update badge
            this.updateBadge();
            
            console.log('✅ Loaded AI selections:', { provider: currentProvider, model: saved[currentProvider] });
        } catch (error) {
            console.error('Failed to load AI selections:', error);
        }
    }

    updateModelsDropdown(provider) {
        if (!this.modelSelect || !this.modelConfigs[provider]) return;
        
        // Clear current options
        this.modelSelect.innerHTML = '';
        
        // Add new options for selected provider
        const models = this.modelConfigs[provider].models;
        models.forEach(model => {
            const option = document.createElement('option');
            option.value = model.value;
            option.textContent = model.label;
            this.modelSelect.appendChild(option);
        });
        
        console.log(`✅ Updated models dropdown for ${provider} (${models.length} models)`);
    }

    onProviderChange() {
        const provider = this.providerSelect.value;
        
        // Save current provider
        localStorage.setItem('ai-current-provider', provider);
        
        // Update models dropdown
        this.updateModelsDropdown(provider);
        
        // Load saved model for this provider or use first model
        const savedSelections = JSON.parse(localStorage.getItem('ai-model-selections') || '{}');
        if (savedSelections[provider]) {
            this.modelSelect.value = savedSelections[provider];
        } else {
            // Select first model by default
            const firstModel = this.modelConfigs[provider].models[0].value;
            this.modelSelect.value = firstModel;
            this.saveModelSelection(provider, firstModel);
        }
        
        // Update badge
        this.updateBadge();
        
        // Notify AIManager
        this.notifyAIManager(provider, this.modelSelect.value);
        
        console.log(`✅ Switched to provider: ${provider}`);
    }

    onModelChange() {
        const provider = this.providerSelect.value;
        const model = this.modelSelect.value;
        
        // Save selection
        this.saveModelSelection(provider, model);
        
        // Update badge
        this.updateBadge();
        
        // Notify AIManager
        this.notifyAIManager(provider, model);
        
        console.log(`✅ Switched to model: ${model}`);
    }

    saveModelSelection(provider, model) {
        try {
            const selections = JSON.parse(localStorage.getItem('ai-model-selections') || '{}');
            selections[provider] = model;
            localStorage.setItem('ai-model-selections', JSON.stringify(selections));
            console.log('💾 Saved model selection:', { provider, model });
        } catch (error) {
            console.error('Failed to save model selection:', error);
        }
    }

    updateBadge() {
        if (!this.modelBadge) return;
        
        const provider = this.providerSelect.value;
        const model = this.modelSelect.value;
        
        // Get friendly model name
        const modelConfig = this.modelConfigs[provider];
        const modelInfo = modelConfig.models.find(m => m.value === model);
        const displayName = modelInfo ? modelInfo.label : model;
        
        this.modelBadge.textContent = displayName;
    }

    notifyAIManager(provider, model) {
        // Send IPC message to main process to update AIManager
        try {
            const { ipcRenderer } = require('electron');
            ipcRenderer.send('update-ai-model', { provider, model });
            console.log('📡 Notified AIManager:', { provider, model });
        } catch (error) {
            console.warn('Could not notify AIManager (renderer context):', error.message);
        }
        
        // Also update window.aiManager if available (for renderer-side usage)
        if (window.aiManager) {
            window.aiManager.setProvider(provider);
            window.aiManager.setModel(provider, model);
            console.log('✅ Updated window.aiManager:', { provider, model });
        }
        
        // Update router if using AIV2Router
        if (window.aiV2Chat && window.aiV2Chat.router) {
            // Router will use the updated model automatically on next request
            console.log('✅ AI router will use new model on next request');
        }
    }

    getCurrentSelection() {
        return {
            provider: this.providerSelect?.value || 'chatgpt',
            model: this.modelSelect?.value || 'gpt-4o-mini'
        };
    }
}

// Initialize when DOM is ready
if (typeof window !== 'undefined') {
    window.aiModelSwitcher = null;
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            window.aiModelSwitcher = new AIModelSwitcher();
        });
    } else {
        window.aiModelSwitcher = new AIModelSwitcher();
    }
}
