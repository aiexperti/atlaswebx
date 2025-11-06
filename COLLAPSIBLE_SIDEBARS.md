# Collapsible Sidebars Feature

## Overview

Both sidebars in Lenoir AI Browser are now **collapsible** for maximum flexibility and screen space optimization.

## Left Sidebar (Navigation)

### Full State (240px)
- Shows all content with labels
- Favorites with names
- Tabs with full titles
- Section headers visible

### Collapsed State (60px)
- **Icon-only view**
- Only shows icons/favicons
- Text labels hidden
- More screen space for content

### Toggle Button
- Located at top of left sidebar (hamburger menu icon)
- Click to collapse/expand
- Smooth 0.3s transition animation

## Right Sidebar (AI Assistant)

### Hidden State (0px)
- Completely hidden
- Maximum screen space for browsing
- Default state on startup

### Visible State (360px)
- Full AI assistant interface
- Suggestions, chat history, input
- Slides in from right

### Toggle Button
- Located in AI sidebar header (X icon)
- Click to show/hide
- Smooth 0.3s transition animation

## Layout States

### Both Expanded (Default)
```
┌────────┬──────────────────┬────────────┐
│  Left  │   Main Content   │     AI     │
│ (240px)│   (Flexible)     │   (0px)    │
└────────┴──────────────────┴────────────┘
```

### Left Collapsed
```
┌──┬──────────────────────┬────────────┐
│L │   Main Content       │     AI     │
│60│   (More Space)       │   (0px)    │
└──┴──────────────────────┴────────────┘
```

### AI Visible
```
┌────────┬──────────────┬──────────────┐
│  Left  │Main Content  │      AI      │
│ (240px)│  (Flexible)  │   (360px)    │
└────────┴──────────────┴──────────────┘
```

### Left Collapsed + AI Visible
```
┌──┬────────────────────┬──────────────┐
│L │  Main Content      │      AI      │
│60│  (Max Space)       │   (360px)    │
└──┴────────────────────┴──────────────┘
```

### Both Collapsed/Hidden
```
┌──┬────────────────────────────────────┐
│L │        Main Content                │
│60│        (Maximum Space)             │
└──┴────────────────────────────────────┘
```

## Icon-Only Mode (Left Sidebar Collapsed)

When collapsed, the left sidebar shows:

### Visible Elements
- ✅ Toggle button (hamburger menu)
- ✅ Home button icon
- ✅ New tab button icon
- ✅ Favorite icons (G, TV, ◆)
- ✅ Tab favicons

### Hidden Elements
- ❌ Section titles ("FAVORITES", "TABS")
- ❌ Favorite names
- ❌ Tab titles
- ❌ Tab close buttons

### Interaction
- Click icons to perform actions
- Hover shows tooltips (title attributes)
- Same functionality, less space

## Dynamic BrowserView Adjustment

The browser content automatically adjusts when sidebars toggle:

```javascript
Content Width = Window Width - Left Sidebar Width - AI Sidebar Width

// Examples:
// Full left, no AI: 1400 - 240 - 0 = 1160px
// Collapsed left, no AI: 1400 - 60 - 0 = 1340px
// Full left, AI visible: 1400 - 240 - 360 = 800px
// Collapsed left, AI visible: 1400 - 60 - 360 = 980px
```

## User Benefits

### More Screen Space
- Collapse left sidebar for more browsing space
- Hide AI when not needed
- Maximize content area

### Flexible Workflow
- Quick access to tabs (icon-only)
- Full details when needed (expanded)
- AI on-demand (toggle when needed)

### Clean Interface
- Reduce clutter
- Focus on content
- Distraction-free browsing

## Keyboard Shortcuts (Future)

Planned shortcuts:
- `Cmd/Ctrl + B` - Toggle left sidebar
- `Cmd/Ctrl + Shift + A` - Toggle AI sidebar
- `Cmd/Ctrl + \` - Toggle both sidebars

## Technical Details

### CSS Transitions
```css
.left-sidebar {
    width: 240px;
    transition: width 0.3s ease;
}

.left-sidebar.collapsed {
    width: 60px;
}

.ai-sidebar {
    width: 0;
    transition: width 0.3s ease;
}

.ai-sidebar.active {
    width: 360px;
}
```

### State Management
- `leftSidebarCollapsed` - Boolean state
- `aiSidebarVisible` - Boolean state
- Synced between renderer and main process
- BrowserView updates on state change

### IPC Communication
```javascript
// Renderer sends state to main process
ipcRenderer.send('sidebar-state-changed', {
    leftCollapsed: boolean,
    aiVisible: boolean
});

// Main process adjusts BrowserView bounds
ipcMain.on('sidebar-state-changed', (event, state) => {
    // Calculate and apply new bounds
});
```

## Best Practices

### When to Collapse Left Sidebar
- Reading long articles
- Watching videos
- Working with web apps
- Maximum focus needed

### When to Keep Left Sidebar Expanded
- Managing many tabs
- Frequent tab switching
- Need to see tab titles
- Organizing favorites

### When to Show AI Sidebar
- Need help understanding content
- Want to ask questions
- Research and learning
- Getting recommendations

### When to Hide AI Sidebar
- Maximum screen space needed
- Not using AI features
- Distraction-free reading
- Video/media consumption

## Comparison with Other Browsers

| Feature | Chrome/Firefox | Arc Browser | Lenoir |
|---------|---------------|-------------|--------|
| Vertical Tabs | ❌ | ✅ | ✅ |
| Collapsible Sidebar | ❌ | ✅ | ✅ |
| Icon-Only Mode | ❌ | ✅ | ✅ |
| AI Sidebar | ❌ | ❌ | ✅ |
| Toggleable AI | ❌ | ❌ | ✅ |
| Smooth Transitions | ❌ | ✅ | ✅ |

## Future Enhancements

- [ ] Remember sidebar states across sessions
- [ ] Per-window sidebar preferences
- [ ] Auto-collapse on small screens
- [ ] Sidebar resize with drag handle
- [ ] Hover to peek when collapsed
- [ ] Gesture support (swipe to toggle)
- [ ] Custom collapse widths
- [ ] Animation speed settings
