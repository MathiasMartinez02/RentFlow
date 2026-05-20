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
  ArrowUpDown, ArrowUp, ArrowDown,
  ChevronLeft, ChevronRight,
  Pencil, Trash2, Eye, MoreHorizontal,
  Banknote, CreditCard, ArrowRightLeft, Repeat,
  AlertTriangle,
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatCurrency, formatDate, getInitials } from "@/shared/utils/format";
import { useCatalogStore } from "@/store/catalog.store";
import type { Payment, PaymentStatus } from "@/types/payment";

const PERIOD_LABELS: Record<string, string> = {
  "01": "Enero", "02": "Febrero", "03": "Marzo", "04": "Abril",
  "05": "Mayo", "06": "Junio", "07": "Julio", "08": "Agosto",
  "09": "Septiembre", "10": "Octubre", "11": "Noviembre", "12": "Diciembre",
};

function formatPeriod(period: string): string {
  const [year, month] = period.split("-");
  return `${PERIOD_LABELS[month] ?? month} ${year}`;
}

type StatusConfig = {
  label: string;
  variant: "success" | "default" | "warning" | "destructive" | "secondary";
};

const STATUS_MAP: Record<PaymentStatus, StatusConfig> = {
  paid: { label: "Pagado", variant: "success" },
  pending: { label: "Pendiente", variant: "default" },
  overdue: { label: "Vencido", variant: "destructive" },
  partial: { label: "Parcial", variant: "warning" },
  cancelled: { label: "Cancelado", variant: "secondary" },
};

const METHOD_CONFIG = {
  transfer: { label: "Transferencia", icon: ArrowRightLeft },
  cash: { label: "Efectivo", icon: Banknote },
  card: { label: "Tarjeta", icon: CreditCard },
  auto_debit: { label: "Débito Auto.", icon: Repeat },
};

function getDaysOverdue(dueDate: string): number {
  return Math.floor((Date.now() - new Date(dueDate).getTime()) / 86400000);
}

function SortableHeader({ column, label }: { column: Column<Payment, unknown>; label: string }) {
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

interface PaymentTableProps {
  payments: Payment[];
  isLoading?: boolean;
  onView: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

export function PaymentTable({ payments, isLoading, onView, onEdit, onDelete }: PaymentTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);

  const { properties, tenants } = useCatalogStore();
  const propertyMap = useMemo(() => new Map(properties.map((p) => [p.id, p])), [properties]);
  const tenantMap = useMemo(() => new Map(tenants.map((t) => [t.id, t])), [tenants]);

  const columns: ColumnDef<Payment>[] = useMemo(
    () => [
      {
        id: "tenant",
        header: () => <span className="text-xs font-medium text-muted-foreground">Inquilino</span>,
        cell: ({ row }) => {
          const tenant = tenantMap.get(row.original.tenantId);
          if (!tenant) return <span className="text-xs italic text-muted-foreground/60">—</span>;
          return (
            <div className="flex items-center gap-2.5">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[10px] font-semibold text-primary">
                {getInitials(tenant.firstName, tenant.lastName)}
              </div>
              <div className="min-w-0">
                <p className="truncate text-xs font-medium text-foreground">
                  {tenant.firstName} {tenant.lastName}
                </p>
                <p className="truncate text-[11px] text-muted-foreground">{row.original.concept}</p>
              </div>
            </div>
          );
        },
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
              <span className="text-[11px] text-muted-foreground">{prop.city}</span>
            </div>
          );
        },
      },
      {
        id: "period",
        accessorKey: "period",
        header: ({ column }) => (
          <SortableHeader column={column as Column<Payment, unknown>} label="Período" />
        ),
        cell: ({ row }) => (
          <span className="text-xs font-medium text-foreground">
            {formatPeriod(row.original.period)}
          </span>
        ),
      },
      {
        accessorKey: "dueDate",
        header: ({ column }) => (
          <SortableHeader column={column as Column<Payment, unknown>} label="Vencimiento" />
        ),
        cell: ({ row }) => {
          const isOverdue = row.original.status === "overdue";
          const days = isOverdue ? getDaysOverdue(row.original.dueDate) : null;
          return (
            <div className="flex flex-col gap-0.5">
              <span className={cn("text-xs font-medium", isOverdue ? "text-destructive" : "text-foreground")}>
                {formatDate(row.original.dueDate, "short")}
              </span>
              {isOverdue && days !== null && (
                <div className="flex items-center gap-1 text-[11px] text-destructive">
                  <AlertTriangle className="h-2.5 w-2.5" />
                  {days}d de mora
                </div>
              )}
            </div>
          );
        },
      },
      {
        accessorKey: "paidDate",
        header: () => <span className="text-xs font-medium text-muted-foreground">Fecha Pago</span>,
        cell: ({ row }) => (
          <span className="text-xs text-muted-foreground">
            {row.original.paidDate ? formatDate(row.original.paidDate, "short") : "—"}
          </span>
        ),
      },
      {
        id: "method",
        header: () => <span className="text-xs font-medium text-muted-foreground">Método</span>,
        cell: ({ row }) => {
          const method = row.original.method;
          if (!method) return <span className="text-xs text-muted-foreground/60">—</span>;
          const config = METHOD_CONFIG[method];
          const MethodIcon = config.icon;
          return (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <MethodIcon className="h-3 w-3" />
              {config.label}
            </div>
          );
        },
      },
      {
        accessorKey: "amount",
        header: ({ column }) => (
          <SortableHeader column={column as Column<Payment, unknown>} label="Monto" />
        ),
        cell: ({ row }) => {
          const { amount, paidAmount, status } = row.original;
          return (
            <div className="flex flex-col gap-0.5">
              <span className="text-sm font-semibold text-foreground">
                {formatCurrency(amount)}
              </span>
              {status === "partial" && paidAmount !== undefined && (
                <span className="text-[11px] text-warning">
                  Cobrado: {formatCurrency(paidAmount)}
                </span>
              )}
            </div>
          );
        },
      },
      {
        id: "status",
        accessorKey: "status",
        header: ({ column }) => (
          <SortableHeader column={column as Column<Payment, unknown>} label="Estado" />
        ),
        cell: ({ row }) => {
          const config = STATUS_MAP[row.original.status];
          return <Badge variant={config.variant}>{config.label}</Badge>;
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
                  Ver detalle
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
    data: payments,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 10 } },
  });

  if (isLoading) {
    return (
      <div className="rounded-xl border border-border overflow-hidden">
        <div className="divide-y divide-border">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 p-4">
              <div className="flex items-center gap-2.5">
                <Skeleton className="h-7 w-7 rounded-full" />
                <div className="space-y-1">
                  <Skeleton className="h-3 w-28" />
                  <Skeleton className="h-2.5 w-20" />
                </div>
              </div>
              <Skeleton className="h-3 w-24 flex-1" />
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-5 w-16 rounded-full" />
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
                <td colSpan={columns.length} className="py-12 text-center text-sm text-muted-foreground">
                  No se encontraron pagos
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => {
                const isOverdue = row.original.status === "overdue";
                const isPartial = row.original.status === "partial";
                const isCancelled = row.original.status === "cancelled";

                return (
                  <tr
                    key={row.id}
                    className={cn(
                      "group cursor-pointer transition-colors hover:bg-accent/40",
                      isOverdue && "bg-destructive/5 hover:bg-destructive/10",
                      isPartial && "bg-warning/5 hover:bg-warning/10",
                      isCancelled && "opacity-60 hover:opacity-80"
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
            payments.length
          )}{" "}
          de {payments.length}
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
