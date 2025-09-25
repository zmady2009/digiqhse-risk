import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import { fireEvent, render, screen } from '@testing-library/react';
import { type ReactNode } from 'react';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';

import { RiskTable } from './RiskTable';
import type { Risk } from '../../../api/client';

describe('RiskTable', () => {
  const theme = createTheme();

  const wrapper = ({ children }: { children: ReactNode }) => (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );

  let boundingRectSpy: ReturnType<typeof vi.spyOn>;
  let originalClientHeight: PropertyDescriptor | undefined;
  let originalOffsetHeight: PropertyDescriptor | undefined;

  beforeAll(() => {
    boundingRectSpy = vi
      .spyOn(HTMLElement.prototype, 'getBoundingClientRect')
      .mockImplementation(() => ({
        x: 0,
        y: 0,
        width: 1024,
        height: 600,
        top: 0,
        right: 1024,
        bottom: 600,
        left: 0,
        toJSON: () => ({})
      }));

    originalClientHeight = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'clientHeight');
    originalOffsetHeight = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'offsetHeight');
    Object.defineProperty(HTMLElement.prototype, 'clientHeight', {
      configurable: true,
      value: 600
    });
    Object.defineProperty(HTMLElement.prototype, 'offsetHeight', {
      configurable: true,
      value: 600
    });
  });

  afterAll(() => {
    boundingRectSpy.mockRestore();
    if (originalClientHeight) {
      Object.defineProperty(HTMLElement.prototype, 'clientHeight', originalClientHeight);
    }
    if (originalOffsetHeight) {
      Object.defineProperty(HTMLElement.prototype, 'offsetHeight', originalOffsetHeight);
    }
  });

  it('renders empty state when no risks', () => {
    render(
      <RiskTable risks={[]} total={0} sort={undefined} onSortChange={vi.fn()} onSelect={vi.fn()} />,
      { wrapper }
    );

    expect(screen.getByText('Aucun risque trouvé.')).toBeInTheDocument();
  });

  it('invokes callback when a row is selected', () => {
    const onSelect = vi.fn();
    const risks: Risk[] = [
      {
        id: 1,
        code: 'R-001',
        label: 'Glissade',
        unitId: 2,
        score: 42,
        status: 'open',
        updatedAt: '2025-01-01T08:00:00Z'
      }
    ];

    render(
      <RiskTable
        risks={risks}
        total={risks.length}
        sort={'updatedAt,desc'}
        onSortChange={vi.fn()}
        onSelect={onSelect}
      />,
      { wrapper }
    );

    fireEvent.click(screen.getByText('Glissade'));
    expect(onSelect).toHaveBeenCalledWith(risks[0]);
  });
});
