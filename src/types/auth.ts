import { User } from "./user";

export interface LoginCredentials {
  email: string;
  password: string;
}
export interface TwoFactorResponse {
  requires_2fa: boolean;
  message: string;
}

export interface VerifyTwoFactorRequest {
  email: string;
  code: string;
  remember_device: boolean;
}
export interface AuthResponse {
  token: string;
  user: User;
  device_token?: string;
  requires_2fa?: boolean;
  message?: string;
}

export interface AuthContextType {
  user: User | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  isLoading: boolean;
  isAuthenticated: boolean;
}
