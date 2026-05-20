"use client";

import { useState, useEffect, useCallback } from "react";
import { propertiesService } from "@/services/properties.service";
import { useUIStore } from "@/store";
import type { Property, PropertyFilters, PropertyStats } from "@/types/property";
import type { PropertyFormValues } from "../schemas/property.schema";

function computeStats(properties: Property[]): PropertyStats {
  const occupied = properties.filter((p) => p.status === "occupied");
  return {
    total: properties.length,
    occupied: occupied.length,
    available: properties.filter((p) => p.status === "available").length,
    maintenance: properties.filter((p) => p.status === "maintenance").length,
    reserved: properties.filter((p) => p.status === "reserved").length,
    monthlyRevenue: occupied.reduce((sum, p) => sum + p.rent, 0),
    occupancyRate: properties.length > 0 ? (occupied.length / properties.length) * 100 : 0,
  };
}

interface UsePropertiesReturn {
  properties: Property[];
  stats: PropertyStats;
  isLoading: boolean;
  isMutating: boolean;
  error: Error | null;
  refetch: () => void;
  createProperty: (data: PropertyFormValues) => Promise<void>;
  updateProperty: (id: string, data: PropertyFormValues) => Promise<void>;
  deleteProperty: (id: string) => Promise<void>;
}

export function useProperties(filters?: PropertyFilters): UsePropertiesReturn {
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isMutating, setIsMutating] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const { closePropertyForm, closePropertyDrawer } = useUIStore();

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await propertiesService.getAll(filters);
      setProperties(result.data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Error al cargar las propiedades"));
    } finally {
      setIsLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters?.search, filters?.status, filters?.type, filters?.city]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const createProperty = async (data: PropertyFormValues) => {
    setIsMutating(true);
    try {
      const newProp = await propertiesService.create({
        ...data,
        images: [],
        yearBuilt: data.yearBuilt ? Number(data.yearBuilt) : undefined,
      });
      setProperties((prev) => [newProp, ...prev]);
      closePropertyForm();
    } finally {
      setIsMutating(false);
    }
  };

  const updateProperty = async (id: string, data: PropertyFormValues) => {
    setIsMutating(true);
    try {
      const updated = await propertiesService.update(id, {
        ...data,
        yearBuilt: data.yearBuilt ? Number(data.yearBuilt) : undefined,
      });
      setProperties((prev) => prev.map((p) => (p.id === id ? updated : p)));
      closePropertyForm();
    } finally {
      setIsMutating(false);
    }
  };

  const deleteProperty = async (id: string) => {
    setIsMutating(true);
    setProperties((prev) => prev.filter((p) => p.id !== id));
    closePropertyDrawer();
    try {
      await propertiesService.delete(id);
    } catch {
      await fetchData();
    } finally {
      setIsMutating(false);
    }
  };

  return {
    properties,
    stats: computeStats(properties),
    isLoading,
    isMutating,
    error,
    refetch: fetchData,
    createProperty,
    updateProperty,
    deleteProperty,
  };
}
