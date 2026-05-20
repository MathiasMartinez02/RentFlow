export type NotificationCategory = "payment" | "contract" | "maintenance" | "system" | "alert";

export type NotificationPriority = "normal" | "important" | "urgent";

export interface Notification {
  id: string;
  category: NotificationCategory;
  priority: NotificationPriority;
  status: "read" | "unread";
  title: string;
  body: string;
  entityId?: string;
  entityType?: string;
  actionUrl?: string;
  createdAt: string;
}

/* ─── Activity ──────────────────────────────────────────────────── */

export type ActivityCategory = "payment" | "contract" | "maintenance" | "system" | "property" | "tenant";

export type ActivityEventType =
  | "payment_received"
  | "payment_overdue"
  | "payment_late"
  | "contract_expiring"
  | "contract_signed"
  | "contract_renewed"
  | "contract_expired"
  | "maintenance_created"
  | "maintenance_resolved"
  | "maintenance_urgent"
  | "tenant_added"
  | "tenant_updated"
  | "property_added"
  | "property_updated"
  | "system_update"
  | "system_backup";

export interface ActivityActor {
  id: string;
  name: string;
  initials: string;
  role: string;
}

export interface ActivityMetadata {
  amount?: number;
  propertyName?: string;
  tenantName?: string;
  contractId?: string;
  period?: string;
  daysUntilExpiry?: number;
  daysOverdue?: number;
  note?: string;
}

export interface ActivityEvent {
  id: string;
  type: ActivityEventType;
  category: ActivityCategory;
  title: string;
  description: string;
  actor?: ActivityActor;
  entityId?: string;
  entityType?: string;
  metadata?: ActivityMetadata;
  createdAt: string;
}
