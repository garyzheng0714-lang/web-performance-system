import { apiClient } from './client';
import { Objective, PaginatedResponse } from '@/types';

export async function fetchMyObjectives(params?: {
  status?: string;
  periodId?: string;
  type?: string;
  keyword?: string;
  page?: number;
  pageSize?: number;
}): Promise<PaginatedResponse<Objective>> {
  return apiClient.get('/objectives/my/list', { params });
}

export async function fetchPendingApprovals(): Promise<PaginatedResponse<Objective>> {
  return apiClient.get('/objectives/pending/approvals');
}

export async function createObjective(payload: {
  title: string;
  description?: string;
  periodId?: string;
  periodName?: string;
  type?: string;
  weight?: number;
  target?: string;
  priority?: string;
  dueDate?: string;
  parentId?: string;
}) {
  return apiClient.post('/objectives', payload);
}

export async function updateObjective(objectiveId: string, payload: Partial<{
  title: string;
  description: string;
  type: string;
  weight: number;
  target: string;
  priority: string;
  dueDate: string;
  parentId: string;
}>) {
  return apiClient.put(`/objectives/${objectiveId}`, payload);
}

export async function deleteObjective(objectiveId: string) {
  return apiClient.delete(`/objectives/${objectiveId}`);
}

export async function submitObjective(objectiveId: string, payload?: { remark?: string }) {
  return apiClient.post(`/objectives/${objectiveId}/submit`, payload || {});
}

export async function approveObjective(objectiveId: string, payload: { approved: boolean; comment?: string }) {
  return apiClient.post(`/objectives/${objectiveId}/approve`, payload);
}
