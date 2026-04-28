// Mock for react-native — provides minimal required exports
const React = require('react');

const Platform = { OS: 'android', Version: 35, select: (obj) => obj.android };
const StyleSheet = {
  create: (styles) => styles,
  flatten: (style) => (Array.isArray(style) ? Object.assign({}, ...style) : style),
};
const Dimensions = { get: () => ({ width: 375, height: 812 }) };

const I18nManager = {
  getConstants: () => ({ isRTL: false, localeIdentifier: 'en_US' }),
  isRTL: false,
  allowRTL: () => {},
  forceRTL: () => {},
  swapLeftAndRightInRTL: () => {},
};

module.exports = {
  Platform,
  StyleSheet,
  Dimensions,
  I18nManager,
  View: function View(props) { return React.createElement('View', props, props.children); },
  Text: function Text(props) { return React.createElement('Text', props, props.children); },
  TextInput: function TextInput(props) { return React.createElement('TextInput', props, props.children); },
  TouchableOpacity: function TouchableOpacity(props) {
    return React.createElement('TouchableOpacity', { ...props, accessibilityRole: 'button' }, props.children);
  },
  ScrollView: function ScrollView(props) { return React.createElement('ScrollView', props, props.children); },
  FlatList: function FlatList(props) {
    const data = props.data || [];
    var items;
    if (data.length === 0) {
      // ListEmptyComponent can be a render function or React element
      var empty = props.ListEmptyComponent;
      if (empty) {
        items = [React.createElement('View', { key: 'empty' },
          typeof empty === 'function' ? React.createElement(empty) : empty
        )];
      }
    } else {
      items = data.map(function(item, index) {
        var key = props.keyExtractor ? props.keyExtractor(item, index) : String(index);
        return props.renderItem({ item: item, index: index, separators: {} });
      });
    }
    return React.createElement('FlatList', props, items || []);
  },
  Image: function Image(props) { return React.createElement('Image', props); },
  Alert: { alert: jest.fn() },
  Linking: { openURL: jest.fn(() => Promise.resolve()) },
  ActivityIndicator: function ActivityIndicator() { return null; },
};
