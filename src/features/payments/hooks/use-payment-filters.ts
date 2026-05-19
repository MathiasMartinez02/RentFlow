"use client";

import { useState, useCallback } from "react";
import type { PaymentFilters, PaymentStatus } from "@/types/payment";

export function usePaymentFilters() {
  const [filters, setFilters] = useState<PaymentFilters>({});

  const hasActiveFilters = !!(
    filters.search ||
    (filters.status && filters.status !== "all") ||
    filters.period
  );

  const setSearch = useCallback((search: string) => {
    setFilters((prev) => ({ ...prev, search: search || undefined }));
  }, []);

  const setStatus = useCallback((status: PaymentStatus | "all") => {
    setFilters((prev) => ({ ...prev, status: status === "all" ? undefined : status }));
  }, []);

  const setPeriod = useCallback((period: string) => {
    setFilters((prev) => ({ ...prev, period: period || undefined }));
  }, []);

  const clearFilters = useCallback(() => setFilters({}), []);

  return { filters, hasActiveFilters, setSearch, setStatus, setPeriod, clearFilters };
}
