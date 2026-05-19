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
import type { PaymentFilters, PaymentStatus } from "@/types/payment";

interface PaymentFiltersBarProps {
  filters: PaymentFilters;
  hasActiveFilters: boolean;
  onSearchChange: (q: string) => void;
  onStatusChange: (s: PaymentStatus | "all") => void;
  onPeriodChange: (p: string) => void;
  onClear: () => void;
}

export function PaymentFiltersBar({
  filters,
  hasActiveFilters,
  onSearchChange,
  onStatusChange,
  onPeriodChange,
  onClear,
}: PaymentFiltersBarProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="relative min-w-[200px] flex-1">
        <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Buscar por inquilino, concepto, referencia..."
          value={filters.search ?? ""}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-8 h-8 text-sm"
        />
      </div>

      <Select
        value={filters.status ?? "all"}
        onValueChange={(v) => onStatusChange(v as PaymentStatus | "all")}
      >
        <SelectTrigger className="h-8 w-[160px] text-sm">
          <SelectValue placeholder="Todos los estados" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos los estados</SelectItem>
          <SelectItem value="paid">Pagado</SelectItem>
          <SelectItem value="pending">Pendiente</SelectItem>
          <SelectItem value="overdue">Vencido</SelectItem>
          <SelectItem value="partial">Parcial</SelectItem>
          <SelectItem value="cancelled">Cancelado</SelectItem>
        </SelectContent>
      </Select>

      <Input
        type="month"
        value={filters.period ?? ""}
        onChange={(e) => onPeriodChange(e.target.value)}
        className="h-8 w-[160px] text-sm"
      />

      {hasActiveFilters && (
        <Button variant="ghost" size="sm" onClick={onClear} className="h-8 gap-1.5 text-muted-foreground">
          <X className="h-3.5 w-3.5" />
          Limpiar
        </Button>
      )}
    </div>
  );
}
