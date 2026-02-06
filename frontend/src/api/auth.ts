import { apiClient } from './client';
import { UserProfile } from '@/types';

export async function fetchProfile(): Promise<UserProfile> {
  return apiClient.get('/auth/profile');
}

export async function refreshToken(): Promise<{ token: string }> {
  return apiClient.get('/auth/refresh');
}
