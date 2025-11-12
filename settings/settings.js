const { ipcRenderer } = require('electron');

// Window Controls
document.getElementById('minimize').addEventListener('click', () => {
    ipcRenderer.send('settings-window-minimize');
});

document.getElementById('close').addEventListener('click', () => {
    ipcRenderer.send('settings-window-close');
});

// Navigation
const navItems = document.querySelectorAll('.nav-item');
const sections = document.querySelectorAll('.settings-section');

navItems.forEach(item => {
    item.addEventListener('click', (e) => {
        e.preventDefault();
        const sectionId = item.getAttribute('data-section');
        
        // Update active nav item
        navItems.forEach(nav => nav.classList.remove('active'));
        item.classList.add('active');
        
        // Show corresponding section
        sections.forEach(section => section.classList.remove('active'));
        document.getElementById(sectionId).classList.add('active');
    });
});

// Load wallpapers from folder
async function loadWallpapersFromFolder() {
    const fs = require('fs');
    const path = require('path');
    const wallpaperDir = path.join(__dirname, '../wallpaper');
    
    try {
        const files = fs.readdirSync(wallpaperDir);
        const imageFiles = files.filter(file => {
            const ext = path.extname(file).toLowerCase();
            return ['.jpg', '.jpeg', '.png', '.webp', '.gif'].includes(ext);
        });
        
        console.log('📁 Found wallpapers:', imageFiles);
        
        // Get wallpaper grid container
        const wallpaperGrid = document.querySelector('.wallpaper-grid');
        
        // Find the custom wallpaper option to insert before it
        const customOption = document.querySelector('.wallpaper-option[data-wallpaper="custom"]');
        
        // Add each image as a wallpaper option
        imageFiles.forEach((file, index) => {
            const wallpaperPath = path.join(wallpaperDir, file);
            const wallpaperId = `wallpaper-${index}`;
            const displayName = file.replace(/\.(jpg|jpeg|png|webp|gif)$/i, '').replace(/[-_]/g, ' ');
            
            const option = document.createElement('div');
            option.className = 'wallpaper-option';
            option.setAttribute('data-wallpaper', wallpaperId);
            option.setAttribute('data-wallpaper-path', wallpaperPath);
            
            // Set first image as default if no wallpaper is selected
            if (index === 0 && !localStorage.getItem('atlaswebx-settings')) {
                option.classList.add('active');
            }
            
            option.innerHTML = `
                <div class="wallpaper-preview" style="background-image: url('file://${wallpaperPath}'); background-size: cover; background-position: center;"></div>
                <span>${displayName}</span>
            `;
            
            // Insert before custom option
            wallpaperGrid.insertBefore(option, customOption);
            
            // Add click handler
            option.addEventListener('click', () => {
                document.querySelectorAll('.wallpaper-option').forEach(opt => opt.classList.remove('active'));
                option.classList.add('active');
                autoSaveSettings();
            });
        });
        
        return imageFiles.length > 0 ? `wallpaper-0` : 'gradient-purple';
    } catch (error) {
        console.error('Error loading wallpapers:', error);
        return 'gradient-purple';
    }
}

// Load saved settings
async function loadSettings() {
    // Load wallpapers from folder first
    const defaultWallpaper = await loadWallpapersFromFolder();
    
    const settings = JSON.parse(localStorage.getItem('atlaswebx-settings') || '{}');
    
    // General
    if (settings.siteName) {
        document.getElementById('site-name').value = settings.siteName;
    }
    if (settings.homepage) {
        document.getElementById('homepage').value = settings.homepage;
    }
    
    // Wallpaper
    const selectedWallpaper = settings.wallpaper || defaultWallpaper;
    document.querySelectorAll('.wallpaper-option').forEach(option => {
        option.classList.remove('active');
        if (option.getAttribute('data-wallpaper') === selectedWallpaper) {
            option.classList.add('active');
        }
    });
    
    // Load custom wallpaper preview if exists
    if (selectedWallpaper === 'custom') {
        const customImage = localStorage.getItem('custom-wallpaper');
        if (customImage) {
            const customPreview = document.getElementById('custom-preview');
            customPreview.style.backgroundImage = `url(${customImage})`;
            customPreview.classList.add('has-image');
        }
    }
    
    // Search Engine
    if (settings.searchEngine) {
        const radio = document.querySelector(`input[name="search-engine"][value="${settings.searchEngine}"]`);
        if (radio) {
            radio.checked = true;
            updateRadioOptions('search-engine');
        }
    }
    
    // AI Model
    if (settings.aiModel) {
        const radio = document.querySelector(`input[name="ai-model"][value="${settings.aiModel}"]`);
        if (radio) {
            radio.checked = true;
            updateRadioOptions('ai-model');
        }
    }
    if (settings.aiApiKey) {
        document.getElementById('ai-api-key').value = settings.aiApiKey;
    }
    
    // Language
    if (settings.language) {
        document.getElementById('language-select').value = settings.language;
    }
}

