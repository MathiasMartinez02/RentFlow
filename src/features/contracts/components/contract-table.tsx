"use client";

import { useState, useMemo } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  flexRender,
  type ColumnDef,
  type Column,
  type SortingState,
} from "@tanstack/react-table";
import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  ChevronLeft,
  ChevronRight,
  Pencil,
  Trash2,
  Eye,
  MoreHorizontal,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatCurrency, formatDate, getInitials, getContractCode } from "@/shared/utils/format";
import { useCatalogStore } from "@/store/catalog.store";
import type { Contract } from "@/types/contract";
import { getDaysLeft, isExpiringSoon } from "../hooks/use-contracts";

type StatusDisplay = {
  label: string;
  variant: "success" | "default" | "warning" | "secondary" | "destructive";
};

function getStatusDisplay(contract: Contract): StatusDisplay {
  if (isExpiringSoon(contract)) {
    const days = getDaysLeft(contract.endDate);
    return {
      label: days <= 15 ? `Vence en ${days}d` : "Por vencer",
      variant: days <= 15 ? "destructive" : "warning",
    };
  }
  const map: Record<Contract["status"], StatusDisplay> = {
    active: { label: "Activo", variant: "success" },
    expired: { label: "Vencido", variant: "secondary" },
    pending: { label: "Pendiente", variant: "default" },
    terminated: { label: "Rescindido", variant: "secondary" },
  };
  return map[contract.status];
}

function SortableHeader({ column, label }: { column: Column<Contract, unknown>; label: string }) {
  const sorted = column.getIsSorted();
  return (
    <button
      className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
      onClick={() => column.toggleSorting(sorted === "asc")}
    >
      {label}
      {sorted === "asc" ? (
        <ArrowUp className="h-3 w-3" />
      ) : sorted === "desc" ? (
        <ArrowDown className="h-3 w-3" />
      ) : (
        <ArrowUpDown className="h-3 w-3 opacity-40" />
      )}
    </button>
  );
}

