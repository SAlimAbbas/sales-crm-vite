import { User } from "./user";
import { Lead } from "./lead";

export interface ConvertedClient {
  id: number;
  lead_id: number;
  company_name: string;
  client_name: string;
  number: string;
  company_gst_number: string | null;
  gst_issued: string | null;
  company_address: string | null;
  company_email: string | null;
  executive_id: number | null;
  client_type: "domestic" | "international";
  gst_on_paid: boolean; // Changed
  gst_on_upgrade: boolean; // Changed
  plan_type: "basic" | "premium" | "vip" | "advanced" | "trial"; // Added trial
  upgrade_plan_type: "basic" | "premium" | "vip" | "advanced" | "trial" | null; // Add
  plan_amount: number;
  paid_amount: number;
  paid_amount_date: string | null;
  pending_amount: number;
  pending_amount_condition: string | null;
  pending_amount_date: string | null;
  upgrade_payment_amount: number;
  upgrade_payment_date: string | null;
  plan_features: string | null;
  currency: string;
  created_by: User;
  payment_status: "fully_paid" | "partially_paid" | "unpaid";
  payment_percentage: number;
  total_amount_paid: number;
  gst_amount_paid: number; // Changed
  gst_amount_upgrade: number; // Changed
  total_with_gst: number;
  created_at: string;
  updated_at: string;
  lead?: Lead;
  created_by_user?: User;
  executive?: User;
}

export interface ConvertedClientFormData {
  lead_id: number;
  company_name: string;
  client_name: string;
  number: string;
  company_gst_number?: string;
  gst_issued?: string;
  company_address?: string;
  company_email?: string;
  executive_id?: number;
  client_type: "domestic" | "international";
  gst_on_paid?: boolean; // Changed
  gst_on_upgrade?: boolean; // Changed
  plan_type: "basic" | "premium" | "vip" | "advanced" | "trial"; // Added trial
  upgrade_plan_type?: "basic" | "premium" | "vip" | "advanced" | "trial"; // Add
  plan_amount: number;
  paid_amount?: number;
  paid_amount_date?: string;
  pending_amount_condition?: string;
  pending_amount_date?: string;
  upgrade_payment_amount?: number;
  upgrade_payment_date?: string;
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
