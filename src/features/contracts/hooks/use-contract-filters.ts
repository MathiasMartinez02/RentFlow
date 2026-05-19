"use client";

import { useState, useCallback } from "react";
import type { ContractFilters, ContractStatus } from "@/types/contract";

type ContractStatusFilter = ContractStatus | "expiring_soon" | "all";

interface UseContractFiltersReturn {
  filters: ContractFilters;
  hasActiveFilters: boolean;
  setSearch: (search: string) => void;
  setStatus: (status: ContractStatusFilter) => void;
  clearFilters: () => void;
}

const DEFAULT_FILTERS: ContractFilters = {
  search: "",
  status: "all",
};

export function useContractFilters(): UseContractFiltersReturn {
  const [filters, setFilters] = useState<ContractFilters>(DEFAULT_FILTERS);

  const setSearch = useCallback((search: string) => {
    setFilters((prev) => ({ ...prev, search }));
  }, []);

  const setStatus = useCallback((status: ContractStatusFilter) => {
    setFilters((prev) => ({ ...prev, status }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
  }, []);

  const hasActiveFilters =
    !!filters.search || (filters.status !== "all" && !!filters.status);

  return { filters, hasActiveFilters, setSearch, setStatus, clearFilters };
}
