import { Lead } from "./lead";
import { User } from "./user";

export interface Task {
  id: number;
  title: string;
  description: string;
  due_date: string;
  priority: "low" | "medium" | "high";
  assigned_to: number;
  lead_id: number;
  created_by: number;
  status: "pending" | "in_progress" | "completed" | "overdue";
  actual_status?: 'pending' | 'in_progress' | 'completed' | 'overdue';
  completed_at?: string;
  created_at: string;
  updated_at: string;
  assigned_user?: User;
  lead?: Lead;
  created_by_user?: User;
}

export interface TaskFormData {
  title: string;
  description: string;
  due_date: string;
  priority: "low" | "medium" | "high";
  assigned_to: number;
  lead_id: number;
}

export interface TasksResponse {
  data: Task[];
  current_page: number;
  total: number;
  per_page: number;
}
