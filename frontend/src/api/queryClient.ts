import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        if (failureCount >= 3) {
          return false;
        }
        return !(error instanceof Error && 'response' in error);
      },
      staleTime: 30_000,
      gcTime: 300_000
    },
    mutations: {
      retry: 1
    }
  }
});
