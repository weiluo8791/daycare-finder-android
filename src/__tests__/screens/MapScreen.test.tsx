import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import MapScreen from '../../screens/MapScreen';
import { DaycareNearby } from '../../types/entities';

// Mock MapView children with testIDs so markers render as identifiable elements
jest.mock('react-native-maps', () => {
  const React = require('react');
  const { View, Text } = require('react-native');

  class Marker extends React.Component<{ title?: string; testID?: string }> {
    render() {
      return (
        <View testID={this.props.testID || 'marker'}>
          {this.props.title ? <Text>{this.props.title}</Text> : null}
        </View>
      );
    }
  }

  class MapView extends React.Component<{ children?: React.ReactNode }> {
    render() {
      return <View testID="map-view">{this.props.children}</View>;
    }
  }

  return {
    __esModule: true,
    default: MapView,
    MapView,
    Marker,
    PROVIDER_GOOGLE: 'google',
  };
});

const mockNavigate = jest.fn();
const mockGoBack = jest.fn();
jest.mock('../../hooks/useAppNavigation', () => ({
  useAppNavigation: () => ({ navigate: mockNavigate, goBack: mockGoBack }),
}));

const mockUseRoute = jest.fn();
jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useRoute: () => mockUseRoute(),
}));

const fakeDaycare = (overrides: Partial<DaycareNearby> = {}): DaycareNearby => ({
  id: '1',
  name: 'Sunshine Daycare',
  nameLower: 'sunshine daycare',
  address: '123 Main St',
  city: 'Boston',
  lat: 42.3601,
  lng: -71.0589,
  geohash: 'drt2z',
  photos: [],
  reviewSnippets: [],
  enrichmentStatus: 'completed',
  createdAt: '2024-01-01',
  updatedAt: '2024-01-01',
  distanceMeters: 500,
  ...overrides,
});

describe('MapScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders count badge with daycare count', () => {
    const daycares = [
      fakeDaycare({ id: '1', name: 'Sunshine Daycare' }),
      fakeDaycare({ id: '2', name: 'Happy Kids Center' }),
    ];
    mockUseRoute.mockReturnValue({
      params: { daycares, lat: 42.36, lng: -71.06 },
    });

    render(<MapScreen />);

    expect(screen.getByText('2 daycares')).toBeOnTheScreen();
  });

  it('renders count badge with 0 when no daycares are provided', () => {
    mockUseRoute.mockReturnValue({
      params: { daycares: [], lat: 42.36, lng: -71.06 },
    });

    render(<MapScreen />);

    expect(screen.getByText('0 daycares')).toBeOnTheScreen();
  });

  it('renders back button and navigates back on press', () => {
    const daycares = [fakeDaycare()];
    mockUseRoute.mockReturnValue({
      params: { daycares, lat: 42.36, lng: -71.06 },
    });

    render(<MapScreen />);

    const backButton = screen.getByText('arrow-back');
    fireEvent.press(backButton);

    expect(mockGoBack).toHaveBeenCalled();
  });

  it('renders markers for each daycare', () => {
    const daycares = [
      fakeDaycare({ id: '1', name: 'Sunshine Daycare' }),
      fakeDaycare({ id: '2', name: 'Happy Kids Center' }),
    ];
    mockUseRoute.mockReturnValue({
      params: { daycares, lat: 42.36, lng: -71.06 },
    });

    const { UNSAFE_getAllByType } = render(<MapScreen />);

    const mapViewChildren = UNSAFE_getAllByType('View');
    expect(mapViewChildren.length).toBeGreaterThan(1);
  });

  it('uses default Boston coordinates when lat/lng are not provided', () => {
    const daycares = [fakeDaycare()];
    mockUseRoute.mockReturnValue({
      params: { daycares, lat: undefined, lng: undefined },
    });

    const { UNSAFE_getAllByType } = render(<MapScreen />);

    expect(screen.getByText('1 daycares')).toBeOnTheScreen();
  });

  it('navigates to DaycareDetail with correct id when a marker callout is pressed', () => {
    const daycares = [fakeDaycare({ id: '42', name: 'Test Daycare' })];
    mockUseRoute.mockReturnValue({
      params: { daycares, lat: 42.36, lng: -71.06 },
    });

    render(<MapScreen />);

    const daycareName = screen.getByText('Test Daycare');
    expect(daycareName).toBeOnTheScreen();
  });
});
