# Android App Deployment Guide

This guide covers building and deploying the Daycare Finder Android app.

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Local Development](#local-development)
3. [Environment Setup](#environment-setup)
4. [Running on Emulator](#running-on-emulator)
5. [Running on Physical Device](#running-on-physical-device)
6. [Production Build](#production-build)
   - [Option A: Local Gradle Build (APK)](#option-a-local-gradle-build-apk)
   - [Option B: EAS Build (Recommended)](#option-b-eas-build-recommended)
7. [Google Play Store Release](#google-play-store-release)
8. [Troubleshooting](#troubleshooting)

---

## Prerequisites

| Tool | Version | Install |
|------|---------|---------|
| Node.js | 24+ | [fnm](https://github.com/Schniz/fnm) or [nvm](https://github.com/nvm-sh/nvm) |
| Java JDK | 17+ | `brew install openjdk@17` (macOS) or Android Studio bundled |
| Android Studio | Latest | https://developer.android.com/studio |
| Expo CLI | Latest | `npm install -g expo-cli` |

Verify your environment:

```bash
node --version    # v24.x.x
java -version     # 17+
```

---

## Local Development

### 1. Install dependencies

```bash
cd /path/to/daycare-finder-android
npm install
```

### 2. Start the web backend

The Android app requires the [Daycare Finder web backend](../omc-autopilot-daycare-finder) to be running.

```bash
cd /path/to/omc-autopilot-daycare-finder
npm run dev
# or
./dev.sh
```

The backend should be accessible at `http://localhost:3000`.

---

## Environment Setup

### Create `.env`

```bash
cp .env.example .env
```

### Configure for your environment

#### Android Emulator

```env
EXPO_PUBLIC_API_BASE_URL=http://10.0.2.2:3000
EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
```

> `10.0.2.2` is the Android emulator's special loopback address to the host machine.

#### Physical Device (same Wi-Fi network)

```bash
# Find your computer's LAN IP
ifconfig | grep "inet " | grep -v 127.0.0.1
# Example: 192.168.1.42
```

```env
EXPO_PUBLIC_API_BASE_URL=http://192.168.1.42:3000
EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
```

#### Production Backend

```env
EXPO_PUBLIC_API_BASE_URL=https://your-app.amplifyapp.com
EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=your_production_google_maps_api_key
```

### Get a Google Maps API Key

1. Go to https://console.cloud.google.com
2. Create or select a project
3. **APIs & Services** → **Enabled APIs & Services**
4. Enable **Maps SDK for Android**
5. **Credentials** → **Create credentials** → **API key**
6. Restrict the key:
   - **Application restriction**: Android apps
   - Add your app's package name (e.g., `com.yourcompany.daycarefinder`)
   - Add your SHA-1 certificate fingerprint (get it with: `cd android && ./gradlew signingReport`)

---

## Running on Emulator

### 1. Start the Android emulator

Open Android Studio → **Device Manager** → **Create Device** (if you don't have one) → Start an existing device.

Or via command line:

```bash
# List available AVDs
emulator -list-avds

# Start an AVD
emulator -avd <avd_name>
```

### 2. Start the Expo dev server

```bash
npm start
```

### 3. Launch on emulator

Press `a` in the Expo CLI, or run:

```bash
npm run android
```

---

## Running on Physical Device

### Enable USB debugging

1. On your Android device: **Settings** → **About phone** → Tap **Build number** 7 times
2. **Developer options** → Enable **USB debugging**
3. Connect device to computer via USB

### Verify connection

```bash
adb devices
# Should show your device
```

### Start the app

```bash
npm start
# Then press 'a' or:
npm run android
```

### Over Wi-Fi (no USB cable)

```bash
# Connect device to same Wi-Fi as computer
# In Expo Go app, scan the QR code from `npm start`
# Or manually enter the URL shown in the terminal
```

---

## Production Build

### Option A: Local Gradle Build (APK)

This generates a standalone APK you can distribute directly.

```bash
# Generate native Android project
npx expo prebuild --platform android --clean

# Build release APK
cd android
./gradlew assembleRelease
```

The APK will be at:
```
android/app/build/outputs/apk/release/app-release.apk
```

> **Note:** The first build will be slow. Subsequent builds are faster.

### Option B: EAS Build (Recommended)

[EAS Build](https://docs.expo.dev/build/introduction/) is Expo's cloud build service. No need to install Android Studio or manage build tooling.

#### Setup

```bash
# Install EAS CLI
npm install -g eas-cli

# Log in to Expo account
eas login

# Configure project
eas build:configure
```

#### Build Android APK

```bash
eas build --platform android --profile preview
```

#### Build Android App Bundle (AAB) for Play Store

```bash
eas build --platform android --profile production
```

EAS will:
1. Upload your project to Expo's build servers
2. Build in the cloud
3. Provide a download link when done

---

## Google Play Store Release

### Prerequisites

- Google Play Developer account ($25 one-time fee)
- Signed AAB (App Bundle) from EAS Build or local Gradle build

### Steps

1. **Generate a signing keystore** (if not using EAS managed credentials):
   ```bash
   keytool -genkey -v -keystore daycare-finder.keystore -alias daycarefinder -keyalg RSA -keysize 2048 -validity 10000
   ```

2. **Upload to Play Console**:
   - Go to https://play.google.com/console
   - Create app → Fill in store listing details
   - **Production** → **Create new release**
   - Upload your AAB file
   - Complete the release checklist

3. **Internal Testing** (recommended before production):
   - Upload AAB to **Internal testing** track first
   - Invite testers via email
   - Verify the app works end-to-end before promoting to production

### Auto-increment Version

Update `app.json` before each release:

```json
{
  "expo": {
    "version": "1.0.1",
    "android": {
      "versionCode": 2
    }
  }
}
```

> `versionCode` must be an integer and must increase with every upload to Play Console.

---

## Troubleshooting

### Build Issues

| Problem | Fix |
|---------|-----|
| `gradlew: Permission denied` | `chmod +x android/gradlew` |
| Build fails with Java version error | Ensure JDK 17 is active: `export JAVA_HOME=/usr/lib/jvm/java-17-openjdk` |
| `expo prebuild` fails | Delete `android/` and `ios/` directories, then re-run |
| Metro bundler won't start | `npx expo start --clear` to clear cache |
| App crashes on launch | Check `adb logcat` for native errors |

### Runtime Issues

| Problem | Fix |
|---------|-----|
| `Network request failed` | Verify backend is running and `EXPO_PUBLIC_API_BASE_URL` points to the correct IP |
| Blank white screen on launch | Check Metro bundler logs for TypeScript/runtime errors |
| Map not showing | Verify Google Maps API key and that Maps SDK for Android is enabled |
| Location permission denied | Grant location permission in Android Settings → Apps → Daycare Finder → Permissions |
| Photo upload fails | Ensure backend has `S3_BUCKET_NAME` configured and the user is authenticated |
| Google OAuth loops / fails | Check redirect URI config in Google Cloud Console matches the app |

### Getting Logs

```bash
# Metro bundler logs (JavaScript)
npm start

# Android system logs (native)
adb logcat | grep ReactNative

# Specific to your app
adb logcat -s daycarefinder
```

---

## Related Documentation

- [Web Backend README](../omc-autopilot-daycare-finder/README.md)
- [Web Backend Deployment Guide](../omc-autopilot-daycare-finder/DEPLOYMENT_GUIDE.md)
- [Expo Documentation](https://docs.expo.dev)
- [React Native Documentation](https://reactnative.dev)
- [Google Maps Platform](https://developers.google.com/maps/documentation/android-sdk/start)
