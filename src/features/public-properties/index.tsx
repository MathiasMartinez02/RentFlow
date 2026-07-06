"use client";

import { useState, useCallback } from "react";
import { Building2 } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { usePublicProperties } from "./hooks/use-public-properties";
import { PropertySearchBar } from "./components/property-search-bar";
import { PropertyCard } from "./components/property-card";
import type { PublicPropertyFilters } from "@/types/public-property";

// Listado público de propiedades con búsqueda/filtros (sin autenticación)
export function PublicPropertiesView() {
  const [filters, setFilters] = useState<PublicPropertyFilters>({});
  const { properties, isLoading } = usePublicProperties(filters);

  const hasActiveFilters = !!(
    filters.search || filters.city || (filters.type && filters.type !== "all") ||
    filters.minPrice != null || filters.maxPrice != null || filters.bedrooms != null
  );

  // Aplica un cambio parcial de filtros conservando el resto
  const handleChange = useCallback((patch: Partial<PublicPropertyFilters>) => {
    setFilters((prev) => ({ ...prev, ...patch }));
  }, []);

  // Limpia todos los filtros
  const handleClear = useCallback(() => setFilters({}), []);

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Encontrá tu próximo hogar
        </h1>
        <p className="text-sm text-muted-foreground">
          Explorá nuestras propiedades disponibles en alquiler.
        </p>
      </div>

      <PropertySearchBar
        filters={filters}
        hasActiveFilters={hasActiveFilters}
        onChange={handleChange}
        onClear={handleClear}
      />

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="overflow-hidden rounded-xl border border-border">
              <Skeleton className="aspect-[4/3] w-full" />
              <div className="space-y-2 p-4">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
                <Skeleton className="h-5 w-1/3" />
              </div>
            </div>
          ))}
        </div>
      ) : properties.length === 0 ? (
        <EmptyState
          icon={Building2}
          title="No se encontraron propiedades"
          description={
            hasActiveFilters
              ? "Probá ajustar los filtros de búsqueda."
              : "Todavía no hay propiedades publicadas."
          }
          className="mt-4"
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {properties.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>
      )}
    </div>
  );
}
