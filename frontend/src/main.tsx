import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { RouterProvider, createRouter } from '@tanstack/react-router';
import React from 'react';
import ReactDOM from 'react-dom/client';

import { queryClient } from './api/queryClient';
import { AuthProvider } from './auth/AuthProvider';
import { routeTree } from './routeTree.gen';
import { AppThemeProvider } from './theme/AppThemeProvider';

const router = createRouter({
  routeTree,
  defaultPreload: 'intent'
});

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <AuthProvider>
      <QueryClientProvider client={queryClient}>
        <AppThemeProvider>
          <RouterProvider router={router} />
          <ReactQueryDevtools position="bottom-right" buttonPosition="bottom-right" />
        </AppThemeProvider>
      </QueryClientProvider>
    </AuthProvider>
  </React.StrictMode>
);
