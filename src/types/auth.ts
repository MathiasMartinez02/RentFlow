export type UserRole = "owner" | "admin" | "agent";

export interface AuthUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  company?: string;
  role: UserRole;
  avatar?: string;
  phone?: string;
  createdAt: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  company?: string;
  password: string;
}
