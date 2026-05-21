"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  X, Pencil, Trash2, AlertTriangle, Clock, Wrench, Package,
  CheckCircle2, Archive, MapPin, User, Calendar,
  FileText, Phone,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatCurrency, formatDate } from "@/shared/utils/format";
import { useCatalogStore } from "@/store/catalog.store";
import { usePermissions } from "@/hooks/use-permissions";

const STATUS_CONFIG = {
  pending: { label: "Pendiente", icon: Clock, class: "bg-muted text-muted-foreground" },
  in_progress: { label: "En Progreso", icon: Wrench, class: "bg-primary/10 text-primary" },
  waiting_parts: { label: "Esperando Repuestos", icon: Package, class: "bg-warning/10 text-warning" },
  resolved: { label: "Resuelto", icon: CheckCircle2, class: "bg-success/10 text-success" },
  closed: { label: "Cerrado", icon: Archive, class: "bg-muted text-muted-foreground/60" },
} as const;

const PRIORITY_CONFIG = {
  urgent: { label: "Urgente", class: "bg-destructive/10 text-destructive border-destructive/20", bannerClass: "bg-destructive/10 border-destructive/20 text-destructive" },
  high: { label: "Alta", class: "bg-orange-500/10 text-orange-500 border-orange-500/20", bannerClass: "bg-orange-500/10 border-orange-500/20 text-orange-500" },
  medium: { label: "Media", class: "bg-warning/10 text-warning border-warning/20", bannerClass: "" },
  low: { label: "Baja", class: "bg-muted text-muted-foreground border-border", bannerClass: "" },
} as const;

const CATEGORY_LABELS: Record<string, string> = {
  plumbing: "Plomería",
  electrical: "Electricidad",
  painting: "Pintura",
  cleaning: "Limpieza",
  security: "Seguridad",
  general: "General",
};

interface MaintenanceDrawerProps {
  ticketId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
}

export function MaintenanceDrawer({ ticketId, isOpen, onClose, onEdit, onDelete }: MaintenanceDrawerProps) {
  return (
    <AnimatePresence>
      {isOpen && ticketId && (
        <DrawerContent
          key={ticketId}
          ticketId={ticketId}
          onClose={onClose}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      )}
    </AnimatePresence>
  );
}

