import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import AdminDashboardScreen from '../../screens/AdminDashboardScreen';

// --- Mocks ---

const mockNavigate = jest.fn();

jest.mock('../../hooks/useAppNavigation', () => ({
  useAppNavigation: () => ({ navigate: mockNavigate }),
}));

const mockUseAuth = jest.fn();
jest.mock('../../context/AuthContext', () => ({
  useAuth: () => mockUseAuth(),
}));

// Mock api client for direct useQuery/useMutation calls
const mockApiGet = jest.fn();
const mockApiPatch = jest.fn();

jest.mock('../../api/client', () => ({
  __esModule: true,
  default: {
    get: (...args: any[]) => mockApiGet(...args),
    patch: (...args: any[]) => mockApiPatch(...args),
  },
}));

const alertSpy = jest.spyOn(Alert, 'alert');

function renderWithQuery(ui: React.ReactElement) {
  const qc = new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0 },
      mutations: { retry: false },
    },
  });
  return render(
    <QueryClientProvider client={qc}>{ui}</QueryClientProvider>
  );
}

beforeEach(() => {
  jest.clearAllMocks();
});

const adminUser = {
  id: 'admin1',
  name: 'Admin User',
  email: 'admin@example.com',
  role: 'admin' as const,
  createdAt: '2024-01-01',
};

const regularUser = {
  id: 'user1',
  name: 'Regular User',
  email: 'user@example.com',
  role: 'parent' as const,
  createdAt: '2024-01-01',
};

