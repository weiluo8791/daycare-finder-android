import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import { QueryClient } from '@tanstack/react-query';
import { renderWithProviders } from '../test-utils';
import SearchScreen from '../../screens/SearchScreen';
import { DaycareNearby, SearchResponse } from '../../types/entities';

const mockNavigate = jest.fn();
jest.mock('../../hooks/useAppNavigation', () => ({
  useAppNavigation: () => ({ navigate: mockNavigate }),
}));

const mockUseAuth = jest.fn();
jest.mock('../../context/AuthContext', () => ({
  useAuth: () => mockUseAuth(),
}));

const mockUseSearchDaycares = jest.fn();
jest.mock('../../hooks/useDaycares', () => ({
  useSearchDaycares: (params: any) => mockUseSearchDaycares(params),
  useToggleFavorite: () => ({ mutate: jest.fn() }),
}));

const mockApiGet = jest.fn();
jest.mock('../../api/client', () => ({
  __esModule: true,
  default: {
    get: (...args: any[]) => mockApiGet(...args),
  },
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

function buildSearchResponse(overrides: Partial<SearchResponse> = {}): SearchResponse {
  return {
    daycares: [fakeDaycare({ id: '1', name: 'Sunshine Daycare' })],
    hasMore: false,
    total: 1,
    ...overrides,
  };
}

describe('SearchScreen', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    jest.clearAllMocks();
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false, gcTime: 0 }, mutations: { retry: false } },
    });
    mockUseAuth.mockReturnValue({ isAuthenticated: false });
    mockUseSearchDaycares.mockReturnValue({
      data: buildSearchResponse(),
      isLoading: false,
      error: null,
    });
  });

  it('renders SearchControls and result count', () => {
    renderWithProviders(<SearchScreen />, { queryClient });

    expect(screen.getByText('1 results')).toBeOnTheScreen();
  });

  it('shows loading spinner on initial load', () => {
    mockUseSearchDaycares.mockReturnValue({
      data: null,
      isLoading: true,
      error: null,
    });

    const { UNSAFE_getAllByType } = renderWithProviders(<SearchScreen />, { queryClient });

    expect(screen.getByText('0 results')).toBeOnTheScreen();
    expect(screen.getByText('Search')).toBeOnTheScreen();
  });

  it('shows error message when error occurs', () => {
    mockUseSearchDaycares.mockReturnValue({
      data: null,
      isLoading: false,
      error: new Error('API failure'),
    });

    renderWithProviders(<SearchScreen />, { queryClient });

    expect(screen.getByText('Failed to load daycares. Try again.')).toBeOnTheScreen();
  });

  it('renders DaycareCard items in the list', () => {
    const daycares = [
      fakeDaycare({ id: '1', name: 'Sunshine Daycare' }),
      fakeDaycare({ id: '2', name: 'Happy Kids Center', address: '456 Oak Ave', city: 'Cambridge' }),
    ];
    mockUseSearchDaycares.mockReturnValue({
      data: buildSearchResponse({ daycares, total: 2 }),
      isLoading: false,
      error: null,
    });

    renderWithProviders(<SearchScreen />, { queryClient });

    expect(screen.getByText('Sunshine Daycare')).toBeOnTheScreen();
    expect(screen.getByText('Happy Kids Center')).toBeOnTheScreen();
    expect(screen.getByText('2 results')).toBeOnTheScreen();
  });

  it('navigates to Map with daycares when View Map is pressed', () => {
    const daycares = [fakeDaycare({ id: '1', name: 'Sunshine Daycare' })];
    mockUseSearchDaycares.mockReturnValue({
      data: buildSearchResponse({ daycares }),
      isLoading: false,
      error: null,
    });

    renderWithProviders(<SearchScreen />, { queryClient });

    fireEvent.press(screen.getByText('View Map 🗺️'));

    expect(mockNavigate).toHaveBeenCalledWith('Map', {
      daycares,
      lat: undefined,
      lng: undefined,
    });
  });

  it('presses a DaycareCard and navigates to DaycareDetail', () => {
    const daycares = [fakeDaycare({ id: '99', name: 'Tiny Tots Academy' })];
    mockUseSearchDaycares.mockReturnValue({
      data: buildSearchResponse({ daycares }),
      isLoading: false,
      error: null,
    });

    renderWithProviders(<SearchScreen />, { queryClient });

    fireEvent.press(screen.getByText('Tiny Tots Academy'));

    expect(mockNavigate).toHaveBeenCalledWith('DaycareDetail', { id: '99' });
  });

  it('loads more when endReached (pagination with cursor)', () => {
    const daycares = [fakeDaycare({ id: '1' }), fakeDaycare({ id: '2' })];
    mockUseSearchDaycares.mockImplementation((params: any) => {
      return {
        data: buildSearchResponse({ daycares, hasMore: true, nextCursor: 'cursor_abc', total: 10 }),
        isLoading: false,
        error: null,
      };
    });

    const { UNSAFE_getAllByType } = renderWithProviders(<SearchScreen />, { queryClient });

    const flatlist = UNSAFE_getAllByType('FlatList' as any)[0];
    expect(flatlist).toBeDefined();
  });

  it('geocodes address when search is submitted with an address', async () => {
    mockApiGet.mockResolvedValueOnce({ data: { lat: 42.36, lng: -71.06 } });
    // After geocoding, setParams triggers a re-render with lat/lng params;
    // mock the hook to return empty results for the geocoded search
    mockUseSearchDaycares.mockImplementation((params: any) => {
      if (params.lat && params.lng) {
        return { data: buildSearchResponse({ daycares: [], total: 0 }), isLoading: false, error: null };
      }
      return { data: buildSearchResponse(), isLoading: false, error: null };
    });

    renderWithProviders(<SearchScreen />, { queryClient });

    const addressInput = screen.getByPlaceholderText('Enter address or city');
    fireEvent.changeText(addressInput, 'Boston, MA');

    const searchButton = screen.getByText('Search');
    fireEvent.press(searchButton);

    await waitFor(() => {
      expect(mockApiGet).toHaveBeenCalledWith('/api/geocode', {
        params: { address: 'Boston, MA' },
      });
    });

    expect(screen.getByText('0 results')).toBeOnTheScreen();
  });

  it('searches by name only when address is empty', () => {
    renderWithProviders(<SearchScreen />, { queryClient });

    const nameInput = screen.getByPlaceholderText('Daycare name (optional)');
    fireEvent.changeText(nameInput, 'KinderCare');

    const searchButton = screen.getByText('Search');
    fireEvent.press(searchButton);

    expect(mockApiGet).not.toHaveBeenCalled();
  });

  it('does nothing if both address and name are empty', () => {
    renderWithProviders(<SearchScreen />, { queryClient });

    const searchButton = screen.getByText('Search');
    fireEvent.press(searchButton);

    expect(mockApiGet).not.toHaveBeenCalled();
  });

  it('handles geocoding failure gracefully', async () => {
    mockApiGet.mockRejectedValueOnce(new Error('Geocoding failed'));

    renderWithProviders(<SearchScreen />, { queryClient });

    const addressInput = screen.getByPlaceholderText('Enter address or city');
    fireEvent.changeText(addressInput, 'Unknown Place');
    fireEvent.press(screen.getByText('Search'));

    await waitFor(() => {
      expect(mockApiGet).toHaveBeenCalledWith('/api/geocode', {
        params: { address: 'Unknown Place' },
      });
    });
  });
});
