import LockIcon from '@mui/icons-material/Lock';
import LogoutIcon from '@mui/icons-material/Logout';
import DarkModeIcon from '@mui/icons-material/NightsStay';
import LightModeIcon from '@mui/icons-material/WbSunny';
import {
  AppBar,
  Backdrop,
  Box,
  Button,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  TextField,
  Toolbar,
  Typography
} from '@mui/material';
import { Link, Outlet, useRouterState } from '@tanstack/react-router';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { useAuth } from '../auth/AuthProvider';
import { useColorMode } from '../theme/AppThemeProvider';

export function RootLayout() {
  const routerState = useRouterState();
  const { mode, toggle } = useColorMode();
  const { isAuthenticated, loginWithApiKey, logout } = useAuth();
  const [dialogOpen, setDialogOpen] = useState(!isAuthenticated);
  const [keyInput, setKeyInput] = useState('');

  useEffect(() => {
    if (!isAuthenticated) {
      setDialogOpen(true);
    }
  }, [isAuthenticated]);

  const activePath = routerState.location.pathname;

  const navigationLinks = useMemo(
    () => [
      {
        label: 'Risques',
        to: '/risks'
      }
    ],
    []
  );

  const handleSubmit = useCallback(
    (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (!keyInput.trim()) {
        return;
      }
      loginWithApiKey(keyInput.trim());
      setKeyInput('');
      setDialogOpen(false);
    },
    [keyInput, loginWithApiKey]
  );

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <AppBar position="sticky" color="transparent" elevation={0} enableColorOnDark>
        <Toolbar sx={{ display: 'flex', gap: 2 }}>
          <IconButton sx={{ display: { xs: 'inline-flex', md: 'none' } }} edge="start" color="inherit">
            <LockIcon sx={{ opacity: 0.7 }} />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            DigiRisk Headless
          </Typography>
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
            {navigationLinks.map((link) => (
              <Button
                key={link.to}
                component={Link}
                to={link.to}
                color={activePath.startsWith(link.to) ? 'primary' : 'inherit'}
              >
                {link.label}
              </Button>
            ))}
            <IconButton color="inherit" onClick={toggle} aria-label="Basculer le thème">
              {mode === 'light' ? <LightModeIcon /> : <DarkModeIcon />}
            </IconButton>
            {isAuthenticated && (
              <Button
                onClick={logout}
                color="inherit"
                startIcon={<LogoutIcon />}
                sx={{ textTransform: 'none' }}
              >
                Déconnexion
              </Button>
            )}
          </Stack>
        </Toolbar>
      </AppBar>
      <Container component="main" maxWidth="xl" sx={{ py: 4 }}>
        {isAuthenticated ? (
          <Outlet />
        ) : (
          <Stack spacing={2} alignItems="center" justifyContent="center" sx={{ py: 10 }}>
            <LockIcon color="primary" sx={{ fontSize: 48 }} />
            <Typography variant="h5">Veuillez saisir votre clé API pour continuer.</Typography>
          </Stack>
        )}
      </Container>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Connexion avec clé API</DialogTitle>
        <Box component="form" onSubmit={handleSubmit} noValidate>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Typography variant="body2" color="text.secondary">
              La clé est stockée uniquement en mémoire pour cette session.
            </Typography>
            <TextField
              label="Clé API"
              type="password"
              value={keyInput}
              onChange={(event) => setKeyInput(event.target.value)}
              autoFocus
              required
              fullWidth
              inputProps={{ 'aria-label': 'Clé API Dolibarr' }}
            />
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 3 }}>
            <Button onClick={() => setDialogOpen(false)}>Annuler</Button>
            <Button type="submit" variant="contained">
              Se connecter
            </Button>
          </DialogActions>
        </Box>
      </Dialog>

      <Backdrop open={!isAuthenticated} sx={{ zIndex: (theme) => theme.zIndex.drawer - 1 }} />
    </Box>
  );
}
