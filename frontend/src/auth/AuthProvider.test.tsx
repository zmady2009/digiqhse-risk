import { renderHook, act } from '@testing-library/react';
import { ReactNode } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { AuthProvider, useAuth } from './AuthProvider';
import { setApiKeyAccessor } from '../api/httpClient';

vi.mock('../api/httpClient', async (importOriginal) => {
  const mod = await importOriginal<typeof import('../api/httpClient')>();
  return {
    ...mod,
    setApiKeyAccessor: vi.fn()
  };
});

afterEach(() => {
  vi.clearAllMocks();
});

describe('AuthProvider', () => {
  const wrapper = ({ children }: { children: ReactNode }) => <AuthProvider>{children}</AuthProvider>;

  it('throws when useAuth is used outside provider', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => renderHook(() => useAuth())).toThrow('useAuth must be used within an AuthProvider');
    consoleSpy.mockRestore();
  });

  it('provides auth context and updates api key', () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    const mockedSetter = vi.mocked(setApiKeyAccessor);

    expect(result.current.isAuthenticated).toBe(false);

    act(() => {
      result.current.loginWithApiKey('secret');
    });

    expect(result.current.apiKey).toBe('secret');
    expect(result.current.isAuthenticated).toBe(true);
    expect(mockedSetter).toHaveBeenLastCalledWith(expect.any(Function));

    act(() => {
      result.current.logout();
    });

    expect(result.current.apiKey).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
    expect(mockedSetter).toHaveBeenCalledTimes(3);
  });
});
