import { api } from "@/lib/api-client";
import type { Property, PropertyFilters, PropertyType, PropertyStatus } from "@/types/property";
import type { ApiResponse } from "@/types";

// ─── Enum mappers ───────────────────────────────────────────────────────────

const PROPERTY_TYPE_TO_BACKEND: Record<PropertyType | string, string> = {
  apartment: "APARTAMENTO",
  house: "CASA",
  commercial: "LOCAL",
  studio: "OFICINA",
};

const PROPERTY_TYPE_FROM_BACKEND: Record<string, PropertyType> = {
  APARTAMENTO: "apartment",
  CASA: "house",
  LOCAL: "commercial",
  OFICINA: "studio",
  DUPLEX: "apartment",
};

const PROPERTY_STATUS_TO_BACKEND: Record<PropertyStatus | string, string> = {
  available: "DISPONIBLE",
  occupied: "OCUPADA",
  maintenance: "MANTENIMIENTO",
  reserved: "DISPONIBLE",
};

const PROPERTY_STATUS_FROM_BACKEND: Record<string, PropertyStatus> = {
  DISPONIBLE: "available",
  OCUPADA: "occupied",
  MANTENIMIENTO: "maintenance",
};

// ─── Backend DTO shape ───────────────────────────────────────────────────────

interface BackendProperty {
  id: string;
  nombre: string;
  descripcion?: string;
  direccion: string;
  ciudad: string;
  provincia?: string;
  codigoPostal?: string;
  tipoPropiedad: string;
  estado: string;
  precioMensual: number;
  expensas?: number;
  habitaciones: number;
  banos: number;
  metrosCuadrados: number;
  imagenPrincipal?: string;
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

// ─── Mapper ─────────────────────────────────────────────────────────────────

function fromBackend(raw: BackendProperty): Property {
  return {
    id: raw.id,
    name: raw.nombre,
    description: raw.descripcion,
    address: raw.direccion,
    city: raw.ciudad,
    state: raw.provincia,
    type: PROPERTY_TYPE_FROM_BACKEND[raw.tipoPropiedad] ?? "apartment",
    status: PROPERTY_STATUS_FROM_BACKEND[raw.estado] ?? "available",
    rent: Number(raw.precioMensual),
    bedrooms: raw.habitaciones,
    bathrooms: raw.banos,
    area: raw.metrosCuadrados,
    images: raw.imagenPrincipal
      ? [`${process.env.NEXT_PUBLIC_WS_URL ?? "http://localhost:3000"}${raw.imagenPrincipal}`]
      : [],
    deposit: 0,
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
  };
}

function toCreatePayload(data: Partial<Property> & { name: string; address: string; city: string }) {
  return {
    nombre: data.name,
    descripcion: data.description,
    direccion: data.address,
    ciudad: data.city,
    provincia: data.state,
    tipoPropiedad: PROPERTY_TYPE_TO_BACKEND[data.type ?? "apartment"],
    precioMensual: data.rent,
    habitaciones: data.bedrooms,
    banos: data.bathrooms,
    metrosCuadrados: data.area,
    estado: PROPERTY_STATUS_TO_BACKEND[data.status ?? "available"],
  };
}

// ─── Build query string from filters ────────────────────────────────────────

function buildQuery(filters?: PropertyFilters, extra?: Record<string, unknown>): string {
  const params = new URLSearchParams();
  if (filters?.search) params.set("search", filters.search);
  if (filters?.status && filters.status !== "all") {
    params.set("estado", PROPERTY_STATUS_TO_BACKEND[filters.status] ?? filters.status);
  }
  if (filters?.type && filters.type !== "all") {
    params.set("tipoPropiedad", PROPERTY_TYPE_TO_BACKEND[filters.type] ?? filters.type);
  }
  if (extra) {
    Object.entries(extra).forEach(([k, v]) => {
      if (v !== undefined && v !== null) params.set(k, String(v));
    });
  }
  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

// ─── Service ─────────────────────────────────────────────────────────────────

export const propertiesService = {
  async getAll(filters?: PropertyFilters): Promise<ApiResponse<Property[]>> {
    const qs = buildQuery(filters, { limit: 100 });
    const res = await api.get<BackendPaginatedResponse<BackendProperty>>(`/properties${qs}`);
    const items = (res.items ?? []).map(fromBackend);
    return { data: items, total: res.total ?? items.length };
  },

  async getById(id: string): Promise<Property | null> {
    try {
      const raw = await api.get<BackendProperty>(`/properties/${id}`);
      return fromBackend(raw);
    } catch {
      return null;
    }
  },

  async create(payload: Omit<Property, "id" | "createdAt" | "updatedAt">): Promise<Property> {
    const raw = await api.post<BackendProperty>("/properties", toCreatePayload(payload as Property));
    return fromBackend(raw);
  },

  async update(id: string, payload: Partial<Property>): Promise<Property> {
    const raw = await api.patch<BackendProperty>(`/properties/${id}`, toCreatePayload(payload as Property));
    return fromBackend(raw);
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/properties/${id}`);
  },

  async getStats() {
    return api.get<Record<string, number>>("/properties/stats/overview");
  },
};
