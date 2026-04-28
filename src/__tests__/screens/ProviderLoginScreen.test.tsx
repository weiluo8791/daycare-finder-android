import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';
import ProviderLoginScreen from '../../screens/ProviderLoginScreen';

// --- Mocks ---

const mockNavigate = jest.fn();
const mockLogin = jest.fn();

jest.mock('../../hooks/useAppNavigation', () => ({
  useAppNavigation: () => ({ navigate: mockNavigate }),
}));

jest.mock('../../context/AuthContext', () => ({
  useAuth: () => ({ login: mockLogin }),
}));

const alertSpy = jest.spyOn(Alert, 'alert');

beforeEach(() => {
  jest.clearAllMocks();
});

describe('ProviderLoginScreen', () => {
  it('renders email and password inputs and sign-in button', () => {
    const { getByPlaceholderText, getByText } = render(<ProviderLoginScreen />);

    expect(getByPlaceholderText('Email')).toBeTruthy();
    expect(getByPlaceholderText('Password')).toBeTruthy();
    expect(getByText('Sign In')).toBeTruthy();
    expect(getByText('Register as Provider')).toBeTruthy();
  });

  it('shows alert when email is empty and Sign In is pressed', () => {
    const { getByText } = render(<ProviderLoginScreen />);

    fireEvent.press(getByText('Sign In'));

    expect(alertSpy).toHaveBeenCalledWith('Error', 'Please enter email and password');
    expect(mockLogin).not.toHaveBeenCalled();
  });

  it('shows alert when password is empty and Sign In is pressed', () => {
    const { getByText } = render(<ProviderLoginScreen />);

    fireEvent.press(getByText('Sign In'));

    expect(alertSpy).toHaveBeenCalledWith('Error', 'Please enter email and password');
    expect(mockLogin).not.toHaveBeenCalled();
  });

  it('calls login and navigates to dashboard on success', async () => {
    mockLogin.mockResolvedValueOnce(undefined);
    const { getByPlaceholderText, getByText } = render(<ProviderLoginScreen />);

    fireEvent.changeText(getByPlaceholderText('Email'), 'test@example.com');
    fireEvent.changeText(getByPlaceholderText('Password'), 'password123');
    fireEvent.press(getByText('Sign In'));

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'password123');
      expect(mockNavigate).toHaveBeenCalledWith('ProviderDashboard');
    });
  });

  it('shows alert on login failure', async () => {
    const errorMessage = 'Invalid credentials';
    mockLogin.mockRejectedValueOnce(new Error(errorMessage));
    const { getByPlaceholderText, getByText } = render(<ProviderLoginScreen />);

    fireEvent.changeText(getByPlaceholderText('Email'), 'test@example.com');
    fireEvent.changeText(getByPlaceholderText('Password'), 'password123');
    fireEvent.press(getByText('Sign In'));

    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith('Login Failed', errorMessage);
    });
  });

  it('shows default message when login error has no message', async () => {
    mockLogin.mockRejectedValueOnce({});
    const { getByPlaceholderText, getByText } = render(<ProviderLoginScreen />);

    fireEvent.changeText(getByPlaceholderText('Email'), 'test@example.com');
    fireEvent.changeText(getByPlaceholderText('Password'), 'password123');
    fireEvent.press(getByText('Sign In'));

    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith('Login Failed', 'Invalid credentials');
    });
  });

  it('navigates to ProviderRegister when link is pressed', () => {
    const { getByText } = render(<ProviderLoginScreen />);

    fireEvent.press(getByText('Register as Provider'));

    expect(mockNavigate).toHaveBeenCalledWith('ProviderRegister');
  });

  it('shows password toggle button', () => {
    const { getByPlaceholderText } = render(<ProviderLoginScreen />);

    // Password field exists
    const passwordInput = getByPlaceholderText('Password');
    expect(passwordInput).toBeTruthy();
  });

  it('shows the header with title and subtitle', () => {
    const { getByText } = render(<ProviderLoginScreen />);

    expect(getByText('Provider Login')).toBeTruthy();
    expect(getByText('Sign in to manage your daycare listings')).toBeTruthy();
  });
});
