import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import { setApiKeyAccessor } from '../api/httpClient';

interface AuthContextValue {
  apiKey: string | null;
  isAuthenticated: boolean;
  loginWithApiKey: (apiKey: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [apiKey, setApiKey] = useState<string | null>(null);

  useEffect(() => {
    setApiKeyAccessor(() => apiKey);
  }, [apiKey]);

  const loginWithApiKey = useCallback((nextKey: string) => {
    setApiKey(nextKey);
  }, []);

  const logout = useCallback(() => {
    setApiKey(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      apiKey,
      isAuthenticated: Boolean(apiKey),
      loginWithApiKey,
      logout
    }),
    [apiKey, loginWithApiKey, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
