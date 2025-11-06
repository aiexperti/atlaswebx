// App Manager - Handle app reordering, removal, and favorites

let apps = [];
let draggedApp = null;
let draggedElement = null;
let editMode = false;

// Initialize apps from HTML
function initializeApps() {
    const appShortcuts = document.querySelectorAll('.app-shortcut');
    
    // Check if we have saved configuration
    const savedApps = localStorage.getItem('app-configuration');
    
    if (savedApps) {
        // Load from saved config
        apps = JSON.parse(savedApps);
        console.log('Loaded', apps.length, 'apps from localStorage');
        renderApps();
    } else {
        // Initialize from HTML
        apps = Array.from(appShortcuts).map((el, index) => ({
            id: `app-${index}`,
            url: el.getAttribute('data-url'),
            action: el.getAttribute('data-action'),
            name: el.querySelector('.app-name')?.textContent || 'App',
            icon: el.querySelector('.app-icon')?.innerHTML || '',
            iconStyle: el.querySelector('.app-icon')?.getAttribute('style') || '',
            page: Math.floor(index / 15), // 15 apps per page
            order: index % 15
        }));
        console.log('Initialized', apps.length, 'apps from HTML');
        
        // Just attach listeners to existing HTML
        attachAppEventListeners();
    }
}

// Render all apps
function renderApps() {
    const appPages = document.getElementById('app-pages');
    const pageCount = Math.max(2, Math.ceil(apps.length / 15));
    
    // Clear existing pages
    appPages.innerHTML = '';
    
    // Create pages
    for (let pageIndex = 0; pageIndex < pageCount; pageIndex++) {
        const pageDivs = createAppPage(pageIndex);
        appPages.appendChild(pageDivs);
    }
    
    // Update page indicators
    updatePageIndicators(pageCount);
    
    // Attach event listeners
    attachAppEventListeners();
}

// Create a single app page
function createAppPage(pageIndex) {
    const pageApps = apps.filter(app => app.page === pageIndex).sort((a, b) => a.order - b.order);
    
    const pageDiv = document.createElement('div');
    pageDiv.className = 'app-page';
    
    const gridDiv = document.createElement('div');
    gridDiv.className = 'app-grid';
    
    pageApps.forEach(app => {
        const appElement = createAppElement(app);
        gridDiv.appendChild(appElement);
    });
    
    pageDiv.appendChild(gridDiv);
    return pageDiv;
}

// Create app element
function createAppElement(app) {
    const appDiv = document.createElement('div');
    appDiv.className = 'app-shortcut';
    appDiv.setAttribute('data-app-id', app.id);
    appDiv.setAttribute('draggable', editMode ? 'true' : 'false');
    if (app.url) appDiv.setAttribute('data-url', app.url);
    if (app.action) appDiv.setAttribute('data-action', app.action);
    
    const iconDiv = document.createElement('div');
    iconDiv.className = 'app-icon';
    if (app.iconStyle) iconDiv.setAttribute('style', app.iconStyle);
    iconDiv.innerHTML = app.icon;
    
    const nameDiv = document.createElement('div');
    nameDiv.className = 'app-name';
    nameDiv.textContent = app.name;
    
    appDiv.appendChild(iconDiv);
    appDiv.appendChild(nameDiv);
    
    // Handle delete button click in edit mode
    appDiv.addEventListener('click', (e) => {
        // Check if clicking on the delete button (::after pseudo-element area)
        if (editMode) {
            const rect = appDiv.getBoundingClientRect();
            const clickX = e.clientX - rect.left;
            const clickY = e.clientY - rect.top;
            
            // Delete button is at top-right corner
            if (clickX > rect.width - 30 && clickY < 30) {
                handleDeleteClick(e, app);
                return;
            }
        }
    });
    
    return appDiv;
}

