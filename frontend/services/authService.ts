import {
  AuthResponse,
  LoginCredentials,
  SignupCredentials,
  User,
} from "../types/auth.types";
import { api } from "./api";

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    return api.post("/auth/signin", credentials);
  },

  async signup(credentials: SignupCredentials): Promise<AuthResponse> {
    return api.post("/auth/signup", credentials);
  },

  async verifyEmail(code: string): Promise<AuthResponse> {
    return api.post("/auth/verify-email", { code });
  },

  async logout(): Promise<void> {
    return api.post("/auth/logout", {});
  },

  async checkAuth(): Promise<{ status: string; data: User }> {
    return api.get("/auth/check-auth");
  },

  async updateProfile(data: {
    username?: string;
    avatar?: string;
    address?: string;
    phone?: string;
    oldPassword?: string;
    newPassword?: string;
  }): Promise<AuthResponse> {
    return api.patch("/auth/update-profile", data);
  },

  async deleteAccount(): Promise<void> {
    return api.delete("/auth/delete");
  },

  async forgotPassword(email: string): Promise<void> {
    return api.post("/auth/forgot-password", { email });
  },

  async resetPassword(token: string, newPassword: string): Promise<void> {
    return api.post(`/auth/reset-password?token=${token}`, { newPassword });
  },

  // Add Google OAuth method
  async googleAuth(googleData: {
    username: string;
    email: string;
    avatar?: string;
  }): Promise<AuthResponse> {
    return api.post("/auth/google", googleData);
  },
};
