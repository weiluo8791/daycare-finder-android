// Mock for @react-navigation/native
// Provides a NavigationContainer that doesn't access document (avoids ReferenceError in Node)
var React = require('react');

function NavigationContainer(props) {
  return React.createElement('View', null, props.children);
}

function useNavigation() {
  return { navigate: jest.fn(), goBack: jest.fn(), reset: jest.fn() };
}

module.exports = {
  NavigationContainer: NavigationContainer,
  useNavigation: useNavigation,
  useFocusEffect: jest.fn(),
  useRoute: jest.fn(function() { return { params: {} }; }),
};
