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
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCatalogStore } from "@/store/catalog.store";
import {
  tenantSchema,
  DEFAULT_TENANT_VALUES,
  type TenantFormValues,
} from "../schemas/tenant.schema";

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="mt-1 text-xs text-destructive">{message}</p>;
}

function FormSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-3">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {title}
      </h3>
      {children}
    </div>
  );
}

interface TenantFormProps {
  isOpen: boolean;
  editingId: string | null;
  isMutating: boolean;
  onSubmit: (data: TenantFormValues) => Promise<void>;
  onClose: () => void;
}

export function TenantForm({ isOpen, editingId, isMutating, onSubmit, onClose }: TenantFormProps) {
  const { tenants: allTenants, properties: allProperties } = useCatalogStore();

  const editingTenant = useMemo(
    () => (editingId ? allTenants.find((t) => t.id === editingId) : null),
    [editingId, allTenants]
  );

  const availableProperties = useMemo(
    () =>
      allProperties.filter(
        (p) =>
          p.status === "available" ||
          (editingTenant?.propertyId && p.id === editingTenant.propertyId)
      ),
    [editingTenant, allProperties]
  );

  const defaultValues: TenantFormValues = useMemo(() => {
    if (!editingTenant) return DEFAULT_TENANT_VALUES;
    return {
      firstName: editingTenant.firstName,
      lastName: editingTenant.lastName,
      nationalId: editingTenant.nationalId,
      email: editingTenant.email,
      phone: editingTenant.phone,
      address: editingTenant.address ?? "",
      status: editingTenant.status,
      paymentStatus: editingTenant.paymentStatus,
      propertyId: editingTenant.propertyId,
      moveInDate: editingTenant.moveInDate ?? "",
      observations: editingTenant.observations ?? "",
      emergencyContactName: editingTenant.emergencyContact.name,
      emergencyContactPhone: editingTenant.emergencyContact.phone,
      emergencyContactRelationship: editingTenant.emergencyContact.relationship,
    };
  }, [editingTenant]);

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<TenantFormValues>({
    resolver: zodResolver(tenantSchema),
    defaultValues,
  });

  useEffect(() => {
    if (isOpen) reset(defaultValues);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, editingId]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl p-0 gap-0">
        <DialogHeader className="px-6 pt-6 pb-4">
          <DialogTitle>
            {editingId ? "Editar Inquilino" : "Agregar Nuevo Inquilino"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)}>
          <ScrollArea className="max-h-[calc(85vh-140px)]">
            <div className="space-y-6 px-6 pb-4">
              {/* Datos Personales */}
              <FormSection title="Datos Personales">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="firstName">Nombre</Label>
                    <Input
                      id="firstName"
                      className="mt-1.5"
                      placeholder="ej. Amanda"
                      {...register("firstName")}
                    />
                    <FieldError message={errors.firstName?.message} />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Apellido</Label>
                    <Input
                      id="lastName"
                      className="mt-1.5"
                      placeholder="ej. Rodriguez"
                      {...register("lastName")}
                    />
                    <FieldError message={errors.lastName?.message} />
                  </div>
                </div>

                <div>
                  <Label htmlFor="nationalId">DNI</Label>
                  <Input
                    id="nationalId"
                    className="mt-1.5"
                    placeholder="ej. DNI 27.712.394"
                    {...register("nationalId")}
                  />
                  <FieldError message={errors.nationalId?.message} />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      className="mt-1.5"
                      placeholder="inquilino@email.com"
                      {...register("email")}
                    />
                    <FieldError message={errors.email?.message} />
                  </div>
                  <div>
                    <Label htmlFor="phone">Teléfono</Label>
                    <Input
                      id="phone"
                      className="mt-1.5"
                      placeholder="+54 11 5555-0000"
                      {...register("phone")}
                    />
                    <FieldError message={errors.phone?.message} />
                  </div>
                </div>

                <div>
                  <Label htmlFor="address">Domicilio</Label>
                  <Input
                    id="address"
                    className="mt-1.5"
                    placeholder="ej. Av. Corrientes 1234, Dpto. 2B, CABA"
                    {...register("address")}
                  />
                </div>
              </FormSection>

              <Separator />

              {/* Estado y Propiedad */}
              <FormSection title="Estado y Propiedad">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Estado del Inquilino</Label>
                    <Controller
                      name="status"
                      control={control}
                      render={({ field }) => (
                        <Select value={field.value} onValueChange={field.onChange}>
                          <SelectTrigger className="mt-1.5">
                            <SelectValue placeholder="Seleccionar estado" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="active">Activo</SelectItem>
                            <SelectItem value="inactive">Inactivo</SelectItem>
                            <SelectItem value="pending">Pendiente</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                    <FieldError message={errors.status?.message} />
                  </div>
                  <div>
                    <Label>Estado de Pagos</Label>
                    <Controller
                      name="paymentStatus"
                      control={control}
                      render={({ field }) => (
                        <Select
                          value={field.value ?? ""}
                          onValueChange={(v) => field.onChange(v || undefined)}
                        >
                          <SelectTrigger className="mt-1.5">
                            <SelectValue placeholder="Seleccionar estado" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="al_dia">Al día</SelectItem>
                            <SelectItem value="atrasado">Atrasado</SelectItem>
                            <SelectItem value="pendiente">Pendiente</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Propiedad Asignada</Label>
                    <Controller
                      name="propertyId"
                      control={control}
                      render={({ field }) => (
                        <Select
                          value={field.value ?? ""}
                          onValueChange={(v) => field.onChange(v || undefined)}
                        >
                          <SelectTrigger className="mt-1.5">
                            <SelectValue placeholder="Sin propiedad" />
                          </SelectTrigger>
                          <SelectContent>
                            {availableProperties.map((p) => (
                              <SelectItem key={p.id} value={p.id}>
                                {p.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>
                  <div>
                    <Label htmlFor="moveInDate">Fecha de Ingreso</Label>
                    <Input
                      id="moveInDate"
                      type="date"
                      className="mt-1.5"
                      {...register("moveInDate")}
                    />
                  </div>
                </div>
              </FormSection>

              <Separator />

              {/* Contacto de Emergencia */}
              <FormSection title="Contacto de Emergencia">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="emergencyContactName">Nombre Completo</Label>
                    <Input
                      id="emergencyContactName"
                      className="mt-1.5"
                      placeholder="ej. Carlos Rodriguez"
                      {...register("emergencyContactName")}
                    />
                    <FieldError message={errors.emergencyContactName?.message} />
                  </div>
                  <div>
                    <Label htmlFor="emergencyContactRelationship">Vínculo</Label>
                    <Input
                      id="emergencyContactRelationship"
                      className="mt-1.5"
                      placeholder="ej. Hermano"
                      {...register("emergencyContactRelationship")}
                    />
                    <FieldError message={errors.emergencyContactRelationship?.message} />
                  </div>
                </div>
                <div>
                  <Label htmlFor="emergencyContactPhone">Teléfono de Contacto</Label>
                  <Input
                    id="emergencyContactPhone"
                    className="mt-1.5"
                    placeholder="+54 11 5555-0000"
                    {...register("emergencyContactPhone")}
                  />
                  <FieldError message={errors.emergencyContactPhone?.message} />
                </div>
              </FormSection>

              <Separator />

              {/* Observaciones */}
              <FormSection title="Observaciones">
                <Textarea
                  rows={3}
                  placeholder="Notas adicionales sobre el inquilino..."
                  {...register("observations")}
                />
                <FieldError message={errors.observations?.message} />
              </FormSection>
            </div>
          </ScrollArea>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isMutating}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isMutating} className="min-w-[120px]">
              {isMutating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {editingId ? "Guardar Cambios" : "Agregar Inquilino"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
