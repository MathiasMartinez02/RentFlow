"use client";

import { useState, useCallback } from "react";
import type { MaintenanceFilters, MaintenancePriority, MaintenanceStatus, MaintenanceCategory } from "@/types/maintenance";

export function useMaintenanceFilters() {
  const [filters, setFilters] = useState<MaintenanceFilters>({});

  const hasActiveFilters = !!(
    filters.search ||
    (filters.status && filters.status !== "all") ||
    (filters.priority && filters.priority !== "all") ||
    (filters.category && filters.category !== "all")
  );

  const setSearch = useCallback((search: string) => {
    setFilters((prev) => ({ ...prev, search: search || undefined }));
  }, []);

  const setStatus = useCallback((status: MaintenanceStatus | "all") => {
    setFilters((prev) => ({ ...prev, status: status === "all" ? undefined : status }));
  }, []);

  const setPriority = useCallback((priority: MaintenancePriority | "all") => {
    setFilters((prev) => ({ ...prev, priority: priority === "all" ? undefined : priority }));
  }, []);

  const setCategory = useCallback((category: MaintenanceCategory | "all") => {
    setFilters((prev) => ({ ...prev, category: category === "all" ? undefined : category }));
  }, []);

  const clearFilters = useCallback(() => setFilters({}), []);

  return { filters, hasActiveFilters, setSearch, setStatus, setPriority, setCategory, clearFilters };
}
