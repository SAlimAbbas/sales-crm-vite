import { apiService } from "./api";
import { NotificationsResponse, UnreadCountResponse } from "../types";

export const notificationService = {
  // Get all notifications with pagination
  getNotifications: (params?: {
    page?: number;
    per_page?: number;
    unread?: boolean;
  }) => apiService.get<NotificationsResponse>("/notifications", params),

  // Mark single notification as read
  markAsRead: (id: number) =>
    apiService.post<{ message: string }>(`/notifications/${id}/read`),

  // Mark all notifications as read
  markAllAsRead: () =>
    apiService.post<{ message: string }>("/notifications/mark-all-read"),

  // Get unread notification count
  getUnreadCount: (): Promise<UnreadCountResponse> =>
    apiService.get<UnreadCountResponse>(
      "/notifications/unread-count"
    ) as Promise<UnreadCountResponse>,
};
