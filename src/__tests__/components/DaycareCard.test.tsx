import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { renderWithProviders } from '../test-utils';
import DaycareCard from '../../components/DaycareCard';
import { DaycareNearby } from '../../types/entities';

// Mock SaveButton to avoid AuthContext and hook dependencies
jest.mock('../../components/SaveButton', () => 'SaveButton');

function createMockDaycare(overrides: Partial<DaycareNearby> = {}): DaycareNearby {
  return {
    id: '1',
    name: 'Sunshine Daycare',
    nameLower: 'sunshine daycare',
    address: '123 Main St',
    city: 'Boston',
    state: 'MA',
    lat: 42.3601,
    lng: -71.0589,
    geohash: 'drt2y',
    photos: [],
    rating: 4.5,
    priceRange: '$$',
    reviewSnippets: [],
    enrichmentStatus: 'completed',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    distanceMeters: 500,
    ...overrides,
  };
}

describe('DaycareCard', () => {
  it('renders daycare name and address', () => {
    const daycare = createMockDaycare();
    const onPress = jest.fn();
    const { getByText } = renderWithProviders(
      <DaycareCard daycare={daycare} onPress={onPress} />,
    );

    expect(getByText('Sunshine Daycare')).toBeTruthy();
    expect(getByText('123 Main St, Boston')).toBeTruthy();
  });

  it('renders distance in meters when less than 1000', () => {
    const daycare = createMockDaycare({ distanceMeters: 500 });
    const onPress = jest.fn();
    const { getByText } = renderWithProviders(
      <DaycareCard daycare={daycare} onPress={onPress} />,
    );

    expect(getByText('500m')).toBeTruthy();
  });

  it('renders distance in miles when 1000 or more', () => {
    const daycare = createMockDaycare({ distanceMeters: 1500 });
    const onPress = jest.fn();
    const { getByText } = renderWithProviders(
      <DaycareCard daycare={daycare} onPress={onPress} />,
    );

    expect(getByText('1.5mi')).toBeTruthy();
  });

  it('renders edge case distance of exactly 1000 as miles', () => {
    const daycare = createMockDaycare({ distanceMeters: 1000 });
    const onPress = jest.fn();
    const { getByText } = renderWithProviders(
      <DaycareCard daycare={daycare} onPress={onPress} />,
    );

    expect(getByText('1.0mi')).toBeTruthy();
  });

  it('shows photo when available', () => {
    const daycare = createMockDaycare({
      photos: ['https://example.com/photo.jpg'],
    });
    const onPress = jest.fn();
    const { queryByText } = renderWithProviders(
      <DaycareCard daycare={daycare} onPress={onPress} />,
    );

    // The emoji placeholder should not be rendered
    expect(queryByText('🏫')).toBeNull();
  });

  it('shows emoji placeholder when no photo', () => {
    const daycare = createMockDaycare({ photos: [] });
    const onPress = jest.fn();
    const { getByText } = renderWithProviders(
      <DaycareCard daycare={daycare} onPress={onPress} />,
    );

    expect(getByText('🏫')).toBeTruthy();
  });

  it('shows rating when present', () => {
    const daycare = createMockDaycare({ rating: 4.5 });
    const onPress = jest.fn();
    const { getByText } = renderWithProviders(
      <DaycareCard daycare={daycare} onPress={onPress} />,
    );

    expect(getByText('4.5')).toBeTruthy();
  });

  it('does not show rating when absent', () => {
    const daycare = createMockDaycare({ rating: undefined });
    const onPress = jest.fn();
    const { queryByText } = renderWithProviders(
      <DaycareCard daycare={daycare} onPress={onPress} />,
    );

    expect(queryByText('star')).toBeNull();
  });

  it('shows priceRange when present', () => {
    const daycare = createMockDaycare({ priceRange: '$$$' });
    const onPress = jest.fn();
    const { getByText } = renderWithProviders(
      <DaycareCard daycare={daycare} onPress={onPress} />,
    );

    expect(getByText('$$$')).toBeTruthy();
  });

  it('does not show priceRange when absent', () => {
    const daycare = createMockDaycare({ priceRange: undefined });
    const onPress = jest.fn();
    const { queryByText } = renderWithProviders(
      <DaycareCard daycare={daycare} onPress={onPress} />,
    );

    expect(queryByText('$$$')).toBeNull();
  });

  it('calls onPress when tapped', () => {
    const daycare = createMockDaycare();
    const onPress = jest.fn();
    const { getByText } = renderWithProviders(
      <DaycareCard daycare={daycare} onPress={onPress} />,
    );

    fireEvent.press(getByText('Sunshine Daycare'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });
});
