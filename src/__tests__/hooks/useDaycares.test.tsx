import React, { useRef, useEffect } from 'react';
import { Text } from 'react-native';
import { render, waitFor, screen } from '@testing-library/react-native';
import { createTestQueryClient, renderWithProviders } from '../test-utils';
import {
  useSearchDaycares,
  useDaycare,
  useFavorites,
  useToggleFavorite,
  useNearbyDaycares,
} from '../../hooks/useDaycares';

// Mock the API client default export
jest.mock('../../api/client', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    post: jest.fn(),
    delete: jest.fn(),
    patch: jest.fn(),
  },
}));

import api from '../../api/client';
const mockedApi = api as jest.Mocked<typeof api>;

// ---------------------------------------------------------------------------
// Test component helpers
// ---------------------------------------------------------------------------

/** Renders a query hook's data / loading / error state to testID-identified Text elements. */
function QueryRenderer({
  hook,
  hookArgs,
}: {
  hook: (...args: unknown[]) => { data: unknown; isPending: boolean; error: unknown };
  hookArgs?: unknown[];
}) {
  const { data, isPending, error } = hook(...(hookArgs || []));
  if (isPending) return <Text testID="loading">loading</Text>;
  if (error) return <Text testID="error">error</Text>;
  return <Text testID="data">{JSON.stringify(data)}</Text>;
}

/**
 * Calls a mutation hook's `mutate` once on mount and renders its lifecycle
 * state so tests can waitFor success / error.
 */
function MutationRenderer({
  hook,
  mutationArgs,
}: {
  hook: () => {
    mutate: (...args: unknown[]) => void;
    isPending: boolean;
    isSuccess: boolean;
    isError: boolean;
  };
  mutationArgs: unknown[];
}) {
  const mutation = hook();
  const started = useRef(false);

  useEffect(() => {
    if (!started.current) {
      started.current = true;
      mutation.mutate(...mutationArgs);
    }
  }, []);

  if (mutation.isPending) return <Text testID="pending">pending</Text>;
  if (mutation.isError) return <Text testID="error">error</Text>;
  if (mutation.isSuccess) return <Text testID="success">success</Text>;
  return <Text testID="idle">idle</Text>;
}

/** Renders a query and a mutation together so invalidation side-effects are visible. */
function QueryAndMutation({
  queryHook,
  queryArgs,
  mutationHook,
  mutationArgs,
}: {
  queryHook: (...args: unknown[]) => { data: unknown; isLoading: boolean };
  queryArgs: unknown[];
  mutationHook: () => { mutate: (...args: unknown[]) => void; isSuccess: boolean; isPending: boolean };
  mutationArgs: unknown[];
}) {
  const queryResult = queryHook(...queryArgs);
  const mutation = mutationHook();
  const started = useRef(false);

  useEffect(() => {
    if (!started.current && !queryResult.isLoading) {
      started.current = true;
      mutation.mutate(...mutationArgs);
    }
  }, [queryResult.isLoading]);

  return (
    <>
      <Text testID="query-data">{JSON.stringify(queryResult.data)}</Text>
      {mutation.isSuccess && <Text testID="mutation-success">success</Text>}
    </>
  );
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

beforeEach(() => {
  jest.clearAllMocks();
});

// ── useSearchDaycares ────────────────────────────────────────────────────

describe('useSearchDaycares', () => {
  it('fetches when lat and lng are provided', async () => {
    (mockedApi.get as jest.Mock).mockResolvedValue({
      data: { daycares: [], hasMore: false, total: 0 },
    });

    renderWithProviders(
      <QueryRenderer hook={useSearchDaycares} hookArgs={[{ lat: 40.7128, lng: -74.006 }]} />,
    );

    await waitFor(() => {
      expect(mockedApi.get).toHaveBeenCalledWith('/api/search', {
        params: { lat: 40.7128, lng: -74.006 },
      });
    });
  });

  it('fetches when name is provided', async () => {
    (mockedApi.get as jest.Mock).mockResolvedValue({
      data: { daycares: [], hasMore: false, total: 0 },
    });

    renderWithProviders(
      <QueryRenderer hook={useSearchDaycares} hookArgs={[{ name: 'Bright' }]} />,
    );

    await waitFor(() => {
      expect(mockedApi.get).toHaveBeenCalledWith('/api/search', {
        params: { name: 'Bright' },
      });
    });
  });

  it('is disabled when no search params are provided', async () => {
    renderWithProviders(<QueryRenderer hook={useSearchDaycares} hookArgs={[{}]} />);

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toBeTruthy();
    });
    expect(mockedApi.get).not.toHaveBeenCalled();
  });

  it('returns full search response data', async () => {
    const mockData = {
      daycares: [{ id: '1', name: 'Sunshine', distanceMeters: 200 }],
      hasMore: false,
      total: 1,
    };
    (mockedApi.get as jest.Mock).mockResolvedValue({ data: mockData });

    renderWithProviders(
      <QueryRenderer hook={useSearchDaycares} hookArgs={[{ lat: 40, lng: -74 }]} />,
    );

    await waitFor(() => {
      const el = screen.getByTestId('data');
      expect(JSON.parse(el.props.children)).toEqual(mockData);
    });
  });
});

// ── useDaycare ───────────────────────────────────────────────────────────

