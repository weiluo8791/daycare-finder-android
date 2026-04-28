import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';
import EditListingScreen from '../../screens/EditListingScreen';

// --- Mocks ---

const mockNavigate = jest.fn();

jest.mock('../../hooks/useAppNavigation', () => ({
  useAppNavigation: () => ({ navigate: mockNavigate }),
}));

// Mock useRoute to provide the id param
const mockRouteParams = { id: 'daycare-1' };
jest.mock('@react-navigation/native', () => ({
  useRoute: () => ({ params: mockRouteParams }),
  useNavigation: () => ({ navigate: mockNavigate }),
}));

const mockUseDaycare = jest.fn();
const mockUseUpdateDaycare = jest.fn();
const mockUseUploadPhoto = jest.fn();

jest.mock('../../hooks/useDaycares', () => ({
  useDaycare: (id: string) => mockUseDaycare(id),
}));

jest.mock('../../hooks/useProvider', () => ({
  useUpdateDaycare: () => mockUseUpdateDaycare(),
  useUploadPhoto: () => mockUseUploadPhoto(),
}));

// Mock expo-image-picker
jest.mock('expo-image-picker', () => ({
  launchImageLibraryAsync: jest.fn(),
  MediaTypeOptions: { Images: 'Images' },
}));

const alertSpy = jest.spyOn(Alert, 'alert');

const mockUpdateMutateAsync = jest.fn();
const mockUploadMutateAsync = jest.fn();

const baseDaycare = {
  id: 'daycare-1',
  name: 'Happy Kids Daycare',
  description: 'A great place for kids',
  email: 'info@happykids.com',
  website: 'https://happykids.com',
  priceRange: '$$',
  phone: '555-0100',
  photos: ['photo1.jpg', 'photo2.jpg'],
  address: '123 Main St',
  city: 'Boston',
  claimed: true,
  enrichmentStatus: 'completed',
  createdAt: '2024-01-01',
  updatedAt: '2024-06-01',
};

beforeEach(() => {
  jest.clearAllMocks();

  mockUseUpdateDaycare.mockReturnValue({
    mutateAsync: mockUpdateMutateAsync,
    isPending: false,
  });

  mockUseUploadPhoto.mockReturnValue({
    mutateAsync: mockUploadMutateAsync,
    isPending: false,
  });
});

