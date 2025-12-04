export interface User {
  id: number;
  name: string;
  email: string;
  phone?: string;
  role: "admin" | "manager" | "salesperson" | "lead_executive";
  shift?: "Day" | "Night";
  type?: "Domestic" | "International";
  is_active: boolean;
  is_deleted: boolean; // Make sure this exists
  manager_id?: number;
  created_by?: number;
  created_at: string;
  updated_at: string;
  manager?: User;
}

export interface UserFormData {
  name: string;
  email: string;
  phone?: string;
  role: "admin" | "manager" | "salesperson" | "lead_executive";
  shift?: "Day" | "Night";
  type?: "Domestic" | "International";
  password?: string;
  manager_id?: number;
  is_active: boolean;
}

export interface UsersResponse {
  data: User[];
  current_page: number;
  total: number;
  per_page: number;
}
