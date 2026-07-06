import { z } from "zod";

export const contactLeadSchema = z.object({
  nombre: z.string().min(2, "El nombre es requerido"),
  email: z.string().email("Email inválido"),
  telefono: z.string().min(6, "El teléfono es requerido"),
  mensaje: z.string().max(1000, "Máximo 1000 caracteres").optional().or(z.literal("")),
  propertyId: z.string().optional().or(z.literal("")),
});

export type ContactLeadFormValues = z.infer<typeof contactLeadSchema>;

export const DEFAULT_CONTACT_LEAD_VALUES: ContactLeadFormValues = {
  nombre: "",
  email: "",
  telefono: "",
  mensaje: "",
  propertyId: "",
};
