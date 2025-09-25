import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import RefreshIcon from '@mui/icons-material/Refresh';
import SearchIcon from '@mui/icons-material/Search';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  FormControl,
  InputAdornment,
  InputLabel,
  MenuItem,
  Pagination,
  Paper,
  Select,
  Stack,
  TextField,
  Typography
} from '@mui/material';
import { useNavigate, useSearch } from '@tanstack/react-router';
import { useMemo, useState } from 'react';

import { useDownloadRiskReport } from '../../api/hooks/useReports';
import { useListRisks } from '../../api/hooks/useRisks';
import { RiskTable, type SortDirection } from '../../features/risks/components/RiskTable';

interface RiskListSearch {
  page?: number;
  size?: number;
  query?: string;
  sort?: string;
  status?: string;
}

const statusOptions = [
  { label: 'Tous les statuts', value: 'all' },
  { label: 'Ouverts', value: 'open' },
  { label: 'En cours', value: 'in_progress' },
  { label: 'Clôturés', value: 'closed' }
];

export function RiskListRoute() {
  const navigate = useNavigate({ from: '/risks' });
  const searchState = useSearch({ from: '/risks' }) as RiskListSearch;

  const page = Number(searchState.page ?? 1);
  const size = Number(searchState.size ?? 25);
  const currentSort = searchState.sort ?? 'updatedAt,desc';
  const statusFilter = searchState.status && searchState.status !== 'all' ? searchState.status : undefined;

  const [query, setQuery] = useState(searchState.query ?? '');

  const filters = useMemo(() => {
    if (!statusFilter) return undefined;
    return JSON.stringify({ status: statusFilter });
  }, [statusFilter]);

  const { data, isLoading, isError, error, refetch, isFetching } = useListRisks({
    page,
    size,
    query: searchState.query,
    sort: currentSort,
    filters
  });

  const risks = data?.data ?? [];
  const total = data?.meta?.totalItems ?? risks.length;
  const totalPages = data?.meta?.totalPages ?? 1;

  const { mutateAsync: downloadReport, isPending: isDownloading } = useDownloadRiskReport();

  const handleSortChange = (field: keyof (typeof risks)[number], direction: SortDirection) => {
    navigate({
      search: {
        ...searchState,
        sort: `${field},${direction}`,
        page: 1
      }
    });
  };

  const handlePageChange = (_: unknown, value: number) => {
    navigate({
      search: {
        ...searchState,
        page: value
      }
    });
  };

  const handleStatusChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    const value = event.target.value as string;
    navigate({
      search: {
        ...searchState,
        status: value === 'all' ? undefined : value,
        page: 1
      }
    });
  };

  const handleSearchSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    navigate({
      search: {
        ...searchState,
        query: query || undefined,
        page: 1
      }
    });
  };

  return (
    <Stack spacing={3}>
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems={{ md: 'center' }}>
        <Typography variant="h4" component="h1" sx={{ flexGrow: 1 }}>
          Risques
        </Typography>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={() => refetch()}
          disabled={isLoading || isFetching}
        >
          Actualiser
        </Button>
      </Stack>

      <Paper variant="outlined" sx={{ p: 2 }}>
        <Stack
          component="form"
          onSubmit={handleSearchSubmit}
          spacing={2}
          direction={{ xs: 'column', md: 'row' }}
        >
          <TextField
            placeholder="Rechercher un risque (code, libellé...)"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              )
            }}
            fullWidth
          />
          <FormControl sx={{ minWidth: 180 }}>
            <InputLabel id="status-filter-label">Statut</InputLabel>
            <Select
              labelId="status-filter-label"
              label="Statut"
              value={statusFilter ?? 'all'}
              onChange={handleStatusChange}
            >
              {statusOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Button
            type="submit"
            variant="contained"
            disabled={isLoading || isFetching}
            startIcon={<SearchIcon />}
          >
            Filtrer
          </Button>
        </Stack>
      </Paper>

      {searchState.query && (
        <Chip
          label={`Filtre texte : "${searchState.query}"`}
          onDelete={() =>
            navigate({
              search: {
                ...searchState,
                query: undefined,
                page: 1
              }
            })
          }
          sx={{ maxWidth: 300 }}
        />
      )}

      {isError && error && (
        <Alert severity="error" role="alert">
          {error.problem?.detail ?? 'Une erreur est survenue lors du chargement des risques.'}
        </Alert>
      )}

      {isLoading ? (
        <Box sx={{ py: 6, display: 'flex', justifyContent: 'center' }}>
          <CircularProgress />
        </Box>
      ) : (
        <RiskTable
          risks={risks}
          total={total}
          sort={currentSort}
          onSelect={(risk) =>
            navigate({ to: '/risks/$riskId', params: { riskId: risk.id }, search: searchState })
          }
          onSortChange={handleSortChange}
        />
      )}

      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems="center" justifyContent="space-between">
        <Pagination count={totalPages} page={page} onChange={handlePageChange} color="primary" />
        <Button
          variant="outlined"
          startIcon={<PictureAsPdfIcon />}
          disabled={risks.length === 0 || isDownloading}
          onClick={async () => {
            if (risks.length === 0) return;
            const risk = risks[0];
            const blob = await downloadReport(risk.id);
            const url = URL.createObjectURL(blob);
            const anchor = document.createElement('a');
            anchor.href = url;
            anchor.download = `risk-${risk.id}.pdf`;
            anchor.click();
            URL.revokeObjectURL(url);
          }}
        >
          Exporter le premier risque (PDF)
        </Button>
      </Stack>
    </Stack>
  );
}
