import { api } from "@/lib/api-client";
import type { Tenant, TenantFilters, TenantStatus } from "@/types/tenant";
import type { ApiResponse } from "@/types";

// ─── Enum mappers ────────────────────────────────────────────────────────────

const TENANT_STATUS_TO_BACKEND: Record<string, string> = {
  active: "ACTIVO",
  inactive: "INACTIVO",
  pending: "PENDIENTE",
  moroso: "MOROSO",
};

const TENANT_STATUS_FROM_BACKEND: Record<string, TenantStatus> = {
  ACTIVO: "active",
  INACTIVO: "inactive",
  PENDIENTE: "pending",
  MOROSO: "active", // displayed as active but payment is overdue
};

// ─── Backend DTO shape ───────────────────────────────────────────────────────

interface BackendTenant {
  id: string;
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
  dni: string;
  estado: string;
  direccion?: string;
  fechaNacimiento?: string;
  observaciones?: string;
  propertyId?: string;
  createdAt: string;
  updatedAt: string;
}

interface BackendPaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ─── Mapper ──────────────────────────────────────────────────────────────────

function fromBackend(raw: BackendTenant): Tenant {
  return {
    id: raw.id,
    firstName: raw.nombre,
    lastName: raw.apellido,
    email: raw.email,
    phone: raw.telefono,
    nationalId: raw.dni,
    status: TENANT_STATUS_FROM_BACKEND[raw.estado] ?? "pending",
    address: raw.direccion,
    observations: raw.observaciones,
    propertyId: raw.propertyId,
    emergencyContact: { name: "", phone: "", relationship: "" },
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
  };
}

function toPayload(data: Partial<Tenant>) {
  return {
    nombre: data.firstName,
    apellido: data.lastName,
    email: data.email,
    telefono: data.phone,
    dni: data.nationalId,
    estado: data.status ? TENANT_STATUS_TO_BACKEND[data.status] : undefined,
    direccion: data.address,
    observaciones: data.observations,
    propertyId: data.propertyId || undefined,
  };
}

function buildQuery(filters?: TenantFilters): string {
  const params = new URLSearchParams();
  if (filters?.search) params.set("search", filters.search);
  if (filters?.status && filters.status !== "all") {
    params.set("estado", TENANT_STATUS_TO_BACKEND[filters.status] ?? filters.status);
  }
  params.set("limit", "100");
  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

// ─── Service ──────────────────────────────────────────────────────────────────

export const tenantsService = {
  async getAll(filters?: TenantFilters): Promise<ApiResponse<Tenant[]>> {
    const qs = buildQuery(filters);
    const res = await api.get<BackendPaginatedResponse<BackendTenant>>(`/tenants${qs}`);
    const items = (res.items ?? []).map(fromBackend);
    return { data: items, total: res.total ?? items.length };
  },

  async getById(id: string): Promise<Tenant | null> {
    try {
      const raw = await api.get<BackendTenant>(`/tenants/${id}`);
      return fromBackend(raw);
    } catch {
      return null;
    }
  },

  async create(payload: Omit<Tenant, "id" | "createdAt" | "updatedAt">): Promise<Tenant> {
    const raw = await api.post<BackendTenant>("/tenants", toPayload(payload as Tenant));
    return fromBackend(raw);
  },

  async update(id: string, payload: Partial<Tenant>): Promise<Tenant> {
    const raw = await api.patch<BackendTenant>(`/tenants/${id}`, toPayload(payload));
    return fromBackend(raw);
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/tenants/${id}`);
  },

  async getStats() {
    return api.get<Record<string, number>>("/tenants/stats/overview");
  },
};
