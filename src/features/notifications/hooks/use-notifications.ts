"use client";

import { useMemo } from "react";
import { useNotificationsStore } from "../store/notifications.store";
import type { Notification, NotificationCategory } from "../types";
import { groupByDate } from "../utils/time.utils";

export function useNotifications() {
  const { items, activeCategory, markAsRead, markAllAsRead, deleteNotification } =
    useNotificationsStore();

  const filtered = useMemo<Notification[]>(() => {
    if (activeCategory === "all") return items;
    return items.filter((n) => n.category === activeCategory);
  }, [items, activeCategory]);

  const unreadCount = useMemo(
    () => items.filter((n) => n.status === "unread").length,
    [items]
  );

  const unreadFiltered = useMemo(
    () => filtered.filter((n) => n.status === "unread").length,
    [filtered]
  );

  const grouped = useMemo(() => groupByDate(filtered), [filtered]);

  const hasUnread = unreadCount > 0;

  const categoryCount = useMemo(() => {
    const counts: Record<string, number> = {};
    items.forEach((n) => {
      if (n.status === "unread") {
        counts[n.category] = (counts[n.category] ?? 0) + 1;
      }
    });
    return counts;
  }, [items]);

  return {
    notifications: filtered,
    grouped,
    unreadCount,
    unreadFiltered,
    hasUnread,
    categoryCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  };
}

export function useNotificationCounts() {
  const items = useNotificationsStore((s) => s.items);
  return useMemo(() => {
    const total = items.filter((n) => n.status === "unread").length;
    const byCategory: Partial<Record<NotificationCategory, number>> = {};
    items
      .filter((n) => n.status === "unread")
      .forEach((n) => {
        byCategory[n.category] = (byCategory[n.category] ?? 0) + 1;
      });
    return { total, byCategory };
  }, [items]);
}
