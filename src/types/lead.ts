// Estados posibles de un lead en el pipeline de CRM (mismos valores que usa el backend)
export type LeadStatus =
  | "NUEVO"
  | "CONTACTADO"
  | "VISITA_AGENDADA"
  | "VISITA_REALIZADA"
  | "NEGOCIACION"
  | "GANADO"
  | "PERDIDO";

// Origen por el cual llegó el lead (mismos valores que usa el backend)
export type LeadOrigin = "WEB" | "WHATSAPP" | "PORTAL" | "REFERIDO" | "OTRO";

export interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  message?: string;
  origin: LeadOrigin;
  status: LeadStatus;
  propertyId?: string;
  vendedorId?: string;
  visitDate?: string;
  visitConfirmed?: boolean;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LeadFilters {
  search?: string;
  status?: LeadStatus | "all";
  propertyId?: string;
  vendedorId?: string;
}

export interface LeadStats {
  total: number;
  byStatus: Record<LeadStatus, number>;
  won: number;
  lost: number;
  conversionRate: number;
}
