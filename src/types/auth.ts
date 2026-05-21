export type UserRole =
  | "SUPER_ADMIN"
  | "ADMIN"
  | "FINANZAS"
  | "VENDEDOR"
  | "MANTENIMIENTO"
  | "CLIENTE"
  | "INQUILINO";

export interface AuthUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  company?: string;
  role: UserRole;
  organizationId?: string;
  linkedTenantId?: string;
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
