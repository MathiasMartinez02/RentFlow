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
import { MOCK_PROPERTIES } from "@/mock/properties";
import { PROPERTY_AMENITIES } from "@/types/property";
import {
  propertySchema,
  DEFAULT_PROPERTY_VALUES,
  type PropertyFormValues,
} from "../schemas/property.schema";

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

interface PropertyFormProps {
  isOpen: boolean;
  editingId: string | null;
  isMutating: boolean;
  onSubmit: (data: PropertyFormValues) => Promise<void>;
  onClose: () => void;
}

export function PropertyForm({
  isOpen,
  editingId,
  isMutating,
  onSubmit,
  onClose,
}: PropertyFormProps) {
  const editingProperty = useMemo(
    () => (editingId ? MOCK_PROPERTIES.find((p) => p.id === editingId) : null),
    [editingId]
  );

  const defaultValues: PropertyFormValues = useMemo(() => {
    if (!editingProperty) return DEFAULT_PROPERTY_VALUES;
    return {
      name: editingProperty.name,
      type: editingProperty.type,
      status: editingProperty.status,
      address: editingProperty.address,
      city: editingProperty.city,
      state: editingProperty.state ?? "",
      bedrooms: editingProperty.bedrooms,
      bathrooms: editingProperty.bathrooms,
      area: editingProperty.area,
      rent: editingProperty.rent,
      deposit: editingProperty.deposit,
      yearBuilt: editingProperty.yearBuilt ?? ("" as never),
      parking: editingProperty.parking ?? false,
      petFriendly: editingProperty.petFriendly ?? false,
      furnished: editingProperty.furnished ?? false,
      amenities: editingProperty.amenities ?? [],
      description: editingProperty.description ?? "",
    };
  }, [editingProperty]);

  const {
    register,
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<PropertyFormValues>({
    resolver: zodResolver(propertySchema),
    defaultValues,
  });

  useEffect(() => {
    if (isOpen) reset(defaultValues);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, editingId]);

  const watchedAmenities = watch("amenities") ?? [];

  function toggleAmenity(amenity: string) {
    const current = watchedAmenities;
    setValue(
      "amenities",
      current.includes(amenity)
        ? current.filter((a) => a !== amenity)
        : [...current, amenity],
      { shouldDirty: true }
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl p-0 gap-0">
        <DialogHeader className="px-6 pt-6 pb-4">
          <DialogTitle>
            {editingId ? "Editar Propiedad" : "Agregar Nueva Propiedad"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)}>
          <ScrollArea className="max-h-[calc(85vh-140px)]">
            <div className="space-y-6 px-6 pb-4">
              {/* Basic Info */}
              <FormSection title="Información Básica">
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="name">Nombre de la Propiedad</Label>
                    <Input
                      id="name"
                      className="mt-1.5"
                      placeholder="ej. El Meridiano - Dpto. 4A"
                      {...register("name")}
                    />
                    <FieldError message={errors.name?.message} />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label>Tipo de Propiedad</Label>
                      <Controller
                        name="type"
                        control={control}
                        render={({ field }) => (
                          <Select value={field.value} onValueChange={field.onChange}>
                            <SelectTrigger className="mt-1.5">
                              <SelectValue placeholder="Seleccionar tipo" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="apartment">Departamento</SelectItem>
                              <SelectItem value="house">Casa</SelectItem>
                              <SelectItem value="commercial">Comercial</SelectItem>
                              <SelectItem value="studio">Estudio</SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                      />
                      <FieldError message={errors.type?.message} />
                    </div>
                    <div>
                      <Label>Estado</Label>
                      <Controller
                        name="status"
                        control={control}
                        render={({ field }) => (
                          <Select value={field.value} onValueChange={field.onChange}>
                            <SelectTrigger className="mt-1.5">
                              <SelectValue placeholder="Seleccionar estado" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="available">Disponible</SelectItem>
                              <SelectItem value="occupied">Ocupado</SelectItem>
                              <SelectItem value="maintenance">Mantenimiento</SelectItem>
                              <SelectItem value="reserved">Reservado</SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="address">Dirección</Label>
                    <Input
                      id="address"
                      className="mt-1.5"
                      placeholder="Av. Santa Fe 742, Dpto. 4A"
                      {...register("address")}
                    />
                    <FieldError message={errors.address?.message} />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="city">Ciudad</Label>
                      <Input
                        id="city"
                        className="mt-1.5"
                        placeholder="Buenos Aires"
                        {...register("city")}
                      />
                      <FieldError message={errors.city?.message} />
                    </div>
                    <div>
                      <Label htmlFor="state">Provincia</Label>
                      <Input
                        id="state"
                        className="mt-1.5"
                        placeholder="CABA"
                        {...register("state")}
                      />
                    </div>
                  </div>
                </div>
              </FormSection>

              <Separator />

              {/* Property Details */}
              <FormSection title="Detalles del Inmueble">
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <Label htmlFor="bedrooms">Dormitorios</Label>
                    <Input
                      id="bedrooms"
                      type="number"
                      min={0}
                      className="mt-1.5"
                      {...register("bedrooms")}
                    />
                    <FieldError message={errors.bedrooms?.message} />
                  </div>
                  <div>
                    <Label htmlFor="bathrooms">Baños</Label>
                    <Input
                      id="bathrooms"
                      type="number"
                      min={1}
                      className="mt-1.5"
                      {...register("bathrooms")}
                    />
                    <FieldError message={errors.bathrooms?.message} />
                  </div>
                  <div>
                    <Label htmlFor="area">Superficie (m²)</Label>
                    <Input
                      id="area"
                      type="number"
                      min={1}
                      className="mt-1.5"
                      placeholder="79"
                      {...register("area")}
                    />
                    <FieldError message={errors.area?.message} />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <Label htmlFor="rent">Alquiler Mensual (USD)</Label>
                    <Input
                      id="rent"
                      type="number"
                      min={0}
                      className="mt-1.5"
                      placeholder="3200"
                      {...register("rent")}
                    />
                    <FieldError message={errors.rent?.message} />
                  </div>
                  <div>
                    <Label htmlFor="deposit">Depósito de Garantía (USD)</Label>
                    <Input
                      id="deposit"
                      type="number"
                      min={0}
                      className="mt-1.5"
                      placeholder="6400"
                      {...register("deposit")}
                    />
                    <FieldError message={errors.deposit?.message} />
                  </div>
                  <div>
                    <Label htmlFor="yearBuilt">Año de Construcción</Label>
                    <Input
                      id="yearBuilt"
                      type="number"
                      min={1800}
                      max={new Date().getFullYear()}
                      className="mt-1.5"
                      placeholder="2020"
                      {...register("yearBuilt")}
                    />
                  </div>
                </div>
              </FormSection>

              <Separator />

              {/* Features */}
              <FormSection title="Características">
                <div className="flex items-center gap-6">
                  <Controller
                    name="parking"
                    control={control}
                    render={({ field }) => (
                      <Checkbox
                        label="Cochera"
                        checked={field.value}
                        onChange={(e) => field.onChange(e.target.checked)}
                      />
                    )}
                  />
                  <Controller
                    name="petFriendly"
                    control={control}
                    render={({ field }) => (
                      <Checkbox
                        label="Mascotas Permitidas"
                        checked={field.value}
                        onChange={(e) => field.onChange(e.target.checked)}
                      />
                    )}
                  />
                  <Controller
                    name="furnished"
                    control={control}
                    render={({ field }) => (
                      <Checkbox
                        label="Amoblado"
                        checked={field.value}
                        onChange={(e) => field.onChange(e.target.checked)}
                      />
                    )}
                  />
                </div>

                <div>
                  <Label className="mb-2 block">Comodidades</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {PROPERTY_AMENITIES.map((amenity) => (
                      <Checkbox
                        key={amenity}
                        label={amenity}
                        checked={watchedAmenities.includes(amenity)}
                        onChange={() => toggleAmenity(amenity)}
                      />
                    ))}
                  </div>
                </div>
              </FormSection>

              <Separator />

              {/* Description */}
              <FormSection title="Descripción">
                <div>
                  <Textarea
                    rows={4}
                    placeholder="Describí la propiedad, sus puntos destacados y lo que la hace especial..."
                    {...register("description")}
                  />
                  <FieldError message={errors.description?.message} />
                </div>
              </FormSection>
            </div>
          </ScrollArea>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isMutating}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isMutating} className="min-w-[120px]">
              {isMutating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {editingId ? "Guardar Cambios" : "Agregar Propiedad"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
