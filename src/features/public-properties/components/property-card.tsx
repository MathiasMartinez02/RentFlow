"use client";

import Image from "next/image";
import Link from "next/link";
import { BedDouble, Bath, Ruler, MapPin, Building2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatArea } from "@/shared/utils/format";
import { PROPERTY_TYPE_LABELS } from "../lib/property-labels";
import type { PublicProperty } from "@/types/public-property";

interface PropertyCardProps {
  property: PublicProperty;
}

// Tarjeta de una propiedad en el listado público; enlaza a su ficha de detalle
export function PropertyCard({ property }: PropertyCardProps) {
  return (
    <Link
      href={`/propiedades/${property.id}`}
      className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card shadow-sm transition-all hover:shadow-md hover:border-primary/30"
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted">
        {property.mainImage ? (
          <Image
            src={property.mainImage}
            alt={property.name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-muted to-muted/40">
            <Building2 className="h-10 w-10 text-muted-foreground/40" />
          </div>
        )}
        <div className="absolute left-3 top-3">
          <Badge variant="secondary" className="backdrop-blur-sm">
            {PROPERTY_TYPE_LABELS[property.type]}
          </Badge>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <div>
          <h3 className="font-semibold text-foreground leading-snug line-clamp-1 group-hover:text-primary transition-colors">
            {property.name}
          </h3>
          <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
            <MapPin className="h-3 w-3 shrink-0" /> {property.city}
          </p>
        </div>

        <div className="mt-auto flex items-center gap-3 border-t border-border pt-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1"><BedDouble className="h-3.5 w-3.5" /> {property.bedrooms}</span>
          <span className="flex items-center gap-1"><Bath className="h-3.5 w-3.5" /> {property.bathrooms}</span>
          <span className="flex items-center gap-1"><Ruler className="h-3.5 w-3.5" /> {formatArea(property.area)}</span>
        </div>

        <div className="flex items-baseline gap-1">
          <span className="text-lg font-bold text-foreground">{formatCurrency(property.rent)}</span>
          <span className="text-xs text-muted-foreground">/ mes</span>
        </div>
      </div>
    </Link>
  );
}
