import { api } from "@/lib/api-client";
import type { ContactLeadFormValues } from "@/features/public-properties/schemas/contact-lead.schema";

interface CreatePublicLeadResponse {
  id: string;
  estado: string;
}

export const publicLeadsService = {
  // Crea un lead desde el sitio público (sin autenticación) vía POST /public/leads
  async create(data: ContactLeadFormValues): Promise<CreatePublicLeadResponse> {
    return api.post<CreatePublicLeadResponse>("/public/leads", {
      nombre: data.nombre,
      email: data.email,
      telefono: data.telefono,
      mensaje: data.mensaje || undefined,
      propertyId: data.propertyId || undefined,
    });
  },
};
