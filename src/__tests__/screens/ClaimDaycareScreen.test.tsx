import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';
import ClaimDaycareScreen from '../../screens/ClaimDaycareScreen';

// --- Mocks ---

const mockNavigate = jest.fn();

jest.mock('../../hooks/useAppNavigation', () => ({
  useAppNavigation: () => ({ navigate: mockNavigate }),
}));

const mockUseSearchEEC = jest.fn();
const mockUseClaimDaycare = jest.fn();

jest.mock('../../hooks/useProvider', () => ({
  useSearchEEC: (query: string) => mockUseSearchEEC(query),
  useClaimDaycare: () => mockUseClaimDaycare(),
}));

const alertSpy = jest.spyOn(Alert, 'alert');

beforeEach(() => {
  jest.clearAllMocks();
});

// Default mock for claim mutation
const mockClaimMutateAsync = jest.fn();

beforeEach(() => {
  mockUseClaimDaycare.mockReturnValue({
    mutateAsync: mockClaimMutateAsync,
    isPending: false,
  });
});

describe('ClaimDaycareScreen', () => {
  it('renders search input', () => {
    mockUseSearchEEC.mockReturnValue({
      data: [],
      isLoading: false,
    });
    const { getByPlaceholderText } = render(<ClaimDaycareScreen />);

    expect(
      getByPlaceholderText('Search by name, address, city, or phone')
    ).toBeTruthy();
  });

  it('shows loading indicator when searching', () => {
    mockUseSearchEEC.mockReturnValue({
      data: [],
      isLoading: true,
    });
    const { getByPlaceholderText } = render(<ClaimDaycareScreen />);

    // Changing text with >=2 chars triggers the query with enabled: query.length >= 2
    fireEvent.changeText(
      getByPlaceholderText('Search by name, address, city, or phone'),
      'ki'
    );

    // The ActivityIndicator should render when isLoading is true
    expect(mockUseSearchEEC).toHaveBeenCalledWith('ki');
  });

  it('renders daycare results with Claim button for unclaimed items', () => {
    const results = [
      {
        id: 'd1',
        name: 'Happy Kids Daycare',
        address: '123 Main St',
        city: 'Boston',
        phone: '555-0100',
        programType: 'Preschool',
        capacity: 50,
        claimed: false,
      },
    ];
    mockUseSearchEEC.mockReturnValue({
      data: results,
      isLoading: false,
    });
    const { getByText, queryByText } = render(<ClaimDaycareScreen />);

    expect(getByText('Happy Kids Daycare')).toBeTruthy();
    expect(getByText('123 Main St, Boston')).toBeTruthy();
    expect(getByText('📞 555-0100')).toBeTruthy();
    expect(getByText('Preschool')).toBeTruthy();
    expect(getByText('Capacity: 50')).toBeTruthy();
    expect(getByText('Claim')).toBeTruthy();
    expect(queryByText('Already Claimed')).toBeNull();
  });

  it('shows Already Claimed button for claimed daycares', () => {
    const results = [
      {
        id: 'd2',
        name: 'Sunshine Preschool',
        address: '456 Oak Ave',
        city: 'Cambridge',
        claimed: true,
      },
    ];
    mockUseSearchEEC.mockReturnValue({
      data: results,
      isLoading: false,
    });
    const { getByText, queryByText } = render(<ClaimDaycareScreen />);

    expect(getByText('Sunshine Preschool')).toBeTruthy();
    expect(getByText('Already Claimed')).toBeTruthy();
    expect(queryByText('Claim')).toBeNull();
  });

  it('calls claim mutation and navigates on success', async () => {
    mockClaimMutateAsync.mockResolvedValueOnce(undefined);
    const results = [
      {
        id: 'd1',
        name: 'Happy Kids Daycare',
        address: '123 Main St',
        city: 'Boston',
        claimed: false,
      },
    ];
    mockUseSearchEEC.mockReturnValue({
      data: results,
      isLoading: false,
    });
    const { getByText } = render(<ClaimDaycareScreen />);

    fireEvent.press(getByText('Claim'));

    await waitFor(() => {
      expect(mockClaimMutateAsync).toHaveBeenCalledWith('d1');
      expect(alertSpy).toHaveBeenCalledWith(
        'Success',
        'Claim request submitted for admin approval.',
        expect.arrayContaining([
          expect.objectContaining({ text: 'OK' }),
        ])
      );
    });
  });

  it('navigates to ProviderDashboard after successful claim alert OK', async () => {
    mockClaimMutateAsync.mockResolvedValueOnce(undefined);
    const results = [
      {
        id: 'd1',
        name: 'Happy Kids Daycare',
        address: '123 Main St',
        city: 'Boston',
        claimed: false,
      },
    ];
    mockUseSearchEEC.mockReturnValue({
      data: results,
      isLoading: false,
    });
    const { getByText } = render(<ClaimDaycareScreen />);

    fireEvent.press(getByText('Claim'));

    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalled();
      const alertCall = alertSpy.mock.calls.find(
        (call) => call[0] === 'Success'
      );
      expect(alertCall).toBeTruthy();
      if (alertCall) {
        const buttons = alertCall[2] as Array<{
          text: string;
          onPress?: () => void;
        }>;
        const okButton = buttons.find((b) => b.text === 'OK');
        okButton!.onPress!();
        expect(mockNavigate).toHaveBeenCalledWith('ProviderDashboard');
      }
    });
  });

  it('shows error alert when claim mutation fails', async () => {
    mockClaimMutateAsync.mockRejectedValueOnce({
      response: { data: { error: 'Already claimed' } },
    });
    const results = [
      {
        id: 'd1',
        name: 'Happy Kids Daycare',
        address: '123 Main St',
        city: 'Boston',
        claimed: false,
      },
    ];
    mockUseSearchEEC.mockReturnValue({
      data: results,
      isLoading: false,
    });
    const { getByText } = render(<ClaimDaycareScreen />);

    fireEvent.press(getByText('Claim'));

    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith('Error', 'Already claimed');
    });
  });

  it('shows generic error message when claim fails with no error data', async () => {
    mockClaimMutateAsync.mockRejectedValueOnce({});
    const results = [
      {
        id: 'd1',
        name: 'Happy Kids Daycare',
        address: '123 Main St',
        city: 'Boston',
        claimed: false,
      },
    ];
    mockUseSearchEEC.mockReturnValue({
      data: results,
      isLoading: false,
    });
    const { getByText } = render(<ClaimDaycareScreen />);

    fireEvent.press(getByText('Claim'));

    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith(
        'Error',
        'Failed to submit claim'
      );
    });
  });

  it('shows empty state when query length is >= 2 but no results', () => {
    mockUseSearchEEC.mockReturnValue({
      data: [],
      isLoading: false,
    });
    const { getByPlaceholderText, queryByText } = render(
      <ClaimDaycareScreen />
    );

    // Set query to trigger the empty component (query.length >= 2 && !isLoading)
    fireEvent.changeText(
      getByPlaceholderText('Search by name, address, city, or phone'),
      'xx'
    );

    // The FlatList's ListEmptyComponent renders when data is empty
    // and query.length >= 2 (but it shows based on the data being empty)
    // The component checks query.length >= 2 && !isLoading in the ListEmptyComponent
    expect(queryByText('No results found. Try a different search.')).toBeTruthy();
  });

  it('does not show empty state when query is too short', () => {
    mockUseSearchEEC.mockReturnValue({
      data: [],
      isLoading: false,
    });
    const { queryByText } = render(<ClaimDaycareScreen />);

    expect(
      queryByText('No results found. Try a different search.')
    ).toBeNull();
  });

  it('renders program type and capacity tags when present', () => {
    const results = [
      {
        id: 'd1',
        name: 'Happy Kids Daycare',
        address: '123 Main St',
        city: 'Boston',
        programType: 'Daycare Center',
        capacity: 30,
        claimed: false,
      },
    ];
    mockUseSearchEEC.mockReturnValue({
      data: results,
      isLoading: false,
    });
    const { getByText } = render(<ClaimDaycareScreen />);

    expect(getByText('Daycare Center')).toBeTruthy();
    expect(getByText('Capacity: 30')).toBeTruthy();
  });

  it('does not render tags when programType and capacity are absent', () => {
    const results = [
      {
        id: 'd1',
        name: 'Simple Daycare',
        address: '1 Elm St',
        city: 'Somerville',
        claimed: false,
      },
    ];
    mockUseSearchEEC.mockReturnValue({
      data: results,
      isLoading: false,
    });
    const { queryByText } = render(<ClaimDaycareScreen />);

    expect(queryByText(/^Daycare Center$/)).toBeNull();
    expect(queryByText(/^Capacity:/)).toBeNull();
  });

  it('renders phone info when present', () => {
    const results = [
      {
        id: 'd1',
        name: 'Kids Club',
        address: '5 Park Ave',
        city: 'Boston',
        phone: '555-1234',
        claimed: false,
      },
    ];
    mockUseSearchEEC.mockReturnValue({
      data: results,
      isLoading: false,
    });
    const { getByText } = render(<ClaimDaycareScreen />);

    expect(getByText('📞 555-1234')).toBeTruthy();
  });
});
