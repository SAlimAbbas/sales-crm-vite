import { Lead } from "./lead";
import { User } from "./user";

export interface Followup {
  id: number;
  lead_id: number;
  salesperson_id: number;
  scheduled_at: string;
  is_completed: boolean;
  is_overdue: boolean;
  completed_at?: string;
  notes?: string;
  reminder_sent: boolean;
  created_at: string;
  updated_at: string;
  lead?: Lead;
  salesperson?: User;
}

export interface FollowupFormData {
  lead_id: number;
  scheduled_at: string;
}

export interface FollowupsResponse {
  data: Followup[];
  current_page: number;
  total: number;
  per_page: number;
}