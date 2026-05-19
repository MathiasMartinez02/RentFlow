"use client";

import { PanelLeftClose, PanelLeftOpen, Zap } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useSidebar } from "@/hooks/use-sidebar";
import { SidebarNav, SidebarBottomNav } from "./sidebar-nav";
import { SidebarUserFooter } from "./sidebar-user-footer";

const SIDEBAR_WIDTH = 240;
const SIDEBAR_COLLAPSED_WIDTH = 60;

export function Sidebar() {
  const { isCollapsed, toggleCollapsed } = useSidebar();

  return (
    <motion.aside
      initial={false}
      animate={{ width: isCollapsed ? SIDEBAR_COLLAPSED_WIDTH : SIDEBAR_WIDTH }}
      transition={{ duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
      className={cn(
        "relative hidden h-screen flex-col border-r border-sidebar-border bg-sidebar lg:flex",
        "shrink-0 overflow-hidden"
      )}
    >
      {/* Logo */}
      <div
        className={cn(
          "flex h-14 items-center border-b border-sidebar-border px-4",
          isCollapsed && "justify-center px-0"
        )}
      >
        <AnimatePresence mode="wait" initial={false}>
          {!isCollapsed ? (
            <motion.div
              key="expanded"
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              transition={{ duration: 0.15 }}
              className="flex items-center gap-2.5"
            >
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary">
                <Zap className="h-4 w-4 text-white" strokeWidth={2.5} />
              </div>
              <span className="text-sm font-semibold tracking-tight text-sidebar-foreground">
                RentFlow
              </span>
            </motion.div>
          ) : (
            <motion.div
              key="collapsed"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.15 }}
              className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary"
            >
              <Zap className="h-4 w-4 text-white" strokeWidth={2.5} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <SidebarNav isCollapsed={isCollapsed} />

      {/* Bottom navigation */}
      <SidebarBottomNav isCollapsed={isCollapsed} />

      {/* User footer */}
      <SidebarUserFooter isCollapsed={isCollapsed} />

      {/* Collapse toggle */}
      <button
        onClick={toggleCollapsed}
        className={cn(
          "absolute -right-3 top-[52px] z-10 flex h-6 w-6 items-center justify-center",
          "rounded-full border border-sidebar-border bg-sidebar shadow-sm",
          "text-sidebar-foreground/50 transition-colors hover:text-sidebar-foreground",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        )}
        aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {isCollapsed ? (
          <PanelLeftOpen className="h-3 w-3" />
        ) : (
          <PanelLeftClose className="h-3 w-3" />
        )}
      </button>
    </motion.aside>
  );
}