// Auto-save function
function autoSaveSettings() {
    const activeWallpaper = document.querySelector('.wallpaper-option.active');
    const wallpaperId = activeWallpaper?.getAttribute('data-wallpaper') || 'gradient-purple';
    const wallpaperPath = activeWallpaper?.getAttribute('data-wallpaper-path') || null;
    
    const settings = {
        siteName: document.getElementById('site-name').value,
        homepage: document.getElementById('homepage').value,
        wallpaper: wallpaperId,
        wallpaperPath: wallpaperPath,
        searchEngine: document.querySelector('input[name="search-engine"]:checked')?.value || 'google',
        aiModel: document.querySelector('input[name="ai-model"]:checked')?.value || 'gpt-4',
        language: document.getElementById('language-select').value
    };
    
    localStorage.setItem('atlaswebx-settings', JSON.stringify(settings));
    
    // Send settings to main window
    ipcRenderer.send('settings-updated', settings);
    
    // Show subtle save indicator
    showAutoSaveIndicator();
    
    console.log('⚡ Settings auto-saved');
}

// Wallpaper selection
document.querySelectorAll('.wallpaper-option').forEach(option => {
    option.addEventListener('click', () => {
        const wallpaper = option.getAttribute('data-wallpaper');
        
        // If custom wallpaper, trigger file upload
        if (wallpaper === 'custom') {
            document.getElementById('wallpaper-upload').click();
            return;
        }
        
        document.querySelectorAll('.wallpaper-option').forEach(opt => opt.classList.remove('active'));
        option.classList.add('active');
        
        // Auto-save
        autoSaveSettings();
    });
});

// Handle custom wallpaper upload
document.getElementById('wallpaper-upload').addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
        const imageData = event.target.result;
        
        // Update preview
        const customPreview = document.getElementById('custom-preview');
        customPreview.style.backgroundImage = `url(${imageData})`;
        customPreview.classList.add('has-image');
        
        // Select custom wallpaper
        document.querySelectorAll('.wallpaper-option').forEach(opt => opt.classList.remove('active'));
        document.querySelector('.wallpaper-option[data-wallpaper="custom"]').classList.add('active');
        
        // Store image data
        localStorage.setItem('custom-wallpaper', imageData);
        
        // Auto-save
        autoSaveSettings();
    };
    reader.readAsDataURL(file);
});

// Radio options styling
function updateRadioOptions(name) {
    const radios = document.querySelectorAll(`input[name="${name}"]`);
    radios.forEach(radio => {
        const label = radio.closest('.radio-option');
        if (radio.checked) {
            label.classList.add('active');
        } else {
            label.classList.remove('active');
        }
    });
}

document.querySelectorAll('input[type="radio"]').forEach(radio => {
    radio.addEventListener('change', () => {
        updateRadioOptions(radio.name);
        // Auto-save
        autoSaveSettings();
    });
});

// Auto-save on text input changes (with debounce)
let autoSaveTimeout;
function debounceAutoSave() {
    clearTimeout(autoSaveTimeout);
    autoSaveTimeout = setTimeout(() => {
        autoSaveSettings();
    }, 500); // Wait 500ms after user stops typing
}

// Add auto-save to text inputs
document.getElementById('site-name')?.addEventListener('input', debounceAutoSave);
document.getElementById('homepage')?.addEventListener('input', debounceAutoSave);

