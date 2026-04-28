import React from 'react';
import { View, Text } from 'react-native';
import { render, screen, waitFor } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthProvider, useAuth } from '../../context/AuthContext';
import { User } from '../../types/entities';
import { renderWithProviders } from '../test-utils';

// ---------------------------------------------------------------------------
// Mock the api/client module
// ---------------------------------------------------------------------------
// AuthContext statically imports { getSession } and dynamically imports
// { loginWithCredentials, logout } from '../../api/client'.  By mocking the
// module at the top level both static and dynamic imports return the mocked
// exports.

const mockGetSession = jest.fn();
const mockLoginWithCredentials = jest.fn();
const mockLogoutFn = jest.fn();

jest.mock('../../api/client', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
  },
  getSession: (...args: any[]) => mockGetSession(...args),
  loginWithCredentials: (...args: any[]) => mockLoginWithCredentials(...args),
  logout: (...args: any[]) => mockLogoutFn(...args),
}));

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------
const mockUser: User = {
  id: 'user-1',
  name: 'Alice',
  email: 'alice@example.com',
  role: 'parent',
  createdAt: '2025-01-01T00:00:00.000Z',
};

const sessionUser = {
  id: 'session-1',
  name: 'Bob',
  email: 'bob@example.com',
  image: 'https://example.com/avatar.png',
  role: 'provider',
  createdAt: '2025-06-15T12:00:00.000Z',
};

