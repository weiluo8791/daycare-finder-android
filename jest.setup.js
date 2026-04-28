// Mock console.error for expected error tests
global.console.error = jest.fn();

// Define __DEV__ for react-native (needed before react-native modules load)
global.__DEV__ = true;

// @react-navigation/native references document at module level (useDocumentTitle)
// Provide a minimal stub so tests don't crash
global.document = { title: '' };
