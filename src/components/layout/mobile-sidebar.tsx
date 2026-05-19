"use client";

import { AnimatePresence, motion } from "framer-motion";
import { X, Zap } from "lucide-react";
import { useSidebar } from "@/hooks/use-sidebar";
import { SidebarNav, SidebarBottomNav } from "./sidebar-nav";
import { SidebarUserFooter } from "./sidebar-user-footer";

export function MobileSidebar() {
  const { isMobileOpen, closeMobile } = useSidebar();

  return (
    <AnimatePresence>
      {isMobileOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden"
            onClick={closeMobile}
          />

          {/* Drawer */}
          <motion.aside
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-sidebar-border bg-sidebar lg:hidden"
          >
            {/* Header */}
            <div className="flex h-14 items-center justify-between border-b border-sidebar-border px-4">
              <div className="flex items-center gap-2.5">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary">
                  <Zap className="h-4 w-4 text-white" strokeWidth={2.5} />
                </div>
                <span className="text-sm font-semibold tracking-tight text-sidebar-foreground">
                  RentFlow
                </span>
              </div>
              <button
                onClick={closeMobile}
                className="rounded-md p-1 text-sidebar-foreground/50 transition-colors hover:text-sidebar-foreground"
                aria-label="Close menu"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <SidebarNav isCollapsed={false} />
            <SidebarBottomNav isCollapsed={false} />
            <SidebarUserFooter isCollapsed={false} />
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
