export type PropertyStatus = "available" | "occupied" | "maintenance" | "reserved";
export type PropertyType = "apartment" | "house" | "commercial" | "studio";

export const PROPERTY_AMENITIES = [
  "WiFi",
  "Cochera",
  "Gimnasio",
  "Pileta",
  "Lavandería",
  "Aire Acondicionado",
  "Calefacción",
  "Ascensor",
  "Balcón",
  "Mascotas Permitidas",
  "Baulera",
  "Sistema de Seguridad",
  "Lavavajillas",
  "Amoblado",
] as const;

export type PropertyAmenity = (typeof PROPERTY_AMENITIES)[number];

export interface Property {
  id: string;
  name: string;
  address: string;
  city: string;
  state?: string;
  type: PropertyType;
  status: PropertyStatus;
  bedrooms: number;
  bathrooms: number;
  area: number;
  rent: number;
  deposit: number;
  yearBuilt?: number;
  parking?: boolean;
  petFriendly?: boolean;
  furnished?: boolean;
  amenities?: string[];
  description?: string;
  images: string[];
  tenantId?: string;
  contractId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PropertyFilters {
  search?: string;
  status?: PropertyStatus | "all";
  type?: PropertyType | "all";
  city?: string;
  minRent?: number;
  maxRent?: number;
}

export interface PropertyStats {
  total: number;
  occupied: number;
  available: number;
  maintenance: number;
  reserved: number;
  monthlyRevenue: number;
  occupancyRate: number;
}
