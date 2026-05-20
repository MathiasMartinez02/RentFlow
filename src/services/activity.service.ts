import { api } from "@/lib/api-client";
import type { ActivityEvent, ActivityCategory, ActivityEventType } from "@/features/notifications/types";

interface BackendActivityEvent {
  id: string;
  action: string;
  entityType: string;
  entityId: string;
  descripcion?: string;
  createdAt: string;
}

interface BackendPaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

function deriveType(action: string, entityType: string): ActivityEventType {
  const a = action.toUpperCase();
  const e = entityType.toLowerCase();
  if (e === "payment") {
    if (a.includes("OVERDUE") || a.includes("VENCIDO")) return "payment_overdue";
    if (a.includes("PAID") || a.includes("PAGADO")) return "payment_received";
    return "payment_received";
  }
  if (e === "contract") {
    if (a.includes("EXPIRED") || a.includes("VENCIDO")) return "contract_expired";
    if (a.includes("RENEWED") || a.includes("RENOVADO")) return "contract_renewed";
    if (a.includes("EXPIRING")) return "contract_expiring";
    return "contract_signed";
  }
  if (e === "maintenanceticket") {
    if (a.includes("RESOLVED") || a.includes("RESUELTO")) return "maintenance_resolved";
    if (a.includes("URGENT")) return "maintenance_urgent";
    return "maintenance_created";
  }
  if (e === "tenant") {
    if (a.includes("UPDATE") || a.includes("ACTUALIZ")) return "tenant_updated";
    return "tenant_added";
  }
  if (e === "property") {
    if (a.includes("UPDATE") || a.includes("ACTUALIZ")) return "property_updated";
    return "property_added";
  }
  return "system_update";
}

function deriveCategory(entityType: string): ActivityCategory {
  const map: Record<string, ActivityCategory> = {
    payment: "payment",
    contract: "contract",
    maintenanceticket: "maintenance",
    tenant: "tenant",
    property: "property",
  };
  return map[entityType.toLowerCase()] ?? "system";
}

const ACTION_LABELS: Record<string, string> = {
  PROPERTY_CREATED: "Propiedad creada",
  PROPERTY_UPDATED: "Propiedad actualizada",
  TENANT_CREATED: "Inquilino creado",
  TENANT_UPDATED: "Inquilino actualizado",
  CONTRACT_CREATED: "Contrato creado",
  CONTRACT_UPDATED: "Contrato actualizado",
  CONTRACT_RENEWED: "Contrato renovado",
  CONTRACT_CANCELLED: "Contrato cancelado",
  PAYMENT_CREATED: "Pago registrado",
  PAYMENT_PAID: "Pago cobrado",
  PAYMENT_OVERDUE: "Pago vencido",
  MAINTENANCE_CREATED: "Ticket creado",
  MAINTENANCE_UPDATED: "Ticket actualizado",
  MAINTENANCE_RESOLVED: "Ticket resuelto",
  MAINTENANCE_CLOSED: "Ticket cerrado",
};

function fromBackend(raw: BackendActivityEvent): ActivityEvent {
  return {
    id: raw.id,
    type: deriveType(raw.action, raw.entityType),
    category: deriveCategory(raw.entityType),
    title: ACTION_LABELS[raw.action] ?? raw.action,
    description: raw.descripcion ?? "",
    entityId: raw.entityId,
    entityType: raw.entityType,
    createdAt: raw.createdAt,
  };
}

export const activityService = {
  async getAll(params?: { limit?: number; entityType?: string; search?: string }): Promise<ActivityEvent[]> {
    const qs = new URLSearchParams();
    qs.set("limit", String(params?.limit ?? 50));
    if (params?.entityType) qs.set("entityType", params.entityType);
    if (params?.search) qs.set("search", params.search);
    const res = await api.get<BackendPaginatedResponse<BackendActivityEvent>>(`/activity?${qs.toString()}`);
    return (res.items ?? []).map(fromBackend);
  },
};
