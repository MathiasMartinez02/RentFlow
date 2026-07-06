"use client";

import { useState } from "react";
import Image from "next/image";
import { Building2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { PublicPropertyImage } from "@/types/public-property";

interface PropertyGalleryProps {
  images: PublicPropertyImage[];
  mainImage?: string;
  alt: string;
}

// Galería de fotos de la ficha de propiedad, con imagen principal y miniaturas seleccionables
export function PropertyGallery({ images, mainImage, alt }: PropertyGalleryProps) {
  // Arma la lista final de URLs combinando la imagen principal con las de la galería sin duplicar
  const urls = Array.from(
    new Set([mainImage, ...images.map((i) => i.url)].filter(Boolean) as string[])
  );
  const [active, setActive] = useState(0);

  if (urls.length === 0) {
    return (
      <div className="flex aspect-[16/9] w-full items-center justify-center rounded-xl border border-border bg-gradient-to-br from-muted to-muted/40">
        <Building2 className="h-12 w-12 text-muted-foreground/40" />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="relative aspect-[16/9] w-full overflow-hidden rounded-xl border border-border bg-muted">
        <Image
          src={urls[active]}
          alt={alt}
          fill
          sizes="(max-width: 1024px) 100vw, 66vw"
          className="object-cover"
          priority
        />
      </div>

      {urls.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {urls.map((url, idx) => (
            <button
              key={url}
              onClick={() => setActive(idx)}
              className={cn(
                "relative h-16 w-24 shrink-0 overflow-hidden rounded-lg border transition-all",
                idx === active ? "border-primary ring-1 ring-primary" : "border-border opacity-70 hover:opacity-100"
              )}
            >
              <Image src={url} alt={`${alt} ${idx + 1}`} fill sizes="96px" className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
