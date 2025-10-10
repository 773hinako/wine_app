# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**PWA-focused wine tasting record app** with offline support.

This project has been restructured to focus exclusively on **Progressive Web App (PWA)** development. Previous iOS and Standalone versions have been archived for reference.

Core technology: Vanilla JavaScript + IndexedDB for complete offline functionality.

## Project Structure

```
wine/
├── src/                    # Source code
│   ├── js/                # JavaScript files
│   │   ├── app.js        # Main application logic
│   │   └── db.js         # IndexedDB wrapper
│   ├── css/              # Stylesheets
│   │   └── styles.css    # Main stylesheet
│   └── workers/          # Service Worker
│       └── service-worker.js
│
├── public/               # Static files (deployed as-is)
│   ├── index.html       # Main HTML file
│   ├── manifest.json    # PWA manifest
│   └── icons/           # PWA icons
│       ├── icon-192.png
│       └── icon-512.png
│
├── docs/                 # Documentation
├── scripts/              # Development scripts
├── assets/               # Source assets
├── archive/              # Archived versions (iOS, Standalone)
│
├── package.json
├── netlify.toml         # Deployment config
└── README.md
```

See [PROJECT-STRUCTURE.md](PROJECT-STRUCTURE.md) for detailed directory layout.

## Common Commands

### Development Server

```bash
# Quick start with provided scripts
./scripts/start-server.bat        # Windows
./scripts/start-server.sh         # Mac/Linux

# Manual start
python -m http.server 8000
```

### Icon Generation

```bash
# PWA icons (192x192, 512x512)
python scripts/generate-icons.py

# Browser-based icon generation
# Open scripts/create-icons.html in browser
```

## Architecture

### Screen Management

The app uses a single-page architecture with three screens managed by JavaScript:
- **Home Screen** (`#home-screen`): Wine list with search functionality
- **Edit Screen** (`#edit-screen`): Add/edit wine form with camera integration
- **Detail Screen** (`#detail-screen`): View full wine details

Screen transitions are handled by `showScreen()` function in [src/js/app.js](src/js/app.js).

### Data Flow

1. User interactions trigger events in [src/js/app.js](src/js/app.js)
2. App logic calls IndexedDB operations through [src/js/db.js](src/js/db.js) WineDB class
3. Data is stored/retrieved from IndexedDB
4. UI is updated with new data

### IndexedDB Schema

**Object Store**: `wines`
- **Key**: `id` (auto-increment)
- **Indexes**: `name`, `region`, `variety`, `date`

**Wine Object Structure**:
```javascript
{
  id: number,              // Auto-generated
  name: string,           // Required
  producer: string,
  region: string,
  variety: string,
  vintage: number,
  date: string,           // ISO date format
  rating: number,         // 0-5
  notes: string,
  photo: string,          // Base64 data URL
  createdAt: string,      // ISO timestamp
  updatedAt: string       // ISO timestamp
}
```

### Photo Handling

Photos are stored as Base64-encoded data URLs directly in IndexedDB. This approach:
- Works completely offline
- Requires no external file storage
- May impact performance with many large photos

### Service Worker Strategy

Uses **Network First** with cache fallback:
1. Tries to fetch from network
2. Updates cache with successful responses
3. Falls back to cache on network failure

This ensures users see the latest version while maintaining offline functionality.

## Key Functions

### src/js/app.js
- `showScreen(screenName)` - Screen navigation
- `loadWineList()` - Load and display all wines
- `searchWines(query)` - Search functionality
- `handleFormSubmit()` - Save wine data
- `showWineDetail(wineId)` - Display wine details
- `handleExport()` / `handleImport()` - Data export/import

### src/js/db.js (WineDB class)
- `init()` - Initialize database
- `addWine(wine)` - Create new wine record
- `updateWine(id, wine)` - Update existing record
- `deleteWine(id)` - Delete record
- `getWine(id)` - Retrieve single wine
- `getAllWines()` - Retrieve all wines (sorted by date)
- `searchWines(query)` - Search across multiple fields
- `exportData()` - Export all data as JSON
- `importData(jsonData)` - Import data from JSON

## File Paths Reference

### HTML
- Main HTML: [public/index.html](public/index.html)
- References:
  - CSS: `../src/css/styles.css`
  - JS: `../src/js/app.js`, `../src/js/db.js`
  - Icons: `icons/icon-*.png`
  - Manifest: `manifest.json`

### Service Worker
- Location: [src/workers/service-worker.js](src/workers/service-worker.js)
- Registration path: `/src/workers/service-worker.js`
- Cached URLs:
  - `/public/index.html`
  - `/src/css/styles.css`
  - `/src/js/app.js`
  - `/src/js/db.js`
  - `/public/manifest.json`

### Manifest
- Location: [public/manifest.json](public/manifest.json)
- Icon paths: `icons/icon-192.png`, `icons/icon-512.png`

## Testing the PWA

1. Start local server (port 8000 recommended)
2. Open `http://localhost:8000/public/` in browser
3. Open Chrome DevTools
4. Go to Application tab
5. Check "Service Workers" - should show registered worker
6. Check "Manifest" - should show app info and icons
7. Test offline: Check "Offline" in Network tab, refresh page

## Installing as PWA

### Desktop (Chrome/Edge)
- Click the install icon in the address bar
- Or use browser menu → "Install app"

### Mobile (Chrome/Safari)
- Chrome: Menu → "Add to Home screen"
- Safari: Share → "Add to Home Screen"

## Deployment (Netlify)

The app is configured for Netlify deployment with [netlify.toml](netlify.toml):
- Publishes from root directory
- Redirects all routes to `/public/index.html` (SPA routing)
- Proper cache headers for Service Worker and assets

Deploy with:
```bash
# Push to connected git repository
# Or use Netlify CLI
netlify deploy --prod
```

## Archived Versions

Previous multi-platform versions are archived in [archive/](archive/):
- **archive/ios/** - iOS native app (Capacitor)
- **archive/standalone/** - Single-file HTML version
- **archive/www/** - Capacitor web files

These are kept for reference but are no longer actively maintained.

## Common Issues

### Service Worker Not Updating
- Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
- Or: DevTools → Application → Service Workers → "Unregister"

### Camera Not Working
- Requires HTTPS or localhost
- Check browser permissions

### Path Issues After Restructure
All file paths have been updated to the new structure:
- HTML uses relative paths (`../src/...`)
- Service Worker uses absolute paths (`/src/...`, `/public/...`)
- Manifest uses relative paths from public/ directory

## Key Documentation Files

- [README.md](README.md) - User-facing documentation (Japanese)
- [PROJECT-STRUCTURE.md](PROJECT-STRUCTURE.md) - Detailed project structure
- [docs/INSTALL.md](docs/INSTALL.md) - PWA installation instructions
- [DEPLOY.md](DEPLOY.md) - Deployment guide
