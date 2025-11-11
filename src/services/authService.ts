import { api, apiService } from "./api";
import { User, LoginCredentials } from "../types";

interface AuthResponse {
  token: string;
  user: User;
  device_token?: string;
  requires_2fa?: boolean;
  message?: string;
}

interface TwoFactorResponse {
  requires_2fa: boolean;
  message: string;
}

export const authService = {
  /**
   * Login with email and password
   * Handles both regular login and 2FA trigger for admin users
   */
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const deviceToken = localStorage.getItem("device_token");

    const headers: Record<string, string> = {};

    // Set device token in header if it exists
    if (deviceToken) {
      headers["X-Device-Token"] = deviceToken;
    }

    const response = await api
      .post<AuthResponse | TwoFactorResponse>(
        "/login",
        credentials,
        { headers } // Pass headers in config object
      )
      .then((res) => res.data);

    // Check if 2FA is required
    if ("requires_2fa" in response && response.requires_2fa) {
      return response as AuthResponse;
    }

    // Regular login successful
    const authResponse = response as AuthResponse;

    if (authResponse.token) {
      localStorage.setItem("auth_token", authResponse.token);
      localStorage.setItem("user", JSON.stringify(authResponse.user));
    }

    if (authResponse.device_token) {
      localStorage.setItem("device_token", authResponse.device_token);
    }

    return authResponse;
  },

  /**
   * Verify 2FA code
   */
  verify2FA: async (
    email: string,
    code: string,
    rememberDevice: boolean
  ): Promise<AuthResponse> => {
    const deviceToken = localStorage.getItem("device_token");

    // Set device token in header if it exists
    if (deviceToken) {
      api.defaults.headers.common["X-Device-Token"] = deviceToken;
    }

    const response = await apiService.loginPost<AuthResponse>("/verify-2fa", {
      email,
      code,
      remember_device: rememberDevice,
    });

    // Store auth data
    if (response.token) {
      localStorage.setItem("auth_token", response.token);
      localStorage.setItem("user", JSON.stringify(response.user));
    }

    // Store new device token if provided
    if (response.device_token) {
      localStorage.setItem("device_token", response.device_token);
    }

    // Clean up device token header
    delete api.defaults.headers.common["X-Device-Token"];

    return response;
  },

  /**
   * Resend 2FA code
   */
  resend2FA: async (email: string): Promise<void> => {
    await apiService.loginPost<{ message: string }>("/resend-2fa", { email });
  },

  /**
   * Logout user
   */
  logout: async (): Promise<void> => {
    try {
      const deviceToken = localStorage.getItem("device_token");

      const headers: Record<string, string> = {};

      if (deviceToken) {
        headers["X-Device-Token"] = deviceToken;
      }

      await api.post("/logout", {}, { headers });
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      // Clear auth token and user, but KEEP device_token for "remember me"
      localStorage.removeItem("auth_token");
      localStorage.removeItem("user");
      // DO NOT remove device_token here - it should persist for 30 days
    }
  },

  /**
   * Get current user from localStorage
   */
  getCurrentUser: (): User | null => {
    const userStr = localStorage.getItem("user");
    if (!userStr) return null;

    try {
      return JSON.parse(userStr) as User;
    } catch (error) {
      console.error("Error parsing user data:", error);
      localStorage.removeItem("user");
      return null;
    }
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated: (): boolean => {
    const token = localStorage.getItem("auth_token");
    const user = authService.getCurrentUser();
    return !!(token && user);
  },

  /**
   * Get auth token
   */
  getToken: (): string | null => {
    return localStorage.getItem("auth_token");
  },

  /**
   * Get device token
   */
  getDeviceToken: (): string | null => {
    return localStorage.getItem("device_token");
  },

  /**
   * Clear all auth data
   */
  clearAuthData: (): void => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("user");
    localStorage.removeItem("device_token");
    delete api.defaults.headers.common["X-Device-Token"];
  },
};
