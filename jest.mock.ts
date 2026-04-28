// Global mocks for React Native modules

jest.mock('@react-native-async-storage/async-storage', () => {
  const store: Record<string, string> = {};
  return {
    __esModule: true,
    default: {
      getItem: jest.fn((key: string) => Promise.resolve(store[key] ?? null)),
      setItem: jest.fn((key: string, value: string) => {
        store[key] = value;
        return Promise.resolve();
      }),
      removeItem: jest.fn((key: string) => {
        delete store[key];
        return Promise.resolve();
      }),
      clear: jest.fn(() => {
        Object.keys(store).forEach((k) => delete store[k]);
        return Promise.resolve();
      }),
    },
  };
});

jest.mock('expo-location', () => ({
  requestForegroundPermissionsAsync: jest.fn(() =>
    Promise.resolve({ status: 'granted' })
  ),
  getCurrentPositionAsync: jest.fn(() =>
    Promise.resolve({
      coords: { latitude: 42.3601, longitude: -71.0589 },
    })
  ),
}));

jest.mock('expo-image-picker', () => ({
  MediaTypeOptions: { Images: 'Images' },
  launchImageLibraryAsync: jest.fn(() =>
    Promise.resolve({
      canceled: false,
      assets: [{ uri: 'file://test-photo.jpg' }],
    })
  ),
}));

jest.mock('react-native-maps', () => {
  const RealComponent = jest.requireActual('react-native');
  class MapView extends RealComponent.View {
    static Marker = class Marker extends RealComponent.View {};
  }
  return {
    __esModule: true,
    default: MapView,
    MapView,
    Marker: MapView.Marker,
    PROVIDER_GOOGLE: 'google',
  };
});

// Mock @expo/vector-icons to avoid expo-font/expo-asset dependency chain
jest.mock('@expo/vector-icons', () => {
  const MockIon = 'Ionicons';
  return { Ionicons: MockIon };
});

jest.mock('@expo/vector-icons/Ionicons', () => 'Ionicons');

jest.mock('expo-font', () => ({
  loadAsync: jest.fn(),
  isLoaded: jest.fn(() => true),
  __esModule: true,
  default: { loadAsync: jest.fn(), isLoaded: jest.fn(() => true) },
}));

jest.mock('expo-asset', () => ({
  Asset: { fromModule: jest.fn(() => ({ downloadAsync: jest.fn() })) },
  useAssets: jest.fn(),
  __esModule: true,
  default: { Asset: { fromModule: jest.fn() } },
}));

jest.mock('expo-constants', () => ({
  default: { manifest: {}, expoConfig: {} },
  manifest: {},
  expoConfig: {},
}));

jest.mock('react-native-paper', () => {
  // Use createElement instead of JSX (setupFiles run before Babel transform)
  const React = { createElement: require('react').createElement };
  const RN = require('react-native');

  function view(props) {
    return React.createElement(RN.View, { ...props }, props.children);
  }
  function touchable(props) {
    const { children, onPress } = props;
    return React.createElement(RN.TouchableOpacity || RN.View, { onPress }, children);
  }
  function textInput(props) {
    const { value, onChangeText, secureTextEntry, label } = props;
    const rnProps = Object.fromEntries(
      Object.entries(props).filter(([k]) => !['label', 'mode', 'right'].includes(k))
    );
    return React.createElement(RN.TextInput || RN.View, { ...rnProps, value, onChangeText, secureTextEntry });
  }

  const MockCard = view;
  MockCard.Content = view;
  MockCard.Title = view;

  return {
    Provider: view,
    Button: touchable,
    TextInput: textInput,
    Card: MockCard,
    ActivityIndicator: view,
  };
});
