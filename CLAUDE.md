# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Multi-platform wine tasting record app available as:
1. **PWA** (Progressive Web App) - Browser-based with offline support
2. **Standalone** - Single HTML file, works without server
3. **iOS Native** - Capacitor-based iOS app for App Store

Core technology: Vanilla JavaScript + IndexedDB for complete offline functionality.

## Project Structure

See [PROJECT-STRUCTURE.md](PROJECT-STRUCTURE.md) for detailed directory layout.

### Key Directories

- **Root**: PWA execution files (`index.html`, `app.js`, etc.)
- **pwa-src/**: PWA source code (backup/reference)
- **docs/**: All documentation files
- **scripts/**: Server startup scripts and icon generators
- **assets/**: Static assets (icons, images)
- **ios/**: iOS native app (Xcode project)
- **www/**: Capacitor web files (auto-generated)

## Available Versions

### 1. PWA Version (Root directory)
- Full-featured web app with Service Worker
- Requires local server (HTTPS or localhost)
- Files duplicated in root for execution

### 2. Standalone Version (`wine-app-standalone.html`)
- Single HTML file with embedded CSS/JS
- No server required, works via `file://` protocol
- Same features as PWA but no Service Worker

### 3. iOS App (`ios/` directory)
- Capacitor-based native iOS app
- Source: `www/index.html` (copy of standalone version)
- Requires Mac + Xcode for building

## Common Commands

### Development Server (PWA version)

```bash
# Quick start with provided scripts
./scripts/start-server.bat        # Windows
./scripts/start-server.sh         # Mac/Linux

# Manual start
python -m http.server 8000
```

### iOS Development (requires Mac)

```bash
# Install dependencies
npm install
cd ios/App && pod install && cd ../..

# Sync web files to iOS
npm run sync:ios

# Open in Xcode
npm run open:ios

# Generate iOS icons
python scripts/generate-ios-icons.py
```

### Icon Generation

```bash
# PWA icons (192x192, 512x512)
python scripts/generate-icons.py

# iOS app icons (all sizes)
python scripts/generate-ios-icons.py

# Browser-based icon generation
# Open scripts/create-icons.html in browser
```

## Architecture

### Screen Management

The app uses a single-page architecture with three screens managed by JavaScript:
- **Home Screen** (`#home-screen`): Wine list with search functionality
- **Edit Screen** (`#edit-screen`): Add/edit wine form with camera integration
- **Detail Screen** (`#detail-screen`): View full wine details

Screen transitions are handled by `showScreen()` function in [app.js](app.js).

### Data Flow

1. User interactions trigger events in [app.js](app.js)
2. App logic calls IndexedDB operations through [db.js](db.js) WineDB class
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

### app.js
- `showScreen(screenName)` - Screen navigation
- `loadWineList()` - Load and display all wines
- `searchWines(query)` - Search functionality
- `handleFormSubmit()` - Save wine data
- `showWineDetail(wineId)` - Display wine details
- `handleExport()` / `handleImport()` - Data export/import

### db.js (WineDB class)
- `init()` - Initialize database
- `addWine(wine)` - Create new wine record
- `updateWine(id, wine)` - Update existing record
- `deleteWine(id)` - Delete record
- `getWine(id)` - Retrieve single wine
- `getAllWines()` - Retrieve all wines (sorted by date)
- `searchWines(query)` - Search across multiple fields
- `exportData()` - Export all data as JSON
- `importData(jsonData)` - Import data from JSON

## Testing the PWA

1. Open Chrome DevTools
2. Go to Application tab
3. Check "Service Workers" - should show registered worker
4. Check "Manifest" - should show app info and icons
5. Test offline: Check "Offline" in Network tab, refresh page

## Installing as PWA

### Desktop (Chrome/Edge)
- Click the install icon in the address bar
- Or use browser menu → "Install app"

### Mobile (Chrome/Safari)
- Chrome: Menu → "Add to Home screen"
- Safari: Share → "Add to Home Screen"

## Multi-Platform Architecture

### Code Sharing Strategy
- **PWA version**: Modular files (`app.js`, `db.js`, `styles.css`) loaded separately
- **Standalone version**: All code embedded in single HTML file for portability
- **iOS app**: Uses standalone version in `www/` directory, wrapped by Capacitor

### Version Synchronization
When updating the app:
1. Modify PWA source files in `pwa-src/` directory
2. Copy updated files to root: `cp pwa-src/* .`
3. Rebuild standalone version by embedding updated code into `wine-app-standalone.html`
4. Copy standalone version to `www/index.html`
5. Run `npm run sync:ios` to update iOS app

### Platform-Specific Features
- **PWA**: Service Worker for offline caching, install prompts
- **Standalone**: No Service Worker (works on `file://` protocol)
- **iOS**: Native camera permissions, App Store compliance

## iOS App Store Deployment

### Bundle ID Configuration
- Current: `com.winerecord.app` (in `capacitor.config.json`)
- Must be unique for App Store submission
- Change before publishing: `com.yourname.winerecord`

### Required for App Store
1. **Apple Developer Account**: $99/year
2. **Privacy Policy URL**: Host `PRIVACY-POLICY.md` on web (required for review)
3. **Screenshots**: Generate from Xcode simulator (6.7" and 6.5" displays)
4. **App Icons**: Auto-generated by `generate-ios-icons.py` (15 sizes + App Store 1024x1024)

### Permissions (already configured in `ios/App/App/Info.plist`)
- `NSCameraUsageDescription`: Camera access for wine label photos
- `NSPhotoLibraryUsageDescription`: Photo library access for selecting images
- `NSPhotoLibraryAddUsageDescription`: Saving photos to library

See [APP-STORE-GUIDE.md](APP-STORE-GUIDE.md) for complete deployment steps.

## Common Issues

### Service Worker Not Updating (PWA only)
- Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
- Or: DevTools → Application → Service Workers → "Unregister"

### Camera Not Working
- **PWA/Web**: Requires HTTPS or localhost
- **Standalone**: Some browsers restrict camera on `file://` protocol
- **iOS**: Ensure permissions granted in Info.plist (already configured)

### Standalone vs PWA Decision
- Use **PWA** when: Need install prompts, Service Worker caching, web distribution
- Use **Standalone** when: Need offline HTML file, no server available, email distribution
- Use **iOS** when: Publishing to App Store, need native integration

## Key Documentation Files

- [README.md](README.md) - User-facing documentation (Japanese)
- [PROJECT-STRUCTURE.md](PROJECT-STRUCTURE.md) - Detailed project structure and file organization
- [docs/STANDALONE-GUIDE.md](docs/STANDALONE-GUIDE.md) - Standalone version installation guide
- [docs/APP-STORE-GUIDE.md](docs/APP-STORE-GUIDE.md) - Complete iOS App Store publishing guide
- [docs/INSTALL.md](docs/INSTALL.md) - PWA installation instructions
- [docs/PRIVACY-POLICY.md](docs/PRIVACY-POLICY.md) - Privacy policy (customize before App Store submission)
