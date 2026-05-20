"use client";

import { useEffect, useMemo } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useCatalogStore } from "@/store/catalog.store";
import {
  maintenanceSchema,
  DEFAULT_MAINTENANCE_VALUES,
  type MaintenanceFormValues,
} from "../schemas/maintenance.schema";

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="mt-1 text-xs text-destructive">{message}</p>;
}

function FormSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-3">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{title}</h3>
      {children}
    </div>
  );
}

interface MaintenanceFormProps {
  isOpen: boolean;
  editingId: string | null;
  isMutating: boolean;
  onSubmit: (data: MaintenanceFormValues) => Promise<void>;
  onClose: () => void;
}

export function MaintenanceForm({ isOpen, editingId, isMutating, onSubmit, onClose }: MaintenanceFormProps) {
  const { properties: allProperties, tenants: allTenants, tickets: allTickets } = useCatalogStore();

  const editingTicket = useMemo(
    () => (editingId ? allTickets.find((t) => t.id === editingId) : null),
    [editingId, allTickets]
  );

  const defaultValues: MaintenanceFormValues = useMemo(() => {
    if (!editingTicket) return DEFAULT_MAINTENANCE_VALUES;
    return {
      title: editingTicket.title,
      description: editingTicket.description,
      propertyId: editingTicket.propertyId,
      tenantId: editingTicket.tenantId ?? "",
      category: editingTicket.category,
      priority: editingTicket.priority,
      status: editingTicket.status,
      assignedTo: editingTicket.assignedTo ?? "",
      estimatedCost: editingTicket.estimatedCost ?? "",
      finalCost: editingTicket.finalCost ?? "",
      reportedAt: editingTicket.reportedAt.split("T")[0],
      notes: editingTicket.notes ?? "",
    };
  }, [editingTicket]);

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<MaintenanceFormValues>({
    resolver: zodResolver(maintenanceSchema),
    defaultValues,
  });

  useEffect(() => {
    if (isOpen) reset(defaultValues);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, editingId]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-xl p-0 gap-0 max-h-[90vh] flex flex-col overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-4 shrink-0">
          <DialogTitle>
            {editingId ? "Editar Ticket" : "Nuevo Ticket de Mantenimiento"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col flex-1 min-h-0">
          <div className="flex-1 overflow-y-auto min-h-0">
            <div className="space-y-5 px-6 pb-4">

              {/* Información básica */}
              <FormSection title="Información del Ticket">
                <div>
                  <Label htmlFor="title">Título</Label>
                  <Input
                    id="title"
                    placeholder="Ej: Gotera en baño principal"
                    className="mt-1.5"
                    {...register("title")}
                  />
                  <FieldError message={errors.title?.message} />
                </div>

                <div>
                  <Label htmlFor="description">Descripción</Label>
                  <Textarea
                    id="description"
                    rows={3}
                    placeholder="Describí el problema con detalle..."
                    className="mt-1.5"
                    {...register("description")}
                  />
                  <FieldError message={errors.description?.message} />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Categoría</Label>
                    <Controller
                      name="category"
                      control={control}
                      render={({ field }) => (
                        <Select value={field.value} onValueChange={field.onChange}>
                          <SelectTrigger className="mt-1.5">
                            <SelectValue placeholder="Categoría" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="plumbing">🔧 Plomería</SelectItem>
                            <SelectItem value="electrical">⚡ Electricidad</SelectItem>
                            <SelectItem value="painting">🎨 Pintura</SelectItem>
                            <SelectItem value="cleaning">🧹 Limpieza</SelectItem>
                            <SelectItem value="security">🔒 Seguridad</SelectItem>
                            <SelectItem value="general">🏠 General</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                    <FieldError message={errors.category?.message} />
                  </div>

                  <div>
                    <Label>Prioridad</Label>
                    <Controller
                      name="priority"
                      control={control}
                      render={({ field }) => (
                        <Select value={field.value} onValueChange={field.onChange}>
                          <SelectTrigger className="mt-1.5">
                            <SelectValue placeholder="Prioridad" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="urgent">🚨 Urgente</SelectItem>
                            <SelectItem value="high">🔴 Alta</SelectItem>
                            <SelectItem value="medium">🟡 Media</SelectItem>
                            <SelectItem value="low">🟢 Baja</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                    <FieldError message={errors.priority?.message} />
                  </div>
                </div>
              </FormSection>

              <Separator />

              {/* Ubicación */}
              <FormSection title="Propiedad e Inquilino">
                <div>
                  <Label>Propiedad</Label>
                  <Controller
                    name="propertyId"
                    control={control}
                    render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger className="mt-1.5">
                          <SelectValue placeholder="Seleccionar propiedad" />
                        </SelectTrigger>
                        <SelectContent>
                          {allProperties.map((p) => (
                            <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  <FieldError message={errors.propertyId?.message} />
                </div>

                <div>
                  <Label>Inquilino (opcional)</Label>
                  <Controller
                    name="tenantId"
                    control={control}
                    render={({ field }) => (
                      <Select
                        value={field.value || "__none__"}
                        onValueChange={(v) => field.onChange(v === "__none__" ? "" : v)}
                      >
                        <SelectTrigger className="mt-1.5">
                          <SelectValue placeholder="Sin inquilino específico" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="__none__">Sin inquilino</SelectItem>
                          {allTenants.filter((t) => t.status === "active").map((t) => (
                            <SelectItem key={t.id} value={t.id}>
                              {t.firstName} {t.lastName}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
              </FormSection>

              <Separator />

              {/* Estado y Técnico */}
              <FormSection title="Estado y Asignación">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Estado</Label>
                    <Controller
                      name="status"
                      control={control}
                      render={({ field }) => (
                        <Select value={field.value} onValueChange={field.onChange}>
                          <SelectTrigger className="mt-1.5">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Pendiente</SelectItem>
                            <SelectItem value="in_progress">En Progreso</SelectItem>
                            <SelectItem value="waiting_parts">Esperando Repuestos</SelectItem>
                            <SelectItem value="resolved">Resuelto</SelectItem>
                            <SelectItem value="closed">Cerrado</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                    <FieldError message={errors.status?.message} />
                  </div>

                  <div>
                    <Label htmlFor="reportedAt">Fecha de Reporte</Label>
                    <Input
                      id="reportedAt"
                      type="date"
                      className="mt-1.5"
                      {...register("reportedAt")}
                    />
                    <FieldError message={errors.reportedAt?.message} />
                  </div>
                </div>

                <div>
                  <Label htmlFor="assignedTo">Técnico Asignado</Label>
                  <Input
                    id="assignedTo"
                    placeholder="Ej: Juan Pérez - Plomero"
                    className="mt-1.5"
                    {...register("assignedTo")}
                  />
                </div>
              </FormSection>

              <Separator />

              {/* Costos */}
              <FormSection title="Costos (ARS)">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="estimatedCost">Costo Estimado</Label>
                    <Input
                      id="estimatedCost"
                      type="number"
                      min={0}
                      className="mt-1.5"
                      placeholder="180000"
                      {...register("estimatedCost")}
                    />
                  </div>
                  <div>
                    <Label htmlFor="finalCost">Costo Final</Label>
                    <Input
                      id="finalCost"
                      type="number"
                      min={0}
                      className="mt-1.5"
                      placeholder="Completar al cierre"
                      {...register("finalCost")}
                    />
                  </div>
                </div>
              </FormSection>

              <Separator />

              {/* Notas */}
              <FormSection title="Notas Internas">
                <Textarea
                  rows={3}
                  placeholder="Notas sobre el trabajo, materiales, estado, etc."
                  {...register("notes")}
                />
              </FormSection>
            </div>
          </div>

          <DialogFooter className="shrink-0 px-6 py-4 border-t border-border">
            <Button type="button" variant="outline" onClick={onClose} disabled={isMutating}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isMutating} className="min-w-[120px]">
              {isMutating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {editingId ? "Guardar Cambios" : "Crear Ticket"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
