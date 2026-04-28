// Mock for react-native-maps
const React = require('react');
const RN = require('react-native');

class MapView extends RN.View {}
MapView.Marker = class Marker extends RN.View {};

module.exports = {
  __esModule: true,
  default: MapView,
  MapView,
  Marker: MapView.Marker,
  PROVIDER_GOOGLE: 'google',
};
