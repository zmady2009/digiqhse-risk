import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationOptions,
  type UseMutationResult,
  type UseQueryOptions,
  type UseQueryResult
} from '@tanstack/react-query';
import type { AxiosRequestConfig } from 'axios';

import { apiClient, type ListRisksParams, type ListRisksResponse } from '../client';
import type { ApiError } from '../httpClient';

export const riskKeys = {
  all: ['risks'] as const,
  list: (params: ListRisksParams) => [...riskKeys.all, 'list', params] as const,
  detail: (riskId: number) => [...riskKeys.all, 'detail', riskId] as const,
  assessments: (riskId: number) => [...riskKeys.detail(riskId), 'assessments'] as const,
  actionPlans: (riskId: number) => [...riskKeys.detail(riskId), 'action-plans'] as const,
  documents: (riskId: number) => [...riskKeys.detail(riskId), 'documents'] as const
};

export const defaultListParams: ListRisksParams = {
  page: 1,
  size: 25
};

type UseListRisksOptions = Omit<
  UseQueryOptions<ListRisksResponse, ApiError, ListRisksResponse, ReturnType<typeof riskKeys.list>>,
  'queryKey' | 'queryFn'
>;

export function useListRisks(
  params: ListRisksParams = {},
  options?: UseListRisksOptions
): UseQueryResult<ListRisksResponse, ApiError> {
  const { enabled, ...rest } = options ?? {};
  const normalizedParams = {
    ...defaultListParams,
    ...params
  } as ListRisksParams;

  return useQuery({
    queryKey: riskKeys.list(normalizedParams),
    queryFn: async () => {
      return apiClient.listRisks(normalizedParams);
    },
    enabled: enabled ?? true,
    throwOnError: false,
    ...rest,
    placeholderData: (prev) => prev
  });
}

type RiskResponse = ReturnType<typeof apiClient.getRisk> extends Promise<infer Result> ? Result : never;

type UseRiskOptions = Omit<
  UseQueryOptions<RiskResponse, ApiError, RiskResponse, ReturnType<typeof riskKeys.detail>>,
  'queryKey' | 'queryFn'
>;

export function useRisk(
  riskId: number,
  options?: UseRiskOptions
): UseQueryResult<RiskResponse, ApiError> {
  const { enabled, ...rest } = options ?? {};

  return useQuery({
    queryKey: riskKeys.detail(riskId),
    queryFn: async () => {
      return apiClient.getRisk(riskId);
    },
    enabled: enabled ?? Number.isFinite(riskId),
    ...rest
  });
}

type AssessmentMutationInput = Parameters<typeof apiClient.createAssessment>[0];
type AssessmentMutationResult = Awaited<ReturnType<typeof apiClient.createAssessment>>;

export function useCreateAssessment(
  options?: UseMutationOptions<AssessmentMutationResult, ApiError, AssessmentMutationInput>
): UseMutationResult<AssessmentMutationResult, ApiError, AssessmentMutationInput> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input) => apiClient.createAssessment(input),
    onSuccess: (data, variables, context) => {
      const riskId = variables.riskId;
      queryClient.invalidateQueries({ queryKey: riskKeys.assessments(riskId) });
      queryClient.invalidateQueries({ queryKey: riskKeys.detail(riskId) });
      options?.onSuccess?.(data, variables, context);
    },
    ...options
  });
}

type UpdateAssessmentVariables = {
  assessmentId: number;
  payload: Parameters<typeof apiClient.updateAssessment>[1];
  riskId: number;
  config?: AxiosRequestConfig;
};

type UpdateAssessmentResult = Awaited<ReturnType<typeof apiClient.updateAssessment>>;

export function useUpdateAssessment(
  options?: UseMutationOptions<UpdateAssessmentResult, ApiError, UpdateAssessmentVariables>
): UseMutationResult<UpdateAssessmentResult, ApiError, UpdateAssessmentVariables> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ assessmentId, payload }: UpdateAssessmentVariables) =>
      apiClient.updateAssessment(assessmentId, payload),
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: riskKeys.detail(variables.riskId) });
      queryClient.invalidateQueries({ queryKey: riskKeys.assessments(variables.riskId) });
      options?.onSuccess?.(data, variables, context);
    },
    ...options
  });
}
