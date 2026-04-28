// Mock for Ionicons
const React = require('react');
function Ionicon(props) {
  return React.createElement('RNText', { 'data-icon-name': 'Ionicon', ...props }, props.children || '');
}
module.exports = Ionicon;
