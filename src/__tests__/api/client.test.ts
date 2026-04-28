import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../../utils/constants';

// Mock axios BEFORE importing the module under test.
// Picks up __mocks__/axios.js automatically.
jest.mock('axios');

import apiClient, {
  loginWithCredentials,
  logout,
  getSession,
} from '../../api/client';

// Retrieve the mock objects set up inside the mock file
const axiosMock = jest.requireMock('axios');
const mockAxiosInstance = axiosMock._mockInstance;
const mockAxiosPost = axiosMock._mockPost;

// Helpers: extract interceptor callbacks from the persistent arrays
function getRequestInterceptor(): (config: any) => Promise<any> {
  return axiosMock._requestInterceptors[0];
}

function getResponseSuccessHandler(): (response: any) => any {
  return axiosMock._responseSuccessInterceptors[0];
}

function getResponseErrorHandler(): (error: any) => Promise<any> {
  return axiosMock._responseErrorInterceptors[0];
}

beforeEach(async () => {
  await AsyncStorage.clear();
});

// ===========================================================================
// Module creation
// ===========================================================================
describe('module creation', () => {
  it('creates an axios instance with the correct base URL and JSON content type', () => {
    const { create } = jest.requireMock('axios').default;
    expect(create).toHaveBeenCalledWith({
      baseURL: API_BASE_URL,
      headers: { 'Content-Type': 'application/json' },
    });
  });

  it('registers one request and one response interceptor', () => {
    const ax = jest.requireMock('axios');
    expect(ax._requestInterceptors.length).toBe(1);
    expect(ax._responseSuccessInterceptors.length).toBe(1);
    expect(ax._responseErrorInterceptors.length).toBe(1);
  });
});

// ===========================================================================
// Request interceptor
// ===========================================================================
describe('request interceptor', () => {
  beforeEach(() => { jest.clearAllMocks(); });
  it('adds a Cookie header when a session cookie is stored', async () => {
    await AsyncStorage.setItem('session_cookie', 'my-session=abc123');
    const interceptor = getRequestInterceptor();
    const config: any = { headers: {} };
    const result = await interceptor(config);
    expect(result.headers.Cookie).toBe('my-session=abc123');
  });

  it('does not add Cookie when no session cookie exists', async () => {
    const interceptor = getRequestInterceptor();
    const config: any = { headers: {} };
    const result = await interceptor(config);
    expect(result.headers.Cookie).toBeUndefined();
  });

  it('preserves other config properties', async () => {
    const interceptor = getRequestInterceptor();
    const config: any = { headers: {}, url: '/foo', method: 'GET' };
    const result = await interceptor(config);
    expect(result.url).toBe('/foo');
    expect(result.method).toBe('GET');
  });
});

// ===========================================================================
// Response interceptor — success handler
// ===========================================================================
describe('response interceptor success handler', () => {
  beforeEach(() => { jest.clearAllMocks(); });
  it('saves set-cookie to AsyncStorage when present', () => {
    const handler = getResponseSuccessHandler();
    const response = {
      headers: { 'set-cookie': ['connect.sid=s%3Aabc.xyz; Path=/'] },
    };
    handler(response);
    expect(AsyncStorage.setItem).toHaveBeenCalledWith(
      'session_cookie', 'connect.sid=s%3Aabc.xyz; Path=/',
    );
  });

  it('uses only the first set-cookie value', () => {
    const handler = getResponseSuccessHandler();
    const response = {
      headers: { 'set-cookie': ['session=first; Path=/', 'persist=second; Path=/'] },
    };
    handler(response);
    expect(AsyncStorage.setItem).toHaveBeenCalledWith('session_cookie', 'session=first; Path=/');
  });

  it('does nothing when no set-cookie header', () => {
    const handler = getResponseSuccessHandler();
    handler({ headers: {} });
    expect(AsyncStorage.setItem).not.toHaveBeenCalled();
  });

  it('returns the response object unchanged', () => {
    const handler = getResponseSuccessHandler();
    const response = { data: { ok: true }, headers: {} };
    expect(handler(response)).toBe(response);
  });
});

// ===========================================================================
// Response interceptor — error handler
// ===========================================================================
describe('response interceptor error handler', () => {
  beforeEach(() => { jest.clearAllMocks(); });
  it('clears storage on 401', async () => {
    const handler = getResponseErrorHandler();
    const error = { response: { status: 401 } };
    await expect(handler(error)).rejects.toBe(error);
    expect(AsyncStorage.removeItem).toHaveBeenCalledWith('session_cookie');
    expect(AsyncStorage.removeItem).toHaveBeenCalledWith('user');
  });

  it('does not clear storage on 500', async () => {
    const handler = getResponseErrorHandler();
    const error = { response: { status: 500 } };
    await expect(handler(error)).rejects.toBe(error);
    expect(AsyncStorage.removeItem).not.toHaveBeenCalled();
  });

  it('does not clear storage on network error (no response)', async () => {
    const handler = getResponseErrorHandler();
    await expect(handler({ response: undefined })).rejects.toBeDefined();
    expect(AsyncStorage.removeItem).not.toHaveBeenCalled();
  });

  it('rejects with the original error', async () => {
    const handler = getResponseErrorHandler();
    const error = { response: { status: 403 } };
    await expect(handler(error)).rejects.toBe(error);
  });
});

