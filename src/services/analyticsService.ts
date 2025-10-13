import { apiService } from "./api";

export interface DashboardData {
  summary: {
    total_leads: number;
    conversion_rate: number;
    invalid_percentage: number;
    active_followups: number;
    overdue_tasks: number;
  };
  charts: {
    leads_by_status: Array<{ status: string; count: number }>;
    conversion_breakdown: {
      converted: number;
      invalid: number;
      active: number;
    };
    daily_trends: Array<{ date: string; leads: number }>;
  };
  performance: Array<{
    salesperson: string;
    leads_handled: number;
    conversions_achieved: number;
    conversion_rate: number;
    avg_response_time_hours: number;
    follow_ups_completed: number;
  }>;
}

export const analyticsService = {
  getDashboard: (params?: any) =>
  apiService.get<DashboardData>("/analytics/dashboard", params).then(response => {    
    // Backend returns data directly, not wrapped
    if (response.summary && response.charts && response.performance) {
      return response as DashboardData;
    }
  }),

  exportReport: (type: string, format: string, params?: any) =>
    apiService.downloadFile(
      `/analytics/export`,
      {
        type,
        format,
        range: params?.range,
      },
      `${type}_report_${new Date().toISOString().split("T")[0]}.${format}`
    ),
};
