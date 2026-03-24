# Web Migration Plan - FACEIT Data

> **Status**: In Progress  
> **Created**: March 2026  
> **ECC Standards**: v1.8 Compliant

---

## Executive Summary

This document outlines the migration strategy for expanding the FACEIT Data Expo (React Native) application to support web browsers. The project is **75% web-ready** with Metro bundler already configured for static web output.

### Current Web Configuration

```json
// app.json - Already configured
"web": {
  "bundler": "metro",
  "output": "static",
  "favicon": "./assets/images/favicon.png"
}
```

### Key Dependencies Status

| Package | Web Support | Action Required |
|---------|-------------|-----------------|
| `react-native-web` | Full | None |
| `expo-router` | Full | Add SEO metadata |
| `react-native-reanimated` | Partial | Test animations |
| `@expo/vector-icons` | Full | Consider lucide-react for web |
| `expo-linear-gradient` | Full | None |
| `expo-image` | Full | None |
| `axios` | Full | Check CORS handling |

---

## Milestone 1: Web Bundler Configuration

**Duration**: 1-2 days  
**Priority**: High

### 1.1 Verify Metro Web Configuration

The project already uses Metro bundler (recommended for Expo SDK 54+). No migration to Webpack required.

```bash
# Test web build
npm run web
```

### 1.2 Configure babel.config.js for Reanimated

Ensure `react-native-reanimated/plugin` is properly configured:

```javascript
// babel.config.js
module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      'react-native-reanimated/plugin', // Must be last
    ],
  };
};
```

### 1.3 Add Web-Specific Entry Point (Optional)

Create `index.web.js` only if custom web initialization is needed:

```javascript
// index.web.js (optional)
import { registerRootComponent } from 'expo';
import App from './App';

registerRootComponent(App);
```

### 1.4 Tasks Checklist

- [ ] Run `npm run web` and verify app loads
- [ ] Check browser console for errors
- [ ] Verify reanimated animations work on web
- [ ] Test static export: `npx expo export --platform web`

---

## Milestone 2: Component Refactoring (Responsive UI)

**Duration**: 3-5 days  
**Priority**: High

### 2.1 Architecture Strategy: Shared Logic vs Platform UI

```
components/
├── StatCard.tsx              # Shared logic + responsive styles
├── MatchItem.tsx             # Shared component
├── PlayerStats/
│   ├── PlayerStats.tsx       # Shared logic (hooks, state)
│   ├── PlayerStats.native.tsx # Mobile-optimized layout
│   └── PlayerStats.web.tsx   # Web-optimized layout with sidebar
└── ui/
    ├── SearchInput.tsx       # Shared
    └── Modal.web.tsx         # Web-specific modal
```

### 2.2 Responsive Breakpoints

Create `hooks/useResponsive.ts`:

```typescript
import { useWindowDimensions } from 'react-native';

export const BREAKPOINTS = {
  mobile: 0,
  tablet: 768,
  desktop: 1024,
  wide: 1440,
} as const;

export function useResponsive() {
  const { width } = useWindowDimensions();
  
  return {
    isMobile: width < BREAKPOINTS.tablet,
    isTablet: width >= BREAKPOINTS.tablet && width < BREAKPOINTS.desktop,
    isDesktop: width >= BREAKPOINTS.desktop,
    isWide: width >= BREAKPOINTS.wide,
    width,
  };
}
```

### 2.3 Player Stats Page - Responsive Design

#### Mobile Layout (Vertical Stack)
```
┌─────────────────────────┐
│      Player Header      │
│  [Avatar] Name + Level  │
├─────────────────────────┤
│        ELO Card         │
├─────────────────────────┤
│        K/D Card         │
├─────────────────────────┤
│      Matches Card       │
├─────────────────────────┤
│    Recent Matches       │
│    ┌─────────────┐      │
│    │  Match 1    │      │
│    ├─────────────┤      │
│    │  Match 2    │      │
│    └─────────────┘      │
└─────────────────────────┘
```