// ===========================================================================
// loginWithCredentials
// ===========================================================================
describe('loginWithCredentials', () => {
  beforeEach(() => { jest.clearAllMocks(); });
  const email = 'user@example.com';
  const password = 's3cret';

  it('sends POST with URL-encoded form data', async () => {
    mockAxiosPost.mockResolvedValueOnce({ data: {}, headers: {} });
    await loginWithCredentials(email, password);
    expect(mockAxiosPost).toHaveBeenCalledWith(
      `${API_BASE_URL}/api/auth/callback/credentials`,
      expect.stringContaining('email=user%40example.com'),
      expect.objectContaining({
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        maxRedirects: 0,
      }),
    );
    const body = mockAxiosPost.mock.calls[0][1] as string;
    expect(body).toContain('password=s3cret');
    expect(body).toContain('redirect=false');
    expect(body).toContain('json=true');
  });

  it('validateStatus accepts < 400', async () => {
    mockAxiosPost.mockResolvedValueOnce({ data: {}, headers: {} });
    await loginWithCredentials(email, password);
    const options = mockAxiosPost.mock.calls[0][2] as any;
    expect(options.validateStatus(200)).toBe(true);
    expect(options.validateStatus(399)).toBe(true);
    expect(options.validateStatus(400)).toBe(false);
  });

  it('saves session cookie from response', async () => {
    mockAxiosPost.mockResolvedValueOnce({
      data: {}, headers: { 'set-cookie': ['my-session=xyz'] },
    });
    await loginWithCredentials(email, password);
    expect(AsyncStorage.setItem).toHaveBeenCalledWith('session_cookie', 'my-session=xyz');
  });

  it('does not save cookie when set-cookie absent', async () => {
    mockAxiosPost.mockResolvedValueOnce({ data: {}, headers: {} });
    await loginWithCredentials(email, password);
    expect(AsyncStorage.setItem).not.toHaveBeenCalledWith('session_cookie', expect.any(String));
  });

  it('throws when POST fails', async () => {
    mockAxiosPost.mockRejectedValueOnce(new Error('Network failure'));
    await expect(loginWithCredentials(email, password)).rejects.toThrow('Network failure');
  });
});

// ===========================================================================
// logout
// ===========================================================================
describe('logout', () => {
  beforeEach(() => { jest.clearAllMocks(); });
  it('clears session and user from AsyncStorage', async () => {
    mockAxiosInstance.get.mockResolvedValueOnce({ data: {} });
    await logout();
    expect(AsyncStorage.removeItem).toHaveBeenCalledWith('session_cookie');
    expect(AsyncStorage.removeItem).toHaveBeenCalledWith('user');
  });

  it('calls the signout endpoint', async () => {
    mockAxiosInstance.get.mockResolvedValueOnce({ data: {} });
    await logout();
    expect(mockAxiosInstance.get).toHaveBeenCalledWith('/api/auth/signout');
  });

  it('clears storage even if signout fails', async () => {
    mockAxiosInstance.get.mockRejectedValueOnce(new Error('Server error'));
    await expect(logout()).rejects.toThrow('Server error');
    expect(AsyncStorage.removeItem).toHaveBeenCalledWith('session_cookie');
    expect(AsyncStorage.removeItem).toHaveBeenCalledWith('user');
  });
});

// ===========================================================================
// getSession
// ===========================================================================
describe('getSession', () => {
  beforeEach(() => { jest.clearAllMocks(); });
  it('calls session endpoint and returns data', async () => {
    const sessionData = { user: { name: 'Alice' } };
    mockAxiosInstance.get.mockResolvedValueOnce({ data: sessionData });
    const result = await getSession();
    expect(mockAxiosInstance.get).toHaveBeenCalledWith('/api/auth/session');
    expect(result).toEqual(sessionData);
  });

  it('throws when request fails', async () => {
    mockAxiosInstance.get.mockRejectedValueOnce(new Error('Unauthorized'));
    await expect(getSession()).rejects.toThrow('Unauthorized');
  });
});

// ===========================================================================
// Default export
// ===========================================================================
describe('default export', () => {
  beforeEach(() => { jest.clearAllMocks(); });
  it('is the created axios instance', () => {
    expect(apiClient).toBe(mockAxiosInstance);
  });
});
