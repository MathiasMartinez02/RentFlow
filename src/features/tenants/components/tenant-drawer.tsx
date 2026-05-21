"use client";

import { useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  X,
  Mail,
  Phone,
  MapPin,
  Pencil,
  Trash2,
  CreditCard,
  CheckCircle2,
  XCircle,
  Clock,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatCurrency, formatDate, getInitials } from "@/shared/utils/format";
import { useCatalogStore } from "@/store/catalog.store";
import type { Tenant } from "@/types/tenant";

const STATUS_BADGE: Record<
  Tenant["status"],
  { label: string; variant: "success" | "default" | "warning" | "secondary" }
> = {
  active: { label: "Activo", variant: "success" },
  inactive: { label: "Inactivo", variant: "secondary" },
  pending: { label: "Pendiente", variant: "warning" },
};

const PAYMENT_STATUS_BADGE: Record<
  NonNullable<Tenant["paymentStatus"]>,
  { label: string; variant: "success" | "destructive" | "warning" }
> = {
  al_dia: { label: "Al día", variant: "success" },
  atrasado: { label: "Atrasado", variant: "destructive" },
  pendiente: { label: "Pendiente", variant: "warning" },
};

const PAYMENT_METHOD_LABELS: Record<string, string> = {
  transferencia: "Transferencia",
  efectivo: "Efectivo",
  cheque: "Cheque",
  tarjeta: "Tarjeta",
};

const AVATAR_GRADIENTS = [
  "from-indigo-950 via-indigo-900/60 to-violet-950",
  "from-emerald-950 via-emerald-900/60 to-teal-950",
  "from-amber-950 via-amber-900/60 to-orange-950",
  "from-rose-950 via-rose-900/60 to-pink-950",
  "from-purple-950 via-purple-900/60 to-fuchsia-950",
];

interface TenantDrawerProps {
  tenantId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
}

export function TenantDrawer({ tenantId, isOpen, onClose, onEdit, onDelete }: TenantDrawerProps) {
  return (
    <AnimatePresence>
      {isOpen && tenantId && (
        <DrawerContent
          key={tenantId}
          tenantId={tenantId}
          onClose={onClose}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      )}
    </AnimatePresence>
  );
}

