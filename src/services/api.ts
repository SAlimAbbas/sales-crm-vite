import axios from "axios";
import { ApiResponse } from "../types";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:8000/api";

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  timeout: 20000,
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("auth_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("auth_token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }

    if (error.response?.status === 500) {
      console.error("Server Error:", error.response.data);
    }

    return Promise.reject(error);
  }
);

// Generic API calls
export const apiService = {
  // Special method for login that doesn't wrap in ApiResponse
  loginPost: <T>(url: string, data?: any) =>
    api.post<T>(url, data).then((response) => response.data),

  // For users endpoint, don't wrap in ApiResponse since Laravel returns paginated data directly
  get: <T>(url: string, params?: any) => {
    if (
      url === "/users" ||
      url === "/analytics/dashboard" ||
      url.startsWith("/notifications") ||
      url.startsWith("/lead-executive")
    ) {
      // ✅ Handle all notification endpoints
      return api.get<T>(url, { params }).then((response) => response.data);
    }
    return api
      .get<ApiResponse<T>>(url, { params })
      .then((response) => response.data);
  },

  post: <T>(url: string, data?: any) =>
    api.post<ApiResponse<T>>(url, data).then((response) => response.data),

  put: <T>(url: string, data?: any) =>
    api.put<ApiResponse<T>>(url, data).then((response) => response.data),

  patch: <T>(url: string, data?: any) =>
    api.patch<ApiResponse<T>>(url, data).then((response) => response.data),

  delete: <T>(url: string) =>
    api.delete<ApiResponse<T>>(url).then((response) => response.data),

  postFormData: <T>(url: string, formData: FormData) =>
    api
      .post<ApiResponse<T>>(url, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then((response) => response.data),

  downloadFile: (
    url: string,
    params?: any,
    filename?: string,
    method: "get" | "post" = "get"
  ) => {
    const request =
      method === "post"
        ? api.post(url, params, { responseType: "blob" })
        : api.get(url, { params, responseType: "blob" });

    return request.then((response) => {
      // Create blob link to download
      const blob = new Blob([response.data]);
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;

      // Get filename from response headers or use provided filename
      const contentDisposition = response.headers["content-disposition"];
      let extractedFilename = filename;

      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="(.+)"/);
        if (filenameMatch) {
          extractedFilename = filenameMatch[1];
        }
      }

      link.download = extractedFilename || "download";
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);

      return response.data;
    });
  },
  downloadBlob: (url: string) => {
    return api
      .get(url, {
        responseType: "blob",
      })
      .then((response) => response.data);
  },
};
