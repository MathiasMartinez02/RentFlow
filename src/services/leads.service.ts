import { api } from "@/lib/api-client";
import type { Lead, LeadFilters, LeadStatus, LeadOrigin } from "@/types/lead";
import type { ApiResponse } from "@/types";

// ─── Enum mappers ──────────────────────────────────────────────────────────────
// Los estados/orígenes ya usan los mismos literales que el backend, por lo que la
// traducción es 1:1. Se mantienen los diccionarios explícitos para seguir el patrón
// de properties.service y validar/normalizar valores inesperados.

const STATUS_VALUES: LeadStatus[] = [
  "NUEVO",
  "CONTACTADO",
  "VISITA_AGENDADA",
  "VISITA_REALIZADA",
  "NEGOCIACION",
  "GANADO",
  "PERDIDO",
];

const ORIGIN_VALUES: LeadOrigin[] = ["WEB", "WHATSAPP", "PORTAL", "REFERIDO", "OTRO"];

const STATUS_FROM_BACKEND: Record<string, LeadStatus> = Object.fromEntries(
  STATUS_VALUES.map((s) => [s, s])
) as Record<string, LeadStatus>;

const ORIGIN_FROM_BACKEND: Record<string, LeadOrigin> = Object.fromEntries(
  ORIGIN_VALUES.map((o) => [o, o])
) as Record<string, LeadOrigin>;

// ─── Backend DTO shape (español) ────────────────────────────────────────────────

interface BackendLead {
  id: string;
  nombre: string;
  email: string;
  telefono: string;
  mensaje?: string;
  origen: string;
  estado: string;
  propertyId?: string;
  vendedorId?: string;
  fechaVisita?: string;
  visitaConfirmada?: boolean;
  notas?: string;
  ownerId?: string;
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

interface BackendLeadStats {
  total?: number;
  porEstado?: Record<string, number>;
  byStatus?: Record<string, number>;
  tasaConversion?: number;
  conversionRate?: number;
}

// ─── Mapper ────────────────────────────────────────────────────────────────────

// Convierte el lead del backend (español) al modelo del frontend
function fromBackend(raw: BackendLead): Lead {
  return {
    id: raw.id,
    name: raw.nombre,
    email: raw.email,
    phone: raw.telefono,
    message: raw.mensaje,
    origin: ORIGIN_FROM_BACKEND[raw.origen] ?? "OTRO",
    status: STATUS_FROM_BACKEND[raw.estado] ?? "NUEVO",
    propertyId: raw.propertyId,
    vendedorId: raw.vendedorId,
    visitDate: raw.fechaVisita,
    visitConfirmed: raw.visitaConfirmada,
    notes: raw.notas,
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
  };
}

// Arma el payload en español para crear/actualizar un lead en el backend
function toPayload(data: Partial<Lead>) {
  return {
    nombre: data.name,
    email: data.email,
    telefono: data.phone,
    mensaje: data.message || undefined,
    origen: data.origin,
    estado: data.status,
    propertyId: data.propertyId || undefined,
    vendedorId: data.vendedorId || undefined,
    fechaVisita: data.visitDate || undefined,
    visitaConfirmada: data.visitConfirmed,
    notas: data.notes || undefined,
  };
}

// ─── Build query string from filters ──────────────────────────────────────────

// Arma el query string del listado de leads (paginación real vía limit alto)
function buildQuery(filters?: LeadFilters): string {
  const params = new URLSearchParams();
  if (filters?.search) params.set("search", filters.search);
  if (filters?.status && filters.status !== "all") params.set("estado", filters.status);
  if (filters?.propertyId) params.set("propertyId", filters.propertyId);
  if (filters?.vendedorId) params.set("vendedorId", filters.vendedorId);
  params.set("limit", "100");
  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

// ─── Service ────────────────────────────────────────────────────────────────────

export const leadsService = {
  // Trae el listado de leads del CRM interno aplicando filtros
  async getAll(filters?: LeadFilters): Promise<ApiResponse<Lead[]>> {
    const qs = buildQuery(filters);
    const res = await api.get<BackendPaginatedResponse<BackendLead>>(`/leads${qs}`);
    const items = (res.items ?? []).map(fromBackend);
    items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return { data: items, total: res.total ?? items.length };
  },

  // Trae un lead por id
  async getById(id: string): Promise<Lead | null> {
    try {
      const raw = await api.get<BackendLead>(`/leads/${id}`);
      return fromBackend(raw);
    } catch {
      return null;
    }
  },

  // Crea un lead desde el CRM interno
  async create(payload: Partial<Lead>): Promise<Lead> {
    const raw = await api.post<BackendLead>("/leads", toPayload(payload));
    return fromBackend(raw);
  },

  // Actualiza un lead existente
  async update(id: string, payload: Partial<Lead>): Promise<Lead> {
    const raw = await api.patch<BackendLead>(`/leads/${id}`, toPayload(payload));
    return fromBackend(raw);
  },

  // Cambia solo el estado de un lead (usado por el drag & drop del kanban)
  async updateStatus(id: string, status: LeadStatus): Promise<Lead> {
    const raw = await api.patch<BackendLead>(`/leads/${id}`, { estado: status });
    return fromBackend(raw);
  },

  // Elimina un lead (soft delete en el backend)
  async delete(id: string): Promise<void> {
    await api.delete(`/leads/${id}`);
  },

  // Trae los conteos por estado y la tasa de conversión desde el backend
  async getStats(): Promise<BackendLeadStats> {
    return api.get<BackendLeadStats>("/leads/stats/overview");
  },
};
