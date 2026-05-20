import { api } from "@/lib/api-client";
import type { Notification, NotificationCategory, NotificationPriority } from "@/features/notifications/types";

// ─── Backend DTO shape ────────────────────────────────────────────────────────

interface BackendNotification {
  id: string;
  titulo: string;
  mensaje: string;
  tipo: string;
  prioridad: string;
  leida: boolean;
  createdAt: string;
}

interface BackendUnreadCount {
  count: number;
}

interface BackendPaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ─── Enum mappers ─────────────────────────────────────────────────────────────

const CATEGORY_FROM_BACKEND: Record<string, NotificationCategory> = {
  PAYMENT: "payment",
  CONTRACT: "contract",
  MAINTENANCE: "maintenance",
  SYSTEM: "system",
};

const PRIORITY_FROM_BACKEND: Record<string, NotificationPriority> = {
  LOW: "normal",
  MEDIUM: "normal",
  HIGH: "important",
  URGENT: "urgent",
};

// ─── Mapper ──────────────────────────────────────────────────────────────────

function fromBackend(raw: BackendNotification): Notification {
  return {
    id: raw.id,
    category: CATEGORY_FROM_BACKEND[raw.tipo] ?? "system",
    priority: PRIORITY_FROM_BACKEND[raw.prioridad] ?? "normal",
    status: raw.leida ? "read" : "unread",
    title: raw.titulo,
    body: raw.mensaje,
    createdAt: raw.createdAt,
  };
}

// ─── Service ──────────────────────────────────────────────────────────────────

export const notificationsService = {
  async getAll(params?: { leida?: boolean; limit?: number }): Promise<Notification[]> {
    const qs = new URLSearchParams();
    if (params?.leida !== undefined) qs.set("leida", String(params.leida));
    qs.set("limit", String(params?.limit ?? 50));
    const path = `/notifications?${qs.toString()}`;
    const res = await api.get<BackendPaginatedResponse<BackendNotification>>(path);
    return (res.items ?? []).map(fromBackend);
  },

  async getUnreadCount(): Promise<number> {
    const res = await api.get<BackendUnreadCount>("/notifications/unread-count");
    return res.count ?? 0;
  },

  async markAsRead(id: string): Promise<void> {
    await api.patch(`/notifications/${id}/read`);
  },

  async markAllAsRead(): Promise<void> {
    await api.patch("/notifications/read-all");
  },
};
