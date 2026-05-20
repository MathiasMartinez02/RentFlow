import { create } from "zustand";
import { notificationsService } from "@/services/notifications.service";
import type { Notification, NotificationCategory } from "../types";

interface NotificationsState {
  items: Notification[];
  isPanelOpen: boolean;
  activeCategory: "all" | NotificationCategory;
  isLoading: boolean;

  openPanel: () => void;
  closePanel: () => void;
  togglePanel: () => void;
  setActiveCategory: (cat: "all" | NotificationCategory) => void;
  fetchNotifications: () => Promise<void>;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  deleteNotification: (id: string) => void;
}

export const useNotificationsStore = create<NotificationsState>()((set, get) => ({
  items: [],
  isPanelOpen: false,
  activeCategory: "all",
  isLoading: false,

  openPanel: () => set({ isPanelOpen: true }),
  closePanel: () => set({ isPanelOpen: false }),
  togglePanel: () => set((s) => ({ isPanelOpen: !s.isPanelOpen })),
  setActiveCategory: (cat) => set({ activeCategory: cat }),

  fetchNotifications: async () => {
    set({ isLoading: true });
    try {
      const items = await notificationsService.getAll({ limit: 50 });
      set({ items });
    } catch {
      // Keep existing items on error
    } finally {
      set({ isLoading: false });
    }
  },

  markAsRead: (id) => {
    set((s) => ({
      items: s.items.map((n) => (n.id === id ? { ...n, status: "read" as const } : n)),
    }));
    notificationsService.markAsRead(id).catch(() => {});
  },

  markAllAsRead: () => {
    set((s) => ({
      items: s.items.map((n) => ({ ...n, status: "read" as const })),
    }));
    notificationsService.markAllAsRead().catch(() => {});
  },

  deleteNotification: (id) => {
    set((s) => ({ items: s.items.filter((n) => n.id !== id) }));
  },
}));

// Fetch notifications when the store is first used (only on the client)
if (typeof window !== "undefined") {
  // Defer to avoid calling before auth is hydrated
  setTimeout(() => {
    const { isLoading, items } = useNotificationsStore.getState();
    if (!isLoading && items.length === 0) {
      useNotificationsStore.getState().fetchNotifications();
    }
  }, 500);
}
