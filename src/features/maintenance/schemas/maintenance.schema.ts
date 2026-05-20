import { z } from "zod";

export const maintenanceSchema = z.object({
  title: z.string().min(3, "El título debe tener al menos 3 caracteres"),
  description: z.string().min(10, "La descripción debe tener al menos 10 caracteres"),
  propertyId: z.string().min(1, "Seleccioná una propiedad"),
  tenantId: z.string().optional().or(z.literal("")),
  category: z.enum(["plumbing", "electrical", "painting", "cleaning", "security", "general"]),
  priority: z.enum(["low", "medium", "high", "urgent"]),
  status: z.enum(["pending", "in_progress", "waiting_parts", "resolved", "closed"]),
  assignedTo: z.string().optional().or(z.literal("")),
  estimatedCost: z.coerce.number().min(0).optional().or(z.literal("")),
  finalCost: z.coerce.number().min(0).optional().or(z.literal("")),
  reportedAt: z.string().min(1, "Ingresá la fecha de reporte"),
  notes: z.string().optional(),
});

export type MaintenanceFormValues = z.infer<typeof maintenanceSchema>;

export const DEFAULT_MAINTENANCE_VALUES: MaintenanceFormValues = {
  title: "",
  description: "",
  propertyId: "",
  tenantId: "",
  category: "general",
  priority: "medium",
  status: "pending",
  assignedTo: "",
  estimatedCost: "",
  finalCost: "",
  reportedAt: new Date().toISOString().split("T")[0],
  notes: "",
};
