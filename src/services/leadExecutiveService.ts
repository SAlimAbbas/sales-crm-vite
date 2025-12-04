import { apiService } from "./api";
import { PaginationParams } from "../types";

export interface LeadExecutiveStats {
  total_leads: number;
  today_leads: number;
  this_week_leads: number;
  this_month_leads: number;
  date_range_leads: number;
  assigned_count: number;
  unassigned_count: number;
  assignment_rate: number;
}

export interface ChartData {
  by_type: {
    domestic: number;
    international: number;
  };
  by_source: Array<{ source: string; count: number }>;
  by_country: Array<{ country: string; count: number }>;
  assignment_status: {
    assigned: number;
    unassigned: number;
  };
}

export interface TrendData {
  daily_trends: Array<{ date: string; count: number }>;
  weekly_comparison: {
    current_week: number;
    last_week: number;
    growth_percentage: number;
  };
}

export interface DashboardData {
  summary: LeadExecutiveStats;
  charts: ChartData;
  trends: TrendData;
  date_range: {
    start: string;
    end: string;
  };
}

export interface LeadExecutiveFilters extends PaginationParams {
  search?: string;
  type?: string;
  source?: string;
  country?: string;
  product?: string;
  date_from?: string;
  date_to?: string;
}

export const leadExecutiveService = {
  // Get dashboard statistics
  getDashboard: (params?: {
    range?: string;
    start_date?: string;
    end_date?: string;
  }) => apiService.get<DashboardData>("/lead-executive/dashboard", params),

  // Get leads created by this executive
  getMyLeads: (params?: LeadExecutiveFilters) =>
    apiService.get("/lead-executive/my-leads", params),
};
