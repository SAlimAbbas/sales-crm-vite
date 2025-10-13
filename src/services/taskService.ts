import { apiService } from "./api";
import { Task, TaskFormData, TasksResponse, PaginationParams } from "../types";

export const taskService = {
  getTasks: (params?: PaginationParams) =>
    apiService.get<TasksResponse>("/tasks", params),

  getTask: (id: number) => apiService.get<Task>(`/tasks/${id}`),

  createTask: (data: TaskFormData) => apiService.post<Task>("/tasks", data),

  updateTask: (id: number, data: Partial<TaskFormData>) =>
    apiService.put<Task>(`/tasks/${id}`, data),

  deleteTask: (id: number) => apiService.delete(`/tasks/${id}`),

  updateStatus: (id: number, status: string) =>
    apiService.patch<Task>(`/tasks/${id}/status`, { status }),
};
