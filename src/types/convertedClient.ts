import { User } from "./user";
import { Lead } from "./lead";

export interface ConvertedClient {
  id: number;
  lead_id: number;
  company_name: string;
  client_name: string;
  number: string;
  company_gst_number: string | null; // Add
  gst_issued: string | null; // Add
  company_address: string | null; // Add
  company_email: string | null; // Add
  executive_id: number | null; // Add
  client_type: "domestic" | "international";
  plan_type: "basic" | "premium" | "vip" | "advanced";
  plan_amount: number;
  paid_amount: number;
  paid_amount_date: string | null;
  pending_amount: number;
  pending_amount_condition: string | null;
  pending_amount_date: string | null;
  upgrade_payment_amount: number; // Add
  upgrade_payment_date: string | null; // Add
  total_amount_paid: number;
  plan_features: string | null;
  currency: string;
  created_by: number;
  payment_status: "fully_paid" | "partially_paid" | "unpaid";
  payment_percentage: number;
  created_at: string;
  updated_at: string;
  lead?: Lead;
  created_by_user?: User;
  executive?: User;
}

export interface ConvertedClientFormData {
  lead_id: number | null;
  company_name: string;
  client_name: string;
  number: string;
  company_gst_number?: string; // Add
  gst_issued?: string; // Add
  company_address?: string; // Add
  company_email?: string; // Add
  executive_id?: number; // Add
  client_type: "domestic" | "international";
  plan_type: "basic" | "premium" | "vip" | "advanced";
  plan_amount: number;
  paid_amount?: number;
  paid_amount_date?: string;
  pending_amount_condition?: string;
  pending_amount_date?: string;
  upgrade_payment_amount?: number; // Add
  upgrade_payment_date?: string; // Add
  plan_features?: string;
  currency?: string;
}

export interface ConvertedClientsResponse {
  data: ConvertedClient[];
  current_page: number;
  total: number;
  per_page: number;
}

export interface ConvertedClientStats {
  total_clients: number;
  total_revenue: number;
  pending_revenue: number;
  by_plan_type: Record<string, { count: number; revenue: number }>;
  by_client_type: Record<string, { count: number; revenue: number }>;
  payment_status: {
    fully_paid: number;
    partially_paid: number;
    unpaid: number;
  };
}