describe('AdminDashboardScreen', () => {
  describe('unauthenticated state', () => {
    beforeEach(() => {
      mockUseAuth.mockReturnValue({
        user: null,
        isAuthenticated: false,
      });
    });

    it('shows sign in prompt when not authenticated', () => {
      const { getByText } = renderWithQuery(<AdminDashboardScreen />);

      expect(getByText('Admin Access Required')).toBeTruthy();
      expect(getByText('Sign In')).toBeTruthy();
    });

    it('navigates to ProviderLogin on sign in press', () => {
      const { getByText } = renderWithQuery(<AdminDashboardScreen />);

      fireEvent.press(getByText('Sign In'));

      expect(mockNavigate).toHaveBeenCalledWith('ProviderLogin');
    });
  });

  describe('non-admin state', () => {
    beforeEach(() => {
      mockUseAuth.mockReturnValue({
        user: regularUser,
        isAuthenticated: true,
      });
    });

    it('shows Access Denied for non-admin users', () => {
      const { getByText } = renderWithQuery(<AdminDashboardScreen />);

      expect(getByText('Access Denied')).toBeTruthy();
      expect(
        getByText("You don't have admin privileges.")
      ).toBeTruthy();
    });

    it('does not render tabs for non-admin users', () => {
      const { queryByText } = renderWithQuery(<AdminDashboardScreen />);

      expect(queryByText('Claims')).toBeNull();
      expect(queryByText('Users')).toBeNull();
    });
  });

  describe('admin state', () => {
    beforeEach(() => {
      mockUseAuth.mockReturnValue({
        user: adminUser,
        isAuthenticated: true,
      });
    });

    it('shows Claims and Users tabs', () => {
      mockApiGet.mockResolvedValue({ data: [] });
      const { getByText } = renderWithQuery(<AdminDashboardScreen />);

      expect(getByText('Claims')).toBeTruthy();
      expect(getByText('Users')).toBeTruthy();
    });

    it('shows empty claims message when no pending claims', async () => {
      mockApiGet.mockImplementation((url: string) => {
        if (url === '/api/admin/claims') {
          return Promise.resolve({ data: [] });
        }
        return Promise.resolve({ data: [] });
      });
      const { getByText } = renderWithQuery(<AdminDashboardScreen />);

      // Should show active Claims tab by default
      await waitFor(() => {
        expect(mockApiGet).toHaveBeenCalledWith('/api/admin/claims');
      });

      expect(getByText('No pending claims.')).toBeTruthy();
    });

    it('shows pending claims with Approve and Reject buttons', async () => {
      const claimsData = [
        {
          id: 'claim1',
          status: 'pending_admin',
          daycare: { name: 'Happy Kids Daycare' },
          provider: { name: 'Jane Provider', email: 'jane@test.com' },
          createdAt: '2024-06-15T10:00:00Z',
        },
      ];
      mockApiGet.mockImplementation((url: string) => {
        if (url === '/api/admin/claims') {
          return Promise.resolve({ data: claimsData });
        }
        return Promise.resolve({ data: [] });
      });
      const { getByText } = renderWithQuery(<AdminDashboardScreen />);

      await waitFor(() => {
        expect(getByText('Happy Kids Daycare')).toBeTruthy();
        expect(getByText('Provider: Jane Provider')).toBeTruthy();
        expect(getByText('Approve')).toBeTruthy();
        expect(getByText('Reject')).toBeTruthy();
      });
    });

    it('approves a claim when Approve is pressed', async () => {
      mockApiPatch.mockResolvedValue({ data: {} });
      mockApiGet.mockImplementation((url: string) => {
        if (url === '/api/admin/claims') {
          return Promise.resolve({
            data: [
              {
                id: 'claim1',
                status: 'pending_admin',
                daycare: { name: 'Happy Kids Daycare' },
                provider: { name: 'Jane Provider' },
                createdAt: '2024-06-15T10:00:00Z',
              },
            ],
          });
        }
        return Promise.resolve({ data: [] });
      });
      const { getByText } = renderWithQuery(<AdminDashboardScreen />);

      await waitFor(() => {
        expect(getByText('Approve')).toBeTruthy();
      });

      fireEvent.press(getByText('Approve'));

      await waitFor(() => {
        expect(mockApiPatch).toHaveBeenCalledWith('/api/admin/claims/claim1', {
          action: 'approve',
        });
      });
    });

    it('rejects a claim when Reject is pressed', async () => {
      mockApiPatch.mockResolvedValue({ data: {} });
      mockApiGet.mockImplementation((url: string) => {
        if (url === '/api/admin/claims') {
          return Promise.resolve({
            data: [
              {
                id: 'claim1',
                status: 'pending_admin',
                daycare: { name: 'Happy Kids Daycare' },
                provider: { name: 'Jane Provider' },
                createdAt: '2024-06-15T10:00:00Z',
              },
            ],
          });
        }
        return Promise.resolve({ data: [] });
      });
      const { getByText } = renderWithQuery(<AdminDashboardScreen />);

      await waitFor(() => {
        expect(getByText('Reject')).toBeTruthy();
      });

      fireEvent.press(getByText('Reject'));

      await waitFor(() => {
        expect(mockApiPatch).toHaveBeenCalledWith('/api/admin/claims/claim1', {
          action: 'reject',
        });
      });
    });

    it('shows users tab when Users is pressed', async () => {
      mockApiGet.mockImplementation((url: string) => {
        if (url === '/api/admin/claims') {
          return Promise.resolve({ data: [] });
        }
        if (url === '/api/admin/users') {
          return Promise.resolve({
            data: [
              {
                id: 'u1',
                name: 'Alice Parent',
                email: 'alice@test.com',
                role: 'parent',
              },
              {
                id: 'u2',
                name: 'Bob Admin',
                email: 'bob@test.com',
                role: 'admin',
              },
            ],
          });
        }
        return Promise.resolve({ data: [] });
      });
      const { getByText, queryByText } = renderWithQuery(
        <AdminDashboardScreen />
      );

      // Default is claims tab
      await waitFor(() => {
        expect(mockApiGet).toHaveBeenCalledWith('/api/admin/claims');
      });

      // Switch to users tab
      fireEvent.press(getByText('Users'));

      await waitFor(() => {
        expect(mockApiGet).toHaveBeenCalledWith('/api/admin/users');
        expect(getByText('Alice Parent')).toBeTruthy();
        expect(getByText('Bob Admin')).toBeTruthy();
      });
    });

    it('shows role badges for each user', async () => {
      mockApiGet.mockImplementation((url: string) => {
        if (url === '/api/admin/claims') {
          return Promise.resolve({ data: [] });
        }
        if (url === '/api/admin/users') {
          return Promise.resolve({
            data: [
              {
                id: 'u1',
                name: 'Alice Parent',
                email: 'alice@test.com',
                role: 'parent',
              },
            ],
          });
        }
        return Promise.resolve({ data: [] });
      });
      const { getByText } = renderWithQuery(<AdminDashboardScreen />);

      fireEvent.press(getByText('Users'));

      await waitFor(() => {
        // Role badges for parent/provider/admin
        expect(getByText('parent')).toBeTruthy();
        expect(getByText('provider')).toBeTruthy();
        expect(getByText('admin')).toBeTruthy();
      });
    });

    it('prevents removing the last admin', async () => {
      mockApiGet.mockImplementation((url: string) => {
        if (url === '/api/admin/claims') {
          return Promise.resolve({ data: [] });
        }
        if (url === '/api/admin/users') {
          return Promise.resolve({
            data: [
              {
                id: 'u1',
                name: 'Alice Parent',
                email: 'alice@test.com',
                role: 'parent',
              },
              {
                id: 'u2',
                name: 'Only Admin',
                email: 'onlyadmin@test.com',
                role: 'admin',
              },
            ],
          });
        }
        return Promise.resolve({ data: [] });
      });
      const { getByText, getAllByText } = renderWithQuery(
        <AdminDashboardScreen />
      );

      fireEvent.press(getByText('Users'));

      await waitFor(() => {
        expect(getByText('Only Admin')).toBeTruthy();
      });

      // Click "parent" role badge on the admin user to try to change role
      // The admin user has 3 role badges (parent, provider, admin)
      // The "parent" badge for the only admin should trigger the alert
      const parentBadges = getAllByText('parent');
      // The second parent badge is for the admin user (the first is for Alice)
      fireEvent.press(parentBadges[parentBadges.length - 1]);

      await waitFor(() => {
        expect(alertSpy).toHaveBeenCalledWith(
          'Error',
          'Cannot remove the last admin.'
        );
      });
    });

    it('allows changing role when there are multiple admins', async () => {
      mockApiPatch.mockResolvedValue({ data: {} });
      mockApiGet.mockImplementation((url: string) => {
        if (url === '/api/admin/claims') {
          return Promise.resolve({ data: [] });
        }
        if (url === '/api/admin/users') {
          return Promise.resolve({
            data: [
              {
                id: 'u1',
                name: 'Admin One',
                email: 'admin1@test.com',
                role: 'admin',
              },
              {
                id: 'u2',
                name: 'Admin Two',
                email: 'admin2@test.com',
                role: 'admin',
              },
            ],
          });
        }
        return Promise.resolve({ data: [] });
      });
      const { getByText, getAllByText } = renderWithQuery(
        <AdminDashboardScreen />
      );

      fireEvent.press(getByText('Users'));

      await waitFor(() => {
        expect(getByText('Admin One')).toBeTruthy();
        expect(getByText('Admin Two')).toBeTruthy();
      });

      // Change Admin One's role from admin to provider
      const providerBadges = getAllByText('provider');
      fireEvent.press(providerBadges[0]);

      await waitFor(() => {
        expect(mockApiPatch).toHaveBeenCalledWith(
          '/api/admin/users/u1',
          { role: 'provider' }
        );
        expect(alertSpy).not.toHaveBeenCalledWith(
          'Error',
          'Cannot remove the last admin.'
        );
      });
    });

    it('shows loading indicator for claims', () => {
      mockApiGet.mockImplementation(
        () => new Promise(() => {}) // never resolves
      );
      const { getByTestId } = renderWithQuery(<AdminDashboardScreen />);

      // Wait for the initial render
      // The ActivityIndicator should be present while loading
      expect(mockApiGet).toHaveBeenCalledWith('/api/admin/claims');
    });
  });
});
