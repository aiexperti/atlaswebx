# App Store Feature

A beautiful App Store interface inspired by Apple's design language with glassmorphism UI.

## Features

### 🎨 Design
- **Glassmorphism UI** - Frosted glass effect with blur and transparency
- **Apple-inspired** - Clean, modern design matching Apple's aesthetic
- **Responsive** - Works on all screen sizes
- **Smooth animations** - Fluid transitions and hover effects

### 📱 Functionality
- **Browse Apps** - View top free, paid, and grossing apps
- **Country Selection** - Switch between different App Store regions
- **Search** - Find apps by name, developer, or category
- **App Details** - View screenshots, descriptions, ratings, and reviews
- **Download** - Direct links to App Store

### 🌍 Supported Countries
- United States (us)
- Germany (de)
- United Kingdom (gb)
- France (fr)
- Japan (jp)
- China (cn)
- Spain (es)
- Italy (it)

### 📊 Categories
- **Top Free** - Most popular free apps
- **Top Paid** - Best-selling paid apps
- **Top Grossing** - Highest revenue apps

### 🔢 Display Options
- Show 10, 25, 50, or 100 apps
- Real-time filtering
- Ranked display

## API

Uses Apple's RSS Feed API:
```
https://rss.applemarketingtools.com/api/v2/{country}/apps/{category}/{limit}/apps.json
```

### Parameters
- `country` - Two-letter country code (us, de, gb, etc.)
- `category` - top-free, top-paid, top-grossing
- `limit` - Number of apps to fetch (10-100)

### Response Data
Each app includes:
- Name and developer
- Icon and screenshots
- Rating and review count
- Category and genre
- Release date
- Price
- Description
- App Store URL

## Usage

### Open App Store
Simply open `appstore.html` in a browser or integrate into your Electron app.

### Integration Example
```javascript
// In your main app
const appStoreWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    webPreferences: {
        nodeIntegration: false,
        contextIsolation: true
    }
});

appStoreWindow.loadFile('appstore/appstore.html');
```

### Customization

**Change default country:**
```javascript
let currentCountry = 'de'; // Change to your country
```

**Change default limit:**
```javascript
let currentLimit = 50; // Show 50 apps by default
```

**Add more countries:**
```html
<option value="ca">Canada</option>
<option value="au">Australia</option>
```

## Features Breakdown

### 1. App Cards
- Large app icon (80x80px)
- App name and developer
- Category badge
- Star rating (0-5 stars)
- Rating count
- Rank number
- Download button

### 2. App Details Modal
- Large icon (120x120px)
- Full app information
- Screenshot gallery (up to 6)
- Complete description
- Metadata (category, release date, rating, price)
- Download button

### 3. Search & Filter
- Real-time search
- Searches name, developer, and category
- Debounced for performance
- Instant results

### 4. Visual Effects
- Glassmorphism backgrounds
- Smooth hover animations
- Scale and lift effects
- Fade and slide transitions
- Custom scrollbars

## Technical Details

### Technologies
- Pure JavaScript (no frameworks)
- CSS3 with backdrop-filter
- Fetch API for data loading
- CSS Grid for layouts
- CSS animations

### Performance
- Debounced search (300ms)
- Lazy loading ready
- Optimized animations
- Efficient DOM updates

### Browser Support
- Chrome/Edge (full support)
- Firefox (full support)
- Safari (full support)
- Requires backdrop-filter support

## Screenshots

The interface includes:
- Header with back button and country selector
- Search bar with icon
- Category filters (Top Free, Top Paid, Top Grossing)
- Grid of app cards
- Detailed modal view
- Loading and error states

## Future Enhancements

Possible additions:
- App categories filter
- Sort options (rating, name, date)
- Favorites/wishlist
- App comparison
- Price tracking
- Update notifications
- Local storage for preferences
- More countries
- iPad/iPhone specific apps filter
