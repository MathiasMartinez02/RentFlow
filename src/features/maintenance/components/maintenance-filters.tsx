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
import type { MaintenanceFilters, MaintenancePriority, MaintenanceStatus, MaintenanceCategory } from "@/types/maintenance";

interface MaintenanceFiltersBarProps {
  filters: MaintenanceFilters;
  hasActiveFilters: boolean;
  onSearchChange: (v: string) => void;
  onStatusChange: (v: MaintenanceStatus | "all") => void;
  onPriorityChange: (v: MaintenancePriority | "all") => void;
  onCategoryChange: (v: MaintenanceCategory | "all") => void;
  onClear: () => void;
}

export function MaintenanceFiltersBar({
  filters,
  hasActiveFilters,
  onSearchChange,
  onStatusChange,
  onPriorityChange,
  onCategoryChange,
  onClear,
}: MaintenanceFiltersBarProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="relative flex-1 min-w-[200px]">
        <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground pointer-events-none" />
        <Input
          placeholder="Buscar por título, propiedad..."
          value={filters.search ?? ""}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-8 h-8 text-sm"
        />
      </div>

      <Select
        value={filters.status ?? "all"}
        onValueChange={(v) => onStatusChange(v as MaintenanceStatus | "all")}
      >
        <SelectTrigger className="h-8 w-[160px] text-sm">
          <SelectValue placeholder="Estado" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos los estados</SelectItem>
          <SelectItem value="pending">Pendiente</SelectItem>
          <SelectItem value="in_progress">En Progreso</SelectItem>
          <SelectItem value="waiting_parts">Esperando Repuestos</SelectItem>
          <SelectItem value="resolved">Resuelto</SelectItem>
          <SelectItem value="closed">Cerrado</SelectItem>
        </SelectContent>
      </Select>

      <Select
        value={filters.priority ?? "all"}
        onValueChange={(v) => onPriorityChange(v as MaintenancePriority | "all")}
      >
        <SelectTrigger className="h-8 w-[150px] text-sm">
          <SelectValue placeholder="Prioridad" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todas las prioridades</SelectItem>
          <SelectItem value="urgent">Urgente</SelectItem>
          <SelectItem value="high">Alta</SelectItem>
          <SelectItem value="medium">Media</SelectItem>
          <SelectItem value="low">Baja</SelectItem>
        </SelectContent>
      </Select>

      <Select
        value={filters.category ?? "all"}
        onValueChange={(v) => onCategoryChange(v as MaintenanceCategory | "all")}
      >
        <SelectTrigger className="h-8 w-[160px] text-sm">
          <SelectValue placeholder="Categoría" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todas las categorías</SelectItem>
          <SelectItem value="plumbing">Plomería</SelectItem>
          <SelectItem value="electrical">Electricidad</SelectItem>
          <SelectItem value="painting">Pintura</SelectItem>
          <SelectItem value="cleaning">Limpieza</SelectItem>
          <SelectItem value="security">Seguridad</SelectItem>
          <SelectItem value="general">General</SelectItem>
        </SelectContent>
      </Select>

      {hasActiveFilters && (
        <Button variant="ghost" size="sm" onClick={onClear} className="h-8 gap-1.5 text-xs">
          <X className="h-3 w-3" />
          Limpiar
        </Button>
      )}
    </div>
  );
}
