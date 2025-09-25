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
  type CreateDocumentInput,
  type CreateDocumentResponse,
  type ListDocumentsParams,
  type ListDocumentsResponse
} from '../client';
import type { ApiError } from '../httpClient';
import { riskKeys } from './useRisks';

const defaultDocumentParams: ListDocumentsParams = {
  page: 1,
  size: 25
};

export function useDocuments(
  riskId: number,
  params: Omit<ListDocumentsParams, 'riskId'> = {},
  options?: Omit<
    UseQueryOptions<ListDocumentsResponse, ApiError, ListDocumentsResponse>,
    'queryKey' | 'queryFn'
  >
): UseQueryResult<ListDocumentsResponse, ApiError> {
  const normalizedParams: ListDocumentsParams = {
    ...defaultDocumentParams,
    riskId,
    ...params
  };

  const { enabled, ...rest } = options ?? {};

  return useQuery({
    queryKey: riskKeys.documents(riskId),
    queryFn: () => apiClient.listDocuments(normalizedParams),
    enabled: Number.isFinite(riskId) && (enabled ?? true),
    ...rest
  });
}

export function useCreateDocument(
  options?: UseMutationOptions<CreateDocumentResponse, ApiError, CreateDocumentInput>
): UseMutationResult<CreateDocumentResponse, ApiError, CreateDocumentInput> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload) => apiClient.createDocument(payload),
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: riskKeys.documents(variables.riskId) });
      options?.onSuccess?.(data, variables, context);
    },
    ...options
  });
}
