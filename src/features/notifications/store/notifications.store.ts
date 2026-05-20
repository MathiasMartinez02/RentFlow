import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Notification, NotificationCategory } from "../types";
import { MOCK_NOTIFICATIONS } from "../mock/notifications.mock";

interface NotificationsState {
  items: Notification[];
  isPanelOpen: boolean;
  activeCategory: "all" | NotificationCategory;

  openPanel: () => void;
  closePanel: () => void;
  togglePanel: () => void;
  setActiveCategory: (cat: "all" | NotificationCategory) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  deleteNotification: (id: string) => void;
}

export const useNotificationsStore = create<NotificationsState>()(
  persist(
    (set) => ({
      items: MOCK_NOTIFICATIONS,
      isPanelOpen: false,
      activeCategory: "all",

      openPanel: () => set({ isPanelOpen: true }),
      closePanel: () => set({ isPanelOpen: false }),
      togglePanel: () => set((s) => ({ isPanelOpen: !s.isPanelOpen })),

      setActiveCategory: (cat) => set({ activeCategory: cat }),

      markAsRead: (id) =>
        set((s) => ({
          items: s.items.map((n) => (n.id === id ? { ...n, status: "read" as const } : n)),
        })),

      markAllAsRead: () =>
        set((s) => ({
          items: s.items.map((n) => ({ ...n, status: "read" as const })),
        })),

      deleteNotification: (id) =>
        set((s) => ({ items: s.items.filter((n) => n.id !== id) })),
    }),
    {
      name: "rentflow-notifications",
      partialize: (s) => ({ items: s.items }),
    }
  )
);
