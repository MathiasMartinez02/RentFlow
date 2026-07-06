"use client";

import { useState, useEffect, useCallback } from "react";
import { publicPropertiesService } from "@/services/public-properties.service";
import type { PublicProperty, PublicPropertyFilters } from "@/types/public-property";

interface UsePublicPropertiesReturn {
  properties: PublicProperty[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

// Trae y mantiene el listado público de propiedades según los filtros (patrón use-contract-filters/limit alto)
export function usePublicProperties(filters?: PublicPropertyFilters): UsePublicPropertiesReturn {
  const [properties, setProperties] = useState<PublicProperty[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Pide el listado público filtrado al backend
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await publicPropertiesService.getAll(filters);
      setProperties(res.data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Error al cargar las propiedades"));
    } finally {
      setIsLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    filters?.search,
    filters?.city,
    filters?.type,
    filters?.minPrice,
    filters?.maxPrice,
    filters?.bedrooms,
  ]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { properties, isLoading, error, refetch: fetchData };
}
