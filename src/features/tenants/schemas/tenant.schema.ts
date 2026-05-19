import { z } from "zod";

export const tenantSchema = z.object({
  firstName: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  lastName: z.string().min(2, "El apellido debe tener al menos 2 caracteres"),
  nationalId: z.string().min(5, "El DNI es requerido"),
  email: z.string().email("Email inválido"),
  phone: z.string().min(5, "El teléfono es requerido"),
  address: z.string().optional(),
  status: z.enum(["active", "inactive", "pending"], {
    required_error: "El estado es requerido",
  }),
  paymentStatus: z.enum(["al_dia", "atrasado", "pendiente"]).optional(),
  propertyId: z.string().optional(),
  moveInDate: z.string().optional(),
  observations: z.string().max(1000, "Máximo 1000 caracteres").optional(),
  emergencyContactName: z.string().min(2, "El nombre del contacto es requerido"),
  emergencyContactPhone: z.string().min(5, "El teléfono del contacto es requerido"),
  emergencyContactRelationship: z.string().min(2, "El vínculo es requerido"),
});

export type TenantFormValues = z.infer<typeof tenantSchema>;

export const DEFAULT_TENANT_VALUES: TenantFormValues = {
  firstName: "",
  lastName: "",
  nationalId: "",
  email: "",
  phone: "",
  address: "",
  status: "active",
  paymentStatus: undefined,
  propertyId: undefined,
  moveInDate: "",
  observations: "",
  emergencyContactName: "",
  emergencyContactPhone: "",
  emergencyContactRelationship: "",
};
