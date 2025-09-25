import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography
} from '@mui/material';
import TableSortLabel from '@mui/material/TableSortLabel';
import { useVirtualizer } from '@tanstack/react-virtual';
import { useMemo, useRef } from 'react';

import type { ListRisksParams, Risk } from '../../../api/client';

export type SortDirection = 'asc' | 'desc';

const columns: { key: keyof Risk; label: string; numeric?: boolean; width?: string }[] = [
  { key: 'code', label: 'Code', width: '15%' },
  { key: 'label', label: 'Libellé', width: '35%' },
  { key: 'unitId', label: 'Unité', width: '10%' },
  { key: 'status', label: 'Statut', width: '12%' },
  { key: 'score', label: 'Score', numeric: true, width: '10%' },
  { key: 'updatedAt', label: 'Mis à jour', width: '18%' }
];

const formatStatus = (status: Risk['status']) => status.replace(/_/g, ' ');

function parseSort(sort?: ListRisksParams['sort']): { field: keyof Risk | null; direction: SortDirection } {
  if (!sort) {
    return { field: null, direction: 'desc' };
  }
  const [field, direction] = String(sort).split(',');
  if (!field || (direction !== 'asc' && direction !== 'desc')) {
    return { field: null, direction: 'desc' };
  }
  return { field: field as keyof Risk, direction };
}

interface RiskTableProps {
  risks: Risk[];
  total: number;
  sort?: ListRisksParams['sort'];
  onSortChange: (field: keyof Risk, direction: SortDirection) => void;
  onSelect: (risk: Risk) => void;
}

export function RiskTable({ risks, total, sort, onSortChange, onSelect }: RiskTableProps) {
  const parentRef = useRef<HTMLDivElement | null>(null);
  const { field, direction } = parseSort(sort);
  const rows = useMemo(() => risks, [risks]);

  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 64,
    overscan: 8
  });

  return (
    <TableContainer component={Paper} variant="outlined" sx={{ maxHeight: 520 }}>
      <Table stickyHeader size="medium" aria-label="Liste des risques">
        <TableHead>
          <TableRow>
            {columns.map((column) => {
              const isActive = field === column.key;
              return (
                <TableCell
                  key={column.key}
                  sortDirection={isActive ? direction : false}
                  sx={{ width: column.width }}
                  align={column.numeric ? 'right' : 'left'}
                >
                  <TableSortLabel
                    active={isActive}
                    direction={isActive ? direction : 'asc'}
                    onClick={() =>
                      onSortChange(
                        column.key,
                        isActive && direction === 'asc' ? 'desc' : 'asc'
                      )
                    }
                  >
                    {column.label}
                  </TableSortLabel>
                </TableCell>
              );
            })}
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.length === 0 ? (
            <TableRow>
              <TableCell colSpan={columns.length}>
                <Box sx={{ py: 6, textAlign: 'center' }}>
                  <Typography variant="body1">Aucun risque trouvé.</Typography>
                </Box>
              </TableCell>
            </TableRow>
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} sx={{ p: 0, borderBottom: 0 }}>
                <Box ref={parentRef} sx={{ maxHeight: 440, overflow: 'auto' }}>
                  <Box sx={{ height: rowVirtualizer.getTotalSize(), position: 'relative' }}>
                    {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                      const risk = rows[virtualRow.index];
                      return (
                        <Box
                          key={risk.id}
                          sx={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            transform: `translateY(${virtualRow.start}px)`
                          }}
                        >
                          <TableRow
                            hover
                            onClick={() => onSelect(risk)}
                            sx={{ cursor: 'pointer' }}
                          >
                            <TableCell>{risk.code}</TableCell>
                            <TableCell>
                              <Typography variant="subtitle2">{risk.label}</Typography>
                              <Typography variant="caption" color="text.secondary">
                                Mis à jour le {new Date(risk.updatedAt).toLocaleString()}
                              </Typography>
                            </TableCell>
                            <TableCell>{risk.unitId}</TableCell>
                            <TableCell sx={{ textTransform: 'capitalize' }}>
                              {formatStatus(risk.status)}
                            </TableCell>
                            <TableCell align="right">
                              <Typography fontWeight={600}>{risk.score}</Typography>
                            </TableCell>
                            <TableCell>
                              {new Date(risk.updatedAt).toLocaleDateString('fr-FR', {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </TableCell>
                          </TableRow>
                        </Box>
                      );
                    })}
                  </Box>
                </Box>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      <Box sx={{ px: 2, py: 1.5 }}>
        <Typography variant="caption" color="text.secondary">
          {total} éléments au total
        </Typography>
      </Box>
    </TableContainer>
  );
}