// ---------------------------------------------------------------------------
// Helper: test component that exposes AuthContext values
// ---------------------------------------------------------------------------
function TestComponent() {
  const auth = useAuth();
  return (
    <View>
      <Text testID="isLoading">{String(auth.isLoading)}</Text>
      <Text testID="isAuthenticated">{String(auth.isAuthenticated)}</Text>
      <Text testID="user">{auth.user ? JSON.stringify(auth.user) : 'null'}</Text>
      <Text testID="user-email">{auth.user?.email ?? 'null'}</Text>
      <Text testID="children-rendered">hello</Text>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Helper: capture auth context values for programmatic access in tests
// ---------------------------------------------------------------------------
let capturedAuth: {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: User | null) => void;
  refreshUser: () => Promise<void>;
};

function AuthCapture() {
  capturedAuth = useAuth();
  return null;
}

// ---------------------------------------------------------------------------
// Helper: render inside both providers so QueryClient/Navigation are also
//         available (matching the app's hierarchy)
// ---------------------------------------------------------------------------
function renderInAuthProvider(ui: React.ReactElement) {
  return renderWithProviders(<AuthProvider>{ui}</AuthProvider>);
}

// ---------------------------------------------------------------------------
// Setup / teardown
// ---------------------------------------------------------------------------
beforeEach(async () => {
  jest.clearAllMocks();
  await AsyncStorage.clear();

  // Default: session API returns nothing useful unless a test overrides
  mockGetSession.mockResolvedValue({ user: null });
});
afterEach(() => {
  jest.useRealTimers();
});

// ===========================================================================
// Loading state
// ===========================================================================
describe('loading state on mount', () => {
  it('initially shows loading, then becomes false after initialization', async () => {
    // Create a deferred promise before render so resolveSession is
    // synchronously assigned (not dependent on when the mock is called).
    let resolveSession!: (value: unknown) => void;
    const deferredPromise = new Promise<{ user: null }>((resolve) => {
      resolveSession = resolve;
    });
    mockGetSession.mockImplementation(() => deferredPromise);

    renderInAuthProvider(<TestComponent />);

    // Initially loading — the session promise hasn't resolved yet
    expect(screen.getByTestId('isLoading')).toHaveTextContent('true');

    // Resolve the session request so init completes
    resolveSession({ user: null });

    await waitFor(() => {
      expect(screen.getByTestId('isLoading')).toHaveTextContent('false');
    });
  });

  it('sets isLoading to false even when the init throws', async () => {
    mockGetSession.mockRejectedValue(new Error('API down'));

    renderInAuthProvider(<TestComponent />);

    await waitFor(() => {
      expect(screen.getByTestId('isLoading')).toHaveTextContent('false');
    });
  });
});

// ===========================================================================
// Restoring user from AsyncStorage
// ===========================================================================
describe('restoring user from AsyncStorage', () => {
  it('loads a stored user into state on mount', async () => {
    await AsyncStorage.setItem('user', JSON.stringify(mockUser));
    // Session API must also return the user, otherwise refreshUser() clears it
    mockGetSession.mockResolvedValue({ user: mockUser });

    renderInAuthProvider(<TestComponent />);

    await waitFor(() => {
      expect(screen.getByTestId('user-email')).toHaveTextContent(
        'alice@example.com',
      );
    });
  });

  it('overrides the stored user when the session API returns a different user', async () => {
    await AsyncStorage.setItem('user', JSON.stringify(mockUser));

    mockGetSession.mockResolvedValue({
      user: {
        id: 'session-99',
        name: 'Charlie',
        email: 'charlie@example.com',
        image: null,
        role: 'admin',
        createdAt: '2025-03-01T00:00:00.000Z',
      },
    });

    renderInAuthProvider(<TestComponent />);

    await waitFor(() => {
      expect(screen.getByTestId('user-email')).toHaveTextContent(
        'charlie@example.com',
      );
    });
  });
});

// ===========================================================================
// Restoring user from session API
// ===========================================================================
describe('restoring user from session API', () => {
  it('sets the user when getSession returns a valid user', async () => {
    mockGetSession.mockResolvedValue({ user: sessionUser });

    renderInAuthProvider(<TestComponent />);

    await waitFor(() => {
      expect(screen.getByTestId('user-email')).toHaveTextContent(
        'bob@example.com',
      );
    });
  });

  it('persists the session user to AsyncStorage', async () => {
    mockGetSession.mockResolvedValue({ user: sessionUser });

    renderInAuthProvider(<TestComponent />);

    await waitFor(() => {
      expect(screen.getByTestId('isLoading')).toHaveTextContent('false');
    });

    expect(AsyncStorage.setItem).toHaveBeenCalledWith(
      'user',
      expect.stringContaining('bob@example.com'),
    );
  });

  it('falls back to id = email when session user lacks an id', async () => {
    mockGetSession.mockResolvedValue({
      user: { email: 'fallback@test.com', name: 'Fallback' },
    });

    renderInAuthProvider(<TestComponent />);

    await waitFor(() => {
      expect(screen.getByTestId('user-email')).toHaveTextContent(
        'fallback@test.com',
      );
    });
  });

  it('uses default role "parent" when session user has no role', async () => {
    mockGetSession.mockResolvedValue({
      user: { id: 'u1', email: 'nobody@test.com' },
    });

    renderInAuthProvider(<TestComponent />);

    await waitFor(() => {
      const userText = screen.getByTestId('user');
      expect(userText).toHaveTextContent('"role":"parent"', { exact: false });
    });
  });

  it('uses current date as createdAt when none is provided', async () => {
    const before = new Date().toISOString().slice(0, 16);
    mockGetSession.mockResolvedValue({
      user: { id: 'u1', email: 'ts@test.com' },
    });

    renderInAuthProvider(<TestComponent />);

    await waitFor(() => {
      expect(screen.getByTestId('user-email')).toHaveTextContent(
        'ts@test.com',
      );
    });

    // The createdAt should have been set to a recent ISO string
    expect(AsyncStorage.setItem).toHaveBeenCalledWith(
      'user',
      expect.stringContaining('"createdAt"'),
    );

    const storedCall = (AsyncStorage.setItem as jest.Mock).mock.calls.find(
      ([key]: [string]) => key === 'user',
    );
    const storedValue = JSON.parse(storedCall[1]);
    const createdAtPrefix = (storedValue.createdAt as string).slice(0, 16);
    expect(createdAtPrefix).toBe(before);
  });
});

// ===========================================================================
// Session API failure
// ===========================================================================
describe('handling session API failure', () => {
  it('keeps user as null when getSession throws', async () => {
    mockGetSession.mockRejectedValue(new Error('Network error'));

    renderInAuthProvider(<TestComponent />);

    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('null');
    });
  });

  it('keeps user as null when getSession returns no user object', async () => {
    mockGetSession.mockResolvedValue({});

    renderInAuthProvider(<TestComponent />);

    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('null');
    });
  });

  it('does NOT persist a non-existent user to AsyncStorage', async () => {
    mockGetSession.mockResolvedValue({ user: null });

    renderInAuthProvider(<TestComponent />);

    await waitFor(() => {
      expect(screen.getByTestId('isLoading')).toHaveTextContent('false');
    });

    // setItem may have been called for a stored user that was later cleared,
    // but no user value should remain.  We check that removeItem was called
    // instead.
    expect(AsyncStorage.removeItem).toHaveBeenCalledWith('user');
  });
});

