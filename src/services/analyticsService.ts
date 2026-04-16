import { apiService } from "./api";

export interface DashboardData {
  summary: {
    total_leads_assigned: number;
    total_leads_generated: number;
    follow_ups: number;
    prospects: number;
    converted: number;
  };
  charts: {
    leads_by_status: Array<{ status: string; count: number }>;
    valid_vs_invalid: {
      valid: number;
      invalid: number;
    };
    daily_trends: Array<{ date: string; leads: number }>;
    weekly_trends: Array<{ week: string; leads: number }>;
    monthly_trends: Array<{ month: string; leads: number }>;
  };
  performance: Array<{
    team: string;
    total_leads_assigned: number;
    total_follow_ups: number;
    total_prospects: number;
    total_conversions: number;
  }>;
}

export const analyticsService = {
  getDashboard: (params?: any) =>
    apiService
      .get<DashboardData>("/analytics/dashboard", params)
      .then((response) => {
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
      `${type}_report_${new Date().toISOString().split("T")[0]}.${format}`,
    ),
};
