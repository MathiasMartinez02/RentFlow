"use client";

import { MapPin, BedDouble, Bath, Maximize2, MoreHorizontal, Pencil, Trash2, Eye } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatCurrency, getInitials } from "@/shared/utils/format";
import type { Property } from "@/types/property";
import type { Tenant } from "@/types/tenant";

const TYPE_GRADIENTS: Record<Property["type"], string> = {
  apartment: "from-indigo-950 via-indigo-900/60 to-violet-950",
  house: "from-emerald-950 via-emerald-900/60 to-teal-950",
  commercial: "from-amber-950 via-amber-900/60 to-orange-950",
  studio: "from-purple-950 via-purple-900/60 to-pink-950",
};

const TYPE_ACCENT: Record<Property["type"], string> = {
  apartment: "text-indigo-400",
  house: "text-emerald-400",
  commercial: "text-amber-400",
  studio: "text-purple-400",
};

const STATUS_BADGE: Record<
  Property["status"],
  { label: string; variant: "success" | "default" | "warning" | "secondary" }
> = {
  occupied: { label: "Ocupado", variant: "success" },
  available: { label: "Disponible", variant: "default" },
  maintenance: { label: "Mantenimiento", variant: "warning" },
  reserved: { label: "Reservado", variant: "secondary" },
};

function PropertyTypeIcon({ type }: { type: Property["type"] }) {
  const labels: Record<Property["type"], string> = {
    apartment: "DEP",
    house: "CAS",
    commercial: "COM",
    studio: "EST",
  };
  return (
    <span className={cn("text-[10px] font-bold tracking-widest uppercase", TYPE_ACCENT[type])}>
      {labels[type]}
    </span>
  );
}

interface PropertyCardProps {
  property: Property;
  tenant?: Tenant | null;
  index?: number;
  onView: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

export function PropertyCard({
  property,
  tenant,
  index = 0,
  onView,
  onEdit,
  onDelete,
}: PropertyCardProps) {
  const status = STATUS_BADGE[property.status];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.04 }}
      whileHover={{ y: -2, transition: { duration: 0.15 } }}
    >
      <Card
        className="group cursor-pointer overflow-hidden transition-all duration-200 hover:border-border/70 hover:shadow-lg hover:shadow-black/10"
        onClick={() => onView(property.id)}
      >
        {/* Image / Gradient Header */}
        <div
          className={cn(
            "relative h-44 bg-gradient-to-br",
            TYPE_GRADIENTS[property.type]
          )}
        >
          {/* Grid overlay texture */}
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage:
                "radial-gradient(circle, rgba(255,255,255,0.15) 1px, transparent 1px)",
              backgroundSize: "20px 20px",
            }}
          />

          {/* Type badge - top left */}
          <div className="absolute left-3 top-3">
            <div className="flex items-center gap-1.5 rounded-md border border-white/10 bg-black/30 px-2 py-1 backdrop-blur-sm">
              <PropertyTypeIcon type={property.type} />
            </div>
          </div>

          {/* Actions - top right */}
          <div
            className="absolute right-3 top-3 flex items-center gap-1.5"
            onClick={(e) => e.stopPropagation()}
          >
            <Badge variant={status.variant}>{status.label}</Badge>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex h-7 w-7 items-center justify-center rounded-md border border-white/10 bg-black/30 text-white/70 backdrop-blur-sm transition-all hover:bg-black/50 hover:text-white">
                  <MoreHorizontal className="h-4 w-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40">
                <DropdownMenuItem onClick={() => onView(property.id)}>
                  <Eye className="mr-2 h-4 w-4" />
                  Ver detalles
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onEdit(property.id)}>
                  <Pencil className="mr-2 h-4 w-4" />
                  Editar propiedad
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => onDelete(property.id)}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Eliminar
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Bottom fade */}
          <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-card/80 to-transparent" />
        </div>

        {/* Content */}
        <CardContent className="p-4">
          <div className="space-y-0.5">
            <h3 className="truncate text-sm font-semibold text-foreground transition-colors group-hover:text-primary">
              {property.name}
            </h3>
            <p className="flex items-center gap-1 truncate text-xs text-muted-foreground">
              <MapPin className="h-3 w-3 shrink-0" />
              {property.address}, {property.city}
            </p>
          </div>

          <div className="mt-3 flex items-end justify-between">
            <div>
              <p className="text-xl font-bold leading-none text-foreground">
                {formatCurrency(property.rent)}
                <span className="text-xs font-normal text-muted-foreground">/mes</span>
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              {property.bedrooms > 0 && (
                <span className="flex items-center gap-1">
                  <BedDouble className="h-3 w-3" />
                  {property.bedrooms}
                </span>
              )}
              <span className="flex items-center gap-1">
                <Bath className="h-3 w-3" />
                {property.bathrooms}
              </span>
              <span className="flex items-center gap-1">
                <Maximize2 className="h-3 w-3" />
                {property.area.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Tenant row */}
          <Separator className="my-3" />
          {tenant ? (
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/15 text-[10px] font-semibold text-primary">
                {getInitials(tenant.firstName, tenant.lastName)}
              </div>
              <span className="flex-1 truncate text-xs text-muted-foreground">
                {tenant.firstName} {tenant.lastName}
              </span>
              <span className="text-[11px] font-medium text-primary">Ver →</span>
            </div>
          ) : (
            <p className="text-xs text-muted-foreground/60 italic">Sin inquilino actual</p>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

export function PropertyCardSkeleton() {
  return (
    <Card className="overflow-hidden">
      <Skeleton className="h-44 rounded-none" />
      <CardContent className="p-4 space-y-3">
        <div className="space-y-1.5">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-full" />
        </div>
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-3 w-24" />
        </div>
        <Separator />
        <div className="flex items-center gap-2">
          <Skeleton className="h-6 w-6 rounded-full" />
          <Skeleton className="h-3 flex-1" />
        </div>
      </CardContent>
    </Card>
  );
}
