# Lenoir AI Browser - Layout Guide

## Three-Panel Layout

Lenoir uses a modern three-panel layout inspired by Arc browser and AI-powered browsers like ChatGPT Atlas and Perplexity Comet.

```
┌──────────────────────────────────────────────────────────────────┐
│                     Title Bar (32px)                              │
├──────────┬──────────────────────────────────┬────────────────────┤
│          │  Top Nav (52px)                  │                    │
│          ├──────────────────────────────────┤                    │
│  Left    │                                  │    AI Assistant    │
│ Sidebar  │      Main Content Area           │     (320px)        │
│ (240px)  │   (Home Screen or Browser)       │                    │
│          │                                  │  - Suggestions     │
│  - Home  │                                  │  - Chat History    │
│  - New   │                                  │  - Input Box       │
│  - Favs  │                                  │                    │
│  - Tabs  │                                  │  Always Visible    │
│          │                                  │                    │
└──────────┴──────────────────────────────────┴────────────────────┘
```

## Panel Breakdown

### 1. Left Sidebar (240px) - Always Visible
**Purpose**: Navigation and tab management

**Sections**:
- **Header** (60px)
  - Home button (return to app shortcuts)
  - New tab button (create new tab)

- **Favorites** (Auto height)
  - Quick access bookmarks
  - Google, TradingView, Binance (pre-configured)
  - Click to open in new tab

- **Tabs** (Flexible, scrollable)
  - Vertical list of all open tabs
  - Active tab highlighted with blue left border
  - Favicon + title + close button (on hover)

- **Footer** (60px)
  - Reserved for future features

### 2. Main Content Area (Flexible) - Center
**Purpose**: Primary browsing and home screen

**Components**:
- **Top Navigation Bar** (52px)
  - Back, Forward, Reload buttons
  - URL bar (centered, max 700px wide)
  - Smart search/URL input

- **Content Display** (Flexible)
  - **Home Screen**: App shortcuts grid with clock
  - **Browser View**: Embedded web content via BrowserView

### 3. AI Assistant Sidebar (320px) - Always Visible
**Purpose**: Contextual AI help and chat interface

**Sections**:
- **Header** (56px)
  - AI Assistant title with icon
  - No close button (always visible)

- **Suggestions** (Auto height)
  - Quick action buttons
  - "Tutorials for my level"
  - "Suggest path"
  - "Popular topics"

- **Chat Area** (Flexible, scrollable)
  - Message history
  - User and AI messages
  - Auto-scroll to latest

- **Input** (72px)
  - Text input field
  - Send button
  - Press Enter to send

## Dimensions

| Element | Width | Height | Notes |
|---------|-------|--------|-------|
| Window | 1400px | 900px | Default, resizable |
| Title Bar | Full width | 32px | Custom, frameless |
| Left Sidebar | 240px | Full height | Fixed width |
| AI Sidebar | 320px | Full height | Fixed width |
| Top Nav | Flexible | 52px | Fixed height |
| Main Content | Flexible | Flexible | Fills remaining space |

**Flexible Width Calculation**:
```
Main Content Width = Window Width - 240px (left) - 320px (right)
```

## Key Features

### Always Visible Sidebars
Both sidebars are **always visible** and cannot be hidden:
- **Left Sidebar**: Provides persistent access to tabs and navigation
- **AI Sidebar**: Keeps AI assistant readily available for any page

### Responsive Content Area
The main content area automatically adjusts to:
- Window resizing
- Different screen sizes
- Content type (home screen vs browser)

### BrowserView Positioning
Web content is rendered in Electron's BrowserView with precise positioning:
```javascript
x: 240px (left sidebar width)
y: 84px (titlebar 32px + top nav 52px)
width: windowWidth - 240px - 320px
height: windowHeight - 84px
```

## Design Philosophy

### 1. **Persistent Navigation**
- Tabs always visible in left sidebar
- No hunting for tabs or navigation
- Quick switching between pages

### 2. **AI-First Design**
- AI assistant always accessible
- No need to toggle or open
- Contextual help at all times

### 3. **Space Efficiency**
- Vertical tabs don't waste horizontal space
- Three-panel layout maximizes content area
- Clean, uncluttered interface

### 4. **Visual Hierarchy**
- Clear separation of concerns
- Left: Navigation
- Center: Content
- Right: AI assistance

## Usage Patterns

### Opening Content
1. Click favorite in left sidebar → Opens in new tab
2. Click app shortcut on home screen → Opens in new tab
3. Type URL in top nav → Opens in current tab or new tab

### Managing Tabs
1. View all tabs in left sidebar (scrollable)
2. Click tab to switch
3. Hover over tab → Close button appears
4. Active tab has blue left border

### Using AI Assistant
1. Always visible on right
2. Click suggestion buttons for quick actions
3. Type question in input box
4. Press Enter or click send
5. Chat history preserved

### Navigation
1. Use back/forward buttons in top nav
2. Click home button in left sidebar
3. Type new URL in URL bar
4. Click reload to refresh

## Color Scheme

| Element | Background | Border | Text |
|---------|-----------|--------|------|
| Sidebars | #1a1a1a | #2a2a2a | #ccc |
| Top Nav | #2a2a2a | #3a3a3a | #fff |
| Active Tab | #2a2a2a | #4a9eff (left) | #fff |
| Hover | #3a3a3a | - | #fff |
| Input Focus | #222 | #4a9eff | #fff |

## Future Enhancements

- [ ] Resizable sidebars (drag to resize)
- [ ] Collapsible AI sidebar (optional)
- [ ] Tab groups in left sidebar
- [ ] Split view (multiple BrowserViews)
- [ ] Picture-in-picture for AI chat
- [ ] Customizable sidebar width
- [ ] Themes and color schemes
