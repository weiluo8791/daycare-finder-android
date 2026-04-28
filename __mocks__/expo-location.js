// Mock for expo-location
module.exports = {
  requestForegroundPermissionsAsync: jest.fn(() =>
    Promise.resolve({ status: 'granted' })
  ),
  getCurrentPositionAsync: jest.fn(() =>
    Promise.resolve({
      coords: { latitude: 42.3601, longitude: -71.0589 },
    })
  ),
};
