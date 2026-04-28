module.exports = {
  transform: {
    '^.+\\.(ts|tsx|js|jsx)$': 'babel-jest',
  },
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|@react-navigation|@react-native-async-storage|@react-native-masked-view|react-native-maps|react-native-paper|react-native-safe-area-context|react-native-screens|react-native-gesture-handler|@expo|expo|expo-.*|expo/virtual|react-native-webview|react-native-dotenv|@tanstack)/)',
  ],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  moduleNameMapper: {
    '^react-native$': '<rootDir>/__mocks__/react-native.js',
    '^@react-native-async-storage/async-storage$': '<rootDir>/__mocks__/@react-native-async-storage/async-storage.js',
    '^@expo/vector-icons$': '<rootDir>/__mocks__/@expo/vector-icons.js',
    '^@expo/vector-icons/Ionicons$': '<rootDir>/__mocks__/@expo/vector-icons/Ionicons.js',
    '^@react-navigation/native$': '<rootDir>/__mocks__/@react-navigation/native.js',
    '^react-native-maps$': '<rootDir>/__mocks__/react-native-maps.js',
    '^react-native-paper$': '<rootDir>/__mocks__/react-native-paper.js',
    '^expo-location$': '<rootDir>/__mocks__/expo-location.js',
    '^expo-image-picker$': '<rootDir>/__mocks__/expo-image-picker.js',
    '^expo-font$': '<rootDir>/__mocks__/expo-font.js',
    '^expo-asset$': '<rootDir>/__mocks__/expo-asset.js',
    '^expo-constants$': '<rootDir>/__mocks__/expo-constants.js',
    '^expo$': '<rootDir>/__mocks__/expo.js',
    '^expo/virtual/env$': '<rootDir>/__mocks__/expo-virtual-env.js',
    '^expo-status-bar$': '<rootDir>/__mocks__/expo-status-bar.js',
  },
  setupFiles: ['./jest.setup.js'],
  moduleDirectories: ['node_modules', 'src'],
  testMatch: ['**/__tests__/**/*.test.(ts|tsx)'],
  collectCoverageFrom: [
    'src/**/*.(ts|tsx)',
    '!src/navigation/types.ts',
    '!src/types/entities.ts',
    '!src/types/navigation.ts',
    '!src/__tests__/**',
  ],
  coverageThreshold: {
    global: {
      branches: 75,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
};