#### Web Layout (Sidebar + Grid)
```
┌──────────────────────────────────────────────────────────────┐
│                          Header                               │
├──────────────┬───────────────────────────────────────────────┤
│              │                                                │
│   Sidebar    │              Main Content                      │
│              │  ┌──────────────────────────────────────────┐ │
│  ┌────────┐  │  │           Player Header                  │ │
│  │ Search │  │  │   [Avatar]  Name + Level + ELO           │ │
│  └────────┘  │  └──────────────────────────────────────────┘ │
│              │                                                │
│  Favorites   │  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ │
│  - Player1   │  │  ELO   │ │  K/D   │ │ WinRate│ │Matches │ │
│  - Player2   │  └────────┘ └────────┘ └────────┘ └────────┘ │
│              │                                                │
│  Recent      │  Match History Grid                            │
│  Searches    │  ┌─────────┬─────────┬─────────┬─────────┐   │
│              │  │ Match 1 │ Match 2 │ Match 3 │ Match 4 │   │
│              │  ├─────────┼─────────┼─────────┼─────────┤   │
│              │  │ Match 5 │ Match 6 │ Match 7 │ Match 8 │   │
│              │  └─────────┴─────────┴─────────┴─────────┘   │
└──────────────┴───────────────────────────────────────────────┘
```

### 2.4 Refactored PlayerStats Component

Create `app/player/[username].tsx` with responsive layout:

```typescript
import { useResponsive } from '@/hooks/useResponsive';
import { Platform, StyleSheet, View } from 'react-native';

export default function PlayerStatsScreen() {
  const { isDesktop } = useResponsive();
  
  // ... existing state and data fetching logic ...

  if (isDesktop && Platform.OS === 'web') {
    return (
      <View style={styles.webContainer}>
        <WebSidebar />
        <View style={styles.mainContent}>
          <PlayerHeader player={player} />
          <StatsGrid stats={stats} columns={4} />
          <MatchHistoryGrid matches={history} columns={4} />
        </View>
      </View>
    );
  }

  // Mobile layout (existing)
  return (
    <ScrollView>
      <PlayerHeader player={player} />
      <StatsStack stats={stats} />
      <MatchList matches={history} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  webContainer: {
    flexDirection: 'row',
    flex: 1,
  },
  mainContent: {
    flex: 1,
    padding: 24,
  },
});
```

### 2.5 Web Sidebar Component

Create `components/WebSidebar.tsx`:

```typescript
import { Platform, StyleSheet, View } from 'react-native';
import { SearchInput } from './ui/SearchInput';
import { FavoritesList } from './FavoritesList';
import { RecentSearches } from './RecentSearches';

export function WebSidebar() {
  if (Platform.OS !== 'web') return null;

  return (
    <View style={styles.sidebar}>
      <SearchInput />
      <FavoritesList />
      <RecentSearches />
    </View>
  );
}

const styles = StyleSheet.create({
  sidebar: {
    width: 280,
    borderRightWidth: 1,
    borderRightColor: 'rgba(255,255,255,0.1)',
    padding: 16,
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
});
```

### 2.6 Fix useColorScheme.web.ts

Replace static value with proper system detection:

```typescript
// components/useColorScheme.web.ts
import { useEffect, useState } from 'react';

type ColorScheme = 'light' | 'dark';

export function useColorScheme(): ColorScheme {
  const [scheme, setScheme] = useState<ColorScheme>(() => {
    if (typeof window === 'undefined') return 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handler = (e: MediaQueryListEvent) => {
      setScheme(e.matches ? 'dark' : 'light');
    };

    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  return scheme;
}
```

### 2.7 Tasks Checklist

- [ ] Create `hooks/useResponsive.ts`
- [ ] Fix `components/useColorScheme.web.ts`
- [ ] Create `components/WebSidebar.tsx`
- [ ] Create responsive `StatsGrid` component
- [ ] Create responsive `MatchHistoryGrid` component
- [ ] Update `app/player/[username].tsx` with responsive layout
- [ ] Test on mobile, tablet, and desktop viewports

---

## Milestone 3: SEO & Routing (Expo Router for Web)

**Duration**: 2-3 days  
**Priority**: High

### 3.1 Add SEO Metadata to Player Pages

Use `expo-router`'s Head component for dynamic metadata:

