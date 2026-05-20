"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { CreditCard, FileText, Wrench, Zap, AlertTriangle, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { timeAgo } from "../utils/time.utils";
import type { Notification, NotificationCategory } from "../types";

/* ─── Config ─────────────────────────────────────────────────────── */

const CATEGORY_CONFIG: Record<
  NotificationCategory,
  { Icon: React.ComponentType<{ className?: string }>; iconColor: string; iconBg: string }
> = {
  payment:     { Icon: CreditCard,     iconColor: "text-emerald-500", iconBg: "bg-emerald-500/10" },
  contract:    { Icon: FileText,       iconColor: "text-blue-500",    iconBg: "bg-blue-500/10" },
  maintenance: { Icon: Wrench,         iconColor: "text-amber-500",   iconBg: "bg-amber-500/10" },
  system:      { Icon: Zap,            iconColor: "text-violet-500",  iconBg: "bg-violet-500/10" },
  alert:       { Icon: AlertTriangle,  iconColor: "text-red-500",     iconBg: "bg-red-500/10" },
};

const PRIORITY_DOT: Record<string, string> = {
  urgent:    "bg-destructive",
  important: "bg-amber-500",
  normal:    "bg-primary",
};

/* ─── Component ──────────────────────────────────────────────────── */

interface NotificationItemProps {
  notification: Notification;
  onMarkRead: (id: string) => void;
  onDelete: (id: string) => void;
}

export function NotificationItem({ notification, onMarkRead, onDelete }: NotificationItemProps) {
  const router = useRouter();
  const { Icon, iconColor, iconBg } = CATEGORY_CONFIG[notification.category];
  const isUnread = notification.status === "unread";
  const isUrgent = notification.priority === "urgent";
  const isImportant = notification.priority === "important";

  const handleClick = () => {
    if (isUnread) onMarkRead(notification.id);
    if (notification.actionUrl) router.push(notification.actionUrl);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.2 }}
      className={cn(
        "group relative cursor-pointer rounded-xl px-3 py-3 transition-colors duration-100",
        "hover:bg-accent/50",
        isUnread && "bg-primary/[0.03]",
        isUrgent && "border-l-2 border-destructive/60",
        isImportant && !isUrgent && "border-l-2 border-amber-500/60"
      )}
      onClick={handleClick}
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className={cn("mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg", iconBg)}>
          <Icon className={cn("h-3.5 w-3.5", iconColor)} />
        </div>

        {/* Content */}
        <div className="min-w-0 flex-1">
          <p
            className={cn(
              "truncate text-[13px] leading-snug",
              isUnread ? "font-semibold text-foreground" : "font-medium text-foreground/80"
            )}
          >
            {notification.title}
          </p>
          <p className="mt-0.5 line-clamp-2 text-[11px] leading-relaxed text-muted-foreground">
            {notification.body}
          </p>
          <p className="mt-1.5 text-[10px] text-muted-foreground/60">
            {timeAgo(notification.createdAt)}
          </p>
        </div>

        {/* Right: unread dot + delete */}
        <div className="flex shrink-0 flex-col items-end gap-2">
          {isUnread && (
            <span className={cn("mt-1 h-2 w-2 rounded-full", PRIORITY_DOT[notification.priority])} />
          )}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(notification.id);
            }}
            className="mt-0.5 rounded p-0.5 text-muted-foreground/0 transition-all group-hover:text-muted-foreground/50 hover:!text-foreground"
            aria-label="Eliminar notificación"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
