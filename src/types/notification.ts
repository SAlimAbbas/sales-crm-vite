export interface Notification {
  id: number;
  user_id: number;
  title: string;
  message: string;
  type:
    | "task_assigned"
    | "task_completed"
    | "task_overdue"
    | "task_reminder"
    | "followup_reminder"
    | "lead_assigned"
    | "lead_status_changed"
    | "user_created"
    | "user_updated"
    | "general";
  data?: any;
  read_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface NotificationsResponse {
  current_page: number;
  data: Notification[];
  total: number;
  per_page: number;
  last_page: number;
}

export interface UnreadCountResponse {
  count: number;
}
