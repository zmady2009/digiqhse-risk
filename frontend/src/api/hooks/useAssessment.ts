import { useQuery, type UseQueryOptions, type UseQueryResult } from '@tanstack/react-query';

import { apiClient } from '../client';
import type { ApiError } from '../httpClient';
import { riskKeys } from './useRisks';

type AssessmentResponse = Awaited<ReturnType<typeof apiClient.getAssessment>>;

export function useAssessment(
  riskId: number,
  assessmentId: number | null,
  options?: Omit<
    UseQueryOptions<AssessmentResponse, ApiError, AssessmentResponse>,
    'queryKey' | 'queryFn'
  >
): UseQueryResult<AssessmentResponse, ApiError> {
  return useQuery({
    queryKey: [...riskKeys.assessments(riskId), assessmentId],
    queryFn: () => apiClient.getAssessment(assessmentId ?? 0),
    enabled: Boolean(assessmentId) && Number.isFinite(assessmentId) && (options?.enabled ?? true),
    ...options
  });
}
