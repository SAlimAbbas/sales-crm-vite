import { User } from "./user";

export interface Lead {
  id: number;
  date: string;
  company_name: string;
  contact_number: string;
  source: string;
  country: string;
  product: string;
  owner_name?: string;
  website?: string;
  email?: string;
  type: "domestic" | "international";
  status: string;
  assigned_to?: number;
  assigned_date?: string;
  created_by: number | { id: number; name: string; [key: string]: any };
  tags: string | null; // Add this
  notes_count?: number;
  created_at: string;
  updated_at: string;
  assigned_user?: User;
  created_by_user?: User;
  lead_executive_id?: number;
  lead_executive?: User;
}

export interface LeadFormData {
  date: string;
  company_name: string;
  contact_number: string;
  source: string;
  country: string;
  product: string;
  owner_name?: string;
  website?: string;
  email?: string;
  assigned_to?: number;
}

export interface LeadStatusHistory {
  id: number;
  lead_id: number;
  old_status: string;
  new_status: string;
  changed_by: number;
  changed_at: string;
  changed_by_user?: User;
}

export interface LeadsResponse {
  data: Lead[];
  current_page: number;
  total: number;
  per_page: number;
}
