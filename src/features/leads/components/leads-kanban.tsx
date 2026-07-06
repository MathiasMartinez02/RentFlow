"use client";

import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { MoreHorizontal, Pencil, Trash2, Eye, Mail, Phone } from "lucide-react";
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
import { formatDate } from "@/shared/utils/format";
import { useCatalogStore } from "@/store/catalog.store";
import { LEAD_STATUS_CONFIG, LEAD_ORIGIN_MAP } from "../lib/lead-config";
import type { Lead, LeadStatus } from "@/types/lead";

interface KanbanCardProps {
  lead: Lead;
  onView: (id: string) => void;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onDragStart: (e: React.DragEvent, id: string) => void;
}

// Tarjeta arrastrable que representa un lead dentro de una columna del kanban
function KanbanCard({ lead, onView, onEdit, onDelete, onDragStart }: KanbanCardProps) {
  const allProperties = useCatalogStore((s) => s.properties);
  const property = lead.propertyId ? allProperties.find((p) => p.id === lead.propertyId) : null;
  const origin = LEAD_ORIGIN_MAP[lead.origin];
  const OriginIcon = origin.icon;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      draggable
      onDragStart={(e) => onDragStart(e as unknown as React.DragEvent, lead.id)}
      className="group cursor-grab rounded-lg border bg-card p-3 shadow-sm transition-shadow hover:shadow-md active:cursor-grabbing"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <button
          className="text-sm font-medium text-foreground hover:text-primary transition-colors text-left leading-snug min-w-0"
          onClick={() => onView(lead.id)}
        >
          {lead.name}
        </button>
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
              <DropdownMenuItem onClick={() => onView(lead.id)}>
                <Eye className="mr-2 h-3.5 w-3.5" /> Ver
              </DropdownMenuItem>
              {onEdit && (
                <DropdownMenuItem onClick={() => onEdit(lead.id)}>
                  <Pencil className="mr-2 h-3.5 w-3.5" /> Editar
                </DropdownMenuItem>
              )}
              {onDelete && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => onDelete(lead.id)}
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

      {/* Contacto */}
      <div className="mt-2 space-y-1">
        <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground truncate">
          <Mail className="h-3 w-3 shrink-0" /> {lead.email}
        </p>
        <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground truncate">
          <Phone className="h-3 w-3 shrink-0" /> {lead.phone}
        </p>
      </div>

      {/* Origen + propiedad */}
      <div className="mt-2 flex items-center gap-1.5 flex-wrap">
        <span className="flex items-center gap-1 rounded-md bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
          <OriginIcon className="h-3 w-3" /> {origin.label}
        </span>
      </div>

      {property && (
        <p className="mt-2 text-[11px] text-muted-foreground truncate">{property.name}</p>
      )}

      {/* Footer */}
      <div className="mt-3 flex items-center justify-between gap-2 border-t border-border pt-2">
        <span className="text-[10px] text-muted-foreground">
          {formatDate(lead.createdAt, "short")}
        </span>
      </div>
    </motion.div>
  );
}

interface KanbanColumnProps {
  status: LeadStatus;
  label: string;
  icon: React.ElementType;
  color: string;
  leads: Lead[];
  isDragOver: boolean;
  onView: (id: string) => void;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onDragStart: (e: React.DragEvent, id: string) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent, status: LeadStatus) => void;
}

// Columna del kanban asociada a un estado; recibe drops para cambiar el estado del lead
function KanbanColumn({
  status, label, icon: Icon, color, leads, isDragOver,
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
      <div className="flex items-center justify-between px-3 py-2.5 border-b border-border">
        <div className="flex items-center gap-2">
          <Icon className={cn("h-3.5 w-3.5", color)} />
          <span className="text-xs font-semibold text-foreground">{label}</span>
        </div>
        <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-muted px-1.5 text-[10px] font-bold text-muted-foreground">
          {leads.length}
        </span>
      </div>

      <div className="flex flex-col gap-2 p-2 flex-1">
        {leads.length === 0 ? (
          <div className={cn(
            "flex flex-1 items-center justify-center rounded-lg border-2 border-dashed py-8 text-center transition-colors",
            isDragOver ? "border-primary/30" : "border-border/50"
          )}>
            <p className="text-[11px] text-muted-foreground/50">Arrastrá leads acá</p>
          </div>
        ) : (
          leads.map((lead) => (
            <KanbanCard
              key={lead.id}
              lead={lead}
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

interface LeadsKanbanProps {
  leads: Lead[];
  isLoading?: boolean;
  onView: (id: string) => void;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onStatusChange: (id: string, status: LeadStatus) => void;
}

// Tablero kanban de leads con drag & drop nativo HTML5 (clonado de maintenance-kanban)
export function LeadsKanban({
  leads, isLoading, onView, onEdit, onDelete, onStatusChange,
}: LeadsKanbanProps) {
  const [dragOverStatus, setDragOverStatus] = useState<LeadStatus | null>(null);
  const draggingId = useRef<string | null>(null);

  // Registra el lead que se empieza a arrastrar
  const handleDragStart = (e: React.DragEvent, id: string) => {
    draggingId.current = id;
    e.dataTransfer.effectAllowed = "move";
  };

  // Resalta la columna sobre la que se está arrastrando
  const handleDragOver = (e: React.DragEvent, status: LeadStatus) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverStatus(status);
  };

  // Al soltar en una columna dispara el cambio de estado si difiere del actual
  const handleDrop = (e: React.DragEvent, status: LeadStatus) => {
    e.preventDefault();
    setDragOverStatus(null);
    if (draggingId.current) {
      const lead = leads.find((l) => l.id === draggingId.current);
      if (lead && lead.status !== status) {
        onStatusChange(draggingId.current, status);
      }
      draggingId.current = null;
    }
  };

  // Limpia el estado de arrastre al terminar
  const handleDragEnd = () => {
    setDragOverStatus(null);
    draggingId.current = null;
  };

  if (isLoading) {
    return (
      <div className="grid gap-3 overflow-x-auto pb-2" style={{ gridTemplateColumns: `repeat(${LEAD_STATUS_CONFIG.length}, minmax(220px, 1fr))` }}>
        {LEAD_STATUS_CONFIG.map((col) => (
          <div key={col.status} className="rounded-xl border border-border bg-muted/20 p-3 space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-28 w-full rounded-lg" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div
      className="grid gap-3 overflow-x-auto pb-2"
      style={{ gridTemplateColumns: `repeat(${LEAD_STATUS_CONFIG.length}, minmax(220px, 1fr))` }}
      onDragEnd={handleDragEnd}
    >
      {LEAD_STATUS_CONFIG.map((col) => (
        <KanbanColumn
          key={col.status}
          status={col.status}
          label={col.label}
          icon={col.icon}
          color={col.color}
          leads={leads.filter((l) => l.status === col.status)}
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
