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
import { getInitials, formatDate } from "@/shared/utils/format";
import { useCatalogStore } from "@/store/catalog.store";
import type { Tenant } from "@/types/tenant";

const STATUS_BADGE: Record<
  Tenant["status"],
  { label: string; variant: "success" | "default" | "warning" | "secondary" }
> = {
  active: { label: "Activo", variant: "success" },
  inactive: { label: "Inactivo", variant: "secondary" },
  pending: { label: "Pendiente", variant: "warning" },
};

const PAYMENT_BADGE: Record<
  NonNullable<Tenant["paymentStatus"]>,
  { label: string; variant: "success" | "destructive" | "warning" }
> = {
  al_dia: { label: "Al día", variant: "success" },
  atrasado: { label: "Atrasado", variant: "destructive" },
  pendiente: { label: "Pendiente", variant: "warning" },
};

function SortableHeader({
  column,
  label,
}: {
  column: Column<Tenant, unknown>;
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

interface TenantTableProps {
  tenants: Tenant[];
  isLoading?: boolean;
  onView: (id: string) => void;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
}

export function TenantTable({ tenants, isLoading, onView, onEdit, onDelete }: TenantTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const allProperties = useCatalogStore((s) => s.properties);

  const propertyMap = useMemo(
    () => new Map(allProperties.map((p) => [p.id, p])),
    [allProperties]
  );

  const columns: ColumnDef<Tenant>[] = useMemo(
    () => [
      {
        id: "tenant",
        accessorFn: (row) => `${row.firstName} ${row.lastName}`,
        header: ({ column }) => <SortableHeader column={column as Column<Tenant, unknown>} label="Inquilino" />,
        cell: ({ row }) => {
          const t = row.original;
          return (
            <button
              className="flex items-center gap-3 text-left"
              onClick={() => onView(t.id)}
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                {getInitials(t.firstName, t.lastName)}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-foreground hover:text-primary transition-colors">
                  {t.firstName} {t.lastName}
                </p>
                <p className="text-xs text-muted-foreground truncate max-w-[160px]">{t.email}</p>
              </div>
            </button>
          );
        },
      },
      {
        id: "property",
        header: () => <span className="text-xs font-medium text-muted-foreground">Propiedad</span>,
        cell: ({ row }) => {
          const prop = row.original.propertyId ? propertyMap.get(row.original.propertyId) : null;
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
        accessorKey: "phone",
        header: () => <span className="text-xs font-medium text-muted-foreground">Teléfono</span>,
        cell: ({ row }) => (
          <span className="text-xs text-muted-foreground">{row.original.phone}</span>
        ),
      },
      {
        accessorKey: "status",
        header: ({ column }) => <SortableHeader column={column as Column<Tenant, unknown>} label="Estado" />,
        cell: ({ row }) => {
          const s = STATUS_BADGE[row.original.status];
          return <Badge variant={s.variant}>{s.label}</Badge>;
        },
      },
      {
        accessorKey: "paymentStatus",
        header: ({ column }) => <SortableHeader column={column as Column<Tenant, unknown>} label="Pagos" />,
        cell: ({ row }) => {
          const ps = row.original.paymentStatus;
          if (!ps) return <span className="text-xs text-muted-foreground/60">—</span>;
          const p = PAYMENT_BADGE[ps];
          return <Badge variant={p.variant}>{p.label}</Badge>;
        },
      },
      {
        accessorKey: "moveInDate",
        header: ({ column }) => <SortableHeader column={column as Column<Tenant, unknown>} label="Ingreso" />,
        cell: ({ row }) => {
          const d = row.original.moveInDate;
          if (!d) return <span className="text-xs text-muted-foreground/60">—</span>;
          return <span className="text-xs text-muted-foreground">{formatDate(d, "short")}</span>;
        },
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
                {onEdit && (
                  <DropdownMenuItem onClick={() => onEdit(row.original.id)}>
                    <Pencil className="mr-2 h-4 w-4" />
                    Editar
                  </DropdownMenuItem>
                )}
                {onDelete && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => onDelete(row.original.id)}
                      className="text-destructive focus:text-destructive"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Eliminar
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ),
      },
    ],
    [propertyMap, onView, onEdit, onDelete]
  );

  const table = useReactTable({
    data: tenants,
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
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 p-4">
              <Skeleton className="h-8 w-8 rounded-full" />
              <div className="flex-1 space-y-1.5">
                <Skeleton className="h-3.5 w-32" />
                <Skeleton className="h-3 w-40" />
              </div>
              <Skeleton className="h-5 w-16 rounded-full" />
              <Skeleton className="h-5 w-16 rounded-full" />
              <Skeleton className="h-3 w-20" />
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
                  No se encontraron inquilinos
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  className={cn(
                    "group cursor-pointer transition-colors hover:bg-accent/40",
                    row.original.paymentStatus === "atrasado" && "bg-destructive/5 hover:bg-destructive/10"
                  )}
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

      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>
          Mostrando {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1}
          –
          {Math.min(
            (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
            tenants.length
          )}{" "}
          de {tenants.length}
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
