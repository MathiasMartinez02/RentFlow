export type MaintenancePriority = "low" | "medium" | "high" | "urgent";
export type MaintenanceStatus = "pending" | "in_progress" | "waiting_parts" | "resolved" | "closed";
export type MaintenanceCategory =
  | "plumbing"
  | "electrical"
  | "painting"
  | "cleaning"
  | "security"
  | "general";

export interface MaintenanceTechnician {
  id: string;
  name: string;
  specialty: string;
  phone: string;
}

export interface MaintenanceTicket {
  id: string;
  title: string;
  description: string;
  propertyId: string;
  tenantId?: string;
  category: MaintenanceCategory;
  priority: MaintenancePriority;
  status: MaintenanceStatus;
  assignedTo?: string;
  estimatedCost?: number;
  finalCost?: number;
  reportedAt: string;
  startedAt?: string;
  resolvedAt?: string;
  closedAt?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MaintenanceFilters {
  search?: string;
  status?: MaintenanceStatus | "all";
  priority?: MaintenancePriority | "all";
  category?: MaintenanceCategory | "all";
}

export interface MaintenanceStats {
  open: number;
  inProgress: number;
  waitingParts: number;
  resolved: number;
  urgent: number;
  avgResolutionDays: number;
  totalEstimatedCost: number;
}
