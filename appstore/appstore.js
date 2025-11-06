// App Store Manager
let currentCountry = 'us';
let currentCategory = 'top-free';
let currentLimit = 25;
let appsData = [];

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    initializeEventListeners();
    loadApps();
});

// Event Listeners
function initializeEventListeners() {
    const { ipcRenderer } = require('electron');
    
    // Windows controls
    document.getElementById('minimize-win-btn').addEventListener('click', () => {
        ipcRenderer.send('appstore-window-minimize');
    });
    
    document.getElementById('maximize-win-btn').addEventListener('click', () => {
        ipcRenderer.send('appstore-window-maximize');
    });
    
    document.getElementById('close-win-btn').addEventListener('click', () => {
        window.close();
    });
    
    // Back button - close window
    document.getElementById('back-btn').addEventListener('click', () => {
        window.close();
    });

    // Country selector
    document.getElementById('country-select').addEventListener('change', (e) => {
        currentCountry = e.target.value;
        loadApps();
    });

    // Category buttons - search by category name
    document.querySelectorAll('.category-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));
            e.currentTarget.classList.add('active');
            const categoryName = e.currentTarget.textContent.trim();
            document.getElementById('apps-title').textContent = categoryName;
            searchApps(categoryName);
        });
    });

    // Limit selector
    document.getElementById('limit-select').addEventListener('change', (e) => {
        currentLimit = parseInt(e.target.value);
        loadApps();
    });

    // Search
    let searchTimeout;
    document.getElementById('search-input').addEventListener('input', (e) => {
        clearTimeout(searchTimeout);
        const query = e.target.value.trim();
        
        searchTimeout = setTimeout(() => {
            if (query.length > 0) {
                // Search using iTunes API
                searchApps(query);
            } else {
                // Show original list
                loadApps();
            }
        }, 500);
    });

    // Modal close
    document.getElementById('modal-close').addEventListener('click', closeModal);
    document.getElementById('modal-overlay').addEventListener('click', closeModal);

    // Retry button
    document.getElementById('retry-btn').addEventListener('click', loadApps);
}

// Search apps using iTunes Search API
async function searchApps(query) {
    showLoading();
    hideError();
    
    // Update title
    document.getElementById('apps-title').textContent = `Search Results for "${query}"`;
    
    try {
        const url = `https://itunes.apple.com/search?entity=software&country=${currentCountry}&term=${encodeURIComponent(query)}&limit=${currentLimit}`;
        
        console.log('Searching:', url);
        
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data && data.results) {
            appsData = data.results;
            console.log(`Found ${appsData.length} apps for "${query}"`);
            renderApps(appsData);
        } else {
            throw new Error('Invalid data structure');
        }
        
    } catch (error) {
        console.error('Error searching apps:', error);
        showError();
    } finally {
        hideLoading();
    }
}

// Load apps from Apple RSS API (Top Free)
async function loadApps() {
    showLoading();
    hideError();

    try {
        const url = `https://rss.applemarketingtools.com/api/v2/${currentCountry}/apps/${currentCategory}/${currentLimit}/apps.json`;
        
        console.log('Fetching from:', url);
        
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data && data.feed && data.feed.results) {
            appsData = data.feed.results;
            renderApps(appsData);
        } else {
            throw new Error('Invalid data structure');
        }
        
    } catch (error) {
        console.error('Error loading apps:', error);
        showError();
    } finally {
        hideLoading();
    }
}

// Render apps grid
function renderApps(apps) {
    const grid = document.getElementById('apps-grid');
    grid.innerHTML = '';

    if (apps.length === 0) {
        grid.innerHTML = '<p style="text-align: center; padding: 40px; color: rgba(255,255,255,0.7);">No apps found</p>';
        return;
    }

    apps.forEach((app, index) => {
        const card = createAppCard(app, index + 1);
        grid.appendChild(card);
    });
}

