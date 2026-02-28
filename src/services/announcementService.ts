import { apiService } from "./api";

export interface Announcement {
  id: number;
  title: string;
  description: string;
  type: "info" | "warning" | "success" | "error";
  target_roles: string[];
  start_date: string;
  end_date: string;
  is_active: boolean;
  created_by: number;
  created_at: string;
  creator?: { id: number; name: string };
}

export interface CreateAnnouncementPayload {
  title: string;
  description: string;
  type: "info" | "warning" | "success" | "error";
  target_roles: string[];
  start_date: string;
  end_date: string;
  is_active?: boolean;
}

export const announcementService = {
  // For logged-in user: get active announcements for their role
  getMyAnnouncements: () => apiService.get<Announcement[]>("/announcements"),

  // Admin: get all announcements
  getAllAnnouncements: (params?: any) =>
    apiService.get<any>("/announcements/all", params),

  create: (data: CreateAnnouncementPayload) =>
    apiService.post<Announcement>("/announcements", data),

  update: (id: number, data: Partial<CreateAnnouncementPayload>) =>
    apiService.put<Announcement>(`/announcements/${id}`, data),

  delete: (id: number) => apiService.delete(`/announcements/${id}`),
};
