import { apiService } from "./api";

export interface BackendStats {
  total_days_this_month: number;
  average_clock_in_time: string;
  total_work_hours: number;
  average_work_hours_per_day: number;
  total_break_hours: number;
  current_status: string;
  current_session_minutes: number;
  days_in_selected_range: number;
}

export interface ChartData {
  daily_hours: Array<{ date: string; hours: number }>;
  clock_in_distribution: Array<{ hour: string; count: number }>;
  break_stats: {
    total_breaks: number;
    average_break_minutes: number;
  };
}

export interface TrendData {
  weekly_comparison: {
    current_week_hours: number;
    last_week_hours: number;
    growth_percentage: number;
  };
  monthly_comparison: {
    current_month_days: number;
    last_month_days: number;
    growth_percentage: number;
  };
}

export interface TodayReport {
  id: number;
  clock_in_time: string;
  clock_out_time: string | null;
  work_duration_minutes: number;
  total_break_minutes: number;
  daily_report: string | null;
  status: string;
  current_status: string;
  can_edit: boolean;
}

export interface DashboardData {
  summary: BackendStats;
  charts: ChartData;
  trends: TrendData;
  today_report: TodayReport | null;
  date_range: {
    start: string;
    end: string;
  };
}

export const backendService = {
  // Get dashboard statistics
  getDashboard: (params?: { range?: string }) =>
    apiService.get<DashboardData>("/backend/dashboard", params),

  // Update today's report
  updateTodayReport: (data: { daily_report: string }) =>
    apiService.post("/backend/update-report", data),
};