function DrawerContent({
  tenantId,
  onClose,
  onEdit,
  onDelete,
}: {
  tenantId: string;
  onClose: () => void;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
}) {
  const { tenants, contracts, properties } = useCatalogStore();
  const tenant = tenants.find((t) => t.id === tenantId);
  const contract = tenant?.contractId
    ? contracts.find((c) => c.id === tenant.contractId)
    : null;
  const property = tenant?.propertyId
    ? properties.find((p) => p.id === tenant.propertyId)
    : null;
  // Payments and activity loaded lazily; show empty state until populated
  const payments: import("@/types/payment").Payment[] = [];
  const activity: { id: string; title: string; description: string; timestamp: string }[] = [];

  if (!tenant) return null;

  const status = STATUS_BADGE[tenant.status];
  const paymentStatus = tenant.paymentStatus ? PAYMENT_STATUS_BADGE[tenant.paymentStatus] : null;
  const gradientIdx = parseInt(tenantId.replace(/\D/g, "").slice(-1) || "0") % AVATAR_GRADIENTS.length;

  const isContractExpiringSoon =
    contract &&
    new Date(contract.endDate).getTime() - Date.now() < 1000 * 60 * 60 * 24 * 90;

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-40 bg-background/60 backdrop-blur-sm"
        onClick={onClose}
      />

      <motion.aside
        initial={{ x: "100%", opacity: 0.5 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: "100%", opacity: 0 }}
        transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="fixed inset-y-0 right-0 z-50 flex w-full flex-col border-l border-border bg-background shadow-2xl sm:w-[480px]"
      >
        {/* Header banner */}
        <div className={cn("relative h-40 shrink-0 bg-gradient-to-br", AVATAR_GRADIENTS[gradientIdx])}>
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

          <div className="absolute inset-x-0 bottom-0 px-5 pb-4">
            <div className="flex items-end gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border-2 border-white/20 bg-white/10 text-xl font-bold text-white backdrop-blur-sm">
                {getInitials(tenant.firstName, tenant.lastName)}
              </div>
              <div className="mb-0.5 space-y-1">
                <div className="flex items-center gap-2">
                  <Badge variant={status.variant}>{status.label}</Badge>
                  {paymentStatus && (
                    <Badge variant={paymentStatus.variant}>{paymentStatus.label}</Badge>
                  )}
                  {isContractExpiringSoon && (
                    <Badge variant="warning">Contrato por vencer</Badge>
                  )}
                </div>
                <h2 className="text-lg font-bold text-white">
                  {tenant.firstName} {tenant.lastName}
                </h2>
              </div>
            </div>
          </div>
        </div>

        {/* Quick info + actions */}
        <div className="flex items-center justify-between border-b border-border px-5 py-3">
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Mail className="h-3 w-3" />
              {tenant.email}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {onEdit && (
              <Button variant="outline" size="sm" className="h-8 gap-1.5" onClick={() => onEdit(tenant.id)}>
                <Pencil className="h-3.5 w-3.5" />
                Editar
              </Button>
            )}
            {onDelete && (
              <Button
                variant="outline"
                size="sm"
                className="h-8 gap-1.5 text-destructive hover:border-destructive hover:text-destructive"
                onClick={() => onDelete(tenant.id)}
              >
                <Trash2 className="h-3.5 w-3.5" />
                Eliminar
              </Button>
            )}
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="perfil" className="flex min-h-0 flex-1 flex-col">
          <TabsList className="h-auto shrink-0 justify-start gap-0 rounded-none border-b border-border bg-transparent px-5 py-0">
            {[
              { value: "perfil", label: "Perfil" },
              { value: "contrato", label: "Contrato" },
              { value: "pagos", label: "Pagos" },
              { value: "actividad", label: "Actividad" },
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
            {/* PERFIL TAB */}
            <TabsContent value="perfil" className="mt-0 p-5 space-y-5">
              <div className="space-y-3">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Datos Personales
                </p>
                <div className="divide-y divide-border rounded-lg border border-border">
                  {[
                    { label: "DNI", value: tenant.nationalId, icon: User },
                    { label: "Teléfono", value: tenant.phone, icon: Phone },
                    { label: "Email", value: tenant.email, icon: Mail },
                    ...(tenant.address
                      ? [{ label: "Domicilio", value: tenant.address, icon: MapPin }]
                      : []),
                    ...(tenant.moveInDate
                      ? [{ label: "Fecha de ingreso", value: formatDate(tenant.moveInDate, "long"), icon: CheckCircle2 }]
                      : []),
                    ...(tenant.moveOutDate
                      ? [{ label: "Fecha de egreso", value: formatDate(tenant.moveOutDate, "long"), icon: XCircle }]
                      : []),
                  ].map(({ label, value, icon: Icon }) => (
                    <div key={label} className="flex items-start gap-3 px-4 py-2.5">
                      <Icon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                      <div className="flex flex-1 items-start justify-between gap-2 min-w-0">
                        <span className="text-xs text-muted-foreground whitespace-nowrap">{label}</span>
                        <span className="text-xs font-medium text-foreground text-right break-all">{value}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Contacto de Emergencia
                </p>
                <div className="rounded-lg border border-border p-3 space-y-0.5">
                  <p className="text-sm font-medium text-foreground">{tenant.emergencyContact.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {tenant.emergencyContact.relationship} · {tenant.emergencyContact.phone}
                  </p>
                </div>
              </div>

              {tenant.observations && (
                <div className="space-y-2">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Observaciones
                  </p>
                  <p className="rounded-lg border border-border bg-muted/20 px-4 py-3 text-sm leading-relaxed text-muted-foreground">
                    {tenant.observations}
                  </p>
                </div>
              )}
            </TabsContent>

            {/* CONTRATO TAB */}
            <TabsContent value="contrato" className="mt-0 p-5 space-y-5">
              {contract && property ? (
                <>
                  <div className="rounded-xl border border-border bg-muted/20 p-4 space-y-1">
                    <p className="text-xs text-muted-foreground">Propiedad</p>
                    <p className="font-semibold text-foreground">{property.name}</p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {property.address}, {property.city}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Detalles del Contrato
                    </p>
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

                  {isContractExpiringSoon && (
                    <div className="flex items-start gap-3 rounded-lg border border-warning/30 bg-warning/10 p-3">
                      <Clock className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
                      <div>
                        <p className="text-xs font-medium text-warning">Contrato por vencer</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Este contrato vence el {formatDate(contract.endDate, "long")}. Contactá al inquilino para gestionar la renovación.
                        </p>
                      </div>
                    </div>
                  )}

                  {contract.terms && (
                    <div className="space-y-2">
                      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Términos</p>
                      <p className="text-xs leading-relaxed text-muted-foreground">{contract.terms}</p>
                    </div>
                  )}
                </>
              ) : (
                <div className="flex flex-col items-center gap-3 py-12 text-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                    <CreditCard className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">Sin contrato activo</p>
                    <p className="text-xs text-muted-foreground">Este inquilino no tiene un contrato asignado</p>
                  </div>
                </div>
              )}
            </TabsContent>

            {/* PAGOS TAB */}
            <TabsContent value="pagos" className="mt-0 p-5 space-y-4">
              {payments.length === 0 ? (
                <p className="py-8 text-center text-sm text-muted-foreground">
                  Sin historial de pagos registrado
                </p>
              ) : (
                <>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      {
                        label: "Pagados",
                        value: payments.filter((p) => p.status === "paid").length,
                        color: "text-success",
                      },
                      {
                        label: "Pendientes",
                        value: payments.filter((p) => p.status === "pending").length,
                        color: "text-warning",
                      },
                      {
                        label: "Atrasados",
                        value: payments.filter((p) => p.status === "overdue").length,
                        color: "text-destructive",
                      },
                    ].map((s) => (
                      <div key={s.label} className="rounded-lg border border-border bg-muted/20 p-3 text-center">
                        <p className={cn("text-xl font-bold leading-none", s.color)}>{s.value}</p>
                        <p className="mt-1 text-[11px] text-muted-foreground">{s.label}</p>
                      </div>
                    ))}
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    {payments.map((payment) => (
                      <div
                        key={payment.id}
                        className={cn(
                          "flex items-center justify-between rounded-lg border px-4 py-3",
                          payment.status === "paid"
                            ? "border-border"
                            : payment.status === "overdue"
                            ? "border-destructive/30 bg-destructive/5"
                            : "border-warning/30 bg-warning/5"
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={cn(
                              "flex h-7 w-7 shrink-0 items-center justify-center rounded-full",
                              payment.status === "paid"
                                ? "bg-success/10 text-success"
                                : payment.status === "overdue"
                                ? "bg-destructive/10 text-destructive"
                                : "bg-warning/10 text-warning"
                            )}
                          >
                            {payment.status === "paid" ? (
                              <CheckCircle2 className="h-3.5 w-3.5" />
                            ) : payment.status === "overdue" ? (
                              <XCircle className="h-3.5 w-3.5" />
                            ) : (
                              <Clock className="h-3.5 w-3.5" />
                            )}
                          </div>
                          <div>
                            <p className="text-xs font-medium text-foreground capitalize">
                              {payment.period.replace("-", " · ")}
                            </p>
                            <p className="text-[11px] text-muted-foreground">
                              {payment.paidDate
                                ? `Pagado el ${formatDate(payment.paidDate, "short")}`
                                : payment.notes ?? `Vence ${formatDate(payment.dueDate, "short")}`}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-foreground">
                            {formatCurrency(payment.amount)}
                          </p>
                          {payment.method && (
                            <p className="text-[11px] text-muted-foreground">
                              {PAYMENT_METHOD_LABELS[payment.method] ?? payment.method}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </TabsContent>

            {/* ACTIVIDAD TAB */}
            <TabsContent value="actividad" className="mt-0 p-5">
              {activity.length === 0 ? (
                <p className="py-8 text-center text-sm text-muted-foreground">
                  Sin actividad reciente para este inquilino
                </p>
              ) : (
                <div className="space-y-1">
                  {activity.map((event) => (
                    <div
                      key={event.id}
                      className="flex items-start gap-3 rounded-lg p-2 hover:bg-accent/30 transition-colors"
                    >
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
