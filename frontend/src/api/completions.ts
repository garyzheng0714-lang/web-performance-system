import { apiClient } from './client';
import { Completion, PaginatedResponse } from '@/types';

export async function fetchMyCompletions(params?: {
  status?: string;
  periodId?: string;
  page?: number;
  pageSize?: number;
}): Promise<PaginatedResponse<Completion>> {
  return apiClient.get('/completions/my/list', { params });
}

export async function fetchPendingScores(): Promise<PaginatedResponse<Completion>> {
  return apiClient.get('/completions/pending/scores');
}

export async function createCompletion(payload: {
  objectiveId: string;
  periodId?: string;
  periodName?: string;
  selfAssessment?: string;
  actualValue?: string;
  completionRate?: number;
  selfScore?: number;
}) {
  return apiClient.post('/completions', payload);
}

export async function updateCompletion(completionId: string, payload: Partial<{
  selfAssessment: string;
  actualValue: string;
  completionRate: number;
  selfScore: number;
}>) {
  return apiClient.put(`/completions/${completionId}`, payload);
}

export async function submitCompletion(completionId: string) {
  return apiClient.post(`/completions/${completionId}/submit`);
}

export async function scoreCompletion(completionId: string, payload: {
  supervisorScore: number;
  calibrationScore?: number;
  supervisorComment?: string;
}) {
  return apiClient.post(`/completions/${completionId}/score`, payload);
}

export async function archiveCompletion(completionId: string) {
  return apiClient.post(`/completions/${completionId}/archive`);
}

export async function deleteCompletion(completionId: string) {
  return apiClient.delete(`/completions/${completionId}`);
}
