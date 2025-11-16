export interface AttendanceLog {
  id: number;
  user_id: number;
  clock_in_time: string;
  clock_out_time: string | null;
  daily_report: string | null;
  work_duration_minutes: number | null;
  status: "clocked_in" | "clocked_out";
  created_at: string;
  updated_at: string;
  user?: {
    id: number;
    name: string;
    email: string;
  };
}
