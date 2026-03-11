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

export const performanceService = {
  getReport: (params: {
    month?: number;
    year?: number;
    shift?: string;
    type?: string;
    role?: string;
  }) => apiService.get<any>("/performance/report", params),

  getMyPerformance: (params?: { month?: number; year?: number }) =>
    apiService.get("/performance/my", params),

  setTarget: (data: SetTargetPayload) =>
    apiService.post("/performance/targets", data),

  bulkSetTargets: (targets: SetTargetPayload[]) =>
    apiService.post("/performance/targets/bulk", { targets }),
};
