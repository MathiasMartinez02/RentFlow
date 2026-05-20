"use client";

import { useEffect, useRef } from "react";
import { Bell } from "lucide-react";
import { AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useNotificationsStore } from "../store/notifications.store";
import { useNotificationCounts } from "../hooks/use-notifications";
import { NotificationsPanel } from "./notifications-panel";

export function NotificationsBell() {
  const { isPanelOpen, togglePanel, closePanel } = useNotificationsStore();
  const { total: unreadCount } = useNotificationCounts();
  const containerRef = useRef<HTMLDivElement>(null);

  /* Click outside to close */
  useEffect(() => {
    if (!isPanelOpen) return;
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        closePanel();
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [isPanelOpen, closePanel]);

  /* Escape key to close */
  useEffect(() => {
    if (!isPanelOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") closePanel();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [isPanelOpen, closePanel]);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={togglePanel}
        className={cn(
          "relative rounded-md p-1.5 text-muted-foreground transition-colors",
          "hover:bg-accent hover:text-foreground",
          isPanelOpen && "bg-accent text-foreground"
        )}
        aria-label="Notificaciones"
        aria-expanded={isPanelOpen}
      >
        <Bell className="h-4 w-4" />

        {/* Unread badge */}
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-primary px-[3px] text-[9px] font-bold leading-none text-primary-foreground">
            {unreadCount > 9 ? "9+" : unreadCount}
            {/* Pulse ring */}
            <span className="absolute inset-0 -z-10 animate-ping rounded-full bg-primary opacity-30" />
          </span>
        )}
      </button>

      {/* Panel */}
      <AnimatePresence>
        {isPanelOpen && <NotificationsPanel />}
      </AnimatePresence>
    </div>
  );
}