// Create app card
function createAppCard(app, rank) {
    const card = document.createElement('div');
    card.className = 'app-card';
    
    // Get rating - RSS feed doesn't include ratings, only Search API does
    // For RSS feed apps, ratings will be fetched when viewing details
    const rating = app.averageUserRating || 0;
    const ratingCount = app.userRatingCount || 0;
    
    // Handle different API formats
    const appName = app.trackName || app.name || 'Unknown App';
    const appDeveloper = app.artistName || app.sellerName || 'Unknown';
    const appIcon = app.artworkUrl100 || '';
    
    // Get category - handle both RSS feed (genres array with objects) and Search API (genres array of strings)
    let category = 'App';
    if (app.genres && app.genres.length > 0) {
        if (typeof app.genres[0] === 'string') {
            // Search API format: ["Games", "Entertainment"]
            category = app.genres[0];
        } else if (app.genres[0]?.name) {
            // RSS feed format: [{name: "Games", ...}]
            category = app.genres[0].name;
        }
    } else if (app.primaryGenreName) {
        // Fallback to primaryGenreName
        category = app.primaryGenreName;
    }
    
    card.innerHTML = `
        <div class="app-card-header">
            <img src="${appIcon}" alt="${appName}" class="app-icon">
            <div class="app-info">
                <div class="app-name" title="${appName}">${appName}</div>
                <div class="app-developer" title="${appDeveloper}">${appDeveloper}</div>
                <div class="app-category">${category}</div>
            </div>
        </div>
        
        ${ratingCount > 0 ? `
        <div class="app-rating">
            <div class="rating-stars">
                ${generateStars(rating)}
            </div>
            <span class="rating-count">${formatNumber(ratingCount)} ratings</span>
        </div>
        ` : '<div class="app-rating" style="height: 24px;"></div>'}
        
        <div class="app-footer">
            <div class="app-rank">#${rank}</div>
            <button class="download-btn">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                    <polyline points="7 10 12 15 17 10"/>
                    <line x1="12" y1="15" x2="12" y2="3"/>
                </svg>
                GET
            </button>
        </div>
    `;
    
    card.addEventListener('click', (e) => {
        if (!e.target.closest('.download-btn')) {
            showAppDetails(app);
        }
    });
    
    card.querySelector('.download-btn').addEventListener('click', (e) => {
        e.stopPropagation();
        downloadApp(app);
    });
    
    return card;
}

// Generate star rating
function generateStars(rating) {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    let stars = '';
    
    for (let i = 0; i < 5; i++) {
        if (i < fullStars) {
            stars += '<svg class="star" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>';
        } else if (i === fullStars && hasHalfStar) {
            stars += '<svg class="star" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77V2z"/></svg>';
        } else {
            stars += '<svg class="star" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>';
        }
    }
    
    return stars;
}

