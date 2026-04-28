// Mock for react-native-paper
const React = require('react');
const RN = require('react-native');

function View(props) {
  return React.createElement(RN.View, props, props.children);
}
function Button(props) {
  const { children, onPress } = props;
  return React.createElement(RN.TouchableOpacity || RN.View, { onPress },
    typeof children === 'string' ? React.createElement(RN.Text, null, children) : children
  );
}
function TextInput(props) {
  return React.createElement(RN.TextInput || RN.View, {
    value: props.value,
    onChangeText: props.onChangeText,
    secureTextEntry: props.secureTextEntry,
    placeholder: typeof props.label === 'string' ? props.label : undefined,
  }, props.value || '');
}

const Card = View;
Card.Content = View;
Card.Title = View;

module.exports = {
  Provider: View,
  Button,
  TextInput,
  Card,
  ActivityIndicator: View,
};
