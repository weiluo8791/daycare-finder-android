// Mock for expo-asset
module.exports = {
  Asset: { fromModule: jest.fn(() => ({ downloadAsync: jest.fn() })) },
  useAssets: jest.fn(),
};
