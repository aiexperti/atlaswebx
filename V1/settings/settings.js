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

// Load saved settings
function loadSettings() {
    const settings = JSON.parse(localStorage.getItem('lenoir-settings') || '{}');
    
    // General
    if (settings.siteName) {
        document.getElementById('site-name').value = settings.siteName;
    }
    if (settings.homepage) {
        document.getElementById('homepage').value = settings.homepage;
    }
    
    // Wallpaper
    if (settings.wallpaper) {
        document.querySelectorAll('.wallpaper-option').forEach(option => {
            option.classList.remove('active');
            if (option.getAttribute('data-wallpaper') === settings.wallpaper) {
                option.classList.add('active');
            }
        });
        
        // Load custom wallpaper preview if exists
        if (settings.wallpaper === 'custom') {
            const customImage = localStorage.getItem('custom-wallpaper');
            if (customImage) {
                const customPreview = document.getElementById('custom-preview');
                customPreview.style.backgroundImage = `url(${customImage})`;
                customPreview.classList.add('has-image');
            }
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
    });
});

// Save settings
document.getElementById('save-btn').addEventListener('click', () => {
    const settings = {
        siteName: document.getElementById('site-name').value,
        homepage: document.getElementById('homepage').value,
        wallpaper: document.querySelector('.wallpaper-option.active')?.getAttribute('data-wallpaper') || 'gradient-purple',
        searchEngine: document.querySelector('input[name="search-engine"]:checked')?.value || 'google',
        aiModel: document.querySelector('input[name="ai-model"]:checked')?.value || 'gpt-4',
        aiApiKey: document.getElementById('ai-api-key').value,
        language: document.getElementById('language-select').value
    };
    
    localStorage.setItem('lenoir-settings', JSON.stringify(settings));
    
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
        localStorage.removeItem('lenoir-settings');
        location.reload();
    }
});

// Notification
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
    const settings = JSON.parse(localStorage.getItem('lenoir-settings') || '{}');
    const lang = settings.language || 'en';
    applyTranslations(lang);
}

// Initialize
loadSettings();
loadLanguage();
updateRadioOptions('search-engine');
updateRadioOptions('ai-model');
