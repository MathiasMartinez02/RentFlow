"use client";

import { useState, useCallback } from "react";
import type { PropertyFilters, PropertyStatus, PropertyType } from "@/types/property";

interface UsePropertyFiltersReturn {
  filters: PropertyFilters;
  hasActiveFilters: boolean;
  setSearch: (search: string) => void;
  setStatus: (status: PropertyStatus | "all") => void;
  setType: (type: PropertyType | "all") => void;
  clearFilters: () => void;
}

const DEFAULT_FILTERS: PropertyFilters = {
  search: "",
  status: "all",
  type: "all",
};

export function usePropertyFilters(): UsePropertyFiltersReturn {
  const [filters, setFilters] = useState<PropertyFilters>(DEFAULT_FILTERS);

  const setSearch = useCallback((search: string) => {
    setFilters((prev) => ({ ...prev, search }));
  }, []);

  const setStatus = useCallback((status: PropertyStatus | "all") => {
    setFilters((prev) => ({ ...prev, status }));
  }, []);

  const setType = useCallback((type: PropertyType | "all") => {
    setFilters((prev) => ({ ...prev, type }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
  }, []);

  const hasActiveFilters =
    !!filters.search ||
    (filters.status !== "all" && !!filters.status) ||
    (filters.type !== "all" && !!filters.type);

  return { filters, hasActiveFilters, setSearch, setStatus, setType, clearFilters };
}