// Update page indicators
function updatePageIndicators(pageCount) {
    const indicators = document.querySelector('.page-indicators');
    indicators.innerHTML = '';
    
    for (let i = 0; i < pageCount; i++) {
        const dot = document.createElement('div');
        dot.className = 'page-dot' + (i === 0 ? ' active' : '');
        dot.setAttribute('data-page', i);
        indicators.appendChild(dot);
    }
}

// Attach event listeners to apps
function attachAppEventListeners() {
    const appShortcuts = document.querySelectorAll('.app-shortcut');
    
    appShortcuts.forEach(app => {
        // Drag events - always attach, but draggable attribute controls if they work
        app.addEventListener('dragstart', handleDragStart);
        app.addEventListener('dragend', handleDragEnd);
        app.addEventListener('dragover', handleDragOver);
        app.addEventListener('drop', handleDrop);
        app.addEventListener('dragenter', handleDragEnter);
        
        // Click event
        app.addEventListener('click', handleAppClick);
        
        // Context menu (only in normal mode)
        app.addEventListener('contextmenu', handleContextMenu);
    });
}

// Drag and drop handlers
function handleDragStart(e) {
    console.log('handleDragStart called, editMode:', editMode);
    
    if (!editMode) {
        console.log('Not in edit mode, preventing drag');
        e.preventDefault();
        return false;
    }
    
    draggedElement = e.currentTarget;
    const appId = e.currentTarget.getAttribute('data-app-id');
    draggedApp = apps.find(app => app.id === appId);
    
    console.log('Dragging app ID:', appId, 'Found app:', draggedApp);
    
    e.currentTarget.classList.add('dragging');
    e.currentTarget.style.opacity = '0.5';
    
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', e.currentTarget.innerHTML);
    
    console.log('✓ Drag started:', draggedApp?.name);
}

function handleDragEnd(e) {
    e.currentTarget.classList.remove('dragging');
    e.currentTarget.style.opacity = '1';
    
    // Remove all drag-over classes
    document.querySelectorAll('.app-shortcut').forEach(app => {
        app.classList.remove('drag-over');
    });
    
    draggedElement = null;
    console.log('Drag ended');
}

let dragOverElement = null;

function handleDragEnter(e) {
    if (!editMode || !draggedElement) return;
    
    const targetElement = e.currentTarget;
    if (targetElement !== draggedElement && targetElement.classList.contains('app-shortcut')) {
        // Remove previous drag-over
        if (dragOverElement && dragOverElement !== targetElement) {
            dragOverElement.classList.remove('drag-over');
        }
        
        dragOverElement = targetElement;
        targetElement.classList.add('drag-over');
    }
}

function handleDragOver(e) {
    if (e.preventDefault) {
        e.preventDefault();
    }
    
    if (!editMode || !draggedElement) {
        return false;
    }
    
    e.dataTransfer.dropEffect = 'move';
    return false;
}

function handleDrop(e) {
    console.log('handleDrop called');
    
    if (e.stopPropagation) {
        e.stopPropagation();
    }
    if (e.preventDefault) {
        e.preventDefault();
    }
    
    if (!editMode || !draggedElement || !dragOverElement) {
        console.log('Drop cancelled - editMode:', editMode, 'draggedElement:', !!draggedElement, 'dragOverElement:', !!dragOverElement);
        dragOverElement = null;
        return false;
    }
    
    // Get the apps being swapped
    const draggedId = draggedElement.getAttribute('data-app-id');
    const targetId = dragOverElement.getAttribute('data-app-id');
    
    console.log('Attempting swap - draggedId:', draggedId, 'targetId:', targetId);
    
    const draggedAppData = apps.find(a => a.id === draggedId);
    const targetAppData = apps.find(a => a.id === targetId);
    
    console.log('Found apps - dragged:', draggedAppData, 'target:', targetAppData);
    
    if (draggedAppData && targetAppData && draggedId !== targetId) {
        console.log('✓ Swapping:', draggedAppData.name, '↔', targetAppData.name);
        
        // Swap page and order
        const tempPage = draggedAppData.page;
        const tempOrder = draggedAppData.order;
        
        draggedAppData.page = targetAppData.page;
        draggedAppData.order = targetAppData.order;
        
        targetAppData.page = tempPage;
        targetAppData.order = tempOrder;
        
        console.log('Saving and re-rendering...');
        saveApps();
        renderApps();
        console.log('✓ Swap complete!');
    } else {
        console.log('✗ Swap failed - conditions not met');
    }
    
    dragOverElement = null;
    return false;
}

