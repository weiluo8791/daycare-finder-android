import axios, { AxiosError, AxiosRequestConfig } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../utils/constants';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(async (config) => {
  const sessionCookie = await AsyncStorage.getItem('session_cookie');
  if (sessionCookie) {
    config.headers.Cookie = sessionCookie;
  }
  return config;
});

api.interceptors.response.use(
  (response) => {
    const setCookie = response.headers['set-cookie'];
    if (setCookie && setCookie.length > 0) {
      AsyncStorage.setItem('session_cookie', setCookie[0]);
    }
    return response;
  },
  async (error: AxiosError) => {
    if (error.response?.status === 401) {
      await AsyncStorage.removeItem('session_cookie');
      await AsyncStorage.removeItem('user');
    }
    return Promise.reject(error);
  }
);

export async function loginWithCredentials(email: string, password: string): Promise<void> {
  const params = new URLSearchParams();
  params.append('email', email);
  params.append('password', password);
  params.append('redirect', 'false');
  params.append('json', 'true');

  const response = await axios.post(`${API_BASE_URL}/api/auth/callback/credentials`, params.toString(), {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    maxRedirects: 0,
    validateStatus: (status) => status < 400,
  });

  const cookies = response.headers['set-cookie'];
  if (cookies && cookies.length > 0) {
    await AsyncStorage.setItem('session_cookie', cookies[0]);
  }
}

export async function logout(): Promise<void> {
  await AsyncStorage.removeItem('session_cookie');
  await AsyncStorage.removeItem('user');
  await api.get('/api/auth/signout');
}

export async function getSession(): Promise<any> {
  const response = await api.get('/api/auth/session');
  return response.data;
}

export default api;
