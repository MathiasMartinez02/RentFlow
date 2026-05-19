"use client";

import { useUIStore } from "@/store";

export function useSidebar() {
  const {
    sidebarOpen,
    sidebarCollapsed,
    mobileSidebarOpen,
    setSidebarOpen,
    setSidebarCollapsed,
    setMobileSidebarOpen,
    toggleSidebar,
    toggleSidebarCollapsed,
  } = useUIStore();

  return {
    isOpen: sidebarOpen,
    isCollapsed: sidebarCollapsed,
    isMobileOpen: mobileSidebarOpen,
    open: () => setSidebarOpen(true),
    close: () => setSidebarOpen(false),
    toggle: toggleSidebar,
    collapse: () => setSidebarCollapsed(true),
    expand: () => setSidebarCollapsed(false),
    toggleCollapsed: toggleSidebarCollapsed,
    openMobile: () => setMobileSidebarOpen(true),
    closeMobile: () => setMobileSidebarOpen(false),
  };
}
