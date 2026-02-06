import { apiClient } from './client';

export async function fetchStatistics(params?: { periodId?: string }) {
  return apiClient.get('/admin/statistics', { params });
}

export async function fetchProgress(params?: { periodId?: string; department?: string }) {
  return apiClient.get('/admin/progress', { params });
}

export async function fetchEmployeeStats(params?: { periodId?: string; page?: number; pageSize?: number }) {
  return apiClient.get('/admin/employee-stats', { params });
}

export async function fetchDepartmentStats(params?: { periodId?: string }) {
  return apiClient.get('/admin/department-stats', { params });
}

export async function exportData(params?: { periodId?: string; department?: string; format?: string }) {
  return apiClient.get('/admin/export', { params });
}

export async function fetchSystemLogs(params?: {
  page?: number;
  pageSize?: number;
  userId?: string;
  operation?: string;
  startDate?: string;
  endDate?: string;
}) {
  return apiClient.get('/admin/logs', { params });
}
