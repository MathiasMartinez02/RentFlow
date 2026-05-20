import { api } from "@/lib/api-client";
import type {
  MaintenanceTicket,
  MaintenanceFilters,
  MaintenanceStatus,
  MaintenancePriority,
  MaintenanceCategory,
} from "@/types/maintenance";
import type { ApiResponse } from "@/types";

// ─── Enum mappers ────────────────────────────────────────────────────────────

const STATUS_TO_BACKEND: Record<string, string> = {
  pending: "PENDIENTE",
  in_progress: "EN_PROGRESO",
  waiting_parts: "ESPERANDO_REPUESTOS",
  resolved: "RESUELTO",
  closed: "CERRADO",
};

const STATUS_FROM_BACKEND: Record<string, MaintenanceStatus> = {
  PENDIENTE: "pending",
  EN_PROGRESO: "in_progress",
  ESPERANDO_REPUESTOS: "waiting_parts",
  RESUELTO: "resolved",
  CERRADO: "closed",
};

const PRIORITY_TO_BACKEND: Record<string, string> = {
  low: "BAJA",
  medium: "MEDIA",
  high: "ALTA",
  urgent: "URGENTE",
};

const PRIORITY_FROM_BACKEND: Record<string, MaintenancePriority> = {
  BAJA: "low",
  MEDIA: "medium",
  ALTA: "high",
  URGENTE: "urgent",
};

const CATEGORY_TO_BACKEND: Record<string, string> = {
  plumbing: "PLOMERIA",
  electrical: "ELECTRICIDAD",
  painting: "PINTURA",
  cleaning: "LIMPIEZA",
  security: "SEGURIDAD",
  general: "GENERAL",
};

const CATEGORY_FROM_BACKEND: Record<string, MaintenanceCategory> = {
  PLOMERIA: "plumbing",
  ELECTRICIDAD: "electrical",
  PINTURA: "painting",
  LIMPIEZA: "cleaning",
  SEGURIDAD: "security",
  GENERAL: "general",
};

// ─── Backend DTO shape ───────────────────────────────────────────────────────

interface BackendTicket {
  id: string;
  titulo: string;
  descripcion: string;
  propertyId: string;
  tenantId?: string;
  categoria: string;
  prioridad: string;
  estado: string;
  assignedTo?: string;
  costoEstimado?: number;
  costoFinal?: number;
  fechaResolucion?: string;
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

function fromBackend(raw: BackendTicket): MaintenanceTicket {
  return {
    id: raw.id,
    title: raw.titulo,
    description: raw.descripcion,
    propertyId: raw.propertyId,
    tenantId: raw.tenantId,
    category: CATEGORY_FROM_BACKEND[raw.categoria] ?? "general",
    priority: PRIORITY_FROM_BACKEND[raw.prioridad] ?? "medium",
    status: STATUS_FROM_BACKEND[raw.estado] ?? "pending",
    assignedTo: raw.assignedTo,
    estimatedCost: raw.costoEstimado != null ? Number(raw.costoEstimado) : undefined,
    finalCost: raw.costoFinal != null ? Number(raw.costoFinal) : undefined,
    notes: raw.observaciones,
    reportedAt: raw.createdAt,
    resolvedAt: raw.fechaResolucion,
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
  };
}

function toCreatePayload(data: Partial<MaintenanceTicket>) {
  return {
    propertyId: data.propertyId,
    tenantId: data.tenantId || undefined,
    titulo: data.title,
    descripcion: data.description,
    categoria: data.category ? CATEGORY_TO_BACKEND[data.category] : undefined,
    prioridad: data.priority ? PRIORITY_TO_BACKEND[data.priority] : undefined,
    costoEstimado: data.estimatedCost,
    assignedTo: data.assignedTo || undefined,
    observaciones: data.notes || undefined,
  };
}

function toUpdatePayload(data: Partial<MaintenanceTicket>) {
  return {
    titulo: data.title,
    descripcion: data.description,
    categoria: data.category ? CATEGORY_TO_BACKEND[data.category] : undefined,
    prioridad: data.priority ? PRIORITY_TO_BACKEND[data.priority] : undefined,
    estado: data.status ? STATUS_TO_BACKEND[data.status] : undefined,
    costoEstimado: data.estimatedCost,
    costoFinal: data.finalCost,
    assignedTo: data.assignedTo || undefined,
    observaciones: data.notes || undefined,
  };
}

function buildQuery(filters?: MaintenanceFilters): string {
  const params = new URLSearchParams();
  if (filters?.search) params.set("search", filters.search);
  if (filters?.status && filters.status !== "all") {
    params.set("estado", STATUS_TO_BACKEND[filters.status] ?? filters.status);
  }
  if (filters?.priority && filters.priority !== "all") {
    params.set("prioridad", PRIORITY_TO_BACKEND[filters.priority] ?? filters.priority);
  }
  if (filters?.category && filters.category !== "all") {
    params.set("categoria", CATEGORY_TO_BACKEND[filters.category] ?? filters.category);
  }
  params.set("limit", "100");
  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

// ─── Service ──────────────────────────────────────────────────────────────────

export const maintenanceService = {
  async getAll(filters?: MaintenanceFilters): Promise<ApiResponse<MaintenanceTicket[]>> {
    const qs = buildQuery(filters);
    const res = await api.get<BackendPaginatedResponse<BackendTicket>>(`/maintenance${qs}`);
    const items = (res.items ?? []).map(fromBackend);
    // Sort by priority: urgent → high → medium → low
    const priorityOrder: Record<string, number> = { urgent: 0, high: 1, medium: 2, low: 3 };
    items.sort((a, b) => {
      const pa = priorityOrder[a.priority] ?? 4;
      const pb = priorityOrder[b.priority] ?? 4;
      if (pa !== pb) return pa - pb;
      return new Date(b.reportedAt).getTime() - new Date(a.reportedAt).getTime();
    });
    return { data: items, total: res.total ?? items.length };
  },

  async getById(id: string): Promise<MaintenanceTicket | null> {
    try {
      const raw = await api.get<BackendTicket>(`/maintenance/${id}`);
      return fromBackend(raw);
    } catch {
      return null;
    }
  },

  async create(payload: Omit<MaintenanceTicket, "id" | "createdAt" | "updatedAt">): Promise<MaintenanceTicket> {
    const raw = await api.post<BackendTicket>("/maintenance", toCreatePayload(payload as MaintenanceTicket));
    return fromBackend(raw);
  },

  async update(id: string, payload: Partial<MaintenanceTicket>): Promise<MaintenanceTicket> {
    const raw = await api.patch<BackendTicket>(`/maintenance/${id}`, toUpdatePayload(payload));
    return fromBackend(raw);
  },

  async updateStatus(id: string, status: MaintenanceStatus): Promise<MaintenanceTicket> {
    const raw = await api.patch<BackendTicket>(`/maintenance/${id}`, {
      estado: STATUS_TO_BACKEND[status],
    });
    return fromBackend(raw);
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/maintenance/${id}`);
  },

  async getStats() {
    return api.get<Record<string, unknown>>("/maintenance/stats/overview");
  },
};
