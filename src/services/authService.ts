import { apiService } from "./api";
import { LoginCredentials, AuthResponse, User } from "../types";

export const authService = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    // Use the special loginPost method
    const response = await apiService.loginPost<AuthResponse>("/login", credentials);
    
    if (response.token && response.user) {
      localStorage.setItem("auth_token", response.token);
      localStorage.setItem("user", JSON.stringify(response.user));
      return response;
    }
    
    throw new Error("Invalid response format from login API");
  },
  
  logout: async (): Promise<void> => {
    try {
      await apiService.post("/logout");
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      localStorage.removeItem("auth_token");
      localStorage.removeItem("user");
    }
  },

  getCurrentUser: (): User | null => {
    const userStr = localStorage.getItem("user");
    return userStr ? JSON.parse(userStr) : null;
  },

  isAuthenticated: (): boolean => {
    return !!localStorage.getItem("auth_token");
  },

  refreshToken: async (): Promise<void> => {
    // Implement token refresh if needed
  },
};
