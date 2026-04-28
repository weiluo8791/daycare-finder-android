# E2E / Integration Test Plan — Daycare Finder Android

## Goal
Achieve >80% code coverage with comprehensive tests across all screens, components, hooks, and API client.

## Screens (11 total)
- [ ] LandingScreen
- [ ] SearchScreen
- [ ] MapScreen
- [ ] DaycareDetailScreen
- [ ] FavoritesScreen
- [ ] ProviderLoginScreen
- [ ] ProviderRegisterScreen
- [ ] ProviderDashboardScreen
- [ ] AdminDashboardScreen
- [ ] ClaimDaycareScreen
- [ ] EditListingScreen

## Components (3)
- [ ] DaycareCard
- [ ] SaveButton
- [ ] SearchControls

## Hooks & Context
- [ ] useDaycares (search, detail, favorites, toggle, nearby)
- [ ] useProvider (dashboard, claimed, searchEEC, claim, unclaim, update, register, upload)
- [ ] AuthContext (login, logout, session, state management)
- [ ] API Client (interceptors, credential login, session)

## Infrastructure
- [ ] Install testing dependencies
- [ ] Configure Jest
- [ ] Set up test mocks (API, navigation, AsyncStorage, Location)
- [ ] Run all tests and verify coverage

## Key Decisions
- Use Jest + @testing-library/react-native for component/integration tests
- Mock API calls with MSW or manual mocks
- Mock navigation with @react-navigation's test utilities
- Run in Node environment with react-native mock