```typescript
// app/player/[username].tsx
import Head from 'expo-router/head';

export default function PlayerStatsScreen() {
  const { username } = useLocalSearchParams();
  const [player, setPlayer] = useState<Player | null>(null);

  return (
    <>
      <Head>
        <title>{player?.nickname || username} - FACEIT Stats</title>
        <meta name="description" content={`View ${player?.nickname}'s CS2 statistics on FACEIT - ELO: ${player?.games?.cs2?.faceit_elo}, Level: ${player?.games?.cs2?.skill_level}`} />
        
        {/* Open Graph */}
        <meta property="og:title" content={`${player?.nickname} - FACEIT Stats`} />
        <meta property="og:description" content={`ELO: ${player?.games?.cs2?.faceit_elo} | Level: ${player?.games?.cs2?.skill_level}`} />
        <meta property="og:image" content={player?.avatar || 'https://faceitdata.com/og-default.png'} />
        <meta property="og:type" content="profile" />
        
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content={`${player?.nickname} - FACEIT Stats`} />
      </Head>
      
      {/* ... rest of component */}
    </>
  );
}
```

### 3.2 Update +html.tsx for Global SEO

```typescript
// app/+html.tsx
import { ScrollViewStyleReset } from 'expo-router/html';

export default function Root({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
        
        {/* Global SEO */}
        <title>FACEIT Data - CS2 Player Statistics</title>
        <meta name="description" content="Track your FACEIT CS2 stats, ELO, K/D ratio, and match history." />
        <meta name="keywords" content="FACEIT, CS2, Counter-Strike, stats, ELO, statistics" />
        
        {/* Favicon */}
        <link rel="icon" href="/favicon.png" />
        <link rel="apple-touch-icon" href="/logo.png" />
        
        {/* Open Graph Defaults */}
        <meta property="og:site_name" content="FACEIT Data" />
        <meta property="og:locale" content="en_US" />
        
        <ScrollViewStyleReset />
      </head>
      <body>{children}</body>
    </html>
  );
}
```

### 3.3 Canonical URLs and Sitemap

Create `public/robots.txt`:

```
User-agent: *
Allow: /

Sitemap: https://faceitdata.com/sitemap.xml
```

Create dynamic sitemap generation (server-side or build-time):

```typescript
// scripts/generate-sitemap.ts
const routes = [
  '/',
  '/favorites',
];

// Add popular player profiles dynamically
```

### 3.4 URL Structure for SEO

| Route | URL | SEO Priority |
|-------|-----|--------------|
| Home | `/` | High |
| Favorites | `/favorites` | Medium |
| Player Profile | `/player/s1mple` | Very High |
| Match Details | `/match/abc123` | Low |

### 3.5 Tasks Checklist

- [ ] Install `expo-router/head` (included with expo-router)
- [ ] Add Head component to `app/player/[username].tsx`
- [ ] Add Head component to `app/match/[id].tsx`
- [ ] Update `app/+html.tsx` with global meta tags
- [ ] Create `public/robots.txt`
- [ ] Configure canonical URLs
- [ ] Test with Google Rich Results Test

---

## Milestone 4: Performance Optimization

**Duration**: 2-3 days  
**Priority**: Medium

### 4.1 Asset Compression

Configure Metro for web asset optimization in `metro.config.js`:

```javascript
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Web-specific optimizations
config.transformer = {
  ...config.transformer,
  minifierConfig: {
    compress: {
      drop_console: true, // Remove console.log in production
    },
  },
};

module.exports = config;
```

### 4.2 Image Optimization

Use `expo-image` with proper sizing:

```typescript
// components/OptimizedImage.tsx
import { Image } from 'expo-image';

export function OptimizedImage({ src, width, height }) {
  return (
    <Image
      source={src}
      style={{ width, height }}
      contentFit="cover"
      placeholder={blurhash}
      transition={200}
      // Web-specific: Add loading="lazy" via props
    />
  );
}
```

### 4.3 Code Splitting (Automatic with Expo Router)

Expo Router automatically code-splits routes. Ensure lazy loading:

```typescript
// Lazy load heavy components
const MatchHistoryGrid = React.lazy(() => import('@/components/MatchHistoryGrid'));
```

### 4.4 Bundle Analysis

Add bundle analyzer script:

```json
// package.json
{
  "scripts": {
    "analyze": "npx expo export --platform web && npx source-map-explorer dist/_expo/static/js/*.js"
  }
}
```

### 4.5 Caching Strategy

Implement service worker for offline support (optional):

```typescript
// app/+html.tsx
<script>
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js');
  }
