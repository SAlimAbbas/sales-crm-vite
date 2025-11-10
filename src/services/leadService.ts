import { apiService } from "./api";
import {
  Lead,
  LeadFormData,
  LeadsResponse,
  PaginationParams,
  BulkActionResponse,
  User,
} from "../types";

// Extended interface for advanced filtering
export interface LeadFilters extends PaginationParams {
  search?: string;
  status?: string;
  type?: string;
  source?: string;
  country?: string;
  assignedTo?: string;
  dateFrom?: string;
  dateTo?: string;
  product?: string;
  assigned_to?: string;
  sort?: string;
  order?: "asc" | "desc";
}

export const leadService = {
  // Get leads with advanced filtering
  getLeads: (params?: LeadFilters) =>
    apiService.get<LeadsResponse>("/leads", params),

  // Get single lead
  getLead: (id: number) => apiService.get<Lead>(`/leads/${id}`),

  // Create lead
  createLead: (data: LeadFormData) => apiService.post<Lead>("/leads", data),

  // Update lead
  updateLead: (id: number, data: Partial<LeadFormData>) =>
    apiService.put<Lead>(`/leads/${id}`, data),

  // Update lead tag
  updateTag: (id: number, tag: string) =>
    apiService.patch<Lead>(`/leads/${id}/tag`, { tag }),

  // Delete single lead
  deleteLead: (id: number) => apiService.delete(`/leads/${id}`),

  // Bulk upload leads
  bulkUpload: (formData: FormData) =>
    apiService.postFormData<BulkActionResponse>("/leads/bulk-upload", formData),

  // Bulk assign leads to salesperson
  bulkAssign: (leadIds: number[], salespersonId: number) =>
    apiService.post<BulkActionResponse>("/leads/bulk-assign", {
      lead_ids: leadIds,
      salesperson_id: salespersonId,
    }),

  // Bulk update status
  bulkUpdateStatus: (leadIds: number[], status: string) =>
    apiService.post<BulkActionResponse>("/leads/bulk-update-status", {
      lead_ids: leadIds,
      status: status,
    }),

  // Bulk delete leads
  bulkDelete: (leadIds: number[]) =>
    apiService.post<BulkActionResponse>("/leads/bulk-delete", {
      lead_ids: leadIds,
    }),

  bulkExportLeads: (leadIds: number[]) =>
    apiService.downloadFile(
      "/leads/bulk-export",
      { lead_ids: leadIds },
      "selected_leads_export.xlsx",
      'post'
    ),

  // Get salespeople for assignment (specific endpoint)
  getSalespeople: () => apiService.get<User[]>("/leads/salespeople"),

  // Get lead status history
  getStatusHistory: (leadId: number) =>
    apiService.get<any[]>(`/leads/${leadId}/history`),

  // Export leads
  exportLeads: (filters?: LeadFilters) =>
  apiService.downloadFile("/leads/export", filters, "leads_export.xlsx", 'get'),

  // Get lead statistics
  getLeadStats: () =>
    apiService.get<{
      total: number;
      unassigned: number;
      assigned: number;
      prospects: number;
      converted: number;
      by_source: Record<string, number>;
      by_country: Record<string, number>;
    }>("/leads/stats"),

  downloadFailedLeads: (sessionKey: string) =>
    apiService
      .downloadBlob(`/leads/download-failed/${sessionKey}`)
      .then((blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `failed_leads_${new Date().getTime()}.csv`;
        link.click();
        window.URL.revokeObjectURL(url);
        return blob;
      }),
};
