import type { PropertyType } from "@/types/property";

// Etiquetas en español para el tipo de propiedad (uso en el sitio público)
export const PROPERTY_TYPE_LABELS: Record<PropertyType, string> = {
  apartment: "Departamento",
  house: "Casa",
  commercial: "Local",
  studio: "Oficina",
};

// Opciones de tipo de propiedad para los selects del sitio público
export const PROPERTY_TYPE_OPTIONS: { value: PropertyType; label: string }[] = (
  Object.entries(PROPERTY_TYPE_LABELS) as [PropertyType, string][]
).map(([value, label]) => ({ value, label }));
