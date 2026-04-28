import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';
import ProviderRegisterScreen from '../../screens/ProviderRegisterScreen';

// --- Mocks ---

const mockNavigate = jest.fn();

jest.mock('../../hooks/useAppNavigation', () => ({
  useAppNavigation: () => ({ navigate: mockNavigate }),
}));

const mockMutateAsync = jest.fn();

jest.mock('../../hooks/useProvider', () => ({
  useRegisterProvider: () => ({
    mutateAsync: mockMutateAsync,
    isPending: false,
  }),
}));

const alertSpy = jest.spyOn(Alert, 'alert');

beforeEach(() => {
  jest.clearAllMocks();
});

describe('ProviderRegisterScreen', () => {
  it('renders all form fields and the create account button', () => {
    const { getByPlaceholderText, getByText } = render(<ProviderRegisterScreen />);

    expect(getByPlaceholderText('Full Name')).toBeTruthy();
    expect(getByPlaceholderText('Email')).toBeTruthy();
    expect(getByPlaceholderText('Password')).toBeTruthy();
    expect(getByPlaceholderText('Confirm Password')).toBeTruthy();
    expect(getByText('Create Account')).toBeTruthy();
  });

  it('shows alert when fields are empty', () => {
    const { getByText } = render(<ProviderRegisterScreen />);

    fireEvent.press(getByText('Create Account'));

    expect(alertSpy).toHaveBeenCalledWith('Error', 'Please fill in all fields');
    expect(mockMutateAsync).not.toHaveBeenCalled();
  });

  it('shows alert when passwords do not match', () => {
    const { getByPlaceholderText, getByText } = render(<ProviderRegisterScreen />);

    fireEvent.changeText(getByPlaceholderText('Full Name'), 'John Doe');
    fireEvent.changeText(getByPlaceholderText('Email'), 'john@example.com');
    fireEvent.changeText(getByPlaceholderText('Password'), 'password123');
    fireEvent.changeText(getByPlaceholderText('Confirm Password'), 'different');
    fireEvent.press(getByText('Create Account'));

    expect(alertSpy).toHaveBeenCalledWith('Error', 'Passwords do not match');
    expect(mockMutateAsync).not.toHaveBeenCalled();
  });

  it('shows alert when password is too short (less than 6 characters)', () => {
    const { getByPlaceholderText, getByText } = render(<ProviderRegisterScreen />);

    fireEvent.changeText(getByPlaceholderText('Full Name'), 'John Doe');
    fireEvent.changeText(getByPlaceholderText('Email'), 'john@example.com');
    fireEvent.changeText(getByPlaceholderText('Password'), '123');
    fireEvent.changeText(getByPlaceholderText('Confirm Password'), '123');
    fireEvent.press(getByText('Create Account'));

    expect(alertSpy).toHaveBeenCalledWith('Error', 'Password must be at least 6 characters');
    expect(mockMutateAsync).not.toHaveBeenCalled();
  });

  it('calls register mutation and navigates to login on success', async () => {
    mockMutateAsync.mockResolvedValueOnce(undefined);
    const { getByPlaceholderText, getByText } = render(<ProviderRegisterScreen />);

    fireEvent.changeText(getByPlaceholderText('Full Name'), 'John Doe');
    fireEvent.changeText(getByPlaceholderText('Email'), 'john@example.com');
    fireEvent.changeText(getByPlaceholderText('Password'), 'password123');
    fireEvent.changeText(getByPlaceholderText('Confirm Password'), 'password123');
    fireEvent.press(getByText('Create Account'));

    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalledWith({
        email: 'john@example.com',
        password: 'password123',
        name: 'John Doe',
      });
      expect(alertSpy).toHaveBeenCalledWith(
        'Success',
        'Account created! Please sign in.',
        expect.arrayContaining([
          expect.objectContaining({ text: 'OK' }),
        ])
      );
    });
  });

  it('calls Alert.alert OK callback to navigate to ProviderLogin on success', async () => {
    mockMutateAsync.mockResolvedValueOnce(undefined);
    // Simulate the alert callback by checking that alert was called with the expected arguments
    const { getByPlaceholderText, getByText } = render(<ProviderRegisterScreen />);

    fireEvent.changeText(getByPlaceholderText('Full Name'), 'John Doe');
    fireEvent.changeText(getByPlaceholderText('Email'), 'john@example.com');
    fireEvent.changeText(getByPlaceholderText('Password'), 'password123');
    fireEvent.changeText(getByPlaceholderText('Confirm Password'), 'password123');
    fireEvent.press(getByText('Create Account'));

    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalled();
      // Verify the OK button callback navigates to ProviderLogin
      const alertCall = alertSpy.mock.calls.find(
        (call) => call[0] === 'Success'
      );
      expect(alertCall).toBeTruthy();
      if (alertCall) {
        const buttons = alertCall[2] as Array<{ text: string; onPress?: () => void }>;
        const okButton = buttons.find((b) => b.text === 'OK');
        expect(okButton).toBeTruthy();
        okButton!.onPress!();
        expect(mockNavigate).toHaveBeenCalledWith('ProviderLogin');
      }
    });
  });

  it('shows error alert when registration fails', async () => {
    mockMutateAsync.mockRejectedValueOnce({
      response: { data: { error: 'Email already in use' } },
    });
    const { getByPlaceholderText, getByText } = render(<ProviderRegisterScreen />);

    fireEvent.changeText(getByPlaceholderText('Full Name'), 'John Doe');
    fireEvent.changeText(getByPlaceholderText('Email'), 'existing@example.com');
    fireEvent.changeText(getByPlaceholderText('Password'), 'password123');
    fireEvent.changeText(getByPlaceholderText('Confirm Password'), 'password123');
    fireEvent.press(getByText('Create Account'));

    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith(
        'Registration Failed',
        'Email already in use'
      );
    });
  });

  it('shows generic error message when error response has no data.error', async () => {
    mockMutateAsync.mockRejectedValueOnce({});
    const { getByPlaceholderText, getByText } = render(<ProviderRegisterScreen />);

    fireEvent.changeText(getByPlaceholderText('Full Name'), 'John Doe');
    fireEvent.changeText(getByPlaceholderText('Email'), 'john@example.com');
    fireEvent.changeText(getByPlaceholderText('Password'), 'password123');
    fireEvent.changeText(getByPlaceholderText('Confirm Password'), 'password123');
    fireEvent.press(getByText('Create Account'));

    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith(
        'Registration Failed',
        'Something went wrong'
      );
    });
  });

  it('shows header with title and subtitle', () => {
    const { getByText } = render(<ProviderRegisterScreen />);

    expect(getByText('Register as Provider')).toBeTruthy();
    expect(
      getByText('Create an account to list and manage your daycare')
    ).toBeTruthy();
  });
});
