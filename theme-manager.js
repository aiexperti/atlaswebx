/**
 * Theme Manager - Handle theme switching between Standard and Neo-Brutalist
 */

class ThemeManager {
    constructor() {
        this.currentTheme = 'standard';
        this.themeBtn = null;
        this.init();
    }

    init() {
        // Load saved theme from localStorage
        const savedTheme = localStorage.getItem('lenoir-theme') || 'standard';
        this.setTheme(savedTheme, false);

        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                this.setupThemeButton();
            });
        } else {
            this.setupThemeButton();
        }

        console.log('✅ Theme Manager initialized');
    }

    setupThemeButton() {
        this.themeBtn = document.getElementById('ai-theme-btn');
        
        if (this.themeBtn) {
            this.themeBtn.addEventListener('click', () => {
                this.toggleTheme();
            });

            // Update button state
            this.updateButtonState();
        }
    }

    toggleTheme() {
        const newTheme = this.currentTheme === 'standard' ? 'brutalist' : 'standard';
        this.setTheme(newTheme, true);
    }

    setTheme(theme, showNotification = false) {
        this.currentTheme = theme;
        
        // Update HTML root element
        const root = document.documentElement;
        root.setAttribute('data-theme', theme);
        
        // Update body element
        document.body.setAttribute('data-theme', theme);
        
        // Save to localStorage
        localStorage.setItem('lenoir-theme', theme);
        
        // Update button state
        this.updateButtonState();
        
        // Show notification if requested
        if (showNotification) {
            this.showThemeNotification(theme);
        }
        
        console.log(`🎨 Theme changed to: ${theme}`);
    }

    updateButtonState() {
        if (!this.themeBtn) return;
        
        // Remove all theme classes
        this.themeBtn.classList.remove('brutalist-active', 'glass-active');
        
        // Add appropriate class based on current theme
        if (this.currentTheme === 'brutalist') {
            this.themeBtn.classList.add('brutalist-active');
            this.themeBtn.title = 'Current: Neo-Brutalist Theme';
        } else if (this.currentTheme === 'glass') {
            this.themeBtn.classList.add('glass-active');
            this.themeBtn.title = 'Current: Neo Glass Theme';
        } else {
            this.themeBtn.title = 'Current: Standard Theme';
        }
    }

    showThemeNotification(theme) {
        // Get AI chat instance if available
        const aiChat = window.aiV2Chat;
        if (aiChat) {
            const themeNames = {
                'standard': 'Standard',
                'brutalist': 'Neo-Brutalist',
                'glass': 'Neo Glass Modern'
            };
            const themeName = themeNames[theme] || 'Standard';
            aiChat.addAssistantMessage(`🎨 Theme changed to **${themeName}**!`);
        }
    }

    getCurrentTheme() {
        return this.currentTheme;
    }
}

// Initialize theme manager
if (typeof window !== 'undefined') {
    window.themeManager = new ThemeManager();
}