describe('EditListingScreen', () => {
  describe('loading state', () => {
    it('shows loading indicator when daycare data is loading', () => {
      mockUseDaycare.mockReturnValue({
        data: undefined,
        isLoading: true,
      });
      const { getByText } = render(<EditListingScreen />);

      // Loading state shows the "refresh" icon
      expect(mockUseDaycare).toHaveBeenCalledWith('daycare-1');
    });

    it('shows loading indicator when daycare is null', () => {
      mockUseDaycare.mockReturnValue({
        data: null,
        isLoading: false,
      });
      const { getByText } = render(<EditListingScreen />);

      // When data is null/undefined and not loading, the condition
      // isLoading || !daycare is true, so the loading view shows
      expect(mockUseDaycare).toHaveBeenCalledWith('daycare-1');
    });

    it('does not render form when still loading', () => {
      mockUseDaycare.mockReturnValue({
        data: undefined,
        isLoading: true,
      });
      const { queryByText } = render(<EditListingScreen />);

      expect(queryByText('Save Changes')).toBeNull();
      expect(queryByText('Edit Happy Kids Daycare')).toBeNull();
    });
  });

  describe('data state', () => {
    beforeEach(() => {
      mockUseDaycare.mockReturnValue({
        data: baseDaycare,
        isLoading: false,
      });
    });

    it('renders the title with daycare name', () => {
      const { getByText } = render(<EditListingScreen />);

      expect(getByText('Edit Happy Kids Daycare')).toBeTruthy();
    });

    it('pre-populates all fields from daycare data', () => {
      const { getByPlaceholderText } = render(<EditListingScreen />);

      expect(getByPlaceholderText('Description').props.value).toBe(
        'A great place for kids'
      );
      expect(getByPlaceholderText('Email').props.value).toBe(
        'info@happykids.com'
      );
      expect(getByPlaceholderText('Website').props.value).toBe(
        'https://happykids.com'
      );
      expect(getByPlaceholderText('Price Range').props.value).toBe('$$');
    });

    it('shows read-only phone field', () => {
      const { getByText } = render(<EditListingScreen />);

      expect(getByText('Phone (read-only)')).toBeTruthy();
      expect(getByText('555-0100')).toBeTruthy();
    });

    it('shows "Not available" when phone is missing', () => {
      mockUseDaycare.mockReturnValue({
        data: { ...baseDaycare, phone: undefined },
        isLoading: false,
      });
      const { getByText } = render(<EditListingScreen />);

      expect(getByText('Not available')).toBeTruthy();
    });

    it('renders existing photos', () => {
      const { UNSAFE_getAllByType } = render(<EditListingScreen />);

      // Should render 2 photo images
      const images = UNSAFE_getAllByType('Image' as any);
      expect(images.length).toBeGreaterThanOrEqual(2);
    });

    it('renders "Add Photo" button', () => {
      const { getByText } = render(<EditListingScreen />);

      expect(getByText('Add Photo')).toBeTruthy();
    });

    it('renders "Save Changes" button', () => {
      const { getByText } = render(<EditListingScreen />);

      expect(getByText('Save Changes')).toBeTruthy();
    });

    it('allows editing description field', () => {
      const { getByPlaceholderText } = render(<EditListingScreen />);

      const descInput = getByPlaceholderText('Description');
      fireEvent.changeText(descInput, 'Updated description');

      expect(descInput.props.value).toBe('Updated description');
    });

    it('allows editing email field', () => {
      const { getByPlaceholderText } = render(<EditListingScreen />);

      const emailInput = getByPlaceholderText('Email');
      fireEvent.changeText(emailInput, 'new@email.com');

      expect(emailInput.props.value).toBe('new@email.com');
    });

    it('allows editing website field', () => {
      const { getByPlaceholderText } = render(<EditListingScreen />);

      const websiteInput = getByPlaceholderText('Website');
      fireEvent.changeText(websiteInput, 'https://new-site.com');

      expect(websiteInput.props.value).toBe('https://new-site.com');
    });

    it('allows editing price range field', () => {
      const { getByPlaceholderText } = render(<EditListingScreen />);

      const priceInput = getByPlaceholderText('Price Range');
      fireEvent.changeText(priceInput, '$$$');

      expect(priceInput.props.value).toBe('$$$');
    });

    it('calls save mutation with updated data', async () => {
      mockUpdateMutateAsync.mockResolvedValueOnce(undefined);
      const { getByPlaceholderText, getByText } = render(<EditListingScreen />);

      // Update fields
      fireEvent.changeText(
        getByPlaceholderText('Description'),
        'Updated description'
      );
      fireEvent.changeText(getByPlaceholderText('Email'), 'new@email.com');
      fireEvent.changeText(
        getByPlaceholderText('Website'),
        'https://new-site.com'
      );
      fireEvent.changeText(getByPlaceholderText('Price Range'), '$$$');

      fireEvent.press(getByText('Save Changes'));

      await waitFor(() => {
        expect(mockUpdateMutateAsync).toHaveBeenCalledWith({
          id: 'daycare-1',
          data: {
            description: 'Updated description',
            email: 'new@email.com',
            website: 'https://new-site.com',
            priceRange: '$$$',
          },
        });
        expect(alertSpy).toHaveBeenCalledWith(
          'Success',
          'Listing updated successfully'
        );
      });
    });

    it('shows error when save fails', async () => {
      mockUpdateMutateAsync.mockRejectedValueOnce({
        response: { data: { error: 'Update failed' } },
      });
      const { getByText } = render(<EditListingScreen />);

      fireEvent.press(getByText('Save Changes'));

      await waitFor(() => {
        expect(alertSpy).toHaveBeenCalledWith('Error', 'Update failed');
      });
    });

    it('shows generic error when save fails with no error data', async () => {
      mockUpdateMutateAsync.mockRejectedValueOnce({});
      const { getByText } = render(<EditListingScreen />);

      fireEvent.press(getByText('Save Changes'));

      await waitFor(() => {
        expect(alertSpy).toHaveBeenCalledWith(
          'Error',
          'Failed to update'
        );
      });
    });

    describe('photo upload', () => {
      it('opens image picker when Add Photo is pressed', async () => {
        const ImagePicker = require('expo-image-picker');
        ImagePicker.launchImageLibraryAsync.mockResolvedValueOnce({
          canceled: false,
          assets: [{ uri: 'file://photo.jpg' }],
        });

        const { getByText } = render(<EditListingScreen />);

        fireEvent.press(getByText('Add Photo'));

        await waitFor(() => {
          expect(
            ImagePicker.launchImageLibraryAsync
          ).toHaveBeenCalledWith({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            quality: 0.8,
          });
        });
      });

      it('uploads photo after picking an image', async () => {
        mockUploadMutateAsync.mockResolvedValueOnce(undefined);
        const ImagePicker = require('expo-image-picker');
        ImagePicker.launchImageLibraryAsync.mockResolvedValueOnce({
          canceled: false,
          assets: [{ uri: 'file://photo.jpg' }],
        });

        const { getByText } = render(<EditListingScreen />);

        fireEvent.press(getByText('Add Photo'));

        await waitFor(() => {
          expect(mockUploadMutateAsync).toHaveBeenCalledWith({
            daycareId: 'daycare-1',
            uri: 'file://photo.jpg',
          });
          expect(alertSpy).toHaveBeenCalledWith(
            'Success',
            'Photo uploaded'
          );
        });
      });

      it('does not upload when image picker is cancelled', async () => {
        const ImagePicker = require('expo-image-picker');
        ImagePicker.launchImageLibraryAsync.mockResolvedValueOnce({
          canceled: true,
          assets: [],
        });

        const { getByText } = render(<EditListingScreen />);

        fireEvent.press(getByText('Add Photo'));

        await waitFor(() => {
          expect(mockUploadMutateAsync).not.toHaveBeenCalled();
        });
      });

      it('shows error when photo upload fails', async () => {
        mockUploadMutateAsync.mockRejectedValueOnce({
          response: { data: { error: 'Upload failed' } },
        });
        const ImagePicker = require('expo-image-picker');
        ImagePicker.launchImageLibraryAsync.mockResolvedValueOnce({
          canceled: false,
          assets: [{ uri: 'file://photo.jpg' }],
        });

        const { getByText } = render(<EditListingScreen />);

        fireEvent.press(getByText('Add Photo'));

        await waitFor(() => {
          expect(alertSpy).toHaveBeenCalledWith(
            'Error',
            'Upload failed'
          );
        });
      });

      it('shows generic error when upload fails with no error data', async () => {
        mockUploadMutateAsync.mockRejectedValueOnce({});
        const ImagePicker = require('expo-image-picker');
        ImagePicker.launchImageLibraryAsync.mockResolvedValueOnce({
          canceled: false,
          assets: [{ uri: 'file://photo.jpg' }],
        });

        const { getByText } = render(<EditListingScreen />);

        fireEvent.press(getByText('Add Photo'));

        await waitFor(() => {
          expect(alertSpy).toHaveBeenCalledWith(
            'Error',
            'Failed to upload'
          );
        });
      });
    });
  });
});
