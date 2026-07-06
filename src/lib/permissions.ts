import type { UserRole } from "@/types/auth";

export type Resource =
  | "dashboard"
  | "properties"
  | "tenants"
  | "contracts"
  | "payments"
  | "maintenance"
  | "leads"
  | "settings"
  | "activity"
  | "users";

export type Action = "view" | "create" | "edit" | "delete";

const ALL: Action[] = ["view", "create", "edit", "delete"];
const VIEW: Action[] = ["view"];
const MANAGE: Action[] = ["view", "create", "edit"];
const VIEW_CREATE: Action[] = ["view", "create"];

const MATRIX: Record<UserRole, Partial<Record<Resource, Action[]>>> = {
  SUPER_ADMIN: {
    dashboard: ALL, properties: ALL, tenants: ALL, contracts: ALL,
    payments: ALL, maintenance: ALL, leads: ALL, settings: ALL, activity: ALL, users: ALL,
  },
  ADMIN: {
    dashboard: ALL, properties: ALL, tenants: ALL, contracts: ALL,
    payments: ALL, maintenance: ALL, leads: ALL, settings: ALL, activity: ALL, users: MANAGE,
  },
  CLIENTE: {
    dashboard: ALL, properties: ALL, tenants: ALL, contracts: ALL,
    payments: ALL, maintenance: ALL, leads: ALL, settings: ALL, activity: ALL, users: MANAGE,
  },
  FINANZAS: {
    dashboard: VIEW, properties: VIEW, tenants: VIEW, contracts: VIEW,
    payments: ALL, maintenance: VIEW, activity: VIEW,
  },
  VENDEDOR: {
    dashboard: VIEW, properties: VIEW, tenants: ALL, contracts: ALL,
    payments: VIEW, maintenance: VIEW, leads: ALL, activity: VIEW,
  },
  MANTENIMIENTO: {
    dashboard: VIEW, properties: VIEW, tenants: VIEW,
    maintenance: ALL, activity: VIEW,
  },
  INQUILINO: {
    dashboard: VIEW, contracts: VIEW, payments: VIEW,
    maintenance: VIEW_CREATE,
  },
};

export function can(role: UserRole, resource: Resource, action: Action): boolean {
  return MATRIX[role]?.[resource]?.includes(action) ?? false;
}

export { MATRIX as PERMISSION_MATRIX };
