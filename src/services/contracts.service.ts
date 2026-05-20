import { api } from "@/lib/api-client";
import type { Contract, ContractFilters, ContractStatus } from "@/types/contract";
import type { ApiResponse } from "@/types";

// ─── Enum mappers ────────────────────────────────────────────────────────────

const CONTRACT_STATUS_TO_BACKEND: Record<string, string> = {
  active: "ACTIVO",
  expired: "VENCIDO",
  pending: "ACTIVO",
  terminated: "CANCELADO",
};

const CONTRACT_STATUS_FROM_BACKEND: Record<string, ContractStatus> = {
  ACTIVO: "active",
  PROXIMO_A_VENCER: "active", // still active; isExpiringSoon() handles the expiry detection
  VENCIDO: "expired",
  CANCELADO: "terminated",
  RENOVADO: "active",
};

// ─── Backend DTO shape ───────────────────────────────────────────────────────

interface BackendContract {
  id: string;
  propertyId: string;
  tenantId: string;
  fechaInicio: string;
  fechaFin: string;
  montoMensual: number;
  deposito: number;
  expensas?: number;
  renovacionAutomatica: boolean;
  estado: string;
  observaciones?: string;
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

function fromBackend(raw: BackendContract): Contract {
  return {
    id: raw.id,
    propertyId: raw.propertyId,
    tenantId: raw.tenantId,
    startDate: raw.fechaInicio,
    endDate: raw.fechaFin,
    monthlyRent: Number(raw.montoMensual),
    deposit: Number(raw.deposito),
    expenses: raw.expensas != null ? Number(raw.expensas) : undefined,
    renewalOption: raw.renovacionAutomatica ?? false,
    noticePeriodDays: 30,
    status: CONTRACT_STATUS_FROM_BACKEND[raw.estado] ?? "active",
    terms: raw.observaciones,
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
  };
}

function toPayload(data: Partial<Contract>) {
  return {
    propertyId: data.propertyId,
    tenantId: data.tenantId,
    fechaInicio: data.startDate,
    fechaFin: data.endDate,
    montoMensual: data.monthlyRent,
    deposito: data.deposit,
    expensas: data.expenses,
    renovacionAutomatica: data.renewalOption,
    estado: data.status ? CONTRACT_STATUS_TO_BACKEND[data.status] : undefined,
    observaciones: data.terms,
  };
}

function buildQuery(filters?: ContractFilters): string {
  const params = new URLSearchParams();
  if (filters?.search) params.set("search", filters.search);
  if (filters?.status && filters.status !== "all" && filters.status !== "expiring_soon") {
    params.set("estado", CONTRACT_STATUS_TO_BACKEND[filters.status] ?? filters.status);
  }
  params.set("limit", "100");
  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

// ─── Service ──────────────────────────────────────────────────────────────────

export const contractsService = {
  async getAll(filters?: ContractFilters): Promise<ApiResponse<Contract[]>> {
    const qs = buildQuery(filters);
    const res = await api.get<BackendPaginatedResponse<BackendContract>>(`/contracts${qs}`);
    const items = (res.items ?? []).map(fromBackend);
    return { data: items, total: res.total ?? items.length };
  },

  async getById(id: string): Promise<Contract | null> {
    try {
      const raw = await api.get<BackendContract>(`/contracts/${id}`);
      return fromBackend(raw);
    } catch {
      return null;
    }
  },

  async create(payload: Omit<Contract, "id" | "createdAt" | "updatedAt">): Promise<Contract> {
    const raw = await api.post<BackendContract>("/contracts", toPayload(payload as Contract));
    return fromBackend(raw);
  },

  async update(id: string, payload: Partial<Contract>): Promise<Contract> {
    const raw = await api.patch<BackendContract>(`/contracts/${id}`, toPayload(payload));
    return fromBackend(raw);
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/contracts/${id}`);
  },

  async renew(id: string): Promise<Contract> {
    const raw = await api.post<BackendContract>(`/contracts/${id}/renew`);
    return fromBackend(raw);
  },

  async getStats() {
    return api.get<Record<string, number>>("/contracts/stats/overview");
  },
};