</script>
```

### 4.6 Tasks Checklist

- [ ] Configure Metro minifier
- [ ] Audit and optimize images
- [ ] Add lazy loading for heavy components
- [ ] Run bundle analysis
- [ ] Test Lighthouse performance score
- [ ] Configure caching headers for static assets

---

## API Considerations (CORS & Environment)

### Current API Configuration

```typescript
// services/faceit.ts
const API_KEY = process.env.EXPO_PUBLIC_FACEIT_API_KEY;
const BASE_URL = 'https://open.faceit.com/data/v4';
```

### CORS Status

The FACEIT API (`https://open.faceit.com`) **does allow CORS** for browser requests with proper Authorization headers. No proxy needed.

### Environment Variable Handling

Expo automatically handles `EXPO_PUBLIC_*` variables for web. Ensure `.env` is configured:

```bash
# .env
EXPO_PUBLIC_FACEIT_API_KEY=your-api-key-here
```

**Security Note**: API keys prefixed with `EXPO_PUBLIC_` are exposed to the client. For production, consider:

1. **Rate limiting** on the API key
2. **Server-side proxy** for sensitive operations
3. **Domain restrictions** on the FACEIT API key

### Recommended API Wrapper for Web

```typescript
// services/faceit.ts - Add error boundary for web
const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Authorization': `Bearer ${API_KEY || ''}`,
    'Accept': 'application/json',
  },
  timeout: 10000,
  // Add retry logic for web flakiness
  validateStatus: (status) => status < 500,
});

// Add request interceptor for web-specific handling
if (Platform.OS === 'web') {
  api.interceptors.response.use(
    (response) => response,
    (error) => {
      // Handle CORS errors gracefully
      if (error.message === 'Network Error') {
        console.error('CORS or network error - check API configuration');
      }
      return Promise.reject(error);
    }
  );
}
```

---

## Files Requiring Changes

### High Priority

| File | Change Type | Description |
|------|-------------|-------------|
| `components/useColorScheme.web.ts` | Fix | Detect system color scheme |
| `app/player/[username].tsx` | Enhance | Add SEO + responsive layout |
| `app/match/[id].tsx` | Enhance | Add SEO metadata |
| `hooks/useResponsive.ts` | Create | Responsive breakpoints hook |

### Medium Priority

| File | Change Type | Description |
|------|-------------|-------------|
| `components/WebSidebar.tsx` | Create | Web-only sidebar component |
| `components/StatsGrid.tsx` | Create | Responsive stats grid |
| `components/MatchHistoryGrid.tsx` | Create | Responsive match grid |
| `app/+html.tsx` | Enhance | Global SEO meta tags |

### Low Priority

| File | Change Type | Description |
|------|-------------|-------------|
| `metro.config.js` | Enhance | Production optimizations |
| `public/robots.txt` | Create | SEO robots file |
| `index.html` | Review | Resolve conflict with Expo Router |

---

## Testing Checklist

### Before Deployment

- [ ] Test on Chrome, Firefox, Safari, Edge
- [ ] Test responsive breakpoints (320px, 768px, 1024px, 1440px)
- [ ] Verify SEO meta tags with browser dev tools
- [ ] Run Lighthouse audit (target: 90+ performance)
- [ ] Test keyboard navigation
- [ ] Verify color scheme detection

### Post-Deployment

- [ ] Submit sitemap to Google Search Console
- [ ] Test Open Graph with Facebook Debugger
- [ ] Test Twitter Card with Twitter Card Validator
- [ ] Monitor Core Web Vitals

---

## Timeline Summary

| Milestone | Duration | Dependencies |
|-----------|----------|--------------|
| 1. Bundler Config | 1-2 days | None |
| 2. Component Refactoring | 3-5 days | Milestone 1 |
| 3. SEO & Routing | 2-3 days | Milestone 2 |
| 4. Performance | 2-3 days | Milestone 3 |

**Total Estimated Duration**: 8-13 days

---

## References

- [Expo Router Web Documentation](https://docs.expo.dev/router/reference/web/)
- [React Native Web](https://necolas.github.io/react-native-web/)
- [Expo SEO Guide](https://docs.expo.dev/router/reference/seo/)
- [FACEIT API Documentation](https://developers.faceit.com/docs)
