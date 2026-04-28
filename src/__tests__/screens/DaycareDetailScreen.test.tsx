import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import DaycareDetailScreen from '../../screens/DaycareDetailScreen';

const mockNavigate = jest.fn();
jest.mock('../../hooks/useAppNavigation', () => ({
  useAppNavigation: () => ({ navigate: mockNavigate }),
}));

const mockUseAuth = jest.fn();
jest.mock('../../context/AuthContext', () => ({
  useAuth: () => mockUseAuth(),
}));

const mockUseDaycare = jest.fn();
jest.mock('../../hooks/useDaycares', () => ({
  useDaycare: (id: string) => mockUseDaycare(id),
  useToggleFavorite: () => ({ mutate: jest.fn() }),
}));

jest.mock('@react-navigation/native', () => ({
  useRoute: () => ({ params: { id: 'daycare-1' } }),
  useNavigation: () => ({ navigate: mockNavigate }),
}));

const baseDaycare = {
  id: 'daycare-1',
  name: 'Sunshine Daycare',
  address: '123 Main St',
  city: 'Boston',
  state: 'MA',
  zipCode: '02101',
  lat: 42.3601,
  lng: -71.0589,
  phone: '555-0100',
  email: 'info@sunshine.com',
  website: 'https://sunshine.com',
  description: 'A great place for kids to learn and grow.',
  rating: 4.5,
  reviewSnippets: ['Wonderful staff!', 'Great environment'],
  photos: ['photo1.jpg'],
  claimed: true,
  claimedByProviderId: 'provider-1',
  licenseNumber: 'LIC-12345',
  capacity: 50,
  programType: 'Preschool',
  licensedStatus: 'Active',
  priceRange: '$$',
  hours: { Monday: '7am-6pm', Tuesday: '7am-6pm' },
  enrichmentStatus: 'completed',
  createdAt: '2024-01-01',
  updatedAt: '2024-06-01',
};

