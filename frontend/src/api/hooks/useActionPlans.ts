import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationOptions,
  type UseMutationResult,
  type UseQueryOptions,
  type UseQueryResult
} from '@tanstack/react-query';

import {
  apiClient,
  type CreateActionPlanInput,
  type CreateActionPlanResponse,
  type ListActionPlansParams,
  type ListActionPlansResponse
} from '../client';
import type { ApiError } from '../httpClient';
import { riskKeys } from './useRisks';

const defaultActionPlanParams: ListActionPlansParams = {
  page: 1,
  size: 25
};

export function useActionPlans(
  riskId: number,
  params: Omit<ListActionPlansParams, 'riskId'> = {},
  options?: Omit<
    UseQueryOptions<ListActionPlansResponse, ApiError, ListActionPlansResponse>,
    'queryFn' | 'queryKey'
  >
): UseQueryResult<ListActionPlansResponse, ApiError> {
  const normalizedParams: ListActionPlansParams = {
    ...defaultActionPlanParams,
    riskId,
    ...params
  };

  const { enabled, ...rest } = options ?? {};

  return useQuery({
    queryKey: riskKeys.actionPlans(riskId),
    queryFn: () => apiClient.listActionPlans(normalizedParams),
    enabled: Number.isFinite(riskId) && (enabled ?? true),
    ...rest
  });
}

export function useCreateActionPlan(
  options?: UseMutationOptions<CreateActionPlanResponse, ApiError, CreateActionPlanInput>
): UseMutationResult<CreateActionPlanResponse, ApiError, CreateActionPlanInput> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload) => apiClient.createActionPlan(payload),
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: riskKeys.actionPlans(variables.riskId) });
      queryClient.invalidateQueries({ queryKey: riskKeys.detail(variables.riskId) });
      options?.onSuccess?.(data, variables, context);
    },
    ...options
  });
}
