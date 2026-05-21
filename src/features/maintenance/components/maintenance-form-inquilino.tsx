"use client";

import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import type { MaintenanceFormValues } from "../schemas/maintenance.schema";

const inquilinoSchema = z.object({
  title: z.string().min(3, "El título debe tener al menos 3 caracteres"),
  description: z.string().min(10, "Describí el problema con más detalle"),
  category: z.enum(["plumbing", "electrical", "painting", "cleaning", "security", "general"]),
});

type InquilinoFormValues = z.infer<typeof inquilinoSchema>;

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="mt-1 text-xs text-destructive">{message}</p>;
}

interface MaintenanceFormInquilinoProps {
  isOpen: boolean;
  isMutating: boolean;
  propertyId: string;
  tenantId: string;
  onSubmit: (data: MaintenanceFormValues) => Promise<void>;
  onClose: () => void;
}

export function MaintenanceFormInquilino({
  isOpen,
  isMutating,
  propertyId,
  tenantId,
  onSubmit,
  onClose,
}: MaintenanceFormInquilinoProps) {
  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<InquilinoFormValues>({
    resolver: zodResolver(inquilinoSchema),
    defaultValues: { title: "", description: "", category: "general" },
  });

  useEffect(() => {
    if (isOpen) reset({ title: "", description: "", category: "general" });
  }, [isOpen, reset]);

  const handleFormSubmit = async (data: InquilinoFormValues) => {
    const fullData: MaintenanceFormValues = {
      ...data,
      propertyId,
      tenantId,
      priority: "medium",
      status: "pending",
      assignedTo: "",
      estimatedCost: "",
      finalCost: "",
      reportedAt: new Date().toISOString().split("T")[0],
      notes: "",
    };
    await onSubmit(fullData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md p-0 gap-0">
        <DialogHeader className="px-6 pt-6 pb-4">
          <DialogTitle>Reportar un Problema</DialogTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Describí el problema y nos pondremos en contacto a la brevedad.
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="flex flex-col">
          <div className="space-y-4 px-6 pb-4">
            <div>
              <Label htmlFor="title">¿Qué pasó?</Label>
              <Input
                id="title"
                placeholder="Ej: Gotera en el baño, sin agua caliente..."
                className="mt-1.5"
                {...register("title")}
              />
              <FieldError message={errors.title?.message} />
            </div>

            <div>
              <Label htmlFor="description">Descripción del problema</Label>
              <Textarea
                id="description"
                rows={4}
                placeholder="Contanos más detalles: ¿cuándo empezó?, ¿qué tan grave es?, ¿afecta algún servicio?"
                className="mt-1.5"
                {...register("description")}
              />
              <FieldError message={errors.description?.message} />
            </div>

            <div>
              <Label>Tipo de problema</Label>
              <Controller
                name="category"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="mt-1.5">
                      <SelectValue placeholder="Seleccionar tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="plumbing">🔧 Plomería</SelectItem>
                      <SelectItem value="electrical">⚡ Electricidad</SelectItem>
                      <SelectItem value="painting">🎨 Pintura / Humedad</SelectItem>
                      <SelectItem value="cleaning">🧹 Limpieza</SelectItem>
                      <SelectItem value="security">🔒 Seguridad / Cerradura</SelectItem>
                      <SelectItem value="general">🏠 Otro</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              <FieldError message={errors.category?.message} />
            </div>
          </div>

          <DialogFooter className="px-6 py-4 border-t border-border">
            <Button type="button" variant="outline" onClick={onClose} disabled={isMutating}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isMutating} className="min-w-[140px]">
              {isMutating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Enviar Reporte
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
