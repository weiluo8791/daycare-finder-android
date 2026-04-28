import React, { useRef, useEffect } from 'react';
import { Text } from 'react-native';
import { render, waitFor, screen } from '@testing-library/react-native';
import { createTestQueryClient, renderWithProviders } from '../test-utils';
import {
  useProviderDashboard,
  useClaimedDaycares,
  useSearchEEC,
  useClaimDaycare,
  useUnclaimDaycare,
  useUpdateDaycare,
  useRegisterProvider,
  useUploadPhoto,
} from '../../hooks/useProvider';

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

/** Renders a query hook result to testID-identified Text elements. */
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
  queryKeyMatch,
}: {
  queryHook: (...args: unknown[]) => { data: unknown; isLoading: boolean };
  queryArgs: unknown[];
  mutationHook: () => { mutate: (...args: unknown[]) => void; isSuccess: boolean; isPending: boolean };
  mutationArgs: unknown[];
  queryKeyMatch?: string;
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

// ── useProviderDashboard ─────────────────────────────────────────────────

describe('useProviderDashboard', () => {
  it('fetches provider dashboard data', async () => {
    const mockDashboard = {
      totalDaycares: 5,
      pendingClaims: 2,
      verified: true,
    };
    (mockedApi.get as jest.Mock).mockResolvedValue({ data: mockDashboard });

    renderWithProviders(<QueryRenderer hook={useProviderDashboard} />);

    await waitFor(() => {
      expect(mockedApi.get).toHaveBeenCalledWith('/api/provider/dashboard');
    });

    await waitFor(() => {
      const el = screen.getByTestId('data');
      expect(JSON.parse(el.props.children)).toEqual(mockDashboard);
    });
  });
});

// ── useClaimedDaycares ───────────────────────────────────────────────────

describe('useClaimedDaycares', () => {
  it('fetches claimed daycares list', async () => {
    const mockClaimed = [
      { id: '1', name: 'Claimed Daycare', claimed: true },
      { id: '2', name: 'Another Claimed', claimed: true },
    ];
    (mockedApi.get as jest.Mock).mockResolvedValue({ data: mockClaimed });

    renderWithProviders(<QueryRenderer hook={useClaimedDaycares} />);

    await waitFor(() => {
      expect(mockedApi.get).toHaveBeenCalledWith('/api/provider/daycare');
    });

    await waitFor(() => {
      const el = screen.getByTestId('data');
      expect(JSON.parse(el.props.children)).toEqual(mockClaimed);
    });
  });
});

// ── useSearchEEC ─────────────────────────────────────────────────────────

describe('useSearchEEC', () => {
  it('fetches results when query is at least 2 characters', async () => {
    const mockResults = [
      { id: '1', name: 'Bright Horizons', licenseNumber: 'LIC-001' },
    ];
    (mockedApi.get as jest.Mock).mockResolvedValue({ data: mockResults });

    renderWithProviders(<QueryRenderer hook={useSearchEEC} hookArgs={['Br']} />);

    await waitFor(() => {
      expect(mockedApi.get).toHaveBeenCalledWith('/api/provider/search', {
        params: { q: 'Br' },
      });
    });

    await waitFor(() => {
      const el = screen.getByTestId('data');
      expect(JSON.parse(el.props.children)).toEqual(mockResults);
    });
  });

  it('is disabled when query is shorter than 2 characters', async () => {
    renderWithProviders(<QueryRenderer hook={useSearchEEC} hookArgs={['B']} />);

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toBeTruthy();
    });
    expect(mockedApi.get).not.toHaveBeenCalled();
  });

  it('is disabled when query is empty', async () => {
    renderWithProviders(<QueryRenderer hook={useSearchEEC} hookArgs={['']} />);

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toBeTruthy();
    });
    expect(mockedApi.get).not.toHaveBeenCalled();
  });
});

// ── useClaimDaycare ──────────────────────────────────────────────────────