// Add auto-save to language select
document.getElementById('language-select')?.addEventListener('change', () => {
    autoSaveSettings();
    // Apply translations immediately
    const settings = JSON.parse(localStorage.getItem('atlaswebx-settings') || '{}');
    applyTranslations(settings.language);
});

// Save settings
document.getElementById('save-btn').addEventListener('click', () => {
    const activeWallpaper = document.querySelector('.wallpaper-option.active');
    const wallpaperId = activeWallpaper?.getAttribute('data-wallpaper') || 'gradient-purple';
    const wallpaperPath = activeWallpaper?.getAttribute('data-wallpaper-path') || null;
    
    const settings = {
        siteName: document.getElementById('site-name').value,
        homepage: document.getElementById('homepage').value,
        wallpaper: wallpaperId,
        wallpaperPath: wallpaperPath,
        searchEngine: document.querySelector('input[name="search-engine"]:checked')?.value || 'google',
        aiModel: document.querySelector('input[name="ai-model"]:checked')?.value || 'gpt-4',
        language: document.getElementById('language-select').value
    };
    
    localStorage.setItem('atlaswebx-settings', JSON.stringify(settings));
    
    // Save AI settings separately
    saveAISettings();
    
    // Apply translations immediately if language changed
    applyTranslations(settings.language);
    
    // Send settings to main window
    ipcRenderer.send('settings-updated', settings);
    
    // Show success message
    const successMsg = t('settings.saved', settings.language);
    showNotification(successMsg);
});

// Reset settings
document.getElementById('reset-btn').addEventListener('click', () => {
    if (confirm('Are you sure you want to reset all settings to defaults?')) {
        localStorage.removeItem('atlaswebx-settings');
        location.reload();
    }
});

// Auto-save indicator (subtle)
function showAutoSaveIndicator() {
    // Remove existing indicator
    const existing = document.getElementById('auto-save-indicator');
    if (existing) existing.remove();
    
    const indicator = document.createElement('div');
    indicator.id = 'auto-save-indicator';
    indicator.style.cssText = `
        position: fixed;
        top: 24px;
        right: 24px;
        background: rgba(74, 158, 255, 0.9);
        color: white;
        padding: 8px 16px;
        border-radius: 6px;
        font-size: 13px;
        font-weight: 500;
        box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        z-index: 1000;
        animation: fadeInOut 1.5s ease;
        display: flex;
        align-items: center;
        gap: 8px;
    `;
    indicator.innerHTML = `
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="20 6 9 17 4 12"/>
        </svg>
        Saved
    `;
    document.body.appendChild(indicator);
    
    setTimeout(() => indicator.remove(), 1500);
}

