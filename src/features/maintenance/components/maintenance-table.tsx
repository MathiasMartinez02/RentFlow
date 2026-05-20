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
  Eye, Pencil, Trash2, MoreHorizontal,
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
import { formatCurrency, formatDate } from "@/shared/utils/format";
import { useCatalogStore } from "@/store/catalog.store";
import type { MaintenanceTicket } from "@/types/maintenance";

const STATUS_CONFIG = {
  pending: { label: "Pendiente", variant: "secondary" as const },
  in_progress: { label: "En Progreso", variant: "default" as const },
  waiting_parts: { label: "Esperando Repuestos", variant: "warning" as const },
  resolved: { label: "Resuelto", variant: "success" as const },
  closed: { label: "Cerrado", variant: "secondary" as const },
};

const PRIORITY_CONFIG = {
  urgent: { label: "Urgente", class: "bg-destructive/10 text-destructive border-destructive/20" },
  high: { label: "Alta", class: "bg-orange-500/10 text-orange-500 border-orange-500/20" },
  medium: { label: "Media", class: "bg-warning/10 text-warning border-warning/20" },
  low: { label: "Baja", class: "bg-muted text-muted-foreground border-border" },
} as const;

const CATEGORY_LABELS: Record<string, string> = {
  plumbing: "Plomería",
  electrical: "Electricidad",
  painting: "Pintura",
  cleaning: "Limpieza",
  security: "Seguridad",
  general: "General",
};

function SortableHeader({ column, label }: { column: Column<MaintenanceTicket, unknown>; label: string }) {
  const sorted = column.getIsSorted();
  return (
    <button
      className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
      onClick={() => column.toggleSorting(sorted === "asc")}
    >
      {label}
      {sorted === "asc" ? <ArrowUp className="h-3 w-3" />
        : sorted === "desc" ? <ArrowDown className="h-3 w-3" />
        : <ArrowUpDown className="h-3 w-3 opacity-40" />}
    </button>
  );
}

interface MaintenanceTableProps {
  tickets: MaintenanceTicket[];
  isLoading?: boolean;
  onView: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

export function MaintenanceTable({ tickets, isLoading, onView, onEdit, onDelete }: MaintenanceTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);

  const allProperties = useCatalogStore((s) => s.properties);
  const propertyMap = useMemo(
    () => new Map(allProperties.map((p) => [p.id, p])),
    [allProperties]
  );
  const technicianMap = new Map(); // no separate technicians endpoint

  const columns: ColumnDef<MaintenanceTicket>[] = useMemo(
    () => [
      {
        accessorKey: "title",
        header: ({ column }) => <SortableHeader column={column as Column<MaintenanceTicket, unknown>} label="Título" />,
        cell: ({ row }) => {
          const t = row.original;
          return (
            <button
              className="flex flex-col items-start gap-0.5 text-left max-w-[240px]"
              onClick={() => onView(t.id)}
            >
              <span className="text-sm font-medium text-foreground hover:text-primary transition-colors truncate max-w-full">
                {t.title}
              </span>
              <span className="text-[11px] text-muted-foreground">{CATEGORY_LABELS[t.category]}</span>
            </button>
          );
        },
      },
      {
        accessorKey: "priority",
        header: ({ column }) => <SortableHeader column={column as Column<MaintenanceTicket, unknown>} label="Prioridad" />,
        cell: ({ row }) => {
          const cfg = PRIORITY_CONFIG[row.original.priority];
          return (
            <span className={cn("rounded-full border px-2 py-0.5 text-[11px] font-semibold", cfg.class)}>
              {cfg.label}
            </span>
          );
        },
      },
      {
        accessorKey: "status",
        header: ({ column }) => <SortableHeader column={column as Column<MaintenanceTicket, unknown>} label="Estado" />,
        cell: ({ row }) => {
          const cfg = STATUS_CONFIG[row.original.status];
          return <Badge variant={cfg.variant}>{cfg.label}</Badge>;
        },
      },
      {
        id: "property",
        header: () => <span className="text-xs font-medium text-muted-foreground">Propiedad</span>,
        cell: ({ row }) => {
          const prop = propertyMap.get(row.original.propertyId);
          return (
            <span className="text-xs text-muted-foreground">
              {prop?.name ?? row.original.propertyId}
            </span>
          );
        },
      },
      {
        id: "technician",
        header: () => <span className="text-xs font-medium text-muted-foreground">Técnico</span>,
        cell: ({ row }) => {
          const tech = row.original.assignedTo ? technicianMap.get(row.original.assignedTo) : null;
          if (!tech) return <span className="text-xs italic text-muted-foreground/60">Sin asignar</span>;
          return (
            <div className="flex items-center gap-1.5">
              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-[9px] font-bold text-primary shrink-0">
                {tech.name.charAt(0)}
              </div>
              <span className="text-xs text-foreground">{tech.name.split(" ")[0]}</span>
            </div>
          );
        },
      },
      {
        accessorKey: "estimatedCost",
        header: ({ column }) => <SortableHeader column={column as Column<MaintenanceTicket, unknown>} label="Costo Est." />,
        cell: ({ row }) => {
          const t = row.original;
          const cost = t.finalCost ?? t.estimatedCost;
          if (!cost) return <span className="text-xs text-muted-foreground/60">—</span>;
          return (
            <span className="text-sm font-semibold text-foreground">{formatCurrency(cost)}</span>
          );
        },
      },
      {
        accessorKey: "reportedAt",
        header: ({ column }) => <SortableHeader column={column as Column<MaintenanceTicket, unknown>} label="Reportado" />,
        cell: ({ row }) => (
          <span className="text-xs text-muted-foreground">
            {formatDate(row.original.reportedAt, "short")}
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
                  <Eye className="mr-2 h-4 w-4" /> Ver
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onEdit(row.original.id)}>
                  <Pencil className="mr-2 h-4 w-4" /> Editar
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => onDelete(row.original.id)}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="mr-2 h-4 w-4" /> Eliminar
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ),
      },
    ],
    [propertyMap, technicianMap, onView, onEdit, onDelete]
  );

  const table = useReactTable({
    data: tickets,
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
              <div className="flex-1 space-y-1.5">
                <Skeleton className="h-3.5 w-48" />
                <Skeleton className="h-3 w-24" />
              </div>
              <Skeleton className="h-5 w-16 rounded-full" />
              <Skeleton className="h-5 w-20 rounded-full" />
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-4 w-20" />
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
                  <th key={header.id} className="whitespace-nowrap px-4 py-3 text-left first:pl-4 last:pr-4">
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="divide-y divide-border">
            {table.getRowModel().rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="py-12 text-center text-sm text-muted-foreground">
                  No se encontraron tickets
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => {
                const isUrgent = row.original.priority === "urgent" && row.original.status !== "closed";
                return (
                  <tr
                    key={row.id}
                    className={cn(
                      "group cursor-pointer transition-colors hover:bg-accent/40",
                      isUrgent && "bg-destructive/3"
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
            tickets.length
          )}{" "}
          de {tickets.length}
        </span>
        <div className="flex items-center gap-1">
          <Button variant="outline" size="icon" className="h-7 w-7"
            onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
            <ChevronLeft className="h-3.5 w-3.5" />
          </Button>
          <span className="px-2">
            {table.getState().pagination.pageIndex + 1} / {table.getPageCount()}
          </span>
          <Button variant="outline" size="icon" className="h-7 w-7"
            onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
            <ChevronRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
