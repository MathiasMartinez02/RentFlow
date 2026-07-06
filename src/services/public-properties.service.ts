import { api } from "@/lib/api-client";
import {
  PROPERTY_TYPE_TO_BACKEND,
  PROPERTY_TYPE_FROM_BACKEND,
} from "@/services/properties.service";
import type {
  PublicProperty,
  PublicPropertyFilters,
  PublicPropertyImage,
} from "@/types/public-property";
import type { ApiResponse } from "@/types";

// ─── Backend DTO shape (público, sin campos internos como ownerId) ────────────

interface BackendPublicImage {
  id: string;
  url: string;
}

interface BackendPublicProperty {
  id: string;
  nombre: string;
  descripcion?: string;
  direccion: string;
  ciudad: string;
  provincia?: string;
  codigoPostal?: string;
  pais?: string;
  tipoPropiedad: string;
  precioMensual: number;
  expensas?: number;
  habitaciones: number;
  banos: number;
  metrosCuadrados: number;
  imagenPrincipal?: string;
  images?: BackendPublicImage[];
  createdAt: string;
}

interface BackendPaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Prefija una ruta relativa del backend con la URL de medios para poder cargarla desde next/image
function resolveMediaUrl(path?: string): string | undefined {
  if (!path) return undefined;
  if (/^https?:\/\//i.test(path)) return path;
  const base = process.env.NEXT_PUBLIC_WS_URL ?? "http://localhost:3000";
  return `${base}${path}`;
}

// ─── Mapper ───────────────────────────────────────────────────────────────────

// Convierte la propiedad pública del backend (español) al modelo del frontend
function fromBackend(raw: BackendPublicProperty): PublicProperty {
  const images: PublicPropertyImage[] = (raw.images ?? []).map((img) => ({
    id: img.id,
    url: resolveMediaUrl(img.url) ?? img.url,
  }));

  return {
    id: raw.id,
    name: raw.nombre,
    description: raw.descripcion,
    address: raw.direccion,
    city: raw.ciudad,
    state: raw.provincia,
    postalCode: raw.codigoPostal,
    country: raw.pais,
    type: PROPERTY_TYPE_FROM_BACKEND[raw.tipoPropiedad] ?? "apartment",
    rent: Number(raw.precioMensual),
    expenses: raw.expensas != null ? Number(raw.expensas) : undefined,
    bedrooms: raw.habitaciones,
    bathrooms: raw.banos,
    area: raw.metrosCuadrados,
    mainImage: resolveMediaUrl(raw.imagenPrincipal),
    images,
    createdAt: raw.createdAt,
  };
}

// ─── Build query string from filters ──────────────────────────────────────────

// Arma el query string de la búsqueda pública traduciendo tipoPropiedad al enum del backend
function buildQuery(filters?: PublicPropertyFilters, extra?: Record<string, unknown>): string {
  const params = new URLSearchParams();
  if (filters?.search) params.set("search", filters.search);
  if (filters?.city) params.set("ciudad", filters.city);
  if (filters?.type && filters.type !== "all") {
    params.set("tipoPropiedad", PROPERTY_TYPE_TO_BACKEND[filters.type] ?? filters.type);
  }
  if (filters?.minPrice != null) params.set("precioMin", String(filters.minPrice));
  if (filters?.maxPrice != null) params.set("precioMax", String(filters.maxPrice));
  if (filters?.bedrooms != null) params.set("habitaciones", String(filters.bedrooms));
  if (extra) {
    Object.entries(extra).forEach(([k, v]) => {
      if (v !== undefined && v !== null) params.set(k, String(v));
    });
  }
  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

// ─── Service ───────────────────────────────────────────────────────────────────

export const publicPropertiesService = {
  // Trae el listado público de propiedades aplicando filtros (sin autenticación)
  async getAll(filters?: PublicPropertyFilters): Promise<ApiResponse<PublicProperty[]>> {
    const qs = buildQuery(filters, { limit: 100 });
    const res = await api.get<BackendPaginatedResponse<BackendPublicProperty>>(
      `/public/properties${qs}`
    );
    const items = (res.items ?? []).map(fromBackend);
    return { data: items, total: res.total ?? items.length };
  },

  // Trae el detalle público de una propiedad por id (sin autenticación)
  async getById(id: string): Promise<PublicProperty | null> {
    try {
      const raw = await api.get<BackendPublicProperty>(`/public/properties/${id}`);
      return fromBackend(raw);
    } catch {
      return null;
    }
  },
};
