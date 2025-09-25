import { createRootRoute, createRoute, redirect } from '@tanstack/react-router';

import { RiskDetailRoute } from './routes/risks/RiskDetailRoute';
import { RiskEvaluationRoute } from './routes/risks/RiskEvaluationRoute';
import { RiskListRoute } from './routes/risks/RiskListRoute';
import { RootLayout } from './routes/RootLayout';

const rootRoute = createRootRoute({
  component: RootLayout
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  beforeLoad: ({ location }) => {
    throw redirect({ to: '/risks', search: location.search as Record<string, unknown> });
  }
});

const risksRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'risks',
  component: RiskListRoute,
  validateSearch: (search: Record<string, unknown>) => ({
    page: Number(search.page ?? 1),
    size: Number(search.size ?? 25),
    query: typeof search.query === 'string' ? search.query : undefined,
    sort: typeof search.sort === 'string' ? search.sort : 'updatedAt,desc',
    status: typeof search.status === 'string' ? search.status : undefined
  })
});

const riskDetailRoute = createRoute({
  getParentRoute: () => risksRoute,
  path: '$riskId',
  component: RiskDetailRoute,
  validateSearch: (search: Record<string, unknown>) => ({
    page: Number(search.page ?? 1),
    size: Number(search.size ?? 25),
    query: typeof search.query === 'string' ? search.query : undefined,
    sort: typeof search.sort === 'string' ? search.sort : 'updatedAt,desc',
    status: typeof search.status === 'string' ? search.status : undefined
  })
});

const riskEvaluationRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'risks/$riskId/evaluation',
  component: RiskEvaluationRoute,
  validateSearch: (search: Record<string, unknown>) => ({
    assessmentId:
      typeof search.assessmentId === 'string' ? Number(search.assessmentId) : undefined
  })
});

export const routeTree = rootRoute.addChildren([
  indexRoute,
  risksRoute.addChildren([riskDetailRoute]),
  riskEvaluationRoute
]);
