// Mock for @expo/vector-icons
var React = require('react');
var RN = require('react-native');
var TextComponent = RN.Text;

function createIcon(familyName) {
  return function Icon(props) {
    return React.createElement(
      TextComponent,
      Object.assign({}, props, { 'data-icon-name': familyName }),
      props.name || props.children || ''
    );
  };
}

module.exports = {
  Ionicons: createIcon('Ionicons'),
};
