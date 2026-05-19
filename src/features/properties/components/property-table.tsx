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
  type VisibilityState,
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
import { formatCurrency, getInitials, formatDate } from "@/shared/utils/format";
import type { Property } from "@/types/property";
import type { Tenant } from "@/types/tenant";
import type { Contract } from "@/types/contract";

const STATUS_BADGE: Record<
  Property["status"],
  { label: string; variant: "success" | "default" | "warning" | "secondary" }
> = {
  occupied: { label: "Ocupado", variant: "success" },
  available: { label: "Disponible", variant: "default" },
  maintenance: { label: "Mantenimiento", variant: "warning" },
  reserved: { label: "Reservado", variant: "secondary" },
};

function SortableHeader({
  column,
  label,
}: {
  column: Column<Property, unknown>;
  label: string;
}) {
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

interface PropertyTableProps {
  properties: Property[];
  tenants: Tenant[];
  contracts: Contract[];
  isLoading?: boolean;
  onView: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

export function PropertyTable({
  properties,
  tenants,
  contracts,
  isLoading,
  onView,
  onEdit,
  onDelete,
}: PropertyTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});

  const tenantMap = useMemo(
    () => new Map(tenants.map((t) => [t.id, t])),
    [tenants]
  );
  const contractMap = useMemo(
    () => new Map(contracts.map((c) => [c.id, c])),
    [contracts]
  );

  const columns: ColumnDef<Property>[] = useMemo(
    () => [
      {
        id: "property",
        accessorKey: "name",
        header: ({ column }) => <SortableHeader column={column as Column<Property, unknown>} label="Propiedad" />,
        cell: ({ row }) => {
          const p = row.original;
          return (
            <button
              className="flex flex-col items-start gap-0.5 text-left"
              onClick={() => onView(p.id)}
            >
              <span className="text-sm font-medium text-foreground hover:text-primary transition-colors">
                {p.name}
              </span>
              <span className="text-xs text-muted-foreground">
                {p.city}, {p.state}
              </span>
            </button>
          );
        },
      },
      {
        accessorKey: "status",
        header: ({ column }) => <SortableHeader column={column as Column<Property, unknown>} label="Estado" />,
        cell: ({ row }) => {
          const s = STATUS_BADGE[row.original.status];
          return <Badge variant={s.variant}>{s.label}</Badge>;
        },
      },
      {
        accessorKey: "type",
        header: ({ column }) => <SortableHeader column={column as Column<Property, unknown>} label="Tipo" />,
        cell: ({ row }) => (
          <span className="text-xs capitalize text-muted-foreground">{row.original.type}</span>
        ),
      },
      {
        id: "tenant",
        header: () => <span className="text-xs font-medium text-muted-foreground">Inquilino</span>,
        cell: ({ row }) => {
          const tenant = row.original.tenantId ? tenantMap.get(row.original.tenantId) : null;
          if (!tenant) {
            return <span className="text-xs italic text-muted-foreground/60">—</span>;
          }
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
        accessorKey: "rent",
        header: ({ column }) => <SortableHeader column={column as Column<Property, unknown>} label="Alquiler Mensual" />,
        cell: ({ row }) => (
          <span className="text-sm font-semibold text-foreground">
            {formatCurrency(row.original.rent)}
          </span>
        ),
      },
      {
        id: "leaseEnd",
        header: () => (
          <span className="text-xs font-medium text-muted-foreground">Fin de Contrato</span>
        ),
        cell: ({ row }) => {
          const contract = row.original.contractId
            ? contractMap.get(row.original.contractId)
            : null;
          if (!contract) return <span className="text-xs text-muted-foreground/60">—</span>;
          const isExpiringSoon =
            new Date(contract.endDate).getTime() - Date.now() < 1000 * 60 * 60 * 24 * 60;
          return (
            <span
              className={cn(
                "text-xs",
                isExpiringSoon ? "font-medium text-warning" : "text-muted-foreground"
              )}
            >
              {formatDate(contract.endDate, "short")}
            </span>
          );
        },
      },
      {
        accessorKey: "area",
        header: ({ column }) => <SortableHeader column={column as Column<Property, unknown>} label="Superficie" />,
        cell: ({ row }) => (
          <span className="text-xs text-muted-foreground">
            {row.original.area.toLocaleString()} m²
          </span>
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
    [tenantMap, contractMap, onView, onEdit, onDelete]
  );

  const table = useReactTable({
    data: properties,
    columns,
    state: { sorting, columnVisibility },
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
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
              <Skeleton className="h-9 w-9 rounded-lg" />
              <div className="flex-1 space-y-1.5">
                <Skeleton className="h-3.5 w-40" />
                <Skeleton className="h-3 w-24" />
              </div>
              <Skeleton className="h-5 w-16 rounded-full" />
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-4 w-16" />
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
      {/* Table */}
      <div className="rounded-xl border border-border overflow-hidden">
        <table className="w-full">
          <thead className="border-b border-border bg-muted/30">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
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
                  No se encontraron propiedades
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  className="group cursor-pointer transition-colors hover:bg-accent/40"
                  onClick={() => onView(row.original.id)}
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-4 py-3 first:pl-4 last:pr-4">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>
          Mostrando {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1}
          –
          {Math.min(
            (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
            properties.length
          )}{" "}
          de {properties.length}
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
