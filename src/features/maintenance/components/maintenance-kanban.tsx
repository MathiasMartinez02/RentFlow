"use client";

import { useState, useRef } from "react";
import { motion } from "framer-motion";
import {
  Clock, Wrench, Package, CheckCircle2, Archive,
  AlertTriangle, MoreHorizontal, Pencil, Trash2, Eye,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatCurrency, formatDate } from "@/shared/utils/format";
import { useCatalogStore } from "@/store/catalog.store";
import { usePermissions } from "@/hooks/use-permissions";
import type { MaintenanceTicket, MaintenanceStatus } from "@/types/maintenance";

const COLUMNS: { status: MaintenanceStatus; label: string; icon: React.ElementType; color: string }[] = [
  { status: "pending", label: "Pendiente", icon: Clock, color: "text-muted-foreground" },
  { status: "in_progress", label: "En Progreso", icon: Wrench, color: "text-primary" },
  { status: "waiting_parts", label: "Esperando Repuestos", icon: Package, color: "text-warning" },
  { status: "resolved", label: "Resuelto", icon: CheckCircle2, color: "text-success" },
  { status: "closed", label: "Cerrado", icon: Archive, color: "text-muted-foreground/60" },
];

const PRIORITY_CONFIG = {
  urgent: { label: "Urgente", class: "bg-destructive/10 text-destructive border-destructive/20" },
  high: { label: "Alta", class: "bg-orange-500/10 text-orange-500 border-orange-500/20" },
  medium: { label: "Media", class: "bg-warning/10 text-warning border-warning/20" },
  low: { label: "Baja", class: "bg-muted text-muted-foreground border-border" },
} as const;

const CATEGORY_ICONS: Record<string, string> = {
  plumbing: "🔧",
  electrical: "⚡",
  painting: "🎨",
  cleaning: "🧹",
  security: "🔒",
  general: "🏠",
};

interface KanbanCardProps {
  ticket: MaintenanceTicket;
  onView: (id: string) => void;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onDragStart: (e: React.DragEvent, id: string) => void;
}

