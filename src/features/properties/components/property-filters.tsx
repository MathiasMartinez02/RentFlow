"use client";

import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { PropertyFilters, PropertyStatus, PropertyType } from "@/types/property";

interface PropertyFiltersBarProps {
  filters: PropertyFilters;
  hasActiveFilters: boolean;
  onSearchChange: (value: string) => void;
  onStatusChange: (value: PropertyStatus | "all") => void;
  onTypeChange: (value: PropertyType | "all") => void;
  onClear: () => void;
}

export function PropertyFiltersBar({
  filters,
  hasActiveFilters,
  onSearchChange,
  onStatusChange,
  onTypeChange,
  onClear,
}: PropertyFiltersBarProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Input
        className="h-8 w-full min-w-[200px] flex-1 sm:w-60 sm:flex-none"
        placeholder="Buscar propiedades..."
        value={filters.search ?? ""}
        onChange={(e) => onSearchChange(e.target.value)}
        startIcon={<Search className="h-3.5 w-3.5" />}
      />

      <Select
        value={filters.status ?? "all"}
        onValueChange={(v) => onStatusChange(v as PropertyStatus | "all")}
      >
        <SelectTrigger className="h-8 w-[130px]">
          <SelectValue placeholder="Estado" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos los estados</SelectItem>
          <SelectItem value="occupied">Ocupado</SelectItem>
          <SelectItem value="available">Disponible</SelectItem>
          <SelectItem value="maintenance">Mantenimiento</SelectItem>
          <SelectItem value="reserved">Reservado</SelectItem>
        </SelectContent>
      </Select>

      <Select
        value={filters.type ?? "all"}
        onValueChange={(v) => onTypeChange(v as PropertyType | "all")}
      >
        <SelectTrigger className="h-8 w-[130px]">
          <SelectValue placeholder="Tipo" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos los tipos</SelectItem>
          <SelectItem value="apartment">Departamento</SelectItem>
          <SelectItem value="house">Casa</SelectItem>
          <SelectItem value="commercial">Comercial</SelectItem>
          <SelectItem value="studio">Estudio</SelectItem>
        </SelectContent>
      </Select>

      {hasActiveFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onClear}
          className="h-8 gap-1.5 text-muted-foreground hover:text-foreground"
        >
          <X className="h-3.5 w-3.5" />
          Limpiar
        </Button>
      )}
    </div>
  );
}
