import { apiService } from "./api";

export interface PerformanceReportRow {
  user_id: number;
  name: string;
  role: string;
  shift: string;
  type: string;
  manager_name: string;
  target_id: number | null;
  target_amount: number;
  achieved_amount: number;
  achievement_percent: number;
  overachievement_percent: number;
  counters_target: number;
  counters_achieved: number;
  counters_achievement_percent: number;
  notes: string;
  month: number;
  year: number;
}

export interface SetTargetPayload {
  user_id: number;
  month: number;
  year: number;
  target_amount: number;
  achieved_amount?: number;
  counters_target?: number;
  counters_achieved?: number;
  notes?: string;
}

export interface BackendPerformanceRow {
  user_id: number;
  name: string;
  role: string;
  total_tasks: number;
  completed_on_time: number;
  overdue_tasks: number;
  pending_tasks: number;
  on_time_rate: number;
  admin_approval: "pending" | "positive" | "negative";
  notes: string;
  month: number;
  year: number;
}

export interface SetBackendApprovalPayload {
  user_id: number;
  month: number;
  year: number;
  admin_approval: "pending" | "positive" | "negative";
  notes?: string;
}

export const performanceService = {
  getReport: (params: {
    month?: number;
    year?: number;
    shift?: string;
    manager_id?: string | number;
  }) => apiService.get<any>("/performance/report", params),

  getBackendReport: (params: {
    month?: number;
    year?: number;
    search?: string;
    role?: string;
  }) => apiService.get<any>("/performance/backend-report", params),

  setBackendApproval: (data: SetBackendApprovalPayload) =>
    apiService.post("/performance/backend-approval", data),

  getMyPerformance: (params?: { month?: number; year?: number }) =>
    apiService.get("/performance/my", params),

  setTarget: (data: SetTargetPayload) =>
    apiService.post("/performance/targets", data),

  bulkSetTargets: (targets: SetTargetPayload[]) =>
    apiService.post("/performance/targets/bulk", { targets }),
};
