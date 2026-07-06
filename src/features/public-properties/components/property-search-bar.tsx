"use client";

import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { PROPERTY_TYPE_OPTIONS } from "../lib/property-labels";
import type { PublicPropertyFilters } from "@/types/public-property";
import type { PropertyType } from "@/types/property";

interface PropertySearchBarProps {
  filters: PublicPropertyFilters;
  hasActiveFilters: boolean;
  onChange: (patch: Partial<PublicPropertyFilters>) => void;
  onClear: () => void;
}

// Convierte el string de un input numérico a número o undefined si está vacío
function parseNumber(value: string): number | undefined {
  if (value === "") return undefined;
  const n = Number(value);
  return Number.isNaN(n) ? undefined : n;
}

// Barra de filtros del listado público: ciudad, tipo, precio min/max y ambientes
export function PropertySearchBar({ filters, hasActiveFilters, onChange, onClear }: PropertySearchBarProps) {
  return (
    <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-6">
        <div className="lg:col-span-2">
          <Input
            placeholder="Buscar propiedad..."
            value={filters.search ?? ""}
            onChange={(e) => onChange({ search: e.target.value || undefined })}
            startIcon={<Search className="h-4 w-4" />}
          />
        </div>

        <Input
          placeholder="Ciudad"
          value={filters.city ?? ""}
          onChange={(e) => onChange({ city: e.target.value || undefined })}
        />

        <Select
          value={filters.type ?? "all"}
          onValueChange={(v) => onChange({ type: v === "all" ? "all" : (v as PropertyType) })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los tipos</SelectItem>
            {PROPERTY_TYPE_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.bedrooms != null ? String(filters.bedrooms) : "all"}
          onValueChange={(v) => onChange({ bedrooms: v === "all" ? undefined : Number(v) })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Ambientes" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Ambientes</SelectItem>
            {[1, 2, 3, 4, 5].map((n) => (
              <SelectItem key={n} value={String(n)}>{n}+ ambientes</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="grid grid-cols-2 gap-2 lg:col-span-1">
          <Input
            type="number"
            min={0}
            placeholder="Precio mín"
            value={filters.minPrice ?? ""}
            onChange={(e) => onChange({ minPrice: parseNumber(e.target.value) })}
          />
          <Input
            type="number"
            min={0}
            placeholder="Precio máx"
            value={filters.maxPrice ?? ""}
            onChange={(e) => onChange({ maxPrice: parseNumber(e.target.value) })}
          />
        </div>
      </div>

      {hasActiveFilters && (
        <div className="mt-3 flex justify-end">
          <Button variant="ghost" size="sm" onClick={onClear} className="gap-1.5">
            <X className="h-3.5 w-3.5" /> Limpiar filtros
          </Button>
        </div>
      )}
    </div>
  );
}
