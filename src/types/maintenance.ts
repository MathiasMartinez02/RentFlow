export type MaintenancePriority = "low" | "medium" | "high" | "urgent";
export type MaintenanceStatus = "open" | "in_progress" | "completed" | "cancelled";
export type MaintenanceCategory =
  | "plumbing"
  | "electrical"
  | "hvac"
  | "structural"
  | "appliance"
  | "other";

export interface MaintenanceRequest {
  id: string;
  propertyId: string;
  tenantId?: string;
  title: string;
  description: string;
  category: MaintenanceCategory;
  priority: MaintenancePriority;
  status: MaintenanceStatus;
  estimatedCost?: number;
  actualCost?: number;
  assignedTo?: string;
  scheduledDate?: string;
  completedDate?: string;
  images?: string[];
  createdAt: string;
  updatedAt: string;
}
