import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import LandingScreen from '../../screens/LandingScreen';

const mockNavigate = jest.fn();

jest.mock('../../hooks/useAppNavigation', () => ({
  useAppNavigation: () => ({ navigate: mockNavigate }),
}));

describe('LandingScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the hero section with title and subtitle', () => {
    render(<LandingScreen />);

    expect(screen.getByText('Find the perfect daycare')).toBeOnTheScreen();
    expect(
      screen.getByText(
        'Browse Massachusetts licensed daycares near you. Verified providers, real reviews, and all the details you need.'
      )
    ).toBeOnTheScreen();
  });

  it('renders three feature cards', () => {
    render(<LandingScreen />);

    expect(screen.getByText('Nearby Search')).toBeOnTheScreen();
    expect(screen.getByText('Find daycares within your radius')).toBeOnTheScreen();
    expect(screen.getByText('Verified Listings')).toBeOnTheScreen();
    expect(screen.getByText('All programs are state-licensed')).toBeOnTheScreen();
    expect(screen.getByText('Reviews & Ratings')).toBeOnTheScreen();
    expect(screen.getByText('Real parent feedback and ratings')).toBeOnTheScreen();
  });

  it('navigates to Search when Browse Daycares Near Me is pressed', () => {
    render(<LandingScreen />);

    const browseButton = screen.getByText('Browse Daycares Near Me');
    fireEvent.press(browseButton);

    expect(mockNavigate).toHaveBeenCalledWith('Search');
  });

  it('navigates to ProviderDashboard when Provider Dashboard is pressed', () => {
    render(<LandingScreen />);

    const providerButton = screen.getByText('Provider Dashboard');
    fireEvent.press(providerButton);

    expect(mockNavigate).toHaveBeenCalledWith('ProviderDashboard');
  });
});
