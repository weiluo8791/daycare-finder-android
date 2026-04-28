// Mock for expo-image-picker
module.exports = {
  MediaTypeOptions: { Images: 'Images' },
  launchImageLibraryAsync: jest.fn(() =>
    Promise.resolve({
      canceled: false,
      assets: [{ uri: 'file://test-photo.jpg' }],
    })
  ),
};
