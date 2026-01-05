export interface User {
  _id: string;
  username: string;
  email: string;
  avatar?: string;
  address?: string;
  phone?: string;
  isVerified: boolean;
  lastLogin?: Date;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupCredentials {
  username: string;
  email: string;
  password: string;
  address?: string;
  phone?: string;
}

export interface AuthResponse {
  status: string;
  message: string;
  data?: User;
}
