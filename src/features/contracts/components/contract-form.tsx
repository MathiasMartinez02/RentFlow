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
import { Checkbox } from "@/components/ui/checkbox";
import { useCatalogStore } from "@/store/catalog.store";
import {
  contractSchema,
  DEFAULT_CONTRACT_VALUES,
  type ContractFormValues,
} from "../schemas/contract.schema";

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

interface ContractFormProps {
  isOpen: boolean;
  editingId: string | null;
  isMutating: boolean;
  onSubmit: (data: ContractFormValues) => Promise<void>;
  onClose: () => void;
}

export function ContractForm({ isOpen, editingId, isMutating, onSubmit, onClose }: ContractFormProps) {
  const { contracts: allContracts, properties: allProperties, tenants: allTenants } = useCatalogStore();

  const editingContract = useMemo(
    () => (editingId ? allContracts.find((c) => c.id === editingId) : null),
    [editingId, allContracts]
  );

  const defaultValues: ContractFormValues = useMemo(() => {
    if (!editingContract) return DEFAULT_CONTRACT_VALUES;
    return {
      propertyId: editingContract.propertyId,
      tenantId: editingContract.tenantId,
      startDate: editingContract.startDate,
      endDate: editingContract.endDate,
      status: editingContract.status,
      monthlyRent: editingContract.monthlyRent,
      deposit: editingContract.deposit,
      expenses: editingContract.expenses ?? "",
      annualIncreasePercent: editingContract.annualIncreasePercent ?? "",
      renewalOption: editingContract.renewalOption,
      noticePeriodDays: editingContract.noticePeriodDays,
      terms: editingContract.terms ?? "",
    };
  }, [editingContract]);

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContractFormValues>({
    resolver: zodResolver(contractSchema),
    defaultValues,
  });

  useEffect(() => {
    if (isOpen) reset(defaultValues);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, editingId]);

  const occupiedPropertyIds = new Set(
    allContracts.filter((c) => c.status === "active" && c.id !== editingId).map((c) => c.propertyId)
  );

  const availableProperties = allProperties.filter(
    (p) => !occupiedPropertyIds.has(p.id) || p.id === editingContract?.propertyId
  );

  const activeTenantIds = new Set(
    allContracts.filter((c) => c.status === "active" && c.id !== editingId).map((c) => c.tenantId)
  );

  const availableTenants = allTenants.filter(
    (t) => !activeTenantIds.has(t.id) || t.id === editingContract?.tenantId
  );

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl p-0 gap-0">
        <DialogHeader className="px-6 pt-6 pb-4">
          <DialogTitle>
            {editingId ? "Editar Contrato" : "Nuevo Contrato"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)}>
          <ScrollArea className="max-h-[calc(85vh-140px)]">
            <div className="space-y-6 px-6 pb-4">

              {/* Partes */}
              <FormSection title="Partes del Contrato">
                <div className="grid grid-cols-2 gap-3">
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
                            {availableProperties.map((p) => (
                              <SelectItem key={p.id} value={p.id}>
                                {p.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                    <FieldError message={errors.propertyId?.message} />
                  </div>
                  <div>
                    <Label>Inquilino</Label>
                    <Controller
                      name="tenantId"
                      control={control}
                      render={({ field }) => (
                        <Select value={field.value} onValueChange={field.onChange}>
                          <SelectTrigger className="mt-1.5">
                            <SelectValue placeholder="Seleccionar inquilino" />
                          </SelectTrigger>
                          <SelectContent>
                            {availableTenants.map((t) => (
                              <SelectItem key={t.id} value={t.id}>
                                {t.firstName} {t.lastName}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                    <FieldError message={errors.tenantId?.message} />
                  </div>
                </div>
              </FormSection>

              <Separator />

              {/* Fechas y estado */}
              <FormSection title="Fechas y Estado">
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <Label htmlFor="startDate">Fecha de Inicio</Label>
                    <Input
                      id="startDate"
                      type="date"
                      className="mt-1.5"
                      {...register("startDate")}
                    />
                    <FieldError message={errors.startDate?.message} />
                  </div>
                  <div>
                    <Label htmlFor="endDate">Fecha de Vencimiento</Label>
                    <Input
                      id="endDate"
                      type="date"
                      className="mt-1.5"
                      {...register("endDate")}
                    />
                    <FieldError message={errors.endDate?.message} />
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
                            <SelectItem value="active">Activo</SelectItem>
                            <SelectItem value="pending">Pendiente</SelectItem>
                            <SelectItem value="expired">Vencido</SelectItem>
                            <SelectItem value="terminated">Rescindido</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                    <FieldError message={errors.status?.message} />
                  </div>
                </div>
              </FormSection>

              <Separator />

              {/* Condiciones económicas */}
              <FormSection title="Condiciones Económicas">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="monthlyRent">Alquiler Mensual (ARS)</Label>
                    <Input
                      id="monthlyRent"
                      type="number"
                      min={0}
                      className="mt-1.5"
                      placeholder="850000"
                      {...register("monthlyRent")}
                    />
                    <FieldError message={errors.monthlyRent?.message} />
                  </div>
                  <div>
                    <Label htmlFor="deposit">Depósito de Garantía (ARS)</Label>
                    <Input
                      id="deposit"
                      type="number"
                      min={0}
                      className="mt-1.5"
                      placeholder="1700000"
                      {...register("deposit")}
                    />
                    <FieldError message={errors.deposit?.message} />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <Label htmlFor="expenses">Expensas (ARS)</Label>
                    <Input
                      id="expenses"
                      type="number"
                      min={0}
                      className="mt-1.5"
                      placeholder="105000"
                      {...register("expenses")}
                    />
                  </div>
                  <div>
                    <Label htmlFor="annualIncreasePercent">Ajuste Anual (%)</Label>
                    <Input
                      id="annualIncreasePercent"
                      type="number"
                      min={0}
                      max={100}
                      step={0.5}
                      className="mt-1.5"
                      placeholder="3"
                      {...register("annualIncreasePercent")}
                    />
                  </div>
                  <div>
                    <Label htmlFor="noticePeriodDays">Preaviso (días)</Label>
                    <Input
                      id="noticePeriodDays"
                      type="number"
                      min={0}
                      className="mt-1.5"
                      placeholder="30"
                      {...register("noticePeriodDays")}
                    />
                  </div>
                </div>

                <Controller
                  name="renewalOption"
                  control={control}
                  render={({ field }) => (
                    <Checkbox
                      label="Renovación automática al vencimiento"
                      checked={field.value}
                      onChange={(e) => field.onChange(e.target.checked)}
                    />
                  )}
                />
              </FormSection>

              <Separator />

              {/* Términos */}
              <FormSection title="Términos y Condiciones">
                <Textarea
                  rows={4}
                  placeholder="Describí las condiciones particulares del contrato, cláusulas especiales, etc."
                  {...register("terms")}
                />
                <FieldError message={errors.terms?.message} />
              </FormSection>
            </div>
          </ScrollArea>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isMutating}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isMutating} className="min-w-[120px]">
              {isMutating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {editingId ? "Guardar Cambios" : "Crear Contrato"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
