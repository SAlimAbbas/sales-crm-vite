import { apiService } from "./api";
import { User, UsersResponse, UserFormData } from "../types";

// ✅ Add this interface
export interface UserQueryParams {
  role?: string;
  manager_id?: number;
  page?: number;
  per_page?: number;
  is_active?: boolean;
  search?: string;
}

export const userService = {
  getUsers: (params?: UserQueryParams) => {
    return apiService.get<UsersResponse>("/users", params);
  },

  getUser: (id: number) => apiService.get<User>(`/users/${id}`),

  createUser: (data: UserFormData) => apiService.post<User>("/users", data),

  updateUser: (id: number, data: Partial<UserFormData>) =>
    apiService.put<User>(`/users/${id}`, data),

  deleteUser: (id: number) => apiService.delete(`/users/${id}`),

  updateStatus: (id: number, is_active: boolean) =>
    apiService.patch<User>(`/users/${id}/status`, { is_active }),

  restoreUser: (id: number) =>
    apiService.patch<User>(`/users/${id}/restore`, {}),
};
