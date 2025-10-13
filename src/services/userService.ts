import { apiService } from "./api";
import { User, UserFormData, UsersResponse, PaginationParams } from "../types";

// Extended interface for user filtering
export interface UserFilters extends PaginationParams {
  search?: string;
  role?: "admin" | "manager" | "salesperson";
  is_active?: boolean;
  manager_id?: number;
}

export const userService = {
  getUsers: (params?: PaginationParams) =>
    apiService.get<UsersResponse>("/users", params),

  getUser: (id: number) => apiService.get<User>(`/users/${id}`),

  createUser: (data: UserFormData) => apiService.post<User>("/users", data),

  updateUser: (id: number, data: Partial<UserFormData>) =>
    apiService.put<User>(`/users/${id}`, data),

  deleteUser: (id: number) => apiService.delete(`/users/${id}`),

  updateStatus: (id: number, isActive: boolean) =>
    apiService.patch<User>(`/users/${id}/status`, { is_active: isActive }),

  restoreUser: (id: number) => apiService.patch<User>(`/users/${id}/restore`),
};