// Click handler
function handleAppClick(e) {
    // Don't open apps in edit mode
    if (editMode) {
        return;
    }
    
    // Prevent default if context menu is open
    if (document.querySelector('.app-context-menu')) {
        return;
    }

    const appElement = e.currentTarget;
    const url = appElement.getAttribute('data-url');
    const action = appElement.getAttribute('data-action');

    // Get ipcRenderer
    const { ipcRenderer } = require('electron');

    if (action === 'settings') {
        // Open settings
        ipcRenderer.send('open-settings');
    } else if (action === 'appstore' || action === 'app-store') {
        // Open App Store
        ipcRenderer.send('open-appstore');
    } else if (url) {
        // Open URL in browser view using createTab from renderer.js
        if (typeof window.createTab === 'function') {
            window.createTab(url);
        } else {
            // Fallback: dispatch event to trigger original handler
            console.log('Opening URL:', url);
            ipcRenderer.send('create-tab', url);
        }
    }
}

// Context menu handler
function handleContextMenu(e) {
    e.preventDefault();
    
    // Remove existing context menu
    const existingMenu = document.querySelector('.app-context-menu');
    if (existingMenu) {
        existingMenu.remove();
    }
    
    const appElement = e.currentTarget;
    const app = apps.find(a => a.id === appElement.getAttribute('data-app-id'));
    
    showContextMenu(e.clientX, e.clientY, app);
}

// Show context menu
function showContextMenu(x, y, app) {
    const menu = document.createElement('div');
    menu.className = 'app-context-menu';
    menu.style.left = x + 'px';
    menu.style.top = y + 'px';
    
    // Calculate total pages
    const totalPages = Math.max(2, Math.ceil(apps.length / 15));
    const hasPreviousPage = app.page > 0;
    const hasNextPage = app.page < totalPages - 1;
    
    const options = [
        { 
            label: 'Add to Favorites', 
            icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>',
            action: () => addToFavorites(app) 
        },
        { 
            label: 'Move to Previous Page', 
            icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 18l-6-6 6-6"/></svg>',
            action: () => moveToPage(app, app.page - 1), 
            hidden: !hasPreviousPage 
        },
        { 
            label: 'Move to Next Page', 
            icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18l6-6-6-6"/></svg>',
            action: () => moveToPage(app, app.page + 1), 
            hidden: !hasNextPage 
        },
        { 
            label: 'Remove', 
            icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M10 11v6M14 11v6"/></svg>',
            action: () => removeApp(app), 
            danger: true 
        }
    ];
    
    options.forEach(option => {
        if (option.hidden) return;
        
        const item = document.createElement('div');
        item.className = 'context-menu-item' + (option.danger ? ' danger' : '');
        item.innerHTML = `<span class="menu-icon">${option.icon}</span><span>${option.label}</span>`;
        item.addEventListener('click', () => {
            option.action();
            menu.remove();
        });
        menu.appendChild(item);
    });
    
    document.body.appendChild(menu);
    
    // Close menu on click outside
    setTimeout(() => {
        document.addEventListener('click', function closeMenu() {
            menu.remove();
            document.removeEventListener('click', closeMenu);
        });
    }, 0);
}

// App management functions
function addToFavorites(app) {
    console.log('Add to favorites:', app.name);
    // TODO: Implement favorites management
    alert(`"${app.name}" added to favorites!`);
}

function moveToPage(app, targetPage) {
    const pageApps = apps.filter(a => a.page === targetPage);
    app.page = targetPage;
    app.order = pageApps.length;
    
    saveApps();
    renderApps();
}

