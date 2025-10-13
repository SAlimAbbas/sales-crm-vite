import { apiService } from './api';
import { Followup, FollowupFormData, FollowupsResponse, PaginationParams } from '../types';

export const followupService = {
  getFollowups: (params?: PaginationParams) => 
    apiService.get<FollowupsResponse>('/followups', params),

  getFollowup: (id: number) => 
    apiService.get<Followup>(`/followups/${id}`),

  createFollowup: (data: FollowupFormData) => 
    apiService.post<Followup>('/followups', data),

  updateFollowup: (id: number, data: Partial<FollowupFormData>) => 
    apiService.put<Followup>(`/followups/${id}`, data),

  deleteFollowup: (id: number) => 
    apiService.delete(`/followups/${id}`),

  completeFollowup: (id: number, notes?: string) => 
    apiService.post<Followup>(`/followups/${id}/complete`, { notes }),

  getOverdue: () => 
    apiService.get<Followup[]>('/followups/overdue'),
};