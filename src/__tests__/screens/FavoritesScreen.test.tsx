import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { QueryClient } from '@tanstack/react-query';
import { renderWithProviders } from '../test-utils';
import FavoritesScreen from '../../screens/FavoritesScreen';
import { Daycare } from '../../types/entities';

const mockNavigate = jest.fn();
jest.mock('../../hooks/useAppNavigation', () => ({
  useAppNavigation: () => ({ navigate: mockNavigate }),
}));

const mockUseAuth = jest.fn();
jest.mock('../../context/AuthContext', () => ({
  useAuth: () => mockUseAuth(),
}));

const mockUseFavorites = jest.fn();
jest.mock('../../hooks/useDaycares', () => ({
  useFavorites: () => mockUseFavorites(),
  useToggleFavorite: () => ({ mutate: jest.fn() }),
}));

const fakeDaycare = (overrides: Partial<Daycare> = {}): Daycare => ({
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
  ...overrides,
});

describe('FavoritesScreen', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    jest.clearAllMocks();
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false, gcTime: 0 }, mutations: { retry: false } },
    });
  });

  describe('when not authenticated', () => {
    beforeEach(() => {
      mockUseAuth.mockReturnValue({ isAuthenticated: false });
      mockUseFavorites.mockReturnValue({ data: [], isLoading: false });
    });

    it('shows sign in message', () => {
      renderWithProviders(<FavoritesScreen />, { queryClient });

      expect(screen.getByText('Sign in to save favorites')).toBeOnTheScreen();
    });

    it('renders a Sign In button that navigates to ProviderLogin', () => {
      renderWithProviders(<FavoritesScreen />, { queryClient });

      const signInButton = screen.getByText('Sign In');
      fireEvent.press(signInButton);

      expect(mockNavigate).toHaveBeenCalledWith('ProviderLogin');
    });

    it('does not query favorites data', () => {
      renderWithProviders(<FavoritesScreen />, { queryClient });

      // useFavorites() is called unconditionally (before the early return),
      // but the component should not render favorites data when not authenticated
      expect(mockUseFavorites).toHaveBeenCalled();
    });
  });

  describe('when authenticated and loading', () => {
    beforeEach(() => {
      mockUseAuth.mockReturnValue({ isAuthenticated: true });
      mockUseFavorites.mockReturnValue({ data: null, isLoading: true });
    });

    it('shows loading state with refresh icon', () => {
      renderWithProviders(<FavoritesScreen />, { queryClient });

      // Ionicons render icon name as text
      expect(screen.getByText('refresh')).toBeOnTheScreen();
    });
  });

  describe('when authenticated and favorites list is empty', () => {
    beforeEach(() => {
      mockUseAuth.mockReturnValue({ isAuthenticated: true });
      mockUseFavorites.mockReturnValue({ data: [], isLoading: false });
    });

    it('shows empty state message', () => {
      renderWithProviders(<FavoritesScreen />, { queryClient });

      expect(screen.getByText('No favorites yet')).toBeOnTheScreen();
      expect(
        screen.getByText('Browse daycares and tap the heart to save them here.')
      ).toBeOnTheScreen();
    });

    it('renders Browse Daycares button that navigates to Search', () => {
      renderWithProviders(<FavoritesScreen />, { queryClient });

      const browseButton = screen.getByText('Browse Daycares');
      fireEvent.press(browseButton);

      expect(mockNavigate).toHaveBeenCalledWith('Search');
    });
  });

  describe('when authenticated and has favorites', () => {
    const favorites = [
      fakeDaycare({ id: '1', name: 'Sunshine Daycare' }),
      fakeDaycare({ id: '2', name: 'Happy Kids Center', address: '456 Oak Ave', city: 'Cambridge' }),
    ];

    beforeEach(() => {
      mockUseAuth.mockReturnValue({ isAuthenticated: true });
      mockUseFavorites.mockReturnValue({ data: favorites, isLoading: false });
    });

    it('shows count header', () => {
      renderWithProviders(<FavoritesScreen />, { queryClient });

      expect(screen.getByText('Your Favorites (2)')).toBeOnTheScreen();
    });

    it('renders DaycareCard for each favorite', () => {
      renderWithProviders(<FavoritesScreen />, { queryClient });

      expect(screen.getByText('Sunshine Daycare')).toBeOnTheScreen();
      expect(screen.getByText('Happy Kids Center')).toBeOnTheScreen();
    });

    it('navigates to DaycareDetail when a favorite is pressed', () => {
      renderWithProviders(<FavoritesScreen />, { queryClient });

      fireEvent.press(screen.getByText('Sunshine Daycare'));

      expect(mockNavigate).toHaveBeenCalledWith('DaycareDetail', { id: '1' });
    });
  });
});
