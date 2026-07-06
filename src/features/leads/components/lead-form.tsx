"use client";

import { useEffect, useMemo } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useCatalogStore } from "@/store/catalog.store";
import {
  leadSchema,
  DEFAULT_LEAD_VALUES,
  type LeadFormValues,
} from "../schemas/lead.schema";
import { LEAD_STATUS_CONFIG, LEAD_ORIGIN_MAP } from "../lib/lead-config";
import type { Lead } from "@/types/lead";

// Muestra el mensaje de error de un campo del formulario
function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="mt-1 text-xs text-destructive">{message}</p>;
}

// Agrupa campos del formulario bajo un título de sección
function FormSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-3">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{title}</h3>
      {children}
    </div>
  );
}

interface LeadFormProps {
  isOpen: boolean;
  editingLead: Lead | null;
  isMutating: boolean;
  onSubmit: (data: LeadFormValues) => Promise<void>;
  onClose: () => void;
}

// Diálogo de alta/edición de un lead del CRM (clonado de maintenance-form)
export function LeadForm({ isOpen, editingLead, isMutating, onSubmit, onClose }: LeadFormProps) {
  const allProperties = useCatalogStore((s) => s.properties);

  const defaultValues: LeadFormValues = useMemo(() => {
    if (!editingLead) return DEFAULT_LEAD_VALUES;
    return {
      name: editingLead.name,
      email: editingLead.email,
      phone: editingLead.phone,
      origin: editingLead.origin,
      status: editingLead.status,
      propertyId: editingLead.propertyId ?? "",
      message: editingLead.message ?? "",
      visitDate: editingLead.visitDate ? editingLead.visitDate.split("T")[0] : "",
      visitConfirmed: editingLead.visitConfirmed ?? false,
      notes: editingLead.notes ?? "",
    };
  }, [editingLead]);

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<LeadFormValues>({
    resolver: zodResolver(leadSchema),
    defaultValues,
  });

  useEffect(() => {
    if (isOpen) reset(defaultValues);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, editingLead?.id]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-xl p-0 gap-0 max-h-[90vh] flex flex-col overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-4 shrink-0">
          <DialogTitle>{editingLead ? "Editar Lead" : "Nuevo Lead"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col flex-1 min-h-0">
          <div className="flex-1 overflow-y-auto min-h-0">
            <div className="space-y-5 px-6 pb-4">

              <FormSection title="Datos de Contacto">
                <div>
                  <Label htmlFor="name">Nombre</Label>
                  <Input id="name" placeholder="Ej: Juan Pérez" className="mt-1.5" {...register("name")} />
                  <FieldError message={errors.name?.message} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" placeholder="juan@example.com" className="mt-1.5" {...register("email")} />
                    <FieldError message={errors.email?.message} />
                  </div>
                  <div>
                    <Label htmlFor="phone">Teléfono</Label>
                    <Input id="phone" placeholder="1122334455" className="mt-1.5" {...register("phone")} />
                    <FieldError message={errors.phone?.message} />
                  </div>
                </div>
              </FormSection>

              <Separator />

              <FormSection title="Pipeline">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Origen</Label>
                    <Controller
                      name="origin"
                      control={control}
                      render={({ field }) => (
                        <Select value={field.value} onValueChange={field.onChange}>
                          <SelectTrigger className="mt-1.5">
                            <SelectValue placeholder="Origen" />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.entries(LEAD_ORIGIN_MAP).map(([value, cfg]) => (
                              <SelectItem key={value} value={value}>{cfg.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                    <FieldError message={errors.origin?.message} />
                  </div>
                  <div>
                    <Label>Estado</Label>
                    <Controller
                      name="status"
                      control={control}
                      render={({ field }) => (
                        <Select value={field.value} onValueChange={field.onChange}>
                          <SelectTrigger className="mt-1.5">
                            <SelectValue placeholder="Estado" />
                          </SelectTrigger>
                          <SelectContent>
                            {LEAD_STATUS_CONFIG.map((cfg) => (
                              <SelectItem key={cfg.status} value={cfg.status}>{cfg.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                    <FieldError message={errors.status?.message} />
                  </div>
                </div>

                <div>
                  <Label>Propiedad de interés (opcional)</Label>
                  <Controller
                    name="propertyId"
                    control={control}
                    render={({ field }) => (
                      <Select
                        value={field.value || "__none__"}
                        onValueChange={(v) => field.onChange(v === "__none__" ? "" : v)}
                      >
                        <SelectTrigger className="mt-1.5">
                          <SelectValue placeholder="Sin propiedad específica" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="__none__">Sin propiedad</SelectItem>
                          {allProperties.map((p) => (
                            <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
              </FormSection>

              <Separator />

              <FormSection title="Visita">
                <div className="grid grid-cols-2 gap-3 items-end">
                  <div>
                    <Label htmlFor="visitDate">Fecha de visita</Label>
                    <Input id="visitDate" type="date" className="mt-1.5" {...register("visitDate")} />
                  </div>
                  <div className="pb-2">
                    <Checkbox label="Visita confirmada" {...register("visitConfirmed")} />
                  </div>
                </div>
              </FormSection>

              <Separator />

              <FormSection title="Mensaje y Notas">
                <div>
                  <Label htmlFor="message">Mensaje del lead</Label>
                  <Textarea id="message" rows={3} placeholder="Consulta o mensaje del interesado..." className="mt-1.5" {...register("message")} />
                  <FieldError message={errors.message?.message} />
                </div>
                <div>
                  <Label htmlFor="notes">Notas internas</Label>
                  <Textarea id="notes" rows={3} placeholder="Notas de seguimiento, contexto, etc." className="mt-1.5" {...register("notes")} />
                  <FieldError message={errors.notes?.message} />
                </div>
              </FormSection>
            </div>
          </div>

          <DialogFooter className="shrink-0 px-6 py-4 border-t border-border">
            <Button type="button" variant="outline" onClick={onClose} disabled={isMutating}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isMutating} className="min-w-[120px]">
              {isMutating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {editingLead ? "Guardar Cambios" : "Crear Lead"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
