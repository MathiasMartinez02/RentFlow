"use client";

import { useState, useCallback } from "react";
import type { TenantFilters, TenantStatus, TenantPaymentStatus } from "@/types/tenant";

interface UseTenantFiltersReturn {
  filters: TenantFilters;
  hasActiveFilters: boolean;
  setSearch: (search: string) => void;
  setStatus: (status: TenantStatus | "all") => void;
  setPaymentStatus: (paymentStatus: TenantPaymentStatus | "all") => void;
  clearFilters: () => void;
}

const DEFAULT_FILTERS: TenantFilters = {
  search: "",
  status: "all",
  paymentStatus: "all",
};

export function useTenantFilters(): UseTenantFiltersReturn {
  const [filters, setFilters] = useState<TenantFilters>(DEFAULT_FILTERS);

  const setSearch = useCallback((search: string) => {
    setFilters((prev) => ({ ...prev, search }));
  }, []);

  const setStatus = useCallback((status: TenantStatus | "all") => {
    setFilters((prev) => ({ ...prev, status }));
  }, []);

  const setPaymentStatus = useCallback((paymentStatus: TenantPaymentStatus | "all") => {
    setFilters((prev) => ({ ...prev, paymentStatus }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
  }, []);

  const hasActiveFilters =
    !!filters.search ||
    (filters.status !== "all" && !!filters.status) ||
    (filters.paymentStatus !== "all" && !!filters.paymentStatus);

  return { filters, hasActiveFilters, setSearch, setStatus, setPaymentStatus, clearFilters };
}
