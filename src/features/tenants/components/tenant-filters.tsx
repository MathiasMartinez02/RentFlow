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
import type { TenantFilters, TenantStatus, TenantPaymentStatus } from "@/types/tenant";

interface TenantFiltersBarProps {
  filters: TenantFilters;
  hasActiveFilters: boolean;
  onSearchChange: (value: string) => void;
  onStatusChange: (value: TenantStatus | "all") => void;
  onPaymentStatusChange: (value: TenantPaymentStatus | "all") => void;
  onClear: () => void;
}

export function TenantFiltersBar({
  filters,
  hasActiveFilters,
  onSearchChange,
  onStatusChange,
  onPaymentStatusChange,
  onClear,
}: TenantFiltersBarProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Input
        className="h-8 w-full min-w-[200px] flex-1 sm:w-64 sm:flex-none"
        placeholder="Buscar inquilinos..."
        value={filters.search ?? ""}
        onChange={(e) => onSearchChange(e.target.value)}
        startIcon={<Search className="h-3.5 w-3.5" />}
      />

      <Select
        value={filters.status ?? "all"}
        onValueChange={(v) => onStatusChange(v as TenantStatus | "all")}
      >
        <SelectTrigger className="h-8 w-[140px]">
          <SelectValue placeholder="Estado" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos los estados</SelectItem>
          <SelectItem value="active">Activo</SelectItem>
          <SelectItem value="inactive">Inactivo</SelectItem>
          <SelectItem value="pending">Pendiente</SelectItem>
        </SelectContent>
      </Select>

      <Select
        value={filters.paymentStatus ?? "all"}
        onValueChange={(v) => onPaymentStatusChange(v as TenantPaymentStatus | "all")}
      >
        <SelectTrigger className="h-8 w-[140px]">
          <SelectValue placeholder="Pagos" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos los pagos</SelectItem>
          <SelectItem value="al_dia">Al día</SelectItem>
          <SelectItem value="atrasado">Atrasado</SelectItem>
          <SelectItem value="pendiente">Pendiente</SelectItem>
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
