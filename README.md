# Daycare Finder - Android App

Native Android application for the Daycare Finder platform. Built with React Native + Expo.

## Features

### Parent / Consumer
- **Landing Screen** - App intro with CTAs for search and provider login
- **Search** - Find daycares by address, name, or current GPS location
- **Map View** - Interactive Google Maps with daycare markers and callout navigation
- **Daycare Detail** - Full profile with photos, contact info, hours, capacity, and reviews
- **Favorites** - Save and manage preferred daycares with quick access

### Provider
- **Provider Login** - Email/password authentication with session persistence
- **Provider Registration** - Create provider account with validation
- **Provider Dashboard** - Manage claimed daycares and view favorites count
- **Claim Daycare** - Search EEC database and submit claim requests
- **Edit Listing** - Update description, email, website, price range, and upload photos
- **Unclaim** - Remove daycare ownership with confirmation

### Admin
- **Admin Dashboard** - Claims approval queue and user role management
- **Approve/Reject Claims** - Process provider daycare claims with one-tap actions
- **User Management** - Change user roles (parent/provider/admin)
- **Last-Admin Guard** - Prevents removing the only admin account

## Tech Stack

- React 19.1.0
- React Native 0.81.5
- Expo SDK ~54.0.33
- TypeScript ~5.9.2
- React Navigation (Stack + Bottom Tabs)
- TanStack Query (React Query) v5
- React Native Paper v5 (UI components)
- React Native Maps (Google Maps)
- Expo Location (GPS)
- Expo Image Picker (Photo upload)
- Expo Auth Session (Google OAuth)
- AsyncStorage (Session persistence)
- Axios (HTTP client)

## Project Structure

```
src/
├── api/
│   └── client.ts           # Axios client with cookie-based auth + AsyncStorage
├── components/
│   ├── DaycareCard.tsx     # Search result card with photo, name, distance
│   ├── SaveButton.tsx      # Favorite toggle with optimistic updates
│   └── SearchControls.tsx  # Search input fields (address, name, GPS)
├── context/
│   └── AuthContext.tsx     # Authentication state with session persistence
├── hooks/
│   ├── useAppNavigation.ts # Typed navigation hook wrapper
│   ├── useDaycares.ts      # Daycare data queries/mutations (search, favorites, detail)
│   └── useProvider.ts      # Provider data queries/mutations (claim, edit, dashboard)
├── navigation/
│   ├── AppNavigator.tsx    # Root navigation (Bottom Tabs + Stack)
│   └── types.ts            # Navigation type definitions + route params
├── screens/
│   ├── LandingScreen.tsx
│   ├── SearchScreen.tsx
│   ├── MapScreen.tsx
│   ├── DaycareDetailScreen.tsx
│   ├── FavoritesScreen.tsx
│   ├── ProviderLoginScreen.tsx
│   ├── ProviderRegisterScreen.tsx
│   ├── ProviderDashboardScreen.tsx
│   ├── ClaimDaycareScreen.tsx
│   ├── EditListingScreen.tsx
│   └── AdminDashboardScreen.tsx
├── types/
│   └── entities.ts         # Shared TypeScript interfaces (Daycare, User, etc.)
└── utils/
    └── constants.ts        # Colors, config values, theme tokens
```

## Prerequisites

- Node.js 24+ (recommended: install via [fnm](https://github.com/Schniz/fnm))
- [Android Studio](https://developer.android.com/studio) (for emulator) or a physical Android device
- The [Daycare Finder web backend](../omc-autopilot-daycare-finder) running locally or deployed

## Setup

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Configure environment**
   ```bash
   cp .env.example .env
   # Edit .env with your API base URL and Google Maps API key
   ```

3. **Start the app**
   ```bash
   npm start         # Start Expo dev server
   npm run android   # Run on Android emulator/device
   ```

## Backend Connection

This Android app consumes the existing Next.js web app API. Configure the API base URL in `.env`:

| Environment | `EXPO_PUBLIC_API_BASE_URL` value |
|-------------|----------------------------------|
| Android Emulator | `http://10.0.2.2:3000` (special loopback to host) |
| Physical Device (same Wi-Fi) | `http://YOUR_COMPUTER_IP:3000` |
| Production | `https://your-deployed-domain.com` |

> **Note:** The web backend must be running before starting the Android app. See the [web project README](../omc-autopilot-daycare-finder/README.md) for backend setup.

## Authentication

- **Email/Password** (Providers): Direct API integration with session cookie storage in AsyncStorage
- **Google OAuth** (Parents): Uses `expo-auth-session` for Google sign-in via system browser
- Session cookies are stored in AsyncStorage and included with all API requests automatically

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `EXPO_PUBLIC_API_BASE_URL` | Yes | Backend API base URL |
| `EXPO_PUBLIC_GOOGLE_MAPS_API_KEY` | Yes | Google Maps API key for Android native maps |

See `.env.example` for the full template.

## Building for Production

### Option A: Local Gradle Build (APK)

```bash
# Generate native Android project
npx expo prebuild --platform android

# Build release APK
cd android
./gradlew assembleRelease

# APK will be at: android/app/build/outputs/apk/release/app-release.apk
```

### Option B: EAS Build (Recommended)

```bash
# Install EAS CLI globally
npm install -g eas-cli

# Log in to your Expo account
eas login

# Configure build
eas build:configure

# Build Android APK or AAB
eas build --platform android --profile production
```

## Troubleshooting

| Problem | Fix |
|---------|-----|
| App can't connect to backend (emulator) | Ensure `EXPO_PUBLIC_API_BASE_URL=http://10.0.2.2:3000` — `localhost` does not work in emulator |
| App can't connect to backend (physical device) | Use your computer's actual LAN IP (e.g., `http://192.168.1.42:3000`) and ensure both are on the same Wi-Fi |
| Map shows blank / gray tiles | Verify `EXPO_PUBLIC_GOOGLE_MAPS_API_KEY` is set and the Maps SDK for Android is enabled in Google Cloud Console |
| Photos not uploading | Check that the backend has `S3_BUCKET_NAME` configured (see web project deployment guide) |
| Auth session lost on app restart | AsyncStorage should persist cookies automatically — check that `AuthContext` mounted correctly |
| Google OAuth fails | Ensure the redirect URI in Google Cloud Console matches `com.googleusercontent.apps.YOUR_CLIENT_ID:/oauth2redirect` |

## License

Same as the parent web project.
