import { api } from "@/lib/api-client";
import type { OrgUser } from "@/types/user";
import type { UserRole } from "@/types/auth";

interface BackendUser {
  id: string;
  nombre: string;
  apellido: string;
  email: string;
  role: string;
  isActive: boolean;
  organizationId?: string;
  linkedTenantId?: string;
  createdAt: string;
}

interface BackendPaginated<T> {
  items: T[];
  total: number;
}

function fromBackend(u: BackendUser): OrgUser {
  return {
    id: u.id,
    firstName: u.nombre,
    lastName: u.apellido,
    email: u.email,
    role: u.role as UserRole,
    isActive: u.isActive,
    organizationId: u.organizationId,
    linkedTenantId: u.linkedTenantId,
    createdAt: u.createdAt,
  };
}

export const usersService = {
  async getAll(): Promise<OrgUser[]> {
    const res = await api.get<BackendPaginated<BackendUser>>("/users");
    return (res.items ?? []).map(fromBackend);
  },

  async changeRole(
    userId: string,
    role: UserRole,
    opts?: { organizationId?: string; linkedTenantId?: string }
  ): Promise<void> {
    await api.patch(`/users/${userId}/role`, { role, ...opts });
  },

  async activate(userId: string): Promise<void> {
    await api.post(`/users/${userId}/activate`);
  },

  async deactivate(userId: string): Promise<void> {
    await api.delete(`/users/${userId}/deactivate`);
  },
};