describe('DaycareDetailScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseAuth.mockReturnValue({ user: null });
  });

  describe('loading state', () => {
    it('shows loading indicator when isLoading is true', () => {
      mockUseDaycare.mockReturnValue({ data: undefined, isLoading: true });
      render(<DaycareDetailScreen />);

      expect(screen.getByText('Loading...')).toBeOnTheScreen();
      expect(screen.getByText('refresh')).toBeOnTheScreen();
    });

    it('shows loading when daycare data is null', () => {
      mockUseDaycare.mockReturnValue({ data: null, isLoading: false });
      render(<DaycareDetailScreen />);

      expect(screen.getByText('Loading...')).toBeOnTheScreen();
    });
  });

  describe('daycare data display', () => {
    beforeEach(() => {
      mockUseDaycare.mockReturnValue({ data: baseDaycare, isLoading: false });
      mockUseAuth.mockReturnValue({ user: null });
    });

    it('renders the daycare name', () => {
      render(<DaycareDetailScreen />);
      expect(screen.getByText('Sunshine Daycare')).toBeOnTheScreen();
    });

    it('renders the address with state and zip', () => {
      render(<DaycareDetailScreen />);
      expect(screen.getByText('123 Main St, Boston, MA 02101')).toBeOnTheScreen();
    });

    it('shows verified badge when claimed', () => {
      render(<DaycareDetailScreen />);
      expect(screen.getByText('Verified Provider')).toBeOnTheScreen();
    });

    it('shows rating and review count', () => {
      render(<DaycareDetailScreen />);
      expect(screen.getByText('4.5')).toBeOnTheScreen();
      expect(screen.getByText('(2 reviews)')).toBeOnTheScreen();
    });

    it('renders hero image when photos exist', () => {
      const { UNSAFE_getAllByType } = render(<DaycareDetailScreen />);
      const images = UNSAFE_getAllByType('Image' as any);
      expect(images.length).toBeGreaterThanOrEqual(1);
    });

    it('shows description', () => {
      render(<DaycareDetailScreen />);
      expect(screen.getByText('A great place for kids to learn and grow.')).toBeOnTheScreen();
    });

    it('renders action buttons for phone, email, website', () => {
      render(<DaycareDetailScreen />);
      expect(screen.getByText('Call')).toBeOnTheScreen();
      expect(screen.getByText('Email')).toBeOnTheScreen();
      expect(screen.getByText('Website')).toBeOnTheScreen();
    });

    it('renders information grid', () => {
      render(<DaycareDetailScreen />);
      expect(screen.getByText('LIC-12345')).toBeOnTheScreen();
      expect(screen.getByText('50 children')).toBeOnTheScreen();
      expect(screen.getByText('Preschool')).toBeOnTheScreen();
      expect(screen.getByText('Active')).toBeOnTheScreen();
    });

    it('renders operating hours', () => {
      render(<DaycareDetailScreen />);
      expect(screen.getByText('Monday')).toBeOnTheScreen();
      expect(screen.getByText('Tuesday')).toBeOnTheScreen();
      const hours = screen.getAllByText('7am-6pm');
      expect(hours.length).toBe(2);
    });

    it('renders reviews', () => {
      render(<DaycareDetailScreen />);
      expect(screen.getByText('"Wonderful staff!"')).toBeOnTheScreen();
      expect(screen.getByText('"Great environment"')).toBeOnTheScreen();
    });

    it('renders Open in Google Maps link', () => {
      render(<DaycareDetailScreen />);
      expect(screen.getByText('📍 Open in Google Maps')).toBeOnTheScreen();
    });
  });

  describe('conditional rendering', () => {
    it('shows hero placeholder when no photos', () => {
      mockUseDaycare.mockReturnValue({
        data: { ...baseDaycare, photos: [] },
        isLoading: false,
      });
      render(<DaycareDetailScreen />);
      expect(screen.getByText('🏫')).toBeOnTheScreen();
    });

    it('does not show rating when absent', () => {
      mockUseDaycare.mockReturnValue({
        data: { ...baseDaycare, rating: undefined },
        isLoading: false,
      });
      render(<DaycareDetailScreen />);
      expect(screen.queryByText('4.5')).toBeNull();
    });

    it('hides action buttons when contact info is missing', () => {
      mockUseDaycare.mockReturnValue({
        data: { ...baseDaycare, phone: undefined, email: undefined, website: undefined },
        isLoading: false,
      });
      render(<DaycareDetailScreen />);
      expect(screen.queryByText('Call')).toBeNull();
      expect(screen.queryByText('Email')).toBeNull();
      expect(screen.queryByText('Website')).toBeNull();
    });

    it('hides description when absent', () => {
      mockUseDaycare.mockReturnValue({
        data: { ...baseDaycare, description: undefined },
        isLoading: false,
      });
      render(<DaycareDetailScreen />);
      expect(screen.queryByText('A great place for kids to learn and grow.')).toBeNull();
    });

    it('does not show verified badge when not claimed', () => {
      mockUseDaycare.mockReturnValue({
        data: { ...baseDaycare, claimed: false },
        isLoading: false,
      });
      render(<DaycareDetailScreen />);
      expect(screen.queryByText('Verified Provider')).toBeNull();
    });

    it('shows Edit Listing button for admin user', () => {
      mockUseAuth.mockReturnValue({ user: { id: 'admin-1', role: 'admin' } });
      render(<DaycareDetailScreen />);
      expect(screen.getByText('Edit Listing')).toBeOnTheScreen();
    });

    it('shows Edit Listing button for owner provider', () => {
      mockUseAuth.mockReturnValue({ user: { id: 'provider-1', role: 'provider' } });
      render(<DaycareDetailScreen />);
      expect(screen.getByText('Edit Listing')).toBeOnTheScreen();
    });

    it('does not show Edit Listing for non-owner', () => {
      mockUseAuth.mockReturnValue({ user: { id: 'other', role: 'provider' } });
      mockUseDaycare.mockReturnValue({
        data: { ...baseDaycare, claimedByProviderId: 'different-provider' },
        isLoading: false,
      });
      render(<DaycareDetailScreen />);
      expect(screen.queryByText('Edit Listing')).toBeNull();
    });

    it('formats address without state when absent', () => {
      mockUseDaycare.mockReturnValue({
        data: { ...baseDaycare, state: undefined, zipCode: undefined },
        isLoading: false,
      });
      render(<DaycareDetailScreen />);
      expect(screen.getByText('123 Main St, Boston')).toBeOnTheScreen();
    });
  });

  describe('action handlers', () => {
    it('calls Linking.openURL for Call button', () => {
      const Linking = require('react-native').Linking;
      mockUseDaycare.mockReturnValue({ data: baseDaycare, isLoading: false });
      render(<DaycareDetailScreen />);

      fireEvent.press(screen.getByText('Call'));
      expect(Linking.openURL).toHaveBeenCalledWith('tel:555-0100');
    });
  });
});