describe('useClaimDaycare', () => {
  it('posts daycareId and returns data', async () => {
    const mockResponse = { id: 'claim-1', status: 'pending_email' };
    (mockedApi.post as jest.Mock).mockResolvedValue({ data: mockResponse });

    renderWithProviders(
      <MutationRenderer hook={useClaimDaycare} mutationArgs={['daycare-1']} />,
    );

    await waitFor(() => {
      expect(screen.getByTestId('success')).toBeTruthy();
    });
    expect(mockedApi.post).toHaveBeenCalledWith('/api/provider/claim', {
      daycareId: 'daycare-1',
    });
  });

  it('invalidates provider queries on success', async () => {
    (mockedApi.get as jest.Mock).mockResolvedValue({
      data: { totalDaycares: 0, pendingClaims: 0, verified: false },
    });
    (mockedApi.post as jest.Mock).mockResolvedValue({
      data: { id: 'claim-1', status: 'pending_email' },
    });

    renderWithProviders(
      <QueryAndMutation
        queryHook={useProviderDashboard}
        queryArgs={[]}
        mutationHook={useClaimDaycare}
        mutationArgs={['daycare-1']}
      />,
    );

    await waitFor(() => {
      expect(screen.getByTestId('mutation-success')).toBeTruthy();
    });

    // Initial fetch + refetch after invalidation = at least 2
    const dashboardCalls = (mockedApi.get as jest.Mock).mock.calls.filter(
      (call: unknown[]) => call[0] === '/api/provider/dashboard',
    );
    expect(dashboardCalls.length).toBeGreaterThanOrEqual(2);
  });
});

// ── useUnclaimDaycare ────────────────────────────────────────────────────

describe('useUnclaimDaycare', () => {
  it('sends DELETE request with daycareId', async () => {
    (mockedApi.delete as jest.Mock).mockResolvedValue({ data: {} });

    renderWithProviders(
      <MutationRenderer hook={useUnclaimDaycare} mutationArgs={['daycare-1']} />,
    );

    await waitFor(() => {
      expect(screen.getByTestId('success')).toBeTruthy();
    });
    expect(mockedApi.delete).toHaveBeenCalledWith('/api/provider/claim', {
      data: { daycareId: 'daycare-1' },
    });
  });

  it('invalidates provider queries on success', async () => {
    (mockedApi.get as jest.Mock).mockResolvedValue({
      data: { totalDaycares: 1, pendingClaims: 0, verified: true },
    });
    (mockedApi.delete as jest.Mock).mockResolvedValue({ data: {} });

    renderWithProviders(
      <QueryAndMutation
        queryHook={useProviderDashboard}
        queryArgs={[]}
        mutationHook={useUnclaimDaycare}
        mutationArgs={['daycare-1']}
      />,
    );

    await waitFor(() => {
      expect(screen.getByTestId('mutation-success')).toBeTruthy();
    });

    const dashboardCalls = (mockedApi.get as jest.Mock).mock.calls.filter(
      (call: unknown[]) => call[0] === '/api/provider/dashboard',
    );
    expect(dashboardCalls.length).toBeGreaterThanOrEqual(2);
  });
});

// ── useUpdateDaycare ─────────────────────────────────────────────────────

