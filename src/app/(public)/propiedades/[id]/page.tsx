"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { PropertyDetail } from "@/features/public-properties/components/property-detail";
import { publicPropertiesService } from "@/services/public-properties.service";
import type { PublicProperty } from "@/types/public-property";

// Página pública de detalle de una propiedad (obtiene los datos por id en el cliente)
export default function PublicPropertyDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id;
  const [property, setProperty] = useState<PublicProperty | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    let active = true;
    setIsLoading(true);
    // Trae la propiedad pública por id y actualiza el estado si el componente sigue montado
    publicPropertiesService
      .getById(id)
      .then((res) => {
        if (active) setProperty(res);
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });
    return () => {
      active = false;
    };
  }, [id]);

  return (
    <div className="space-y-4">
      <Button asChild variant="ghost" size="sm" className="gap-1.5 -ml-2">
        <Link href="/">
          <ArrowLeft className="h-4 w-4" /> Volver al listado
        </Link>
      </Button>

      {isLoading ? (
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-4">
            <Skeleton className="aspect-[16/9] w-full rounded-xl" />
            <Skeleton className="h-8 w-2/3" />
            <Skeleton className="h-4 w-1/2" />
          </div>
          <Skeleton className="h-80 w-full rounded-xl" />
        </div>
      ) : property ? (
        <PropertyDetail property={property} />
      ) : (
        <EmptyState
          icon={Building2}
          title="Propiedad no encontrada"
          description="La propiedad que buscás no existe o ya no está disponible."
          action={
            <Button asChild variant="outline" size="sm">
              <Link href="/">Ver todas las propiedades</Link>
            </Button>
          }
        />
      )}
    </div>
  );
}
