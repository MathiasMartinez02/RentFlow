"use client";

import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, CheckCheck, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useNotificationsStore } from "../store/notifications.store";
import { useNotifications } from "../hooks/use-notifications";
import { NotificationItem } from "./notification-item";
import type { NotificationCategory } from "../types";

/* ─── Category tabs ──────────────────────────────────────────────── */

const CATEGORIES: { id: "all" | NotificationCategory; label: string }[] = [
  { id: "all",         label: "Todas" },
  { id: "payment",     label: "Pagos" },
  { id: "contract",    label: "Contratos" },
  { id: "maintenance", label: "Mant." },
  { id: "alert",       label: "Alertas" },
  { id: "system",      label: "Sistema" },
];

/* ─── Panel ──────────────────────────────────────────────────────── */

export function NotificationsPanel() {
  const { activeCategory, setActiveCategory, markAllAsRead, closePanel } = useNotificationsStore();
  const { grouped, unreadCount, hasUnread, markAsRead, deleteNotification, categoryCount } =
    useNotifications();

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97, y: -8 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97, y: -8 }}
      transition={{ duration: 0.18, ease: [0.25, 0.46, 0.45, 0.94] }}
      className={cn(
        "absolute right-0 top-full z-50 mt-2",
        "w-[min(calc(100vw-24px),384px)]",
        "overflow-hidden rounded-2xl border border-border/50 bg-background/95 backdrop-blur-xl",
        "shadow-[0_20px_60px_-15px_rgba(0,0,0,0.35)] dark:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.6)]"
      )}
    >
      {/* ─── Header ──────────────────────────────────────────────── */}
      <div className="flex items-center justify-between border-b border-border/40 px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-foreground">Notificaciones</span>
          {unreadCount > 0 && (
            <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-primary px-1.5 text-[10px] font-bold text-primary-foreground">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </div>
        {hasUnread && (
          <button
            type="button"
            onClick={markAllAsRead}
            className="flex items-center gap-1.5 rounded-md px-2 py-1 text-[11px] text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            <CheckCheck className="h-3 w-3" />
            Marcar leídas
          </button>
        )}
      </div>

      {/* ─── Category tabs ───────────────────────────────────────── */}
      <div className="flex items-center gap-0.5 overflow-x-auto border-b border-border/30 px-3 py-2 scrollbar-none">
        {CATEGORIES.map((cat) => {
          const count = cat.id === "all" ? unreadCount : (categoryCount[cat.id] ?? 0);
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => setActiveCategory(cat.id)}
              className={cn(
                "relative flex shrink-0 items-center gap-1.5 rounded-md px-2.5 py-1 text-[11px] font-medium transition-colors",
                activeCategory === cat.id
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:bg-accent/60 hover:text-foreground"
              )}
            >
              {cat.label}
              {count > 0 && (
                <span className="flex h-3.5 min-w-[14px] items-center justify-center rounded-full bg-primary px-0.5 text-[9px] font-bold text-primary-foreground">
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ─── Notification list ───────────────────────────────────── */}
      <div className="max-h-[min(400px,55vh)] overflow-y-auto overscroll-contain">
        <AnimatePresence initial={false}>
          {grouped.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center gap-3 py-10 text-center"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-border bg-muted/40">
                <Bell className="h-5 w-5 text-muted-foreground/40" />
              </div>
              <div className="space-y-0.5">
                <p className="text-sm font-medium text-foreground">Sin notificaciones</p>
                <p className="text-xs text-muted-foreground">
                  {activeCategory === "all"
                    ? "Todo al día por acá."
                    : "No hay notificaciones en esta categoría."}
                </p>
              </div>
            </motion.div>
          ) : (
            <div className="p-2">
              {grouped.map((group) => (
                <div key={group.dateKey} className="mb-2 last:mb-0">
                  {/* Date group header */}
                  <div className="mb-1 flex items-center gap-2 px-1 py-1.5">
                    <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/50">
                      {group.label}
                    </span>
                    <div className="h-px flex-1 bg-border/30" />
                  </div>

                  {/* Items */}
                  <div className="space-y-0.5">
                    {group.items.map((noti) => (
                      <NotificationItem
                        key={noti.id}
                        notification={noti}
                        onMarkRead={markAsRead}
                        onDelete={deleteNotification}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* ─── Footer ──────────────────────────────────────────────── */}
      <div className="border-t border-border/30 bg-muted/20 px-4 py-2.5">
        <Link
          href="/actividad"
          onClick={closePanel}
          className="flex items-center justify-center gap-1.5 text-[11px] font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          Ver toda la actividad
          <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
    </motion.div>
  );
}