// ===========================================================================
// isAuthenticated
// ===========================================================================
describe('isAuthenticated', () => {
  it('is false when there is no user', async () => {
    renderInAuthProvider(<TestComponent />);

    await waitFor(() => {
      expect(screen.getByTestId('isAuthenticated')).toHaveTextContent('false');
    });
  });

  it('is true when a user is loaded from the session API', async () => {
    mockGetSession.mockResolvedValue({ user: sessionUser });

    renderInAuthProvider(<TestComponent />);

    await waitFor(() => {
      expect(screen.getByTestId('isAuthenticated')).toHaveTextContent('true');
    });
  });
});

// ===========================================================================
// login flow
// ===========================================================================
describe('login', () => {
  // NOTE: login tests are skipped because AuthContext.tsx's login()
  // function uses await import('../api/client'), which requires Node.js
  // --experimental-vm-modules to work in Jest. The individual behaviors
  // (calling loginWithCredentials, refreshing user after login, error
  // propagation) are covered by other tests below (refreshUser, setUser,
  // and the mockLoginWithCredentials assertions).

  it('calls loginWithCredentials with the provided email and password', async () => {
    renderInAuthProvider(
      <>
        <AuthCapture />
        <TestComponent />
      </>,
    );

    await waitFor(() => {
      expect(screen.getByTestId('isLoading')).toHaveTextContent('false');
    });

    await capturedAuth.login('test@test.com', 'p@ss');

    expect(mockLoginWithCredentials).toHaveBeenCalledWith(
      'test@test.com',
      'p@ss',
    );
  });

  it('refreshes the user after a successful login', async () => {
    mockGetSession.mockResolvedValueOnce({ user: null }); // initial
    mockGetSession.mockResolvedValueOnce({ user: sessionUser }); // after login

    renderInAuthProvider(
      <>
        <AuthCapture />
        <TestComponent />
      </>,
    );

    await waitFor(() => {
      expect(screen.getByTestId('isLoading')).toHaveTextContent('false');
    });

    await capturedAuth.login('bob@test.com', 'pass');

    // getSession should have been called a second time (refreshUser)
    expect(mockGetSession).toHaveBeenCalledTimes(2);
  });

  it('re-throws when loginWithCredentials fails', async () => {
    mockLoginWithCredentials.mockRejectedValueOnce(
      new Error('Invalid credentials'),
    );

    renderInAuthProvider(
      <>
        <AuthCapture />
        <TestComponent />
      </>,
    );

    await waitFor(() => {
      expect(screen.getByTestId('isLoading')).toHaveTextContent('false');
    });

    await expect(capturedAuth.login('bad@test.com', 'wrong')).rejects.toThrow(
      'Invalid credentials',
    );
  });
});

// ===========================================================================
// logout flow
// ===========================================================================
describe('logout', () => {
  // NOTE: logout tests are skipped because AuthContext.tsx's logout()
  // function uses await import('../api/client'), which requires Node.js
  // --experimental-vm-modules to work in Jest.

  it('calls the logout API', async () => {
    renderInAuthProvider(
      <>
        <AuthCapture />
        <TestComponent />
      </>,
    );

    await waitFor(() => {
      expect(screen.getByTestId('isLoading')).toHaveTextContent('false');
    });

    await capturedAuth.logout();

    expect(mockLogoutFn).toHaveBeenCalled();
  });

  it('sets the user to null after logout', async () => {
    // Start with a logged-in user
    mockGetSession.mockResolvedValue({ user: sessionUser });

    renderInAuthProvider(
      <>
        <AuthCapture />
        <TestComponent />
      </>,
    );

    await waitFor(() => {
      expect(screen.getByTestId('isAuthenticated')).toHaveTextContent('true');
    });

    await capturedAuth.logout();

    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('null');
    });
  });
});

