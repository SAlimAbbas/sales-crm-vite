import { apiService } from "./api";

export interface AttendanceStatus {
  is_clocked_in: boolean;
  clock_in_time?: string;
  duration_seconds?: number;
  log_id?: number;
}

export interface AttendanceLog {
  id: number;
  user_id: number;
  clock_in_time: string;
  clock_out_time: string | null;
  daily_report: string | null;
  work_duration_minutes: number | null;
  status: "clocked_in" | "clocked_out";
  created_at: string;
  user?: {
    id: number;
    name: string;
    email: string;
  };
}

export const attendanceService = {
  getCurrentStatus: () =>
    apiService.get<AttendanceStatus>("/attendance/status"),

  clockIn: () => apiService.post("/attendance/clock-in"),

  clockOut: (dailyReport: string) =>
    apiService.post("/attendance/clock-out", { daily_report: dailyReport }),

  startBreak: () => apiService.post("/attendance/start-break"),

  endBreak: () => apiService.post("/attendance/end-break"),

  getAttendanceHistory: (params?: any) =>
    apiService.get("/attendance/history", params),
};