function DrawerContent({
  ticketId, onClose, onEdit, onDelete,
}: {
  ticketId: string;
  onClose: () => void;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
}) {
  const { is } = usePermissions();
  const isInquilino = is("INQUILINO");
  const { tickets, properties, tenants } = useCatalogStore();
  const ticket = tickets.find((t) => t.id === ticketId);
  if (!ticket) return null;

  const property = properties.find((p) => p.id === ticket.propertyId);
  const tenant = ticket.tenantId ? tenants.find((t) => t.id === ticket.tenantId) : null;
  const technician = null as unknown as { name: string; specialty: string; phone: string } | null;
  const statusCfg = STATUS_CONFIG[ticket.status];
  const priorityCfg = PRIORITY_CONFIG[ticket.priority];
  const StatusIcon = statusCfg.icon;

  const timeline = [
    ticket.reportedAt && { date: ticket.reportedAt, label: "Ticket reportado", icon: FileText },
    ticket.startedAt && { date: ticket.startedAt, label: "Trabajo iniciado", icon: Wrench },
    ticket.resolvedAt && { date: ticket.resolvedAt, label: "Resuelto", icon: CheckCircle2 },
    ticket.closedAt && { date: ticket.closedAt, label: "Cerrado", icon: Archive },
  ].filter(Boolean) as { date: string; label: string; icon: React.ElementType }[];

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-40 bg-background/60 backdrop-blur-sm"
        onClick={onClose}
      />

      <motion.aside
        initial={{ x: "100%", opacity: 0.5 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: "100%", opacity: 0 }}
        transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="fixed inset-y-0 right-0 z-50 flex w-full flex-col border-l border-border bg-background shadow-2xl sm:w-[480px]"
      >
        {/* Header */}
        <div className="relative shrink-0 bg-gradient-to-br from-slate-950 via-slate-900/60 to-zinc-950 px-5 pt-5 pb-16">
          <div
            className="absolute inset-0 opacity-10 pointer-events-none"
            style={{
              backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.2) 1px, transparent 1px)",
              backgroundSize: "18px 18px",
            }}
          />
          <button
            onClick={onClose}
            className="absolute right-4 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-md border border-white/10 bg-black/30 text-white/70 backdrop-blur-sm transition-all hover:bg-black/50 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
          <div className="relative">
            <div className="flex items-center gap-2 mb-2">
              <span className={cn("flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-semibold", priorityCfg.class)}>
                {ticket.priority === "urgent" && <AlertTriangle className="h-3 w-3" />}
                {priorityCfg.label}
              </span>
              <span className="text-[11px] text-white/50 font-mono">{ticket.id.toUpperCase()}</span>
            </div>
            <h2 className="text-lg font-bold text-white leading-snug">{ticket.title}</h2>
            <p className="mt-1 text-xs text-white/50">{CATEGORY_LABELS[ticket.category]}</p>
          </div>
        </div>

        {/* Status bar */}
        <div className="flex items-center justify-between border-b border-border px-5 py-3 -mt-10 bg-background relative z-10 mx-4 rounded-t-xl shadow-sm">
          <div className={cn("flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold", statusCfg.class)}>
            <StatusIcon className="h-3.5 w-3.5" />
            {statusCfg.label}
          </div>
          <div className="flex items-center gap-2">
            {onEdit && (
              <Button variant="outline" size="sm" className="h-8 gap-1.5" onClick={() => onEdit(ticket.id)}>
                <Pencil className="h-3.5 w-3.5" />
                Editar
              </Button>
            )}
            {onDelete && (
              <Button
                variant="outline"
                size="sm"
                className="h-8 gap-1.5 text-destructive hover:border-destructive hover:text-destructive"
                onClick={() => onDelete(ticket.id)}
              >
                <Trash2 className="h-3.5 w-3.5" />
                Eliminar
              </Button>
            )}
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="general" className="flex min-h-0 flex-1 flex-col">
          <TabsList className="h-auto shrink-0 justify-start gap-0 rounded-none border-b border-border bg-transparent px-5 py-0">
            {[
              { value: "general", label: "General" },
              ...(!isInquilino ? [{ value: "costs", label: "Costos" }] : []),
              { value: "history", label: "Historial" },
            ].map((tab) => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className="h-10 rounded-none border-b-2 border-transparent px-4 data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none"
              >
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>

          <ScrollArea className="flex-1">
            {/* GENERAL TAB */}
            <TabsContent value="general" className="mt-0 p-5 space-y-5">
              {/* Description */}
              <div className="space-y-2">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Descripción</p>
                <p className="text-sm leading-relaxed text-muted-foreground">{ticket.description}</p>
              </div>

              {/* Property */}
              {property && (
                <>
                  <Separator />
                  <div className="space-y-2">
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Propiedad</p>
                    <div className="flex items-center gap-3 rounded-lg border border-border p-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                        <MapPin className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-foreground">{property.name}</p>
                        <p className="text-xs text-muted-foreground">{property.address}, {property.city}</p>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* Tenant */}
              {tenant && (
                <>
                  <Separator />
                  <div className="space-y-2">
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Inquilino</p>
                    <div className="flex items-center gap-3 rounded-lg border border-border p-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10">
                        <User className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-foreground">{tenant.firstName} {tenant.lastName}</p>
                        <p className="text-xs text-muted-foreground">{tenant.phone}</p>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* Technician */}
              <Separator />
              {isInquilino ? (
                <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/20 px-4 py-3">
                  <Wrench className="h-4 w-4 text-muted-foreground shrink-0" />
                  <p className="text-sm text-muted-foreground">
                    {ticket.assignedTo ? "Técnico asignado — en gestión" : "Sin técnico asignado aún"}
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Técnico Asignado</p>
                  {technician ? (
                    <div className="flex items-center gap-3 rounded-lg border border-border p-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-bold text-foreground">
                        {technician.name.charAt(0)}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-foreground">{technician.name}</p>
                        <p className="text-xs text-muted-foreground">{technician.specialty}</p>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Phone className="h-3 w-3" />
                        {technician.phone}
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm italic text-muted-foreground">Sin técnico asignado</p>
                  )}
                </div>
              )}

              {/* Notes — internal, hidden for INQUILINO */}
              {!isInquilino && ticket.notes && (
                <>
                  <Separator />
                  <div className="space-y-2">
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Notas Internas</p>
                    <div className="rounded-lg bg-muted/40 p-3">
                      <p className="text-sm text-muted-foreground">{ticket.notes}</p>
                    </div>
                  </div>
                </>
              )}

              {/* Dates */}
              <Separator />
              <div className="divide-y divide-border rounded-lg border border-border">
                {[
                  { label: "Reportado", value: formatDate(ticket.reportedAt, "long") },
                  ticket.startedAt && { label: "Iniciado", value: formatDate(ticket.startedAt, "long") },
                  ticket.resolvedAt && { label: "Resuelto", value: formatDate(ticket.resolvedAt, "long") },
                  ticket.closedAt && { label: "Cerrado", value: formatDate(ticket.closedAt, "long") },
                ].filter(Boolean).map((item) => (
                  <div key={(item as { label: string }).label} className="flex items-center justify-between px-4 py-2.5">
                    <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      {(item as { label: string }).label}
                    </span>
                    <span className="text-xs font-medium text-foreground">{(item as { value: string }).value}</span>
                  </div>
                ))}
              </div>
            </TabsContent>

            {/* COSTS TAB */}
            <TabsContent value="costs" className="mt-0 p-5 space-y-5">
              {/* Priority banner for high/urgent */}
              {(ticket.priority === "urgent" || ticket.priority === "high") && (
                <div className={cn("flex items-center gap-2 rounded-lg border p-3", priorityCfg.bannerClass)}>
                  <AlertTriangle className="h-4 w-4 shrink-0" />
                  <p className="text-xs font-medium">
                    Prioridad {priorityCfg.label} — Requiere atención inmediata
                  </p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Costo Estimado", value: ticket.estimatedCost, color: "text-foreground" },
                  { label: "Costo Final", value: ticket.finalCost, color: "text-success" },
                ].map(({ label, value, color }) => (
                  <div key={label} className="rounded-lg border border-border bg-muted/20 p-3 space-y-1">
                    <p className="text-xs text-muted-foreground">{label}</p>
                    <p className={cn("text-lg font-bold leading-none", color)}>
                      {value ? formatCurrency(value) : <span className="text-sm text-muted-foreground/60">—</span>}
                    </p>
                  </div>
                ))}
              </div>

              {ticket.finalCost && ticket.estimatedCost && (
                <div className="rounded-lg border border-border bg-muted/10 p-4">
                  <p className="text-xs font-medium text-muted-foreground mb-2">Variación de Costo</p>
                  <div className="flex items-baseline gap-2">
                    <span className={cn(
                      "text-lg font-bold",
                      ticket.finalCost <= ticket.estimatedCost ? "text-success" : "text-destructive"
                    )}>
                      {ticket.finalCost <= ticket.estimatedCost ? "−" : "+"}
                      {formatCurrency(Math.abs(ticket.finalCost - ticket.estimatedCost))}
                    </span>
                    <span className="text-xs text-muted-foreground">vs. estimado</span>
                  </div>
                </div>
              )}
            </TabsContent>

            {/* HISTORY TAB */}
            <TabsContent value="history" className="mt-0 p-5">
              {timeline.length === 0 ? (
                <p className="py-8 text-center text-sm text-muted-foreground">Sin eventos registrados</p>
              ) : (
                <div className="relative space-y-0">
                  <div className="absolute left-3.5 top-4 bottom-4 w-px bg-border" />
                  {timeline.map((event, idx) => {
                    const EventIcon = event.icon;
                    return (
                      <div key={idx} className="flex items-start gap-4 pb-6 last:pb-0">
                        <div className="relative z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-border bg-background">
                          <EventIcon className="h-3.5 w-3.5 text-muted-foreground" />
                        </div>
                        <div className="pt-0.5 min-w-0 flex-1">
                          <p className="text-sm font-medium text-foreground">{event.label}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {formatDate(event.date, "long")}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </motion.aside>
    </>
  );
}
