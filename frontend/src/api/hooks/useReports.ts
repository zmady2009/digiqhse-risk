import { useMutation, type UseMutationOptions, type UseMutationResult } from '@tanstack/react-query';

import { apiClient, type DownloadReportResponse } from '../client';
import type { ApiError } from '../httpClient';

export function useDownloadRiskReport(
  options?: UseMutationOptions<DownloadReportResponse, ApiError, number>
): UseMutationResult<DownloadReportResponse, ApiError, number> {
  return useMutation({
    mutationFn: (riskId) => apiClient.downloadRiskReport(riskId),
    ...options
  });
}
