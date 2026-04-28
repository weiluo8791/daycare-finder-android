// Mock console.error for expected error tests
global.console.error = jest.fn();

// Define __DEV__ for react-native
global.__DEV__ = true;

// Configure React Native Platform
const RN = require('react-native');
RN.Platform.OS = 'android';
RN.Platform.Version = 35;
