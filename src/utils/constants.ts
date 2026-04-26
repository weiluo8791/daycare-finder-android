import { Platform } from 'react-native';

const isAndroid = Platform.OS === 'android';
const isEmulator = __DEV__;

export const API_BASE_URL = isEmulator && isAndroid
  ? 'http://10.0.2.2:3000'
  : 'https://your-production-domain.com';

export const GOOGLE_MAPS_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || '';

export const DEFAULT_SEARCH_RADIUS = 10000; // 10km in meters
export const MAX_SEARCH_RADIUS = 50000; // 50km

export const COLORS = {
  primary: '#2563eb',
  primaryDark: '#1d4ed8',
  secondary: '#64748b',
  success: '#22c55e',
  warning: '#f59e0b',
  danger: '#ef4444',
  background: '#f8fafc',
  surface: '#ffffff',
  text: '#1e293b',
  textLight: '#64748b',
  border: '#e2e8f0',
};