function KanbanCard({ ticket, onView, onEdit, onDelete, onDragStart }: KanbanCardProps) {
  const { is } = usePermissions();
  const hideCosts = is("INQUILINO");
  const allProperties = useCatalogStore((s) => s.properties);
  const property = allProperties.find((p) => p.id === ticket.propertyId);
  const technician = null as unknown as { name: string } | null;
  const priority = PRIORITY_CONFIG[ticket.priority];
  const isUrgent = ticket.priority === "urgent";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      draggable
      onDragStart={(e) => onDragStart(e as unknown as React.DragEvent, ticket.id)}
      className={cn(
        "group cursor-grab rounded-lg border bg-card p-3 shadow-sm transition-shadow hover:shadow-md active:cursor-grabbing",
        isUrgent && "border-destructive/30 bg-destructive/3"
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-2 min-w-0">
          <span className="text-base leading-none shrink-0 mt-0.5">
            {CATEGORY_ICONS[ticket.category]}
          </span>
          <button
            className="text-sm font-medium text-foreground hover:text-primary transition-colors text-left leading-snug"
            onClick={() => onView(ticket.id)}
          >
            {ticket.title}
          </button>
        </div>
        <div onClick={(e) => e.stopPropagation()}>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <MoreHorizontal className="h-3.5 w-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-36">
              <DropdownMenuItem onClick={() => onView(ticket.id)}>
                <Eye className="mr-2 h-3.5 w-3.5" /> Ver
              </DropdownMenuItem>
              {onEdit && (
                <DropdownMenuItem onClick={() => onEdit(ticket.id)}>
                  <Pencil className="mr-2 h-3.5 w-3.5" /> Editar
                </DropdownMenuItem>
              )}
              {onDelete && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => onDelete(ticket.id)}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash2 className="mr-2 h-3.5 w-3.5" /> Eliminar
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Priority + urgent indicator */}
      <div className="mt-2 flex items-center gap-1.5 flex-wrap">
        {isUrgent && (
          <span className="flex items-center gap-1 text-[10px] font-semibold text-destructive">
            <AlertTriangle className="h-3 w-3" />
          </span>
        )}
        <span className={cn("rounded-full border px-2 py-0.5 text-[10px] font-semibold", priority.class)}>
          {priority.label}
        </span>
        <span className="rounded-md bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
          {ticket.category === "plumbing" ? "Plomería"
            : ticket.category === "electrical" ? "Electricidad"
            : ticket.category === "painting" ? "Pintura"
            : ticket.category === "cleaning" ? "Limpieza"
            : ticket.category === "security" ? "Seguridad"
            : "General"}
        </span>
      </div>

      {/* Property */}
      {property && (
        <p className="mt-2 text-[11px] text-muted-foreground truncate">{property.name}</p>
      )}

      {/* Footer */}
      <div className="mt-3 flex items-center justify-between gap-2 border-t border-border pt-2">
        <div className="flex items-center gap-1">
          {technician ? (
            <div className="flex items-center gap-1">
              <div className="flex h-4 w-4 items-center justify-center rounded-full bg-primary/15 text-[8px] font-bold text-primary">
                {technician.name.charAt(0)}
              </div>
              <span className="text-[10px] text-muted-foreground truncate max-w-[80px]">
                {technician.name.split(" ")[0]}
              </span>
            </div>
          ) : (
            <span className="text-[10px] italic text-muted-foreground/60">Sin asignar</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {!hideCosts && ticket.estimatedCost && (
            <span className="text-[10px] font-medium text-foreground">
              {formatCurrency(ticket.estimatedCost)}
            </span>
          )}
          <span className="text-[10px] text-muted-foreground">
            {formatDate(ticket.reportedAt, "short")}
          </span>
        </div>
      </div>
    </motion.div>
  );
}

interface KanbanColumnProps {
  status: MaintenanceStatus;
  label: string;
  icon: React.ElementType;
  color: string;
  tickets: MaintenanceTicket[];
  isDragOver: boolean;
  onView: (id: string) => void;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onDragStart: (e: React.DragEvent, id: string) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent, status: MaintenanceStatus) => void;
}

function KanbanColumn({
  status, label, icon: Icon, color, tickets, isDragOver,
  onView, onEdit, onDelete, onDragStart, onDragOver, onDrop,
}: KanbanColumnProps) {
  return (
    <div
      className={cn(
        "flex min-h-[200px] flex-col rounded-xl border border-border bg-muted/20 transition-colors",
        isDragOver && "border-primary/40 bg-primary/5"
      )}
      onDragOver={onDragOver}
      onDrop={(e) => onDrop(e, status)}
    >
      {/* Column header */}
      <div className="flex items-center justify-between px-3 py-2.5 border-b border-border">
        <div className="flex items-center gap-2">
          <Icon className={cn("h-3.5 w-3.5", color)} />
          <span className="text-xs font-semibold text-foreground">{label}</span>
        </div>
        <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-muted px-1.5 text-[10px] font-bold text-muted-foreground">
          {tickets.length}
        </span>
      </div>

      {/* Cards */}
      <div className="flex flex-col gap-2 p-2 flex-1">
        {tickets.length === 0 ? (
          <div className={cn(
            "flex flex-1 items-center justify-center rounded-lg border-2 border-dashed py-8 text-center transition-colors",
            isDragOver ? "border-primary/30" : "border-border/50"
          )}>
            <p className="text-[11px] text-muted-foreground/50">Arrastrá tickets acá</p>
          </div>
        ) : (
          tickets.map((ticket) => (
            <KanbanCard
              key={ticket.id}
              ticket={ticket}
              onView={onView}
              onEdit={onEdit}
              onDelete={onDelete}
              onDragStart={onDragStart}
            />
          ))
        )}
      </div>
    </div>
  );
}

interface MaintenanceKanbanProps {
  tickets: MaintenanceTicket[];
  isLoading?: boolean;
  onView: (id: string) => void;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onStatusChange: (id: string, status: MaintenanceStatus) => void;
}

export function MaintenanceKanban({
  tickets, isLoading, onView, onEdit, onDelete, onStatusChange,
}: MaintenanceKanbanProps) {
  const [dragOverStatus, setDragOverStatus] = useState<MaintenanceStatus | null>(null);
  const draggingId = useRef<string | null>(null);

  const handleDragStart = (e: React.DragEvent, id: string) => {
    draggingId.current = id;
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent, status: MaintenanceStatus) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverStatus(status);
  };

  const handleDrop = (e: React.DragEvent, status: MaintenanceStatus) => {
    e.preventDefault();
    setDragOverStatus(null);
    if (draggingId.current) {
      const ticket = tickets.find((t) => t.id === draggingId.current);
      if (ticket && ticket.status !== status) {
        onStatusChange(draggingId.current, status);
      }
      draggingId.current = null;
    }
  };

  const handleDragEnd = () => {
    setDragOverStatus(null);
    draggingId.current = null;
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-5 gap-3">
        {COLUMNS.map((col) => (
          <div key={col.status} className="rounded-xl border border-border bg-muted/20 p-3 space-y-2">
            <Skeleton className="h-4 w-24" />
            {Array.from({ length: col.status === "pending" ? 3 : col.status === "in_progress" ? 2 : 1 }).map((_, i) => (
              <Skeleton key={i} className="h-24 w-full rounded-lg" />
            ))}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div
      className="grid gap-3 overflow-x-auto pb-2"
      style={{ gridTemplateColumns: `repeat(${COLUMNS.length}, minmax(220px, 1fr))` }}
      onDragEnd={handleDragEnd}
    >
      {COLUMNS.map((col) => (
        <KanbanColumn
          key={col.status}
          {...col}
          tickets={tickets.filter((t) => t.status === col.status)}
          isDragOver={dragOverStatus === col.status}
          onView={onView}
          onEdit={onEdit}
          onDelete={onDelete}
          onDragStart={handleDragStart}
          onDragOver={(e) => handleDragOver(e, col.status)}
          onDrop={handleDrop}
        />
      ))}
    </div>
  );
}
