"use client";

import { MapPin, BedDouble, Bath, Ruler, Building2, ExternalLink, MessageCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { formatCurrency, formatArea } from "@/shared/utils/format";
import { PROPERTY_TYPE_LABELS } from "../lib/property-labels";
import { PropertyGallery } from "./property-gallery";
import { ContactForm } from "./contact-form";
import type { PublicProperty } from "@/types/public-property";

interface PropertyDetailProps {
  property: PublicProperty;
}

// Ficha de detalle de una propiedad pública: galería, datos, mapa, WhatsApp y contacto
export function PropertyDetail({ property }: PropertyDetailProps) {
  // Dirección completa usada para el link a Google Maps
  const direccionCompleta = [property.address, property.city, property.state, property.country]
    .filter(Boolean)
    .join(", ");

  const mapsHref = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(direccionCompleta)}`;

  // Número de WhatsApp de la inmobiliaria tomado de la variable de entorno pública
  const whatsappNumber = (process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "").replace(/[^0-9]/g, "");
  const whatsappMessage = `Hola, me interesa la propiedad "${property.name}" (${formatCurrency(property.rent)}/mes).`;
  const whatsappHref = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`;

  const facts = [
    { icon: BedDouble, label: "Ambientes", value: property.bedrooms },
    { icon: Bath, label: "Baños", value: property.bathrooms },
    { icon: Ruler, label: "Superficie", value: formatArea(property.area) },
    { icon: Building2, label: "Tipo", value: PROPERTY_TYPE_LABELS[property.type] },
  ];

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2 space-y-6">
        <PropertyGallery images={property.images} mainImage={property.mainImage} alt={property.name} />

        <div>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <Badge variant="secondary" className="mb-2">{PROPERTY_TYPE_LABELS[property.type]}</Badge>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">{property.name}</h1>
              <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4 shrink-0" /> {direccionCompleta}
              </p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-foreground">{formatCurrency(property.rent)}</p>
              <p className="text-xs text-muted-foreground">por mes</p>
              {property.expenses ? (
                <p className="text-xs text-muted-foreground">+ {formatCurrency(property.expenses)} expensas</p>
              ) : null}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {facts.map((f) => {
            const Icon = f.icon;
            return (
              <div key={f.label} className="rounded-lg border border-border bg-muted/20 p-3 text-center">
                <Icon className="mx-auto h-5 w-5 text-muted-foreground" />
                <p className="mt-1.5 text-sm font-semibold text-foreground">{f.value}</p>
                <p className="text-[11px] text-muted-foreground">{f.label}</p>
              </div>
            );
          })}
        </div>

        {property.description && (
          <>
            <Separator />
            <div className="space-y-2">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Descripción</h2>
              <p className="text-sm leading-relaxed text-muted-foreground whitespace-pre-line">{property.description}</p>
            </div>
          </>
        )}

        <Separator />

        <div className="flex flex-wrap gap-3">
          <Button asChild variant="outline" className="gap-2">
            <a href={mapsHref} target="_blank" rel="noopener noreferrer">
              <MapPin className="h-4 w-4" /> Ver en Google Maps <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </Button>
          {whatsappNumber && (
            <Button asChild className="gap-2 bg-success text-white hover:bg-success/90">
              <a href={whatsappHref} target="_blank" rel="noopener noreferrer">
                <MessageCircle className="h-4 w-4" /> Consultar por WhatsApp
              </a>
            </Button>
          )}
        </div>
      </div>

      <div className="lg:col-span-1">
        <div className="lg:sticky lg:top-6">
          <ContactForm
            propertyId={property.id}
            propertyName={property.name}
            title="¿Te interesa?"
            description="Dejanos tus datos y te contactamos."
          />
          <Card className="mt-4">
            <CardContent className="p-4 text-xs text-muted-foreground">
              Publicado el {new Date(property.createdAt).toLocaleDateString("es-AR")}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
