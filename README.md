# Daycare Finder Android

A comprehensive native Android application for finding and managing daycare providers.

## Features

- **Provider Discovery**: Search for daycare providers based on location and preferences.
- **Detailed Listings**: View comprehensive details about each provider, including hours, capacity, and services.
- **Favorites Management**: Save and organize favorite providers for quick access.
- **Provider Portal**: Dedicated registration and listing management for daycare providers.
- **Interactive Map**: Visualize provider locations using native maps integration.
- **Authentication**: Secure user and provider authentication and profile management.

## Technical Stack

- **Framework**: React Native / Expo
- **Language**: TypeScript
- **State Management**: React Context API
- **Styling**: React Native Paper
- **API Communication**: Axios
- **Testing**: Jest & React Native Testing Library

## Testing & Quality Assurance

The project maintains a high standard of quality with a comprehensive test suite:

- **Unit & Integration Tests**: Extensive coverage for API clients, authentication logic, and utility functions.
- **Component Tests**: All major screens (Search, Favorites, Register, Detail) are tested for behavioral correctness.
- **Coverage**: The project aims for 80%+ code coverage across all functional areas.

Run tests with:
```bash
npm test
```

## Getting Started

### Prerequisites
- Node.js (LTS)
- Expo Go app on Android device or an Android Emulator

### Installation
1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd daycare-finder-android
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure environment variables:
   Create a `.env` file based on the provided template.

4. Start the development server:
   ```bash
   npm start
   ```