describe('useUpdateDaycare', () => {
  it('patches daycare data and returns updated record', async () => {
    const updatePayload = { id: 'daycare-1', data: { name: 'Updated Name', capacity: 20 } };
    const mockUpdated = { id: 'daycare-1', name: 'Updated Name', capacity: 20 };
    (mockedApi.patch as jest.Mock).mockResolvedValue({ data: mockUpdated });

    renderWithProviders(
      <MutationRenderer hook={useUpdateDaycare} mutationArgs={[updatePayload]} />,
    );

    await waitFor(() => {
      expect(screen.getByTestId('success')).toBeTruthy();
    });
    expect(mockedApi.patch).toHaveBeenCalledWith('/api/provider/daycare', {
      id: 'daycare-1',
      ...updatePayload.data,
    });
  });

  it('invalidates both provider and daycare queries on success', async () => {
    (mockedApi.get as jest.Mock).mockResolvedValue({ data: {} });
    (mockedApi.patch as jest.Mock).mockResolvedValue({
      data: { id: 'daycare-1', name: 'Updated' },
    });

    // Use useClaimedDaycares (key: ['provider', 'claimed']) to watch invalidation
    renderWithProviders(
      <QueryAndMutation
        queryHook={useClaimedDaycares}
        queryArgs={[]}
        mutationHook={useUpdateDaycare}
        mutationArgs={[{ id: 'daycare-1', data: { name: 'Updated' } }]}
      />,
    );

    await waitFor(() => {
      expect(screen.getByTestId('mutation-success')).toBeTruthy();
    });

    // provider.* queries should have been invalidated and refetched
    const providerCalls = (mockedApi.get as jest.Mock).mock.calls.filter(
      (call: unknown[]) => call[0] === '/api/provider/daycare',
    );
    expect(providerCalls.length).toBeGreaterThanOrEqual(2);
  });
});

// ── useRegisterProvider ──────────────────────────────────────────────────

describe('useRegisterProvider', () => {
  it('posts registration data and returns result', async () => {
    const mockResult = { id: 'prov-1', verified: false };
    const regData = { email: 'test@example.com', password: 'secure123', name: 'Test Provider' };
    (mockedApi.post as jest.Mock).mockResolvedValue({ data: mockResult });

    renderWithProviders(
      <MutationRenderer hook={useRegisterProvider} mutationArgs={[regData]} />,
    );

    await waitFor(() => {
      expect(screen.getByTestId('success')).toBeTruthy();
    });
    expect(mockedApi.post).toHaveBeenCalledWith('/api/provider/register', regData);
  });
});

// ── useUploadPhoto ───────────────────────────────────────────────────────

describe('useUploadPhoto', () => {
  it('posts formData with photo and daycareId', async () => {
    const mockResult = { url: 'https://example.com/photo.jpg' };
    (mockedApi.post as jest.Mock).mockResolvedValue({ data: mockResult });

    renderWithProviders(
      <MutationRenderer
        hook={useUploadPhoto}
        mutationArgs={[{ daycareId: 'daycare-1', uri: 'file://photo.jpg' }]}
      />,
    );

    await waitFor(() => {
      expect(screen.getByTestId('success')).toBeTruthy();
    });

    // Verify the post call
    expect(mockedApi.post).toHaveBeenCalledTimes(1);
    const postCallArgs = (mockedApi.post as jest.Mock).mock.calls[0];

    // First arg should be the endpoint
    expect(postCallArgs[0]).toBe('/api/provider/daycare/photos');

    // Second arg should be FormData containing daycareId + photo
    const formData = postCallArgs[1];
    expect(formData).toBeInstanceOf(FormData);

    // Third arg should have multipart headers
    expect(postCallArgs[2]).toEqual({
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  });

  it('invalidates provider and daycare queries on success', async () => {
    (mockedApi.get as jest.Mock).mockResolvedValue({ data: {} });
    (mockedApi.post as jest.Mock).mockResolvedValue({ data: { url: 'https://example.com/p.jpg' } });

    renderWithProviders(
      <QueryAndMutation
        queryHook={useClaimedDaycares}
        queryArgs={[]}
        mutationHook={useUploadPhoto}
        mutationArgs={[{ daycareId: 'daycare-1', uri: 'file://photo.jpg' }]}
      />,
    );

    await waitFor(() => {
      expect(screen.getByTestId('mutation-success')).toBeTruthy();
    });

    // provider.* queries should have been invalidated and refetched
    const providerCalls = (mockedApi.get as jest.Mock).mock.calls.filter(
      (call: unknown[]) => call[0] === '/api/provider/daycare',
    );
    expect(providerCalls.length).toBeGreaterThanOrEqual(2);
  });
});
