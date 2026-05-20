"use client";

import { useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  X,
  MapPin,
  Pencil,
  Trash2,
  Calendar,
  DollarSign,
  FileText,
  CheckCircle2,
  Clock,
  AlertTriangle,
  RefreshCw,
  File,
  Download,
  Lock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  formatCurrency,
  formatDate,
  formatPercent,
  getInitials,
  getContractCode,
} from "@/shared/utils/format";
import { useCatalogStore } from "@/store/catalog.store";
import type { Contract } from "@/types/contract";
import { getDaysLeft, isExpiringSoon } from "../hooks/use-contracts";

const STATUS_CONFIG: Record<
  Contract["status"],
  { label: string; variant: "success" | "default" | "warning" | "secondary" | "destructive" }
> = {
  active: { label: "Activo", variant: "success" },
  expired: { label: "Vencido", variant: "secondary" },
  pending: { label: "Pendiente", variant: "default" },
  terminated: { label: "Rescindido", variant: "secondary" },
};

const STATUS_GRADIENTS: Record<Contract["status"], string> = {
  active: "from-emerald-950 via-emerald-900/60 to-teal-950",
  expired: "from-slate-900 via-slate-800/60 to-zinc-950",
  pending: "from-indigo-950 via-indigo-900/60 to-violet-950",
  terminated: "from-rose-950 via-rose-900/60 to-pink-950",
};

interface ContractDrawerProps {
  contractId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

export function ContractDrawer({
  contractId,
  isOpen,
  onClose,
  onEdit,
  onDelete,
}: ContractDrawerProps) {
  return (
    <AnimatePresence>
      {isOpen && contractId && (
        <DrawerContent
          key={contractId}
          contractId={contractId}
          onClose={onClose}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      )}
    </AnimatePresence>
  );
}

function ContractProgressBar({ contract }: { contract: Contract }) {
  const total =
    new Date(contract.endDate).getTime() - new Date(contract.startDate).getTime();
  const elapsed = Date.now() - new Date(contract.startDate).getTime();
  const progress = Math.min(100, Math.max(0, (elapsed / total) * 100));
  const daysLeft = getDaysLeft(contract.endDate);
  const isActive = contract.status === "active";

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-[11px]">
        <span className="text-muted-foreground">
          {formatDate(contract.startDate, "short")}
        </span>
        <span
          className={cn(
            "font-medium",
            isExpiringSoon(contract) && daysLeft <= 15
              ? "text-destructive"
              : isExpiringSoon(contract)
              ? "text-warning"
              : "text-muted-foreground"
          )}
        >
          {isActive
            ? daysLeft > 0
              ? `${daysLeft} días restantes`
              : "Vencido hoy"
            : "Finalizado"}
        </span>
        <span className="text-muted-foreground">
          {formatDate(contract.endDate, "short")}
        </span>
      </div>
      <Progress
        value={progress}
        className={cn(
          "h-1.5",
          isExpiringSoon(contract) && daysLeft <= 15 && "[&>div]:bg-destructive",
          isExpiringSoon(contract) && daysLeft > 15 && "[&>div]:bg-warning"
        )}
      />
    </div>
  );
}

function TimelineItem({
  date,
  title,
  description,
  variant = "default",
  isLast = false,
}: {
  date: string;
  title: string;
  description?: string;
  variant?: "default" | "success" | "warning" | "future";
  isLast?: boolean;
}) {
  const dotClass = {
    default: "bg-primary border-primary/30",
    success: "bg-success border-success/30",
    warning: "bg-warning border-warning/30",
    future: "bg-muted border-border",
  }[variant];

  const isPast = variant !== "future" && new Date(date) <= new Date();

  return (
    <div className="flex gap-3">
      <div className="flex flex-col items-center">
        <div
          className={cn(
            "h-3 w-3 shrink-0 rounded-full border-2 mt-0.5",
            dotClass,
            !isPast && "opacity-50"
          )}
        />
        {!isLast && <div className={cn("w-px flex-1 bg-border my-1", !isPast && "opacity-40")} />}
      </div>
      <div className="pb-4 min-w-0">
        <p
          className={cn(
            "text-xs font-medium",
            isPast ? "text-foreground" : "text-muted-foreground"
          )}
        >
          {title}
        </p>
        <p className="text-[11px] text-muted-foreground mt-0.5">
          {formatDate(date, "long")}
        </p>
        {description && (
          <p className="text-[11px] text-muted-foreground/70 mt-0.5">{description}</p>
        )}
      </div>
    </div>
  );
}