function removeApp(app) {
    if (confirm(`Remove "${app.name}" from home screen?`)) {
        const index = apps.findIndex(a => a.id === app.id);
        if (index > -1) {
            apps.splice(index, 1);
            
            // Reorder remaining apps
            apps.forEach((a, i) => {
                a.page = Math.floor(i / 15);
                a.order = i % 15;
            });
            
            saveApps();
            renderApps();
        }
    }
}

// Save apps configuration
function saveApps() {
    localStorage.setItem('app-configuration', JSON.stringify(apps));
    console.log('Apps saved:', apps.length);
}

// Add app to grid (exposed globally for App Store)
window.addAppToGrid = function(newApp) {
    console.log('Adding app to grid:', newApp);
    
    const APPS_PER_PAGE = 15; // Maximum apps per page (5 columns × 3 rows)
    
    // Find the last page with apps
    const maxPage = apps.length > 0 ? Math.max(...apps.map(a => a.page)) : 0;
    
    // Get apps on the last page
    const lastPageApps = apps.filter(a => a.page === maxPage);
    
    // Determine which page to add to
    let targetPage = maxPage;
    let targetOrder = 0;
    
    if (lastPageApps.length >= APPS_PER_PAGE) {
        // Last page is full, create new page
        targetPage = maxPage + 1;
        targetOrder = 0;
        console.log(`Last page (${maxPage}) is full (${lastPageApps.length} apps). Creating new page ${targetPage}`);
    } else {
        // Add to last page
        targetPage = maxPage;
        targetOrder = lastPageApps.length > 0 ? Math.max(...lastPageApps.map(a => a.order)) + 1 : 0;
        console.log(`Adding to page ${targetPage} at position ${targetOrder}`);
    }
    
    // Set page and order
    newApp.page = targetPage;
    newApp.order = targetOrder;
    
    // Add to apps array
    apps.push(newApp);
    
    console.log(`App added: ${newApp.name} on page ${newApp.page}, order ${newApp.order}`);
    console.log(`Total apps: ${apps.length}`);
    
    // Save and re-render
    saveApps();
    renderApps();
    
    // Re-attach event listeners to all apps (including the new one)
    attachAppEventListeners();
    
    console.log('✓ App added successfully!');
};

function toggleEditMode() {
    editMode = !editMode;
    const homeScreen = document.getElementById('home-screen');
    const editBtn = document.getElementById('edit-mode-btn');
    
    if (editMode) {
        homeScreen.classList.add('edit-mode');
        editBtn.classList.add('active');
        editBtn.querySelector('span').textContent = 'Done';
        
        // Enable dragging
        document.querySelectorAll('.app-shortcut').forEach(app => {
            app.setAttribute('draggable', 'true');
        });
    } else {
        homeScreen.classList.remove('edit-mode');
        editBtn.classList.remove('active');
        editBtn.querySelector('span').textContent = 'Edit';
        
        // Disable dragging
        document.querySelectorAll('.app-shortcut').forEach(app => {
            app.setAttribute('draggable', 'false');
        });
    }
}

// Handle delete button click (the × button in edit mode)
function handleDeleteClick(e, app) {
    e.stopPropagation();
    e.preventDefault();
    
    if (confirm(`Remove "${app.name}" from home screen?`)) {
        const index = apps.findIndex(a => a.id === app.id);
        if (index > -1) {
            apps.splice(index, 1);
            
            // Reorder remaining apps
            apps.forEach((a, i) => {
                a.page = Math.floor(i / 15);
                a.order = i % 15;
            });
            
            saveApps();
            renderApps();
        }
    }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        initializeApps();
        
        // Edit mode button
        const editBtn = document.getElementById('edit-mode-btn');
        if (editBtn) {
            editBtn.addEventListener('click', toggleEditMode);
        }
    });
} else {
    initializeApps();
    
    // Edit mode button
    const editBtn = document.getElementById('edit-mode-btn');
    if (editBtn) {
        editBtn.addEventListener('click', toggleEditMode);
    }
}
