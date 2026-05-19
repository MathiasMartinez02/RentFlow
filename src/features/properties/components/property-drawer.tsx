"use client";

import { useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  X,
  MapPin,
  BedDouble,
  Bath,
  Maximize2,
  Pencil,
  Trash2,
  Zap,
  Car,
  PawPrint,
  Sofa,
  Building2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { formatCurrency, formatDate, formatPercent, getInitials } from "@/shared/utils/format";
import { MOCK_PROPERTIES } from "@/mock/properties";
import { MOCK_TENANTS } from "@/mock/tenants";
import { MOCK_CONTRACTS } from "@/mock/contracts";
import { MOCK_DASHBOARD_DATA } from "@/mock/dashboard";
import type { Property } from "@/types/property";

const STATUS_BADGE: Record<
  Property["status"],
  { label: string; variant: "success" | "default" | "warning" | "secondary" }
> = {
  occupied: { label: "Ocupado", variant: "success" },
  available: { label: "Disponible", variant: "default" },
  maintenance: { label: "Mantenimiento", variant: "warning" },
  reserved: { label: "Reservado", variant: "secondary" },
};

const TYPE_GRADIENTS: Record<Property["type"], string> = {
  apartment: "from-indigo-950 via-indigo-900/60 to-violet-950",
  house: "from-emerald-950 via-emerald-900/60 to-teal-950",
  commercial: "from-amber-950 via-amber-900/60 to-orange-950",
  studio: "from-purple-950 via-purple-900/60 to-pink-950",
};

interface PropertyDrawerProps {
  propertyId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

export function PropertyDrawer({
  propertyId,
  isOpen,
  onClose,
  onEdit,
  onDelete,
}: PropertyDrawerProps) {
  return (
    <AnimatePresence>
      {isOpen && propertyId && (
        <DrawerContent
          key={propertyId}
          propertyId={propertyId}
          onClose={onClose}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      )}
    </AnimatePresence>
  );
}

function DrawerContent({
  propertyId,
  onClose,
  onEdit,
  onDelete,
}: {
  propertyId: string;
  onClose: () => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const prop = MOCK_PROPERTIES.find((p) => p.id === propertyId);
  const tenant = prop?.tenantId ? MOCK_TENANTS.find((t) => t.id === prop.tenantId) : null;
  const contract = prop?.contractId
    ? MOCK_CONTRACTS.find((c) => c.id === prop.contractId)
    : null;
  const activity = useMemo(
    () =>
      MOCK_DASHBOARD_DATA.recentActivity.filter(
        (a) => a.entityId === propertyId || (tenant && a.entityId === tenant.id)
      ),
    [propertyId, tenant]
  );

  if (!prop) return null;

  const status = STATUS_BADGE[prop.status];
  const annualRevenue = prop.rent * 12;
  const estimatedGrossYield = 8.4;

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-40 bg-background/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Drawer panel */}
      <motion.aside
        initial={{ x: "100%", opacity: 0.5 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: "100%", opacity: 0 }}
        transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="fixed inset-y-0 right-0 z-50 flex w-full flex-col border-l border-border bg-background shadow-2xl sm:w-[480px]"
      >
        {/* Image header */}
        <div
          className={cn(
            "relative h-48 shrink-0 bg-gradient-to-br",
            TYPE_GRADIENTS[prop.type]
          )}
        >
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage:
                "radial-gradient(circle, rgba(255,255,255,0.2) 1px, transparent 1px)",
              backgroundSize: "18px 18px",
            }}
          />

          <button
            onClick={onClose}
            className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-md border border-white/10 bg-black/30 text-white/70 backdrop-blur-sm transition-all hover:bg-black/50 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>

          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-background to-transparent px-5 pb-4 pt-8">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Badge variant={status.variant}>{status.label}</Badge>
                <Badge variant="outline" className="capitalize">{prop.type}</Badge>
              </div>
              <h2 className="text-lg font-bold text-foreground">{prop.name}</h2>
              <p className="flex items-center gap-1 text-xs text-muted-foreground">
                <MapPin className="h-3 w-3" />
                {prop.address}, {prop.city}, {prop.state}
              </p>
            </div>
          </div>
        </div>

        {/* Quick actions */}
        <div className="flex items-center justify-between border-b border-border px-5 py-3">
          <span className="text-xl font-bold text-foreground">
            {formatCurrency(prop.rent)}
            <span className="text-xs font-normal text-muted-foreground">/mo</span>
          </span>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="h-8 gap-1.5" onClick={() => onEdit(prop.id)}>
              <Pencil className="h-3.5 w-3.5" />
              Editar
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-8 gap-1.5 text-destructive hover:border-destructive hover:text-destructive"
              onClick={() => onDelete(prop.id)}
            >
              <Trash2 className="h-3.5 w-3.5" />
              Eliminar
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="overview" className="flex min-h-0 flex-1 flex-col">
          <TabsList className="h-auto shrink-0 justify-start gap-0 rounded-none border-b border-border bg-transparent px-5 py-0">
            {[
              { value: "overview", label: "General" },
              { value: "tenant", label: "Inquilino" },
              { value: "financials", label: "Finanzas" },
              { value: "activity", label: "Actividad" },
            ].map((tab) => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className="h-10 rounded-none border-b-2 border-transparent px-4 data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none"
              >
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>

          <ScrollArea className="flex-1">
            {/* OVERVIEW TAB */}
            <TabsContent value="overview" className="mt-0 p-5 space-y-5">
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: "Dormitorios", value: prop.bedrooms > 0 ? prop.bedrooms : "Estudio", icon: BedDouble },
                  { label: "Baños", value: prop.bathrooms, icon: Bath },
                  { label: "Superficie", value: `${prop.area.toLocaleString()} m²`, icon: Maximize2 },
                ].map((s) => (
                  <div key={s.label} className="flex flex-col items-center gap-1 rounded-lg border border-border bg-muted/30 p-3">
                    <s.icon className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-semibold text-foreground">{s.value}</span>
                    <span className="text-[11px] text-muted-foreground">{s.label}</span>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap gap-2">
                {prop.parking && (
                  <div className="flex items-center gap-1.5 rounded-full border border-border px-3 py-1 text-xs text-muted-foreground">
                    <Car className="h-3 w-3" /> Cochera
                  </div>
                )}
                {prop.petFriendly && (
                  <div className="flex items-center gap-1.5 rounded-full border border-border px-3 py-1 text-xs text-muted-foreground">
                    <PawPrint className="h-3 w-3" /> Mascotas Permitidas
                  </div>
                )}
                {prop.furnished && (
                  <div className="flex items-center gap-1.5 rounded-full border border-border px-3 py-1 text-xs text-muted-foreground">
                    <Sofa className="h-3 w-3" /> Amoblado
                  </div>
                )}
                {prop.yearBuilt && (
                  <div className="flex items-center gap-1.5 rounded-full border border-border px-3 py-1 text-xs text-muted-foreground">
                    <Building2 className="h-3 w-3" /> Año {prop.yearBuilt}
                  </div>
                )}
              </div>

              {prop.amenities && prop.amenities.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Comodidades</p>
                  <div className="flex flex-wrap gap-1.5">
                    {prop.amenities.map((a) => (
                      <div key={a} className="flex items-center gap-1 rounded-md bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
                        <Zap className="h-2.5 w-2.5" />
                        {a}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {prop.description && (
                <div className="space-y-2">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Descripción</p>
                  <p className="text-sm leading-relaxed text-muted-foreground">{prop.description}</p>
                </div>
              )}
            </TabsContent>

            {/* TENANT TAB */}
            <TabsContent value="tenant" className="mt-0 p-5 space-y-5">
              {tenant ? (
                <>
                  <div className="flex items-center gap-3 rounded-xl border border-border p-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/15 text-base font-bold text-primary">
                      {getInitials(tenant.firstName, tenant.lastName)}
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">{tenant.firstName} {tenant.lastName}</p>
                      <p className="text-xs text-muted-foreground">{tenant.email}</p>
                      <p className="text-xs text-muted-foreground">{tenant.phone}</p>
                    </div>
                  </div>

                  {contract && (
                    <div className="space-y-3">
                      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Detalles del Contrato</p>
                      <div className="divide-y divide-border rounded-lg border border-border">
                        {[
                          { label: "Fecha de inicio", value: formatDate(contract.startDate, "long") },
                          { label: "Fecha de vencimiento", value: formatDate(contract.endDate, "long") },
                          { label: "Alquiler mensual", value: formatCurrency(contract.monthlyRent) },
                          { label: "Depósito de garantía", value: formatCurrency(contract.deposit) },
                          { label: "Preaviso", value: `${contract.noticePeriodDays} días` },
                          { label: "Opción de renovación", value: contract.renewalOption ? "Sí" : "No" },
                        ].map(({ label, value }) => (
                          <div key={label} className="flex items-center justify-between px-4 py-2.5">
                            <span className="text-xs text-muted-foreground">{label}</span>
                            <span className="text-xs font-medium text-foreground">{value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Contacto de Emergencia</p>
                    <div className="rounded-lg border border-border p-3 space-y-0.5">
                      <p className="text-sm font-medium text-foreground">{tenant.emergencyContact.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {tenant.emergencyContact.relationship} · {tenant.emergencyContact.phone}
                      </p>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center gap-3 py-12 text-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                    <BedDouble className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">Sin inquilino asignado</p>
                    <p className="text-xs text-muted-foreground">Esta propiedad está actualmente vacante</p>
                  </div>
                  <Button size="sm" variant="outline">Buscar Inquilino</Button>
                </div>
              )}
            </TabsContent>

            {/* FINANCIALS TAB */}
            <TabsContent value="financials" className="mt-0 p-5 space-y-5">
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Ingreso Mensual", value: formatCurrency(prop.rent), sub: "bruto mensual", color: "text-success" },
                  { label: "Ingreso Anual", value: formatCurrency(annualRevenue), sub: "proyectado", color: "text-foreground" },
                  { label: "Depósito", value: formatCurrency(prop.deposit), sub: "garantía", color: "text-foreground" },
                  { label: "Rendimiento Bruto", value: formatPercent(estimatedGrossYield), sub: "estimado", color: "text-primary" },
                ].map((item) => (
                  <div key={item.label} className="rounded-lg border border-border bg-muted/20 p-3 space-y-1">
                    <p className="text-xs text-muted-foreground">{item.label}</p>
                    <p className={cn("text-lg font-bold leading-none", item.color)}>{item.value}</p>
                    <p className="text-[11px] text-muted-foreground/60">{item.sub}</p>
                  </div>
                ))}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Ocupación</p>
                  <span className="text-xs font-medium text-foreground">
                    {prop.status === "occupied" ? "100%" : "0%"}
                  </span>
                </div>
                <Progress value={prop.status === "occupied" ? 100 : 0} className="h-1.5" />
              </div>

              <div className="rounded-lg border border-border bg-muted/10 p-4 space-y-2">
                <p className="text-xs font-semibold text-muted-foreground mb-2">Gastos Mensuales (Estimados)</p>
                {[
                  { label: "Administración (8%)", value: prop.rent * 0.08 },
                  { label: "Reserva mantenimiento (5%)", value: prop.rent * 0.05 },
                  { label: "Seguros", value: 180 },
                  { label: "Impuestos (6%)", value: prop.rent * 0.06 },
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between text-xs">
                    <span className="text-muted-foreground">{label}</span>
                    <span className="font-medium text-foreground">{formatCurrency(value)}</span>
                  </div>
                ))}
                <Separator />
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-foreground">Neto Mensual</span>
                  <span className="text-success">
                    {formatCurrency(prop.rent - prop.rent * 0.19 - 180)}
                  </span>
                </div>
              </div>
            </TabsContent>

            {/* ACTIVITY TAB */}
            <TabsContent value="activity" className="mt-0 p-5">
              {activity.length === 0 ? (
                <p className="py-8 text-center text-sm text-muted-foreground">
                  Sin actividad reciente para esta propiedad
                </p>
              ) : (
                <div className="space-y-1">
                  {activity.map((event) => (
                    <div key={event.id} className="flex items-start gap-3 rounded-lg p-2 hover:bg-accent/30 transition-colors">
                      <div className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-medium text-foreground">{event.title}</p>
                        <p className="text-xs text-muted-foreground">{event.description}</p>
                      </div>
                      <time className="shrink-0 text-[11px] text-muted-foreground/60">
                        {formatDate(event.timestamp, "relative")}
                      </time>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </motion.aside>
    </>
  );
}
