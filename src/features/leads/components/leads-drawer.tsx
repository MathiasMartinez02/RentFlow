"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  X, Pencil, Trash2, Mail, Phone, MessageCircle,
  MapPin, Calendar, FileText, CheckCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatDate } from "@/shared/utils/format";
import { useCatalogStore } from "@/store/catalog.store";
import { LEAD_STATUS_MAP, LEAD_ORIGIN_MAP } from "../lib/lead-config";
import type { Lead } from "@/types/lead";

interface LeadsDrawerProps {
  lead: Lead | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
}

// Drawer lateral con el detalle de un lead y acciones rápidas de contacto
export function LeadsDrawer({ lead, isOpen, onClose, onEdit, onDelete }: LeadsDrawerProps) {
  return (
    <AnimatePresence>
      {isOpen && lead && (
        <DrawerContent
          key={lead.id}
          lead={lead}
          onClose={onClose}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      )}
    </AnimatePresence>
  );
}

// Contenido animado del drawer (se monta solo cuando hay un lead seleccionado)
function DrawerContent({
  lead, onClose, onEdit, onDelete,
}: {
  lead: Lead;
  onClose: () => void;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
}) {
  const properties = useCatalogStore((s) => s.properties);
  const property = lead.propertyId ? properties.find((p) => p.id === lead.propertyId) : null;
  const statusCfg = LEAD_STATUS_MAP[lead.status];
  const origin = LEAD_ORIGIN_MAP[lead.origin];
  const StatusIcon = statusCfg.icon;
  const OriginIcon = origin.icon;

  // Arma el link de WhatsApp con un mensaje precargado hacia el teléfono del lead
  const whatsappHref = `https://wa.me/${lead.phone.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(
    `Hola ${lead.name}, te contacto de RentFlow.`
  )}`;

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
          <button
            onClick={onClose}
            className="absolute right-4 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-md border border-white/10 bg-black/30 text-white/70 backdrop-blur-sm transition-all hover:bg-black/50 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
          <div className="relative">
            <div className="flex items-center gap-2 mb-2">
              <span className="flex items-center gap-1 rounded-full border border-white/10 bg-white/10 px-2.5 py-1 text-[11px] font-semibold text-white/80">
                <OriginIcon className="h-3 w-3" /> {origin.label}
              </span>
            </div>
            <h2 className="text-lg font-bold text-white leading-snug">{lead.name}</h2>
            <p className="mt-1 text-xs text-white/50">{lead.email}</p>
          </div>
        </div>

        {/* Status bar */}
        <div className="flex items-center justify-between border-b border-border px-5 py-3 -mt-10 bg-background relative z-10 mx-4 rounded-t-xl shadow-sm">
          <div className={cn("flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold", statusCfg.badgeClass)}>
            <StatusIcon className="h-3.5 w-3.5" />
            {statusCfg.label}
          </div>
          <div className="flex items-center gap-2">
            {onEdit && (
              <Button variant="outline" size="sm" className="h-8 gap-1.5" onClick={() => onEdit(lead.id)}>
                <Pencil className="h-3.5 w-3.5" />
                Editar
              </Button>
            )}
            {onDelete && (
              <Button
                variant="outline"
                size="sm"
                className="h-8 gap-1.5 text-destructive hover:border-destructive hover:text-destructive"
                onClick={() => onDelete(lead.id)}
              >
                <Trash2 className="h-3.5 w-3.5" />
                Eliminar
              </Button>
            )}
          </div>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-5 space-y-5">
            {/* Acciones rápidas de contacto */}
            <div className="grid grid-cols-3 gap-2">
              <Button asChild variant="outline" size="sm" className="gap-1.5">
                <a href={`mailto:${lead.email}`}>
                  <Mail className="h-3.5 w-3.5" /> Email
                </a>
              </Button>
              <Button asChild variant="outline" size="sm" className="gap-1.5">
                <a href={`tel:${lead.phone}`}>
                  <Phone className="h-3.5 w-3.5" /> Llamar
                </a>
              </Button>
              <Button asChild variant="outline" size="sm" className="gap-1.5 text-success hover:text-success">
                <a href={whatsappHref} target="_blank" rel="noopener noreferrer">
                  <MessageCircle className="h-3.5 w-3.5" /> WhatsApp
                </a>
              </Button>
            </div>

            <Separator />

            {/* Datos de contacto */}
            <div className="divide-y divide-border rounded-lg border border-border">
              <div className="flex items-center justify-between px-4 py-2.5">
                <span className="flex items-center gap-1.5 text-xs text-muted-foreground"><Mail className="h-3 w-3" /> Email</span>
                <span className="text-xs font-medium text-foreground">{lead.email}</span>
              </div>
              <div className="flex items-center justify-between px-4 py-2.5">
                <span className="flex items-center gap-1.5 text-xs text-muted-foreground"><Phone className="h-3 w-3" /> Teléfono</span>
                <span className="text-xs font-medium text-foreground">{lead.phone}</span>
              </div>
            </div>

            {/* Propiedad de interés */}
            {property && (
              <>
                <Separator />
                <div className="space-y-2">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Propiedad de Interés</p>
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

            {/* Visita */}
            {lead.visitDate && (
              <>
                <Separator />
                <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/20 px-4 py-3">
                  <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
                  <p className="text-sm text-muted-foreground">
                    Visita: {formatDate(lead.visitDate, "long")}
                  </p>
                  {lead.visitConfirmed && <CheckCircle2 className="h-4 w-4 text-success ml-auto" />}
                </div>
              </>
            )}

            {/* Mensaje del lead */}
            {lead.message && (
              <>
                <Separator />
                <div className="space-y-2">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Mensaje</p>
                  <div className="rounded-lg bg-muted/40 p-3">
                    <p className="text-sm text-muted-foreground">{lead.message}</p>
                  </div>
                </div>
              </>
            )}

            {/* Notas internas */}
            {lead.notes && (
              <>
                <Separator />
                <div className="space-y-2">
                  <p className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    <FileText className="h-3 w-3" /> Notas Internas
                  </p>
                  <div className="rounded-lg bg-muted/40 p-3">
                    <p className="text-sm text-muted-foreground">{lead.notes}</p>
                  </div>
                </div>
              </>
            )}

            {/* Fechas */}
            <Separator />
            <div className="divide-y divide-border rounded-lg border border-border">
              <div className="flex items-center justify-between px-4 py-2.5">
                <span className="flex items-center gap-1.5 text-xs text-muted-foreground"><Calendar className="h-3 w-3" /> Creado</span>
                <span className="text-xs font-medium text-foreground">{formatDate(lead.createdAt, "long")}</span>
              </div>
              <div className="flex items-center justify-between px-4 py-2.5">
                <span className="flex items-center gap-1.5 text-xs text-muted-foreground"><Calendar className="h-3 w-3" /> Actualizado</span>
                <span className="text-xs font-medium text-foreground">{formatDate(lead.updatedAt, "long")}</span>
              </div>
            </div>
          </div>
        </ScrollArea>
      </motion.aside>
    </>
  );
}
