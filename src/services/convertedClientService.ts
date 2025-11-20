import { apiService } from "./api";
import {
  ConvertedClient,
  ConvertedClientFormData,
  ConvertedClientsResponse,
  ConvertedClientStats,
} from "../types/convertedClient";
import { PaginationParams } from "../types";
import { Lead } from "../types";

export interface ConvertedClientFilters extends PaginationParams {
  search?: string;
  client_type?: string;
  plan_type?: string;
  payment_status?: string;
  date_from?: string;
  date_to?: string;
  sort?: string;
  order?: "asc" | "desc";
}

export const convertedClientService = {
  // Get converted clients with filtering
  getConvertedClients: (params?: ConvertedClientFilters) =>
    apiService.get<ConvertedClientsResponse>("/converted-clients", params),

  // Get single converted client
  getConvertedClient: (id: number) =>
    apiService.get<ConvertedClient>(`/converted-clients/${id}`),

  // Create converted client
  createConvertedClient: (data: ConvertedClientFormData) =>
    apiService.post<ConvertedClient>("/converted-clients", data),

  // Update converted client
  updateConvertedClient: (id: number, data: Partial<ConvertedClientFormData>) =>
    apiService.put<ConvertedClient>(`/converted-clients/${id}`, data),

  // Delete converted client
  deleteConvertedClient: (id: number) =>
    apiService.delete(`/converted-clients/${id}`),

  // Get converted client statistics
  getStats: () =>
    apiService.get<ConvertedClientStats>("/converted-clients/stats"),

  // Export converted clients
  exportConvertedClients: (filters?: ConvertedClientFilters) =>
    apiService.downloadFile(
      "/converted-clients/export",
      filters,
      "converted_clients_export.xlsx",
      "get"
    ),

  // Get converted leads (leads with status 'converted' without client record)
  getConvertedLeads: () =>
    apiService.get<Lead[]>("/converted-clients/converted-leads"),
};