describe('useDaycare', () => {
  it('fetches daycare by id', async () => {
    const mockDaycare = { id: '1', name: 'Sunshine Daycare', address: '123 Main St' };
    (mockedApi.get as jest.Mock).mockResolvedValue({ data: mockDaycare });

    renderWithProviders(<QueryRenderer hook={useDaycare} hookArgs={['1']} />);

    await waitFor(() => {
      expect(mockedApi.get).toHaveBeenCalledWith('/api/daycare/1');
    });
  });

  it('is disabled when id is empty', async () => {
    renderWithProviders(<QueryRenderer hook={useDaycare} hookArgs={['']} />);

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toBeTruthy();
    });
    expect(mockedApi.get).not.toHaveBeenCalled();
  });

  it('returns daycare data', async () => {
    const mockDaycare = { id: '42', name: 'Test Daycare' };
    (mockedApi.get as jest.Mock).mockResolvedValue({ data: mockDaycare });

    renderWithProviders(<QueryRenderer hook={useDaycare} hookArgs={['42']} />);

    await waitFor(() => {
      const el = screen.getByTestId('data');
      expect(JSON.parse(el.props.children)).toEqual(mockDaycare);
    });
  });
});

// ── useFavorites ─────────────────────────────────────────────────────────

describe('useFavorites', () => {
  it('fetches favorites list', async () => {
    const mockFavorites = [
      { id: '1', name: 'Fav One' },
      { id: '2', name: 'Fav Two' },
    ];
    (mockedApi.get as jest.Mock).mockResolvedValue({ data: mockFavorites });

    renderWithProviders(<QueryRenderer hook={useFavorites} />);

    await waitFor(() => {
      expect(mockedApi.get).toHaveBeenCalledWith('/api/favorites');
    });

    await waitFor(() => {
      const el = screen.getByTestId('data');
      expect(JSON.parse(el.props.children)).toEqual(mockFavorites);
    });
  });
});

// ── useToggleFavorite ────────────────────────────────────────────────────

describe('useToggleFavorite', () => {
  it('calls POST when daycare is not saved', async () => {
    (mockedApi.post as jest.Mock).mockResolvedValue({ data: {} });

    renderWithProviders(
      <MutationRenderer
        hook={useToggleFavorite}
        mutationArgs={[{ daycareId: '1', isSaved: false }]}
      />,
    );

    await waitFor(() => {
      expect(screen.getByTestId('success')).toBeTruthy();
    });
    expect(mockedApi.post).toHaveBeenCalledWith('/api/favorites', { daycareId: '1' });
    expect(mockedApi.delete).not.toHaveBeenCalled();
  });

  it('calls DELETE when daycare is saved', async () => {
    (mockedApi.delete as jest.Mock).mockResolvedValue({ data: {} });

    renderWithProviders(
      <MutationRenderer
        hook={useToggleFavorite}
        mutationArgs={[{ daycareId: '1', isSaved: true }]}
      />,
    );

    await waitFor(() => {
      expect(screen.getByTestId('success')).toBeTruthy();
    });
    expect(mockedApi.delete).toHaveBeenCalledWith('/api/favorites', {
      data: { daycareId: '1' },
    });
    expect(mockedApi.post).not.toHaveBeenCalled();
  });

  it('invalidates favorites query on success', async () => {
    (mockedApi.get as jest.Mock).mockResolvedValue({ data: [] });
    (mockedApi.post as jest.Mock).mockResolvedValue({ data: {} });

    renderWithProviders(
      <QueryAndMutation
        queryHook={useFavorites}
        queryArgs={[]}
        mutationHook={useToggleFavorite}
        mutationArgs={[{ daycareId: '1', isSaved: false }]}
      />,
    );

    await waitFor(() => {
      expect(screen.getByTestId('mutation-success')).toBeTruthy();
    });

    // Initial fetch (from useFavorites) + refetch after invalidation = at least 2
    const favoritesCalls = (mockedApi.get as jest.Mock).mock.calls.filter(
      (call: unknown[]) => call[0] === '/api/favorites',
    );
    expect(favoritesCalls.length).toBeGreaterThanOrEqual(2);
  });
});

// ── useNearbyDaycares ────────────────────────────────────────────────────

describe('useNearbyDaycares', () => {
  it('fetches nearby daycares with default radius 10000', async () => {
    (mockedApi.get as jest.Mock).mockResolvedValue({
      data: { daycares: [], hasMore: false, total: 0 },
    });

    renderWithProviders(
      <QueryRenderer hook={useNearbyDaycares} hookArgs={[40.7128, -74.006]} />,
    );

    await waitFor(() => {
      expect(mockedApi.get).toHaveBeenCalledWith('/api/search', {
        params: { lat: 40.7128, lng: -74.006, radius: 10000 },
      });
    });
  });

  it('fetches with custom radius', async () => {
    (mockedApi.get as jest.Mock).mockResolvedValue({
      data: { daycares: [], hasMore: false, total: 0 },
    });

    renderWithProviders(
      <QueryRenderer hook={useNearbyDaycares} hookArgs={[40.7128, -74.006, 5000]} />,
    );

    await waitFor(() => {
      expect(mockedApi.get).toHaveBeenCalledWith('/api/search', {
        params: { lat: 40.7128, lng: -74.006, radius: 5000 },
      });
    });
  });

  it('is disabled when lat and lng are 0', async () => {
    renderWithProviders(<QueryRenderer hook={useNearbyDaycares} hookArgs={[0, 0]} />);

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toBeTruthy();
    });
    expect(mockedApi.get).not.toHaveBeenCalled();
  });
});
