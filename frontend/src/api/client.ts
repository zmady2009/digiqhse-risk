import { httpClient } from './httpClient';
import type { components, operations } from './types';

export type Risk = components['schemas']['Risk'];
export type RiskPage = components['schemas']['RiskPage'];
export type Assessment = components['schemas']['Assessment'];
export type ActionPlan = components['schemas']['ActionPlan'];
export type Document = components['schemas']['Document'];

export type ListRisksParams = NonNullable<operations['listRisks']['parameters']['query']>;
export type ListRisksResponse = operations['listRisks']['responses'][200]['content']['application/json'];
export type GetRiskResponse = operations['getRisk']['responses'][200]['content']['application/json'];

export type GetAssessmentResponse = operations['getAssessment']['responses'][200]['content']['application/json'];
export type CreateAssessmentInput = NonNullable<
  operations['createAssessment']['requestBody']
>['content']['application/json'];
export type CreateAssessmentResponse = operations['createAssessment']['responses'][201]['content']['application/json'];
export type UpdateAssessmentInput = NonNullable<
  operations['updateAssessment']['requestBody']
>['content']['application/json'];
export type UpdateAssessmentResponse = operations['updateAssessment']['responses'][200]['content']['application/json'];

export type ListActionPlansParams = NonNullable<
  operations['listActionPlans']['parameters']['query']
>;
export type ListActionPlansResponse = operations['listActionPlans']['responses'][200]['content']['application/json'];
export type CreateActionPlanInput = NonNullable<
  operations['createActionPlan']['requestBody']
>['content']['application/json'];
export type CreateActionPlanResponse = operations['createActionPlan']['responses'][201]['content']['application/json'];

export type ListDocumentsParams = NonNullable<operations['listDocuments']['parameters']['query']>;
export type ListDocumentsResponse = operations['listDocuments']['responses'][200]['content']['application/json'];
export type CreateDocumentInput = NonNullable<
  operations['createDocument']['requestBody']
>['content']['application/json'];
export type CreateDocumentResponse = operations['createDocument']['responses'][201]['content']['application/json'];

export const apiClient = {
  async listRisks(params: ListRisksParams) {
    const { data } = await httpClient.get<ListRisksResponse>('/risks', { params });
    return data;
  },
  async getRisk(riskId: number) {
    const { data } = await httpClient.get<GetRiskResponse>(`/risks/${riskId}`);
    return data;
  },
  async getAssessment(assessmentId: number) {
    const { data } = await httpClient.get<GetAssessmentResponse>(`/assessments/${assessmentId}`);
    return data;
  },
  async createAssessment(payload: CreateAssessmentInput) {
    const { data } = await httpClient.post<CreateAssessmentResponse>('/assessments', payload);
    return data;
  },
  async updateAssessment(assessmentId: number, payload: UpdateAssessmentInput) {
    const { data } = await httpClient.patch<UpdateAssessmentResponse>(
      `/assessments/${assessmentId}`,
      payload
    );
    return data;
  },
  async listActionPlans(params: ListActionPlansParams) {
    const { data } = await httpClient.get<ListActionPlansResponse>('/action-plans', { params });
    return data;
  },
  async createActionPlan(payload: CreateActionPlanInput) {
    const { data } = await httpClient.post<CreateActionPlanResponse>('/action-plans', payload);
    return data;
  },
  async listDocuments(params: ListDocumentsParams) {
    const { data } = await httpClient.get<ListDocumentsResponse>('/documents', { params });
    return data;
  },
  async createDocument(payload: CreateDocumentInput) {
    const { data } = await httpClient.post<CreateDocumentResponse>('/documents', payload);
    return data;
  },
  async downloadRiskReport(riskId: number) {
    const { data } = await httpClient.get<Blob>(`/reports/${riskId}/pdf`, {
      responseType: 'blob'
    });
    return data;
  }
};

export type DownloadReportResponse = Awaited<ReturnType<typeof apiClient.downloadRiskReport>>;