// ===========================================================================
// setUser
// ===========================================================================
describe('setUser', () => {
  it('sets the user and persists to AsyncStorage', async () => {
    renderInAuthProvider(
      <>
        <AuthCapture />
        <TestComponent />
      </>,
    );

    await waitFor(() => {
      expect(screen.getByTestId('isLoading')).toHaveTextContent('false');
    });

    capturedAuth.setUser(mockUser);

    await waitFor(() => {
      expect(screen.getByTestId('user-email')).toHaveTextContent(
        'alice@example.com',
      );
    });

    expect(AsyncStorage.setItem).toHaveBeenCalledWith(
      'user',
      JSON.stringify(mockUser),
    );
  });

  it('clears the user when called with null', async () => {
    // Start with a user
    mockGetSession.mockResolvedValue({ user: sessionUser });

    renderInAuthProvider(
      <>
        <AuthCapture />
        <TestComponent />
      </>,
    );

    await waitFor(() => {
      expect(screen.getByTestId('isAuthenticated')).toHaveTextContent('true');
    });

    capturedAuth.setUser(null);

    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('null');
    });

    expect(AsyncStorage.removeItem).toHaveBeenCalledWith('user');
  });
});

// ===========================================================================
// useAuth outside provider
// ===========================================================================
describe('useAuth without AuthProvider', () => {
  // Suppress the expected console.error from React's error boundary
  const originalError = console.error;
  beforeAll(() => {
    console.error = jest.fn();
  });
  afterAll(() => {
    console.error = originalError;
  });

  it('throws an error when used outside AuthProvider', () => {
    // Render a component that calls useAuth() without wrapping in AuthProvider
    // but still inside the standard test providers.
    const renderOutsideProvider = () => {
      renderWithProviders(<TestComponent />);
    };

    expect(renderOutsideProvider).toThrow(
      'useAuth must be used within AuthProvider',
    );
  });
});

// ===========================================================================
// Renders children
// ===========================================================================
describe('renders children', () => {
  it('renders its child content', async () => {
    renderInAuthProvider(<TestComponent />);

    expect(await screen.findByTestId('children-rendered')).toHaveTextContent(
      'hello',
    );
  });
});

// ===========================================================================
// refreshUser
// ===========================================================================
describe('refreshUser', () => {
  it('updates the user state from the session API', async () => {
    renderInAuthProvider(
      <>
        <AuthCapture />
        <TestComponent />
      </>,
    );

    await waitFor(() => {
      expect(screen.getByTestId('isLoading')).toHaveTextContent('false');
    });

    // Simulate the session becoming available
    mockGetSession.mockResolvedValue({ user: sessionUser });

    capturedAuth.refreshUser();

    await waitFor(() => {
      expect(screen.getByTestId('user-email')).toHaveTextContent(
        'bob@example.com',
      );
    });
  });

  it('clears the user when session API returns null', async () => {
    // Start with a user
    mockGetSession.mockResolvedValue({ user: sessionUser });

    renderInAuthProvider(
      <>
        <AuthCapture />
        <TestComponent />
      </>,
    );

    await waitFor(() => {
      expect(screen.getByTestId('isAuthenticated')).toHaveTextContent('true');
    });

    // Now session goes away
    mockGetSession.mockResolvedValue({ user: null });

    capturedAuth.refreshUser();

    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('null');
    });
  });

  it('clears the user when the session request fails', async () => {
    // Start with a user
    mockGetSession.mockResolvedValue({ user: sessionUser });

    renderInAuthProvider(
      <>
        <AuthCapture />
        <TestComponent />
      </>,
    );

    await waitFor(() => {
      expect(screen.getByTestId('isAuthenticated')).toHaveTextContent('true');
    });

    // Now the API is down
    mockGetSession.mockRejectedValue(new Error('Timeout'));

    capturedAuth.refreshUser();

    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('null');
    });
  });
});
