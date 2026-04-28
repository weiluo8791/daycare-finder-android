import React, { ReactNode } from 'react';
import { render, RenderOptions } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { NavigationContainer } from '@react-navigation/native';

function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0 },
      mutations: { retry: false },
    },
  });
}

interface WrapperProps {
  children: ReactNode;
  queryClient?: QueryClient;
}

export function AllTheProviders({ children, queryClient }: WrapperProps) {
  const qc = queryClient ?? createTestQueryClient();
  return (
    <QueryClientProvider client={qc}>
      <NavigationContainer>
        {children}
      </NavigationContainer>
    </QueryClientProvider>
  );
}

export function createMockWrapper(queryClient?: QueryClient) {
  return function MockWrapper({ children }: { children: ReactNode }) {
    return (
      <AllTheProviders queryClient={queryClient}>
        {children}
      </AllTheProviders>
    );
  };
}

export function renderWithProviders(
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'wrapper'> & { queryClient?: QueryClient }
) {
  const qc = options?.queryClient ?? createTestQueryClient();
  const wrapper = createMockWrapper(qc);
  return { ...render(ui, { wrapper, ...options }), queryClient: qc };
}

export { createTestQueryClient };