interface ContractTableProps {
  contracts: Contract[];
  isLoading?: boolean;
  onView: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

export function ContractTable({ contracts, isLoading, onView, onEdit, onDelete }: ContractTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const { properties, tenants } = useCatalogStore();

  const propertyMap = useMemo(() => new Map(properties.map((p) => [p.id, p])), [properties]);
  const tenantMap = useMemo(() => new Map(tenants.map((t) => [t.id, t])), [tenants]);

  const columns: ColumnDef<Contract>[] = useMemo(
    () => [
      {
        id: "code",
        accessorFn: (row) => getContractCode(row.id, row.startDate),
        header: ({ column }) => (
          <SortableHeader column={column as Column<Contract, unknown>} label="Código" />
        ),
        cell: ({ row }) => (
          <button
            className="font-mono text-xs font-semibold text-primary hover:underline"
            onClick={() => onView(row.original.id)}
          >
            {getContractCode(row.original.id, row.original.startDate)}
          </button>
        ),
      },
      {
        id: "property",
        header: () => <span className="text-xs font-medium text-muted-foreground">Propiedad</span>,
        cell: ({ row }) => {
          const prop = propertyMap.get(row.original.propertyId);
          if (!prop) return <span className="text-xs italic text-muted-foreground/60">—</span>;
          return (
            <div className="flex flex-col gap-0.5">
              <span className="text-xs font-medium text-foreground">{prop.name}</span>
              <span className="text-xs text-muted-foreground">{prop.city}</span>
            </div>
          );
        },
      },
      {
        id: "tenant",
        header: () => <span className="text-xs font-medium text-muted-foreground">Inquilino</span>,
        cell: ({ row }) => {
          const tenant = tenantMap.get(row.original.tenantId);
          if (!tenant) return <span className="text-xs italic text-muted-foreground/60">—</span>;
          return (
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[10px] font-semibold text-primary">
                {getInitials(tenant.firstName, tenant.lastName)}
              </div>
              <span className="text-xs font-medium text-foreground">
                {tenant.firstName} {tenant.lastName}
              </span>
            </div>
          );
        },
      },
      {
        id: "period",
        accessorKey: "startDate",
        header: ({ column }) => (
          <SortableHeader column={column as Column<Contract, unknown>} label="Período" />
        ),
        cell: ({ row }) => (
          <div className="flex flex-col gap-0.5">
            <span className="text-xs text-muted-foreground">
              {formatDate(row.original.startDate, "short")}
            </span>
            <span className="text-xs font-medium text-foreground">
              → {formatDate(row.original.endDate, "short")}
            </span>
          </div>
        ),
      },
      {
        accessorKey: "monthlyRent",
        header: ({ column }) => (
          <SortableHeader column={column as Column<Contract, unknown>} label="Monto Mensual" />
        ),
        cell: ({ row }) => (
          <div className="flex flex-col gap-0.5">
            <span className="text-sm font-semibold text-foreground">
              {formatCurrency(row.original.monthlyRent)}
            </span>
            {row.original.expenses && (
              <span className="text-[11px] text-muted-foreground">
                +{formatCurrency(row.original.expenses)} expensas
              </span>
            )}
          </div>
        ),
      },
      {
        id: "status",
        accessorKey: "status",
        header: ({ column }) => (
          <SortableHeader column={column as Column<Contract, unknown>} label="Estado" />
        ),
        cell: ({ row }) => {
          const s = getStatusDisplay(row.original);
          return <Badge variant={s.variant}>{s.label}</Badge>;
        },
      },
      {
        accessorKey: "renewalOption",
        header: () => (
          <span className="text-xs font-medium text-muted-foreground">Renovación</span>
        ),
        cell: ({ row }) =>
          row.original.renewalOption ? (
            <div className="flex items-center gap-1 text-xs text-success">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Automática
            </div>
          ) : (
            <div className="flex items-center gap-1 text-xs text-muted-foreground/60">
              <XCircle className="h-3.5 w-3.5" />
              Manual
            </div>
          ),
      },
      {
        id: "actions",
        enableHiding: false,
        cell: ({ row }) => (
          <div onClick={(e) => e.stopPropagation()}>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-7 w-7">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40">
                <DropdownMenuItem onClick={() => onView(row.original.id)}>
                  <Eye className="mr-2 h-4 w-4" />
                  Ver
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onEdit(row.original.id)}>
                  <Pencil className="mr-2 h-4 w-4" />
                  Editar
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => onDelete(row.original.id)}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Eliminar
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ),
      },
    ],
    [propertyMap, tenantMap, onView, onEdit, onDelete]
  );

  const table = useReactTable({
    data: contracts,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 8 } },
  });

  if (isLoading) {
    return (
      <div className="rounded-xl border border-border overflow-hidden">
        <div className="divide-y divide-border">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 p-4">
              <Skeleton className="h-4 w-24 rounded" />
              <div className="flex-1 space-y-1.5">
                <Skeleton className="h-3.5 w-36" />
                <Skeleton className="h-3 w-20" />
              </div>
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-5 w-14 rounded-full" />
              <Skeleton className="h-7 w-7 rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
      className="space-y-3"
    >
      <div className="rounded-xl border border-border overflow-hidden">
        <table className="w-full">
          <thead className="border-b border-border bg-muted/30">
            {table.getHeaderGroups().map((hg) => (
              <tr key={hg.id}>
                {hg.headers.map((header) => (
                  <th
                    key={header.id}
                    className="whitespace-nowrap px-4 py-3 text-left first:pl-4 last:pr-4"
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="divide-y divide-border">
            {table.getRowModel().rows.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="py-12 text-center text-sm text-muted-foreground"
                >
                  No se encontraron contratos
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => {
                const daysLeft =
                  row.original.status === "active"
                    ? getDaysLeft(row.original.endDate)
                    : null;
                const isUrgent = daysLeft !== null && daysLeft <= 15 && daysLeft > 0;
                const isWarning =
                  daysLeft !== null && daysLeft > 15 && daysLeft <= 90;
                const isInactive =
                  row.original.status === "expired" ||
                  row.original.status === "terminated";

                return (
                  <tr
                    key={row.id}
                    className={cn(
                      "group cursor-pointer transition-colors hover:bg-accent/40",
                      isUrgent && "bg-destructive/5 hover:bg-destructive/10",
                      isWarning && "bg-warning/5 hover:bg-warning/10",
                      isInactive && "opacity-60 hover:opacity-80"
                    )}
                    onClick={() => onView(row.original.id)}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="px-4 py-3 first:pl-4 last:pr-4">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>
          Mostrando{" "}
          {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1}–
          {Math.min(
            (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
            contracts.length
          )}{" "}
          de {contracts.length}
        </span>
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="icon"
            className="h-7 w-7"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronLeft className="h-3.5 w-3.5" />
          </Button>
          <span className="px-2">
            {table.getState().pagination.pageIndex + 1} / {table.getPageCount()}
          </span>
          <Button
            variant="outline"
            size="icon"
            className="h-7 w-7"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            <ChevronRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
