export interface ApiResponse<T = any> {
  failed: number;
  success: number;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginationParams {
  page?: number;
  per_page?: number;
  search?: string;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
  role?: 'admin' | 'manager' | 'salesperson';
  is_active?: boolean;
  start_date?: string;
  end_date?: string;
  status?: string;
  is_completed?: boolean;
}

export interface BulkActionResponse {
  message: string;
  success: number;
  failed: number;
  duplicates?: number;
}