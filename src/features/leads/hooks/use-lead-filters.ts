"use client";

import { useState, useCallback } from "react";
import type { LeadFilters, LeadStatus } from "@/types/lead";

export function useLeadFilters() {
  const [filters, setFilters] = useState<LeadFilters>({});

  const hasActiveFilters = !!(
    filters.search ||
    (filters.status && filters.status !== "all") ||
    filters.propertyId ||
    filters.vendedorId
  );

  // Actualiza el término de búsqueda libre
  const setSearch = useCallback((search: string) => {
    setFilters((prev) => ({ ...prev, search: search || undefined }));
  }, []);

  // Actualiza el filtro por estado del lead
  const setStatus = useCallback((status: LeadStatus | "all") => {
    setFilters((prev) => ({ ...prev, status: status === "all" ? undefined : status }));
  }, []);

  // Actualiza el filtro por propiedad asociada
  const setPropertyId = useCallback((propertyId: string) => {
    setFilters((prev) => ({ ...prev, propertyId: propertyId || undefined }));
  }, []);

  // Limpia todos los filtros
  const clearFilters = useCallback(() => setFilters({}), []);

  return { filters, hasActiveFilters, setSearch, setStatus, setPropertyId, clearFilters };
}
