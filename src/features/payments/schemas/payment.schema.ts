import { z } from "zod";

export const paymentSchema = z.object({
  tenantId: z.string().min(1, "Seleccioná un inquilino"),
  propertyId: z.string().min(1, "Seleccioná una propiedad"),
  contractId: z.string().min(1, "Seleccioná un contrato"),
  period: z.string().min(7, "Seleccioná el período"),
  concept: z.string().min(1, "Ingresá el concepto"),
  amount: z.coerce.number().positive("El monto debe ser mayor a 0"),
  paidAmount: z.coerce.number().min(0).optional().or(z.literal("")),
  dueDate: z.string().min(1, "Ingresá la fecha de vencimiento"),
  paidDate: z.string().optional().or(z.literal("")),
  status: z.enum(["paid", "pending", "overdue", "partial", "cancelled"]),
  method: z.enum(["transfer", "cash", "card", "auto_debit"]).optional().or(z.literal("")),
  reference: z.string().optional(),
  notes: z.string().optional(),
});

export type PaymentFormValues = z.infer<typeof paymentSchema>;

export const DEFAULT_PAYMENT_VALUES: PaymentFormValues = {
  tenantId: "",
  propertyId: "",
  contractId: "",
  period: "",
  concept: "",
  amount: 0,
  paidAmount: "",
  dueDate: "",
  paidDate: "",
  status: "pending",
  method: "",
  reference: "",
  notes: "",
};
