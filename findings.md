# Codebase Findings

## Project Structure
- Expo SDK 54, React 19.1, TypeScript 5.9
- React Navigation (stack + bottom tabs)
- TanStack React Query for data fetching
- Axios for HTTP client
- react-native-paper for UI components
- AsyncStorage for session persistence
- expo-location for geolocation

## Key Observation: No Test Dependencies
The project has **zero** test infrastructure — no Jest config, no test dependencies in package.json. Everything needs to be set up from scratch.

## API Patterns
- `api/client.ts` — Axios instance with session cookie interceptor, credential login, logout, getSession
- All data fetching uses TanStack React Query hooks
- Hooks are separated into `useDaycares.ts` (public) and `useProvider.ts` (provider/admin)

## Navigation Structure
- Root stack: Main (tabs) + DaycareDetail, ProviderLogin, ProviderRegister, ClaimDaycare, EditListing
- Tab bar: Home (Landing), Search (stack: SearchMain, Map, DaycareDetail), Favorites, Dashboard (Provider stack), Admin
- `useAppNavigation` wraps useNavigation with typed StackNavigationProp

## Mocking Needed
- AsyncStorage (jest mock)
- expo-location
- expo-image-picker
- react-native-maps (for MapScreen)
- react-native-paper
- Axios/API calls
- React Navigation

## Coverage Targets
- Statements: >80%
- Branches: >75%
- Functions: >80%
- Lines: >80%
