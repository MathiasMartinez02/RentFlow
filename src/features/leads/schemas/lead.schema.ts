import { z } from "zod";

export const leadSchema = z.object({
  name: z.string().min(2, "El nombre es requerido"),
  email: z.string().email("Email inválido"),
  phone: z.string().min(6, "El teléfono es requerido"),
  origin: z.enum(["WEB", "WHATSAPP", "PORTAL", "REFERIDO", "OTRO"], {
    required_error: "El origen es requerido",
  }),
  status: z.enum(
    [
      "NUEVO",
      "CONTACTADO",
      "VISITA_AGENDADA",
      "VISITA_REALIZADA",
      "NEGOCIACION",
      "GANADO",
      "PERDIDO",
    ],
    { required_error: "El estado es requerido" }
  ),
  propertyId: z.string().optional().or(z.literal("")),
  message: z.string().max(1000, "Máximo 1000 caracteres").optional().or(z.literal("")),
  visitDate: z.string().optional().or(z.literal("")),
  visitConfirmed: z.boolean().default(false),
  notes: z.string().max(2000, "Máximo 2000 caracteres").optional().or(z.literal("")),
});

export type LeadFormValues = z.infer<typeof leadSchema>;

export const DEFAULT_LEAD_VALUES: LeadFormValues = {
  name: "",
  email: "",
  phone: "",
  origin: "WEB",
  status: "NUEVO",
  propertyId: "",
  message: "",
  visitDate: "",
  visitConfirmed: false,
  notes: "",
};