function DrawerContent({
  contractId,
  onClose,
  onEdit,
  onDelete,
}: {
  contractId: string;
  onClose: () => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const { contracts, properties, tenants } = useCatalogStore();
  const contract = contracts.find((c) => c.id === contractId);
  const property = contract ? properties.find((p) => p.id === contract.propertyId) : null;
  const tenant = contract ? tenants.find((t) => t.id === contract.tenantId) : null;
  const payments: import("@/types/payment").Payment[] = [];

  const daysLeft = contract ? getDaysLeft(contract.endDate) : 0;

  const timelineEvents = useMemo(() => {
    if (!contract) return [];

    const events: Array<{
      date: string;
      title: string;
      description?: string;
      variant: "default" | "success" | "warning" | "future";
    }> = [];

    const start = new Date(contract.startDate);
    const end = new Date(contract.endDate);

    events.push({
      date: contract.startDate,
      title: "Inicio del contrato",
      description: "Firma y entrega de llaves",
      variant: "success",
    });

    let year = 1;
    const milestone = new Date(start);
    milestone.setFullYear(milestone.getFullYear() + year);

    while (milestone < end) {
      const isInFuture = milestone > new Date();
      events.push({
        date: milestone.toISOString().split("T")[0],
        title: `${year}° aniversario`,
        description: contract.annualIncreasePercent
          ? `Ajuste del ${contract.annualIncreasePercent}% según contrato`
          : "Sin ajuste programado",
        variant: isInFuture ? "future" : "default",
      });
      year++;
      milestone.setFullYear(milestone.getFullYear() + 1);
    }

    if (isExpiringSoon(contract)) {
      events.push({
        date: contract.endDate,
        title: "Vencimiento del contrato",
        description: daysLeft > 0 ? `Faltan ${daysLeft} días` : "Vence hoy",
        variant: "warning",
      });
    } else {
      events.push({
        date: contract.endDate,
        title: "Vencimiento del contrato",
        description: contract.renewalOption ? "Con opción de renovación" : "Sin renovación automática",
        variant: new Date(contract.endDate) > new Date() ? "future" : "default",
      });
    }

    return events;
  }, [contract, daysLeft]);

  if (!contract) return null;

  const statusConfig = STATUS_CONFIG[contract.status];
  const code = getContractCode(contract.id, contract.startDate);
  const totalMonthly = contract.monthlyRent + (contract.expenses ?? 0);
  const annualRevenue = contract.monthlyRent * 12;

  const fakeDocs = [
    { name: "Contrato de locación", ext: "PDF", size: "284 KB", status: "Cargado", date: contract.startDate },
    { name: "Comprobante de depósito", ext: "PDF", size: "142 KB", status: "Cargado", date: contract.startDate },
    { name: "DNI / Documento inquilino", ext: "JPG", size: "1.2 MB", status: "Cargado", date: contract.startDate },
    { name: "Garantía propietaria", ext: "PDF", size: "—", status: "Pendiente", date: null },
    { name: "Inventario de ingreso", ext: "PDF", size: "396 KB", status: "Cargado", date: contract.startDate },
  ];

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

      {/* Panel */}
      <motion.aside
        initial={{ x: "100%", opacity: 0.5 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: "100%", opacity: 0 }}
        transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="fixed inset-y-0 right-0 z-50 flex w-full flex-col border-l border-border bg-background shadow-2xl sm:w-[500px]"
      >
        {/* Header banner */}
        <div
          className={cn(
            "relative h-44 shrink-0 bg-gradient-to-br",
            STATUS_GRADIENTS[contract.status]
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

          <div className="absolute inset-x-0 bottom-0 px-5 pb-4 space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant={statusConfig.variant}>{statusConfig.label}</Badge>
              {isExpiringSoon(contract) && (
                <Badge variant={daysLeft <= 15 ? "destructive" : "warning"}>
                  {daysLeft <= 15 ? `¡Vence en ${daysLeft}d!` : `${daysLeft} días restantes`}
                </Badge>
              )}
              {contract.renewalOption && (
                <Badge variant="outline" className="border-white/20 text-white/70 text-[11px]">
                  <RefreshCw className="mr-1 h-2.5 w-2.5" /> Renovación automática
                </Badge>
              )}
            </div>
            <div>
              <p className="font-mono text-sm font-bold text-white/70">{code}</p>
              <h2 className="text-lg font-bold text-white leading-tight">
                {property?.name ?? contract.propertyId}
              </h2>
              {property && (
                <p className="flex items-center gap-1 text-xs text-white/60 mt-0.5">
                  <MapPin className="h-3 w-3" />
                  {property.address}, {property.city}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Quick actions bar */}
        <div className="flex items-center justify-between border-b border-border px-5 py-3">
          <div className="flex flex-col">
            <span className="text-xl font-bold text-foreground">
              {formatCurrency(totalMonthly)}
              <span className="text-xs font-normal text-muted-foreground">/mes</span>
            </span>
            {contract.expenses && (
              <span className="text-[11px] text-muted-foreground">
                {formatCurrency(contract.monthlyRent)} alquiler + {formatCurrency(contract.expenses)} expensas
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-8 gap-1.5"
              onClick={() => onEdit(contract.id)}
            >
              <Pencil className="h-3.5 w-3.5" />
              Editar
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-8 gap-1.5 text-destructive hover:border-destructive hover:text-destructive"
              onClick={() => onDelete(contract.id)}
            >
              <Trash2 className="h-3.5 w-3.5" />
              Eliminar
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="general" className="flex min-h-0 flex-1 flex-col">
          <TabsList className="h-auto shrink-0 justify-start gap-0 rounded-none border-b border-border bg-transparent px-5 py-0">
            {[
              { value: "general", label: "General" },
              { value: "financiero", label: "Financiero" },
              { value: "timeline", label: "Timeline" },
              { value: "documentos", label: "Documentos" },
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

            {/* ── GENERAL ── */}
            <TabsContent value="general" className="mt-0 p-5 space-y-5">
              {/* Contract progress */}
              <div className="rounded-xl border border-border bg-muted/20 p-4 space-y-3">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Duración del Contrato
                </p>
                <ContractProgressBar contract={contract} />
              </div>

              {/* Contract details */}
              <div className="space-y-2">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Información Contractual
                </p>
                <div className="divide-y divide-border rounded-lg border border-border">
                  {[
                    { label: "Código", value: code, icon: FileText },
                    { label: "Fecha de inicio", value: formatDate(contract.startDate, "long"), icon: Calendar },
                    { label: "Fecha de vencimiento", value: formatDate(contract.endDate, "long"), icon: Calendar },
                    { label: "Preaviso", value: `${contract.noticePeriodDays} días`, icon: Clock },
                    {
                      label: "Renovación automática",
                      value: contract.renewalOption ? "Sí" : "No",
                      icon: RefreshCw,
                    },
                    ...(contract.annualIncreasePercent != null && contract.annualIncreasePercent > 0
                      ? [{ label: "Ajuste anual", value: `${contract.annualIncreasePercent}%`, icon: DollarSign }]
                      : []),
                  ].map(({ label, value, icon: Icon }) => (
                    <div key={label} className="flex items-center gap-3 px-4 py-2.5">
                      <Icon className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                      <div className="flex flex-1 items-center justify-between gap-2">
                        <span className="text-xs text-muted-foreground">{label}</span>
                        <span className="text-xs font-medium text-foreground">{value}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tenant info */}
              {tenant && (
                <div className="space-y-2">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Inquilino
                  </p>
                  <div className="flex items-center gap-3 rounded-lg border border-border p-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/15 text-sm font-bold text-primary">
                      {getInitials(tenant.firstName, tenant.lastName)}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {tenant.firstName} {tenant.lastName}
                      </p>
                      <p className="text-xs text-muted-foreground">{tenant.email}</p>
                      <p className="text-xs text-muted-foreground">{tenant.phone}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Terms */}
              {contract.terms && (
                <div className="space-y-2">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Términos y Condiciones
                  </p>
                  <p className="rounded-lg border border-border bg-muted/20 px-4 py-3 text-xs leading-relaxed text-muted-foreground">
                    {contract.terms}
                  </p>
                </div>
              )}

              {/* Expiring soon alert */}
              {isExpiringSoon(contract) && (
                <div className="flex items-start gap-3 rounded-lg border border-warning/40 bg-warning/10 p-3">
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
                  <div>
                    <p className="text-xs font-semibold text-warning">Contrato próximo a vencer</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      Este contrato vence el {formatDate(contract.endDate, "long")}.
                      {contract.renewalOption
                        ? " Tiene opción de renovación automática."
                        : " Se requiere acuerdo de las partes para renovar."}
                    </p>
                  </div>
                </div>
              )}
            </TabsContent>

            {/* ── FINANCIERO ── */}
            <TabsContent value="financiero" className="mt-0 p-5 space-y-5">
              {/* Summary cards */}
              <div className="grid grid-cols-2 gap-3">
                {[
                  {
                    label: "Alquiler Mensual",
                    value: formatCurrency(contract.monthlyRent),
                    sub: "base del contrato",
                    color: "text-success",
                  },
                  {
                    label: "Expensas",
                    value: contract.expenses ? formatCurrency(contract.expenses) : "No incluidas",
                    sub: "gastos comunes",
                    color: "text-foreground",
                  },
                  {
                    label: "Total Mensual",
                    value: formatCurrency(totalMonthly),
                    sub: "ingreso total",
                    color: "text-primary",
                  },
                  {
                    label: "Ingreso Anual",
                    value: formatCurrency(annualRevenue),
                    sub: "proyectado",
                    color: "text-foreground",
                  },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="rounded-lg border border-border bg-muted/20 p-3 space-y-1"
                  >
                    <p className="text-xs text-muted-foreground">{item.label}</p>
                    <p className={cn("text-lg font-bold leading-none", item.color)}>
                      {item.value}
                    </p>
                    <p className="text-[11px] text-muted-foreground/60">{item.sub}</p>
                  </div>
                ))}
              </div>

              {/* Deposit + increase */}
              <div className="divide-y divide-border rounded-lg border border-border">
                <div className="flex items-center justify-between px-4 py-3">
                  <span className="text-xs text-muted-foreground">Depósito de garantía</span>
                  <span className="text-sm font-bold text-foreground">
                    {formatCurrency(contract.deposit)}
                  </span>
                </div>
                <div className="flex items-center justify-between px-4 py-3">
                  <span className="text-xs text-muted-foreground">Equivalente en meses</span>
                  <span className="text-xs font-medium text-foreground">
                    {(contract.deposit / contract.monthlyRent).toFixed(1)} meses
                  </span>
                </div>
                {contract.annualIncreasePercent != null && (
                  <div className="flex items-center justify-between px-4 py-3">
                    <span className="text-xs text-muted-foreground">Ajuste anual</span>
                    <span className="text-xs font-medium text-foreground">
                      {contract.annualIncreasePercent > 0
                        ? `${formatPercent(contract.annualIncreasePercent)} por año`
                        : "Sin ajuste"}
                    </span>
                  </div>
                )}
              </div>

              {/* Payment history summary */}
              {payments.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Últimos pagos registrados
                  </p>
                  <div className="space-y-1.5">
                    {payments.slice(0, 4).map((p) => (
                      <div
                        key={p.id}
                        className={cn(
                          "flex items-center justify-between rounded-lg border px-3 py-2",
                          p.status === "paid" ? "border-border" : "border-destructive/30 bg-destructive/5"
                        )}
                      >
                        <div className="flex items-center gap-2">
                          <div
                            className={cn(
                              "h-1.5 w-1.5 rounded-full",
                              p.status === "paid" ? "bg-success" : "bg-destructive"
                            )}
                          />
                          <span className="text-xs capitalize text-muted-foreground">
                            {p.period.replace("-", " · ")}
                          </span>
                        </div>
                        <span className="text-xs font-semibold text-foreground">
                          {formatCurrency(p.amount)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </TabsContent>

            {/* ── TIMELINE ── */}
            <TabsContent value="timeline" className="mt-0 p-5">
              <div className="space-y-1">
                {timelineEvents.map((event, idx) => (
                  <TimelineItem
                    key={idx}
                    date={event.date}
                    title={event.title}
                    description={event.description}
                    variant={event.variant}
                    isLast={idx === timelineEvents.length - 1}
                  />
                ))}
              </div>

              <Separator className="my-4" />

              <div className="rounded-lg border border-border bg-muted/10 p-3 space-y-1">
                <p className="text-xs font-semibold text-muted-foreground">Duración total</p>
                <p className="text-sm font-bold text-foreground">
                  {Math.round(
                    (new Date(contract.endDate).getTime() -
                      new Date(contract.startDate).getTime()) /
                      (1000 * 60 * 60 * 24 * 30)
                  )}{" "}
                  meses
                </p>
                <p className="text-[11px] text-muted-foreground">
                  {formatDate(contract.startDate, "long")} →{" "}
                  {formatDate(contract.endDate, "long")}
                </p>
              </div>
            </TabsContent>

            {/* ── DOCUMENTOS ── */}
            <TabsContent value="documentos" className="mt-0 p-5 space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Archivos del Contrato
                </p>
                <Button variant="outline" size="sm" className="h-7 gap-1.5 text-xs">
                  <Download className="h-3 w-3" />
                  Descargar todos
                </Button>
              </div>

              <div className="space-y-2">
                {fakeDocs.map((doc, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05, duration: 0.2 }}
                    className={cn(
                      "flex items-center gap-3 rounded-lg border p-3 transition-colors",
                      doc.status === "Pendiente"
                        ? "border-dashed border-border/60 bg-muted/20"
                        : "border-border hover:bg-accent/30 cursor-pointer"
                    )}
                  >
                    <div
                      className={cn(
                        "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-[11px] font-bold",
                        doc.status === "Pendiente"
                          ? "bg-muted text-muted-foreground"
                          : doc.ext === "PDF"
                          ? "bg-red-500/10 text-red-500"
                          : "bg-blue-500/10 text-blue-500"
                      )}
                    >
                      {doc.status === "Pendiente" ? (
                        <Lock className="h-3.5 w-3.5" />
                      ) : (
                        doc.ext
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p
                        className={cn(
                          "text-xs font-medium truncate",
                          doc.status === "Pendiente"
                            ? "text-muted-foreground"
                            : "text-foreground"
                        )}
                      >
                        {doc.name}
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        {doc.status === "Pendiente"
                          ? "Sin cargar · Requerido"
                          : `${doc.size} · ${formatDate(doc.date!, "short")}`}
                      </p>
                    </div>
                    {doc.status === "Cargado" ? (
                      <div className="flex items-center gap-1 shrink-0">
                        <CheckCircle2 className="h-3.5 w-3.5 text-success" />
                        <File className="h-3.5 w-3.5 text-muted-foreground" />
                      </div>
                    ) : (
                      <Button variant="outline" size="sm" className="h-6 px-2 text-[11px] shrink-0">
                        Cargar
                      </Button>
                    )}
                  </motion.div>
                ))}
              </div>

              <div className="rounded-lg border border-dashed border-primary/30 bg-primary/5 p-4 text-center">
                <p className="text-xs font-medium text-primary">Agregar documento</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  PDF, JPG, PNG · máx. 10 MB
                </p>
              </div>
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </motion.aside>
    </>
  );
}