// Show app details modal
async function showAppDetails(app) {
    const modal = document.getElementById('app-modal');
    const modalBody = document.getElementById('modal-body');
    
    // Show loading state
    modalBody.innerHTML = '<div style="text-align: center; padding: 60px;"><div class="spinner"></div><p style="margin-top: 20px;">Loading app details...</p></div>';
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    
    // Fetch detailed information from iTunes API
    let appDetails = app;
    if (app.id) {
        try {
            const lookupUrl = `https://itunes.apple.com/lookup?id=${app.id}`;
            const response = await fetch(lookupUrl);
            const data = await response.json();
            if (data.results && data.results[0]) {
                appDetails = data.results[0];
            }
        } catch (error) {
            console.error('Error fetching app details:', error);
        }
    }
    
    const rating = appDetails.averageUserRating || 0;
    const ratingCount = appDetails.userRatingCount || 0;
    
    // Get screenshots
    const screenshots = appDetails.screenshotUrls || [];
    const screenshotsHTML = screenshots.length > 0 ? `
        <div class="modal-screenshots">
            <h3 style="font-size: 20px; margin-bottom: 12px; font-weight: 600;">📸 Screenshots</h3>
            <div class="screenshots-grid">
                ${screenshots.slice(0, 6).map(url => `
                    <img src="${url}" alt="Screenshot" class="screenshot">
                `).join('')}
            </div>
        </div>
    ` : '';
    
    // Format file size
    const fileSize = appDetails.fileSizeBytes ? (appDetails.fileSizeBytes / 1024 / 1024).toFixed(1) + ' MB' : 'N/A';
    
    // Format version
    const version = appDetails.version || 'N/A';
    
    // Format minimum OS
    const minimumOS = appDetails.minimumOsVersion || 'N/A';
    
    // Get languages
    const languages = appDetails.languageCodesISO2A || [];
    const languageText = languages.length > 0 ? `${languages.length} language${languages.length > 1 ? 's' : ''}` : 'N/A';
    
    // Get app name - handle different API formats
    const appName = appDetails.trackName || appDetails.name || app.name || 'Unknown App';
    const developerName = appDetails.artistName || appDetails.sellerName || app.artistName || 'Unknown Developer';
    const appIcon = appDetails.artworkUrl512 || appDetails.artworkUrl100 || app.artworkUrl100 || '';
    
    modalBody.innerHTML = `
        <div class="modal-header">
            <img src="${appIcon}" alt="${appName}" class="modal-icon">
            <div class="modal-info">
                <h2 class="modal-title">${appName}</h2>
                <div class="modal-developer">${developerName}</div>
                <div class="app-rating" style="margin-bottom: 16px;">
                    <div class="rating-stars">
                        ${generateStars(rating)}
                    </div>
                    <span class="rating-count">${rating.toFixed(1)} • ${formatNumber(ratingCount)} ratings</span>
                </div>
                <button class="modal-download-btn" id="modal-download-btn">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                        <polyline points="7 10 12 15 17 10"/>
                        <line x1="12" y1="15" x2="12" y2="3"/>
                    </svg>
                    GET
                </button>
            </div>
        </div>
        
        ${screenshotsHTML}
        
        <div class="modal-description">
            <h3 style="font-size: 20px; margin-bottom: 12px; font-weight: 600;">📝 Description</h3>
            <p class="description-text">${appDetails.description || 'No description available.'}</p>
        </div>
        
        <div style="margin-bottom: 32px;">
            <h3 style="font-size: 20px; margin-bottom: 16px; font-weight: 600;">ℹ️ Information</h3>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; padding: 20px; background: rgba(255,255,255,0.1); border-radius: 12px;">
                <div>
                    <div style="font-size: 12px; color: rgba(255,255,255,0.6); margin-bottom: 4px;">Developer</div>
                    <div style="font-size: 15px; font-weight: 600;">${developerName}</div>
                </div>
                <div>
                    <div style="font-size: 12px; color: rgba(255,255,255,0.6); margin-bottom: 4px;">Category</div>
                    <div style="font-size: 15px; font-weight: 600;">${appDetails.genres[0]?.name || 'App'}</div>
                </div>
                <div>
                    <div style="font-size: 12px; color: rgba(255,255,255,0.6); margin-bottom: 4px;">Price</div>
                    <div style="font-size: 15px; font-weight: 600;">${appDetails.formattedPrice || 'Free'}</div>
                </div>
                <div>
                    <div style="font-size: 12px; color: rgba(255,255,255,0.6); margin-bottom: 4px;">Size</div>
                    <div style="font-size: 15px; font-weight: 600;">${fileSize}</div>
                </div>
                <div>
                    <div style="font-size: 12px; color: rgba(255,255,255,0.6); margin-bottom: 4px;">Version</div>
                    <div style="font-size: 15px; font-weight: 600;">${version}</div>
                </div>
                <div>
                    <div style="font-size: 12px; color: rgba(255,255,255,0.6); margin-bottom: 4px;">Requires</div>
                    <div style="font-size: 15px; font-weight: 600;">iOS ${minimumOS}+</div>
                </div>
                <div>
                    <div style="font-size: 12px; color: rgba(255,255,255,0.6); margin-bottom: 4px;">Age Rating</div>
                    <div style="font-size: 15px; font-weight: 600;">${appDetails.contentAdvisoryRating || 'N/A'}</div>
                </div>
                <div>
                    <div style="font-size: 12px; color: rgba(255,255,255,0.6); margin-bottom: 4px;">Languages</div>
                    <div style="font-size: 15px; font-weight: 600;">${languageText}</div>
                </div>
                <div>
                    <div style="font-size: 12px; color: rgba(255,255,255,0.6); margin-bottom: 4px;">Release Date</div>
                    <div style="font-size: 15px; font-weight: 600;">${new Date(appDetails.releaseDate).toLocaleDateString()}</div>
                </div>
                <div>
                    <div style="font-size: 12px; color: rgba(255,255,255,0.6); margin-bottom: 4px;">Last Updated</div>
                    <div style="font-size: 15px; font-weight: 600;">${appDetails.currentVersionReleaseDate ? new Date(appDetails.currentVersionReleaseDate).toLocaleDateString() : 'N/A'}</div>
                </div>
            </div>
        </div>
        
        ${appDetails.releaseNotes ? `
        <div style="margin-bottom: 32px;">
            <h3 style="font-size: 20px; margin-bottom: 12px; font-weight: 600;">🆕 What's New</h3>
            <div style="padding: 20px; background: rgba(255,255,255,0.1); border-radius: 12px;">
                <p style="font-size: 15px; line-height: 1.6; color: rgba(255,255,255,0.9); white-space: pre-wrap;">${appDetails.releaseNotes}</p>
            </div>
        </div>
        ` : ''}
    `;
    
    // Add click event listener to download button
    const downloadBtn = document.getElementById('modal-download-btn');
    if (downloadBtn) {
        downloadBtn.addEventListener('click', () => {
            downloadApp(appDetails);
        });
    }
}

// Close modal
function closeModal() {
    const modal = document.getElementById('app-modal');
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
}

