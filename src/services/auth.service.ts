import { api } from "@/lib/api-client";
import type { AuthUser, LoginCredentials, RegisterData, UserRole } from "@/types/auth";

interface BackendUser {
  id: string;
  email: string;
  nombre: string;
  apellido: string;
  role: string;
  empresa?: string;
  organizationId?: string;
  linkedTenantId?: string;
}

interface BackendAuthResponse {
  accessToken: string;
  refreshToken: string;
  user: BackendUser;
}

export interface AuthSession {
  user: AuthUser;
  accessToken: string;
  refreshToken: string;
}

const VALID_ROLES = new Set<UserRole>([
  "SUPER_ADMIN", "ADMIN", "FINANZAS", "VENDEDOR", "MANTENIMIENTO", "CLIENTE", "INQUILINO",
]);

function toUserRole(raw: string): UserRole {
  const upper = raw?.toUpperCase() as UserRole;
  return VALID_ROLES.has(upper) ? upper : "ADMIN";
}

function toAuthUser(u: BackendUser): AuthUser {
  return {
    id: u.id,
    firstName: u.nombre,
    lastName: u.apellido,
    email: u.email,
    company: u.empresa,
    role: toUserRole(u.role),
    organizationId: u.organizationId,
    linkedTenantId: u.linkedTenantId,
    createdAt: new Date().toISOString(),
  };
}

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthSession> {
    const data = await api.post<BackendAuthResponse>("/auth/login", {
      email: credentials.email,
      password: credentials.password,
    });
    return { user: toAuthUser(data.user), accessToken: data.accessToken, refreshToken: data.refreshToken };
  },

  async register(data: RegisterData): Promise<AuthSession> {
    const res = await api.post<BackendAuthResponse>("/auth/register", {
      nombre: data.firstName,
      apellido: data.lastName,
      email: data.email,
      password: data.password,
      empresa: data.company,
    });
    return { user: toAuthUser(res.user), accessToken: res.accessToken, refreshToken: res.refreshToken };
  },

  async logout(refreshToken: string): Promise<void> {
    await api.post("/auth/logout", { refreshToken });
  },

  async sendPasswordReset(_email: string): Promise<void> {
    // Backend doesn't expose a forgot-password endpoint yet; silently succeed
  },

  async getMe(): Promise<AuthUser> {
    const data = await api.get<BackendUser>("/auth/me");
    return toAuthUser(data);
  },
};
