import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import SearchControls from '../../components/SearchControls';

describe('SearchControls', () => {
  it('updates address input on change', () => {
    const onSearch = jest.fn();
    const onUseLocation = jest.fn();
    const { getByPlaceholderText } = render(
      <SearchControls onSearch={onSearch} onUseLocation={onUseLocation} />,
    );

    const addressInput = getByPlaceholderText('Enter address or city');
    fireEvent.changeText(addressInput, '123 Main St');

    expect(addressInput.props.value).toBe('123 Main St');
  });

  it('updates name input on change', () => {
    const onSearch = jest.fn();
    const onUseLocation = jest.fn();
    const { getByPlaceholderText } = render(
      <SearchControls onSearch={onSearch} onUseLocation={onUseLocation} />,
    );

    const nameInput = getByPlaceholderText('Daycare name (optional)');
    fireEvent.changeText(nameInput, 'Sunshine');

    expect(nameInput.props.value).toBe('Sunshine');
  });

  it('calls onSearch with address and name on Search press', () => {
    const onSearch = jest.fn();
    const onUseLocation = jest.fn();
    const { getByPlaceholderText, getByText } = render(
      <SearchControls onSearch={onSearch} onUseLocation={onUseLocation} />,
    );

    fireEvent.changeText(
      getByPlaceholderText('Enter address or city'),
      'Boston',
    );
    fireEvent.changeText(
      getByPlaceholderText('Daycare name (optional)'),
      'Sunshine',
    );
    fireEvent.press(getByText('Search'));

    expect(onSearch).toHaveBeenCalledWith('Boston', 'Sunshine');
  });

  it('calls onSearch with empty strings when inputs are empty', () => {
    const onSearch = jest.fn();
    const onUseLocation = jest.fn();
    const { getByText } = render(
      <SearchControls onSearch={onSearch} onUseLocation={onUseLocation} />,
    );

    fireEvent.press(getByText('Search'));

    expect(onSearch).toHaveBeenCalledWith('', '');
  });

  it('calls onUseLocation on location button press', () => {
    const onSearch = jest.fn();
    const onUseLocation = jest.fn();
    const { getByText } = render(
      <SearchControls onSearch={onSearch} onUseLocation={onUseLocation} />,
    );

    fireEvent.press(getByText('locate'));

    expect(onUseLocation).toHaveBeenCalledTimes(1);
  });

  it('renders without crashing when isLoading is true', () => {
    const onSearch = jest.fn();
    const onUseLocation = jest.fn();
    const { getByPlaceholderText } = render(
      <SearchControls
        onSearch={onSearch}
        onUseLocation={onUseLocation}
        isLoading={true}
      />,
    );

    // Verify all key elements still render
    expect(getByPlaceholderText('Enter address or city')).toBeTruthy();
    expect(getByPlaceholderText('Daycare name (optional)')).toBeTruthy();
  });
});