// Download app (install to home screen)
async function downloadApp(app) {
    // Get app name with fallbacks
    const appName = app.trackName || app.name || 'Unknown App';
    console.log('Installing app:', appName, 'ID:', app.id);
    
    let appUrl = null;
    let appDetails = null;
    
    // Fetch detailed app information from iTunes API
    if (app.id) {
        try {
            const lookupUrl = `https://itunes.apple.com/lookup?id=${app.id}`;
            console.log('Fetching app details from:', lookupUrl);
            
            const response = await fetch(lookupUrl);
            const data = await response.json();
            
            if (data.results && data.results[0]) {
                appDetails = data.results[0];
                console.log('App details:', appDetails);
                
                // Try to get URL in order of preference:
                // 1. sellerUrl (official website)
                // 2. supportedDevices (if it's a web app)
                // 3. trackViewUrl (App Store link as fallback)
                appUrl = appDetails.sellerUrl || 
                         appDetails.trackViewUrl || 
                         app.url;
                
                console.log('Found URL:', appUrl);
            }
        } catch (error) {
            console.error('Error fetching app details:', error);
        }
    }
    
    // Fallback to app data if lookup failed
    if (!appUrl) {
        appUrl = app.sellerUrl || app.url;
    }
    
    if (!appUrl) {
        alert('Unable to find app URL. This app may not have a website.');
        return;
    }
    
    // Extract main domain
    const domain = extractDomain(appUrl);
    console.log('Extracted domain:', domain);
    
    // Use high-res icon if available from details
    const iconUrl = (appDetails && appDetails.artworkUrl512) || 
                    (appDetails && appDetails.artworkUrl100) || 
                    app.artworkUrl100;
    
    // Prepare app data for home screen with safe fallbacks
    const finalAppName = (appDetails && appDetails.trackName) || app.trackName || app.name || 'Unknown App';
    const finalDeveloper = (appDetails && appDetails.artistName) || app.artistName || 'Unknown';
    const finalCategory = (appDetails && appDetails.genres && appDetails.genres[0]?.name) || 
                         (app.genres && app.genres[0]?.name) || 'App';
    
    const homeScreenApp = {
        name: finalAppName,
        url: `https://${domain}`,
        icon: iconUrl,
        developer: finalDeveloper,
        category: finalCategory,
        description: appDetails?.description || app.description
    };
    
    console.log('Installing to home screen:', homeScreenApp);
    
    // Send to main process via IPC
    try {
        const { ipcRenderer } = require('electron');
        ipcRenderer.send('install-app', homeScreenApp);
        
        // Show success message
        showNotification(`${finalAppName} installed to home screen!`);
        
        console.log('✓ App installation sent to main window');
    } catch (error) {
        console.error('Error installing app:', error);
        alert('Failed to install app. Please try again.');
    }
}

// Extract main domain from URL
function extractDomain(url) {
    try {
        const urlObj = new URL(url);
        let hostname = urlObj.hostname;
        
        // Remove www. prefix
        hostname = hostname.replace(/^www\./, '');
        
        // For subdomains, try to get main domain
        const parts = hostname.split('.');
        if (parts.length > 2) {
            // Keep last two parts (domain.com)
            hostname = parts.slice(-2).join('.');
        }
        
        return hostname;
    } catch (error) {
        console.error('Error extracting domain:', error);
        // Fallback: try to extract domain manually
        const match = url.match(/(?:https?:\/\/)?(?:www\.)?([^\/]+)/);
        return match ? match[1] : url;
    }
}

// Show notification
function showNotification(message) {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 16px 24px;
        background: rgba(40, 40, 45, 0.95);
        backdrop-filter: blur(40px);
        border: 1px solid rgba(255, 255, 255, 0.2);
        border-radius: 12px;
        color: #fff;
        font-size: 15px;
        font-weight: 500;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
        z-index: 10000;
        animation: slideIn 0.3s ease;
    `;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Filter apps by search
function filterApps(query) {
    if (!query.trim()) {
        renderApps(appsData);
        return;
    }
    
    const filtered = appsData.filter(app => 
        app.name.toLowerCase().includes(query.toLowerCase()) ||
        app.artistName.toLowerCase().includes(query.toLowerCase()) ||
        (app.genres[0]?.name || '').toLowerCase().includes(query.toLowerCase())
    );
    
    renderApps(filtered);
}

// Format number
function formatNumber(num) {
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
}

// Show loading state
function showLoading() {
    document.getElementById('loading-state').style.display = 'flex';
    document.getElementById('apps-grid').style.display = 'none';
}

// Hide loading state
function hideLoading() {
    document.getElementById('loading-state').style.display = 'none';
    document.getElementById('apps-grid').style.display = 'grid';
}

// Show error state
function showError() {
    document.getElementById('error-state').style.display = 'flex';
    document.getElementById('apps-grid').style.display = 'none';
}

// Hide error state
function hideError() {
    document.getElementById('error-state').style.display = 'none';
}
