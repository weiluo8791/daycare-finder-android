// Mocks must be hoisted above imports.
// jest.mock calls are hoisted by babel-jest, so these run before any imports.
jest.mock('../../context/AuthContext', () => ({
  useAuth: jest.fn(),
}));

jest.mock('../../hooks/useDaycares', () => ({
  useToggleFavorite: jest.fn(),
}));

import React from 'react';
import { Alert } from 'react-native';
import { render, fireEvent } from '@testing-library/react-native';
import { renderWithProviders } from '../test-utils';
import SaveButton from '../../components/SaveButton';
import { useAuth } from '../../context/AuthContext';
import { useToggleFavorite } from '../../hooks/useDaycares';

describe('SaveButton', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders heart-outline when not saved', () => {
    (useAuth as jest.Mock).mockReturnValue({ isAuthenticated: true });
    (useToggleFavorite as jest.Mock).mockReturnValue({ mutate: jest.fn() });

    const { getByText } = renderWithProviders(<SaveButton daycareId="1" />);

    expect(getByText('heart-outline')).toBeTruthy();
  });

  it('shows alert when not authenticated', () => {
    (useAuth as jest.Mock).mockReturnValue({ isAuthenticated: false });
    (useToggleFavorite as jest.Mock).mockReturnValue({ mutate: jest.fn() });

    // Mock Alert.alert so it does not throw in test environment
    jest.spyOn(Alert, 'alert').mockImplementation(() => {});

    const { getByText } = renderWithProviders(<SaveButton daycareId="1" />);

    fireEvent.press(getByText('heart-outline'));

    expect(Alert.alert).toHaveBeenCalledWith(
      'Sign In Required',
      'Please sign in to save daycares.',
    );

    jest.restoreAllMocks();
  });

  it('toggles to red heart when authenticated and pressed', () => {
    (useAuth as jest.Mock).mockReturnValue({ isAuthenticated: true });
    (useToggleFavorite as jest.Mock).mockReturnValue({ mutate: jest.fn() });

    const { getByText, queryByText } = renderWithProviders(
      <SaveButton daycareId="1" />,
    );

    // Initially shows heart-outline
    expect(getByText('heart-outline')).toBeTruthy();

    // Press the button
    fireEvent.press(getByText('heart-outline'));

    // Now shows heart (solid), outline is gone
    expect(queryByText('heart-outline')).toBeNull();
    expect(getByText('heart')).toBeTruthy();
  });

  it('calls toggle.mutate with correct params when authenticated and pressed', () => {
    const mutate = jest.fn();
    (useAuth as jest.Mock).mockReturnValue({ isAuthenticated: true });
    (useToggleFavorite as jest.Mock).mockReturnValue({ mutate });

    const { getByText } = renderWithProviders(<SaveButton daycareId="1" />);

    fireEvent.press(getByText('heart-outline'));

    // When isSaved is false (initial state), calling mutate passes isSaved: false
    expect(mutate).toHaveBeenCalledWith({ daycareId: '1', isSaved: false });
  });

  it('does not call mutate when not authenticated', () => {
    const mutate = jest.fn();
    (useAuth as jest.Mock).mockReturnValue({ isAuthenticated: false });
    (useToggleFavorite as jest.Mock).mockReturnValue({ mutate });

    jest.spyOn(Alert, 'alert').mockImplementation(() => {});

    const { getByText } = renderWithProviders(<SaveButton daycareId="1" />);

    fireEvent.press(getByText('heart-outline'));

    expect(mutate).not.toHaveBeenCalled();

    jest.restoreAllMocks();
  });
});