// Notification (for manual save)
function showNotification(message) {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 24px;
        right: 24px;
        background: #4a9eff;
        color: white;
        padding: 16px 24px;
        border-radius: 8px;
        font-size: 15px;
        font-weight: 500;
        box-shadow: 0 8px 24px rgba(0,0,0,0.3);
        z-index: 1000;
        animation: slideIn 0.3s ease;
    `;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Add animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
    @keyframes fadeInOut {
        0% {
            opacity: 0;
            transform: translateY(-10px);
        }
        20% {
            opacity: 1;
            transform: translateY(0);
        }
        80% {
            opacity: 1;
            transform: translateY(0);
        }
        100% {
            opacity: 0;
            transform: translateY(-10px);
        }
    }
`;
document.head.appendChild(style);

// Apply translations to settings page
function applyTranslations(lang) {
    // Translate all elements with data-i18n
    document.querySelectorAll('[data-i18n]').forEach(element => {
        const key = element.getAttribute('data-i18n');
        element.textContent = t(key, lang);
    });
    
    // Translate placeholders
    document.querySelectorAll('[data-i18n-placeholder]').forEach(element => {
        const key = element.getAttribute('data-i18n-placeholder');
        element.placeholder = t(key, lang);
    });
    
    console.log(`Settings page translated to: ${lang}`);
}

// Load and apply current language
function loadLanguage() {
    const settings = JSON.parse(localStorage.getItem('atlaswebx-settings') || '{}');
    const lang = settings.language || 'en';
    applyTranslations(lang);
}

// Auto-save AI settings on input changes (with debounce)
let aiAutoSaveTimeout;
function debounceAISave() {
    clearTimeout(aiAutoSaveTimeout);
    aiAutoSaveTimeout = setTimeout(() => {
        saveAISettings();
        showAutoSaveIndicator();
    }, 500); // Wait 500ms after user stops typing
}

// Add auto-save to AI settings inputs
document.getElementById('openai-api-key')?.addEventListener('input', debounceAISave);
document.getElementById('anthropic-api-key')?.addEventListener('input', debounceAISave);
document.getElementById('google-api-key')?.addEventListener('input', debounceAISave);

// Add auto-save to AI checkboxes
document.getElementById('ai-web-interaction')?.addEventListener('change', () => {
    saveAISettings();
    showAutoSaveIndicator();
});
document.getElementById('ai-auto-rules')?.addEventListener('change', () => {
    saveAISettings();
    showAutoSaveIndicator();
});

// AI Settings - API Keys
function loadAISettings() {
    console.log('📖 Loading AI settings from localStorage...');
    
    // Load from localStorage
    const aiSettings = JSON.parse(localStorage.getItem('ai-settings') || '{}');
    
    console.log('📖 Loaded AI settings:', {
        hasOpenAI: !!aiSettings.openaiKey,
        openaiKeyLength: aiSettings.openaiKey?.length || 0,
        hasAnthropic: !!aiSettings.anthropicKey,
        hasGoogle: !!aiSettings.googleKey
    });
    
    if (aiSettings.openaiKey) {
        document.getElementById('openai-api-key').value = aiSettings.openaiKey;
        console.log('✅ OpenAI key loaded into input field');
    } else {
        console.log('⚠️ No OpenAI key found in localStorage');
    }
    
    if (aiSettings.anthropicKey) {
        document.getElementById('anthropic-api-key').value = aiSettings.anthropicKey;
    }
    if (aiSettings.googleKey) {
        document.getElementById('google-api-key').value = aiSettings.googleKey;
    }
    if (aiSettings.deepseekKey) {
        document.getElementById('deepseek-api-key').value = aiSettings.deepseekKey;
    }
    if (aiSettings.kimiKey) {
        document.getElementById('kimi-api-key').value = aiSettings.kimiKey;
    }
    
    document.getElementById('ai-web-interaction').checked = !!aiSettings.webInteraction;
    document.getElementById('ai-auto-rules').checked = !!aiSettings.autoRules;
}

function saveAISettings() {
    const aiSettings = {
        openaiKey: document.getElementById('openai-api-key').value,
        anthropicKey: document.getElementById('anthropic-api-key').value,
        googleKey: document.getElementById('google-api-key').value,
        deepseekKey: document.getElementById('deepseek-api-key').value,
        kimiKey: document.getElementById('kimi-api-key').value,
        webInteraction: document.getElementById('ai-web-interaction').checked,
        autoRules: document.getElementById('ai-auto-rules').checked
    };
    
    console.log('💾 Saving AI settings to localStorage:', {
        hasOpenAI: !!aiSettings.openaiKey,
        openaiKeyLength: aiSettings.openaiKey?.length || 0,
        hasAnthropic: !!aiSettings.anthropicKey,
        hasGoogle: !!aiSettings.googleKey,
        hasDeepSeek: !!aiSettings.deepseekKey,
        hasKimi: !!aiSettings.kimiKey
    });
    
    // Save to localStorage
    localStorage.setItem('ai-settings', JSON.stringify(aiSettings));
    
    // Also save to atlaswebx-settings as backup
    const atlaswebxSettings = JSON.parse(localStorage.getItem('atlaswebx-settings') || '{}');
    atlaswebxSettings.openaiKey = aiSettings.openaiKey;
    atlaswebxSettings.anthropicKey = aiSettings.anthropicKey;
    atlaswebxSettings.googleKey = aiSettings.googleKey;
    atlaswebxSettings.deepseekKey = aiSettings.deepseekKey;
    atlaswebxSettings.kimiKey = aiSettings.kimiKey;
    localStorage.setItem('atlaswebx-settings', JSON.stringify(atlaswebxSettings));
    
    console.log('✅ AI settings saved to localStorage');
    
    // Send to main process to update AI manager
    ipcRenderer.send('update-ai-keys', aiSettings);
}

// Test API key connections
document.getElementById('test-openai')?.addEventListener('click', async () => {
    const key = document.getElementById('openai-api-key').value;
    if (!key) {
        showNotification('Please enter an API key', 'error');
        return;
    }
    
    const btn = document.getElementById('test-openai');
    btn.textContent = 'Testing...';
    btn.disabled = true;
    
    try {
        // Simple validation for now
        if (key.startsWith('sk-') && key.length > 20) {
            showNotification('OpenAI key format looks valid! ✓', 'success');
        } else {
            showNotification('Invalid key format. Should start with sk-', 'error');
        }
    } catch (error) {
        showNotification('Test failed: ' + error.message, 'error');
    }
    
    btn.textContent = 'Test Connection';
    btn.disabled = false;
});

document.getElementById('test-anthropic')?.addEventListener('click', async () => {
    const key = document.getElementById('anthropic-api-key').value;
    if (!key) {
        showNotification('Please enter an API key', 'error');
        return;
    }
    
    const btn = document.getElementById('test-anthropic');
    btn.textContent = 'Testing...';
    btn.disabled = true;
    
    try {
        // Simple validation for now
        if (key.startsWith('sk-ant-') && key.length > 20) {
            showNotification('Anthropic key format looks valid! ✓', 'success');
        } else {
            showNotification('Invalid key format. Should start with sk-ant-', 'error');
        }
    } catch (error) {
        showNotification('Test failed: ' + error.message, 'error');
    }
    
    btn.textContent = 'Test Connection';
    btn.disabled = false;
});

document.getElementById('test-google')?.addEventListener('click', async () => {
    const key = document.getElementById('google-api-key').value;
    if (!key) {
        showNotification('Please enter an API key', 'error');
        return;
    }
    
    const btn = document.getElementById('test-google');
    btn.textContent = 'Testing...';
    btn.disabled = true;
    
    try {
        // Simple validation for now
        if (key.startsWith('AI') && key.length > 20) {
            showNotification('Google AI key format looks valid! ✓', 'success');
        } else {
            showNotification('Invalid key format. Should start with AI', 'error');
        }
    } catch (error) {
        showNotification('Test failed: ' + error.message, 'error');
    }
    
    btn.textContent = 'Test Connection';
    btn.disabled = false;
});

document.getElementById('test-deepseek')?.addEventListener('click', async () => {
    const key = document.getElementById('deepseek-api-key').value;
    if (!key) {
        showNotification('Please enter an API key', 'error');
        return;
    }
    
    const btn = document.getElementById('test-deepseek');
    btn.textContent = 'Testing...';
    btn.disabled = true;
    
    try {
        // Simple validation for now
        if (key.startsWith('sk-') && key.length > 20) {
            showNotification('DeepSeek key format looks valid! ✓', 'success');
        } else {
            showNotification('Invalid key format. Should start with sk-', 'error');
        }
    } catch (error) {
        showNotification('Test failed: ' + error.message, 'error');
    }
    
    btn.textContent = 'Test Connection';
    btn.disabled = false;
});

document.getElementById('test-kimi')?.addEventListener('click', async () => {
    const key = document.getElementById('kimi-api-key').value;
    if (!key) {
        showNotification('Please enter an API key', 'error');
        return;
    }
    
    const btn = document.getElementById('test-kimi');
    btn.textContent = 'Testing...';
    btn.disabled = true;
    
    try {
        // Simple validation for now
        if (key.startsWith('sk-') && key.length > 20) {
            showNotification('Kimi key format looks valid! ✓', 'success');
        } else {
            showNotification('Invalid key format. Should start with sk-', 'error');
        }
    } catch (error) {
        showNotification('Test failed: ' + error.message, 'error');
    }
    
    btn.textContent = 'Test Connection';
    btn.disabled = false;
});

// Initialize
loadSettings();
loadLanguage();
loadAISettings();
updateRadioOptions('search-engine');
updateRadioOptions('ai-model');
