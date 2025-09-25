import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';

type ColorMode = 'light' | 'dark';

interface ColorModeContextValue {
  mode: ColorMode;
  toggle: () => void;
}

const ColorModeContext = createContext<ColorModeContextValue | undefined>(undefined);

const palette = {
  primary: {
    main: '#05668d'
  },
  secondary: {
    main: '#00a896'
  },
  background: {
    default: '#f7f9fb',
    paper: '#ffffff'
  }
};

export function AppThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<ColorMode>('light');

  const colorMode = useMemo<ColorModeContextValue>(
    () => ({
      mode,
      toggle: () => setMode((prev) => (prev === 'light' ? 'dark' : 'light'))
    }),
    [mode]
  );

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          ...palette
        },
        typography: {
          fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif'
        },
        components: {
          MuiButton: {
            defaultProps: {
              variant: 'contained',
              disableElevation: true
            }
          },
          MuiTableHead: {
            styleOverrides: {
              root: {
                backgroundColor: mode === 'light' ? '#e0f7fa' : '#004d61'
              }
            }
          }
        }
      }),
    [mode]
  );

  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}

export function useColorMode() {
  const context = useContext(ColorModeContext);
  if (!context) {
    throw new Error('useColorMode must be used within AppThemeProvider');
  }
  return context;
}
