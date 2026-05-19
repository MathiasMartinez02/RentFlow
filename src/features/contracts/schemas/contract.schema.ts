import { z } from "zod";

export const contractSchema = z.object({
  propertyId: z.string().min(1, "La propiedad es requerida"),
  tenantId: z.string().min(1, "El inquilino es requerido"),
  startDate: z.string().min(1, "La fecha de inicio es requerida"),
  endDate: z.string().min(1, "La fecha de vencimiento es requerida"),
  status: z.enum(["active", "expired", "pending", "terminated"], {
    required_error: "El estado es requerido",
  }),
  monthlyRent: z.coerce.number().positive("El monto debe ser mayor a 0"),
  deposit: z.coerce.number().min(0, "El depósito no puede ser negativo"),
  expenses: z.coerce.number().min(0).optional().or(z.literal("")),
  annualIncreasePercent: z.coerce.number().min(0).max(100).optional().or(z.literal("")),
  renewalOption: z.boolean().default(false),
  noticePeriodDays: z.coerce.number().int().min(0).default(30),
  terms: z.string().max(2000, "Máximo 2000 caracteres").optional(),
});

export type ContractFormValues = z.infer<typeof contractSchema>;

export const DEFAULT_CONTRACT_VALUES: ContractFormValues = {
  propertyId: "",
  tenantId: "",
  startDate: "",
  endDate: "",
  status: "active",
  monthlyRent: 0,
  deposit: 0,
  expenses: "",
  annualIncreasePercent: "",
  renewalOption: false,
  noticePeriodDays: 30,
  terms: "",
};
