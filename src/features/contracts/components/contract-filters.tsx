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
import type { ContractFilters, ContractStatus } from "@/types/contract";

type ContractStatusFilter = ContractStatus | "expiring_soon" | "all";

interface ContractFiltersBarProps {
  filters: ContractFilters;
  hasActiveFilters: boolean;
  onSearchChange: (value: string) => void;
  onStatusChange: (value: ContractStatusFilter) => void;
  onClear: () => void;
}

export function ContractFiltersBar({
  filters,
  hasActiveFilters,
  onSearchChange,
  onStatusChange,
  onClear,
}: ContractFiltersBarProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Input
        className="h-8 w-full min-w-[200px] flex-1 sm:w-72 sm:flex-none"
        placeholder="Buscar por contrato, propiedad o inquilino..."
        value={filters.search ?? ""}
        onChange={(e) => onSearchChange(e.target.value)}
        startIcon={<Search className="h-3.5 w-3.5" />}
      />

      <Select
        value={(filters.status as string) ?? "all"}
        onValueChange={(v) => onStatusChange(v as ContractStatusFilter)}
      >
        <SelectTrigger className="h-8 w-[180px]">
          <SelectValue placeholder="Estado" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos los estados</SelectItem>
          <SelectItem value="active">Activo</SelectItem>
          <SelectItem value="expiring_soon">Próximo a vencer</SelectItem>
          <SelectItem value="expired">Vencido</SelectItem>
          <SelectItem value="pending">Pendiente</SelectItem>
          <SelectItem value="terminated">Rescindido</SelectItem>
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
