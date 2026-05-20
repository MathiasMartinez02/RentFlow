"use client";

import { useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  X, Pencil, Trash2,
  Building2, User, FileText,
  ArrowRightLeft, Banknote, CreditCard, Repeat,
  CheckCircle2, Clock, AlertTriangle, XCircle, RotateCcw,
  Calendar, Hash, StickyNote,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { formatCurrency, formatDate, formatPercent, getInitials, getContractCode } from "@/shared/utils/format";
import { useCatalogStore } from "@/store/catalog.store";
import type { Payment, PaymentStatus } from "@/types/payment";

const PERIOD_LABELS: Record<string, string> = {
  "01": "Enero", "02": "Febrero", "03": "Marzo", "04": "Abril",
  "05": "Mayo", "06": "Junio", "07": "Julio", "08": "Agosto",
  "09": "Septiembre", "10": "Octubre", "11": "Noviembre", "12": "Diciembre",
};

function formatPeriod(period: string) {
  const [year, month] = period.split("-");
  return `${PERIOD_LABELS[month] ?? month} ${year}`;
}

function getDaysOverdue(dueDate: string): number {
  return Math.floor((Date.now() - new Date(dueDate).getTime()) / 86400000);
}

type StatusConfig = {
  label: string;
  variant: "success" | "default" | "warning" | "destructive" | "secondary";
  icon: React.ElementType;
  iconClass: string;
};

const STATUS_CONFIG: Record<PaymentStatus, StatusConfig> = {
  paid: { label: "Pagado", variant: "success", icon: CheckCircle2, iconClass: "text-success" },
  pending: { label: "Pendiente", variant: "default", icon: Clock, iconClass: "text-muted-foreground" },
  overdue: { label: "Vencido", variant: "destructive", icon: AlertTriangle, iconClass: "text-destructive" },
  partial: { label: "Pago Parcial", variant: "warning", icon: RotateCcw, iconClass: "text-warning" },
  cancelled: { label: "Cancelado", variant: "secondary", icon: XCircle, iconClass: "text-muted-foreground" },
};

const METHOD_CONFIG = {
  transfer: { label: "Transferencia bancaria", icon: ArrowRightLeft },
  cash: { label: "Efectivo", icon: Banknote },
  card: { label: "Tarjeta de crédito/débito", icon: CreditCard },
  auto_debit: { label: "Débito automático", icon: Repeat },
};

function DetailRow({ label, value, valueClass }: { label: string; value: React.ReactNode; valueClass?: string }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2">
      <span className="text-xs text-muted-foreground shrink-0">{label}</span>
      <span className={cn("text-xs font-medium text-right", valueClass ?? "text-foreground")}>{value}</span>
    </div>
  );
}

function TimelineStep({
  icon: Icon,
  label,
  date,
  description,
  variant,
  isLast,
}: {
  icon: React.ElementType;
  label: string;
  date?: string;
  description?: string;
  variant: "done" | "active" | "pending" | "error";
  isLast?: boolean;
}) {
  const variantConfig = {
    done: { dot: "bg-success border-success/30", icon: "text-success" },
    active: { dot: "bg-primary border-primary/30 animate-pulse", icon: "text-primary" },
    pending: { dot: "bg-muted border-border", icon: "text-muted-foreground" },
    error: { dot: "bg-destructive border-destructive/30", icon: "text-destructive" },
  }[variant];

  return (
    <div className="flex gap-3">
      <div className="flex flex-col items-center">
        <div className={cn("flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2", variantConfig.dot)}>
          <Icon className={cn("h-3.5 w-3.5", variantConfig.icon)} />
        </div>
        {!isLast && <div className="mt-1 w-px flex-1 bg-border" />}
      </div>
      <div className="pb-4 pt-0.5 min-w-0">
        <p className="text-xs font-medium text-foreground">{label}</p>
        {date && <p className="text-[11px] text-muted-foreground">{date}</p>}
        {description && <p className="mt-0.5 text-[11px] text-muted-foreground">{description}</p>}
      </div>
    </div>
  );
}

// ─── Tab: Detalle ─────────────────────────────────────────────────────────────
function TabDetalle({ payment }: { payment: Payment }) {
  const { tenants, properties, contracts } = useCatalogStore();
  const tenant = tenants.find((t) => t.id === payment.tenantId);
  const property = properties.find((p) => p.id === payment.propertyId);
  const contract = contracts.find((c) => c.id === payment.contractId);
  const config = STATUS_CONFIG[payment.status];
  const StatusIcon = config.icon;

  return (
    <div className="space-y-4">
      {/* Status banner */}
      <div className={cn(
        "flex items-center gap-2.5 rounded-lg border px-4 py-3",
        payment.status === "paid" && "border-success/30 bg-success/5",
        payment.status === "overdue" && "border-destructive/30 bg-destructive/5",
        payment.status === "partial" && "border-warning/30 bg-warning/5",
        payment.status === "pending" && "border-border bg-muted/30",
        payment.status === "cancelled" && "border-border bg-muted/30 opacity-70",
      )}>
        <StatusIcon className={cn("h-4.5 w-4.5 shrink-0", config.iconClass)} style={{ width: 18, height: 18 }} />
        <div>
          <p className="text-sm font-semibold text-foreground">{config.label}</p>
          {payment.status === "overdue" && (
            <p className="text-xs text-destructive">{getDaysOverdue(payment.dueDate)} días de mora</p>
          )}
          {payment.status === "partial" && payment.paidAmount !== undefined && (
            <p className="text-xs text-warning">
              Cobrado {formatCurrency(payment.paidAmount)} de {formatCurrency(payment.amount)}
            </p>
          )}
        </div>
      </div>

      {/* Inquilino */}
      {tenant && (
        <div className="rounded-lg border border-border p-3">
          <div className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            <User className="h-3 w-3" />
            Inquilino
          </div>
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
              {getInitials(tenant.firstName, tenant.lastName)}
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">{tenant.firstName} {tenant.lastName}</p>
              <p className="text-xs text-muted-foreground">{tenant.email}</p>
            </div>
          </div>
        </div>
      )}

      {/* Propiedad */}
      {property && (
        <div className="rounded-lg border border-border p-3">
          <div className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            <Building2 className="h-3 w-3" />
            Propiedad
          </div>
          <p className="text-sm font-semibold text-foreground">{property.name}</p>
          <p className="text-xs text-muted-foreground">{property.address}, {property.city}</p>
        </div>
      )}

      {/* Detalles del pago */}
      <div className="rounded-lg border border-border p-3">
        <div className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          <FileText className="h-3 w-3" />
          Información del Pago
        </div>
        <div className="divide-y divide-border">
          <DetailRow label="Concepto" value={payment.concept} />
          <DetailRow label="Período" value={formatPeriod(payment.period)} />
          <DetailRow label="Vencimiento" value={formatDate(payment.dueDate, "long")} />
          {payment.paidDate && (
            <DetailRow label="Fecha de pago" value={formatDate(payment.paidDate, "long")} />
          )}
          {payment.method && (
            <DetailRow label="Método" value={
              <div className="flex items-center gap-1.5">
                {(() => {
                  const m = METHOD_CONFIG[payment.method!];
                  const MIcon = m.icon;
                  return <><MIcon className="h-3 w-3" />{m.label}</>;
                })()}
              </div>
            } />
          )}
          {payment.reference && (
            <DetailRow label="Referencia" value={
              <div className="flex items-center gap-1">
                <Hash className="h-3 w-3 text-muted-foreground" />
                <span className="font-mono text-xs">{payment.reference}</span>
              </div>
            } />
          )}
          {contract && (
            <DetailRow label="Contrato" value={
              <span className="font-mono text-xs">{getContractCode(contract.id, contract.startDate)}</span>
            } />
          )}
        </div>
      </div>

      {payment.notes && (
        <div className="rounded-lg border border-border bg-muted/30 p-3">
          <div className="mb-1.5 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            <StickyNote className="h-3 w-3" />
            Observaciones
          </div>
          <p className="text-xs text-muted-foreground">{payment.notes}</p>
        </div>
      )}
    </div>
  );
}

// ─── Tab: Financiero ──────────────────────────────────────────────────────────
function TabFinanciero({ payment }: { payment: Payment }) {
  const paidAmount = payment.paidAmount ?? (payment.status === "paid" ? payment.amount : 0);
  const balance = payment.amount - paidAmount;
  const lateFee = payment.lateFee ?? 0;
  const totalDue = payment.amount + lateFee;
  const progressPct = payment.amount > 0 ? (paidAmount / payment.amount) * 100 : 0;

  const tenantPayments: Payment[] = [];

  return (
    <div className="space-y-4">
      {/* Resumen financiero */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-lg bg-muted/40 p-3">
          <p className="text-[11px] text-muted-foreground">Monto Total</p>
          <p className="mt-1 text-lg font-bold text-foreground">{formatCurrency(payment.amount)}</p>
        </div>
        <div className="rounded-lg bg-muted/40 p-3">
          <p className="text-[11px] text-muted-foreground">Monto Cobrado</p>
          <p className={cn("mt-1 text-lg font-bold", paidAmount > 0 ? "text-success" : "text-muted-foreground")}>
            {formatCurrency(paidAmount)}
          </p>
        </div>
        <div className="rounded-lg bg-muted/40 p-3">
          <p className="text-[11px] text-muted-foreground">Saldo Pendiente</p>
          <p className={cn("mt-1 text-lg font-bold", balance > 0 ? "text-destructive" : "text-success")}>
            {formatCurrency(balance)}
          </p>
        </div>
        <div className="rounded-lg bg-muted/40 p-3">
          <p className="text-[11px] text-muted-foreground">Cargo por Mora</p>
          <p className={cn("mt-1 text-lg font-bold", lateFee > 0 ? "text-warning" : "text-muted-foreground")}>
            {lateFee > 0 ? formatCurrency(lateFee) : "—"}
          </p>
        </div>
      </div>

      {/* Barra de progreso */}
      {payment.status !== "pending" && (
        <div className="rounded-lg border border-border p-3">
          <div className="mb-2 flex items-center justify-between text-xs">
            <span className="font-medium text-foreground">Progreso de cobranza</span>
            <span className="font-bold text-primary">{formatPercent(progressPct, 0)}</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
            <div
              className={cn(
                "h-full rounded-full transition-all duration-700",
                progressPct >= 100 ? "bg-success" : progressPct > 0 ? "bg-warning" : "bg-destructive"
              )}
              style={{ width: `${Math.min(progressPct, 100)}%` }}
            />
          </div>
          <div className="mt-1.5 flex justify-between text-[11px] text-muted-foreground">
            <span>Cobrado: {formatCurrency(paidAmount)}</span>
            <span>Total: {formatCurrency(totalDue)}</span>
          </div>
        </div>
      )}

      {/* Historial de pagos del inquilino */}
      {tenantPayments.length > 0 && (
        <div>
          <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Últimos pagos del inquilino
          </h4>
          <div className="space-y-1.5">
            {tenantPayments.map((p) => {
              const config = STATUS_CONFIG[p.status];
              return (
                <div key={p.id} className="flex items-center justify-between rounded-lg bg-muted/30 px-3 py-2">
                  <div>
                    <p className="text-xs font-medium text-foreground">{formatPeriod(p.period)}</p>
                    {p.paidDate && (
                      <p className="text-[11px] text-muted-foreground">{formatDate(p.paidDate, "short")}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold">{formatCurrency(p.amount)}</span>
                    <Badge variant={config.variant} className="text-[10px]">{config.label}</Badge>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Tab: Timeline ────────────────────────────────────────────────────────────
function TabTimeline({ payment }: { payment: Payment }) {
  const steps = useMemo(() => {
    const result: Array<{
      icon: React.ElementType;
      label: string;
      date?: string;
      description?: string;
      variant: "done" | "active" | "pending" | "error";
    }> = [];

    result.push({
      icon: FileText,
      label: "Registro creado",
      date: formatDate(payment.createdAt, "long"),
      description: `Concepto: ${payment.concept}`,
      variant: "done",
    });

    const reminderDate = new Date(payment.dueDate);
    reminderDate.setDate(reminderDate.getDate() - 7);
    const reminderStr = reminderDate.toISOString().split("T")[0];
    const now = new Date();

    if (now >= reminderDate) {
      result.push({
        icon: Clock,
        label: "Recordatorio enviado",
        date: formatDate(reminderStr, "long"),
        description: "Notificación automática al inquilino",
        variant: "done",
      });
    }

    const dueIsPast = new Date(payment.dueDate) <= now;
    result.push({
      icon: Calendar,
      label: "Fecha de vencimiento",
      date: formatDate(payment.dueDate, "long"),
      description: `${formatCurrency(payment.amount)} a cobrar`,
      variant:
        payment.status === "paid" || payment.status === "partial"
          ? "done"
          : payment.status === "overdue"
          ? "error"
          : dueIsPast
          ? "error"
          : "active",
    });

    if (payment.status === "overdue") {
      result.push({
        icon: AlertTriangle,
        label: "Pago vencido",
        date: formatDate(payment.dueDate, "long"),
        description: `${getDaysOverdue(payment.dueDate)} días de mora acumulados`,
        variant: "error",
      });
    }

    if (payment.status === "partial" && payment.paidDate) {
      result.push({
        icon: RotateCcw,
        label: "Pago parcial recibido",
        date: formatDate(payment.paidDate, "long"),
        description: `${formatCurrency(payment.paidAmount ?? 0)} cobrado de ${formatCurrency(payment.amount)}`,
        variant: "active",
      });
    }

    if ((payment.status === "paid" || payment.status === "partial") && payment.paidDate) {
      if (payment.status === "paid") {
        result.push({
          icon: CheckCircle2,
          label: "Pago confirmado",
          date: formatDate(payment.paidDate, "long"),
          description: payment.method
            ? `Método: ${METHOD_CONFIG[payment.method].label}`
            : undefined,
          variant: "done",
        });
      }
    }

    if (payment.status === "cancelled") {
      result.push({
        icon: XCircle,
        label: "Pago cancelado",
        variant: "error",
      });
    }

    return result;
  }, [payment]);

  return (
    <div className="space-y-1">
      {steps.map((step, i) => (
        <TimelineStep
          key={i}
          icon={step.icon}
          label={step.label}
          date={step.date}
          description={step.description}
          variant={step.variant}
          isLast={i === steps.length - 1}
        />
      ))}
    </div>
  );
}

// ─── Drawer principal ─────────────────────────────────────────────────────────
interface PaymentDrawerProps {
  paymentId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

export function PaymentDrawer({ paymentId: _paymentId, isOpen, onClose, onEdit, onDelete }: PaymentDrawerProps) {
  const payment = null as Payment | null;

  const config = payment ? STATUS_CONFIG[payment.status] : null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 280 }}
            className="fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col border-l border-border bg-background shadow-2xl"
          >
            {/* Header */}
            <div className="flex shrink-0 items-center justify-between border-b border-border px-5 py-4">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="truncate text-sm font-semibold text-foreground">
                    {payment?.concept ?? "Detalle del Pago"}
                  </p>
                  {payment && config && (
                    <Badge variant={config.variant} className="text-[10px]">{config.label}</Badge>
                  )}
                </div>
                {payment && (
                  <p className="text-xs text-muted-foreground">
                    {formatCurrency(payment.amount)} · Vence {formatDate(payment.dueDate, "short")}
                  </p>
                )}
              </div>
              <div className="ml-3 flex shrink-0 items-center gap-1">
                {payment && (
                  <>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => onEdit(payment.id)}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
                      onClick={() => onDelete(payment.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </>
                )}
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onClose}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Body */}
            {!payment ? (
              <div className="flex flex-1 items-center justify-center">
                <p className="text-sm text-muted-foreground">Pago no encontrado.</p>
              </div>
            ) : (
              <Tabs defaultValue="detalle" className="flex flex-1 flex-col overflow-hidden">
                <div className="shrink-0 border-b border-border px-5">
                  <TabsList className="h-9 w-full rounded-none border-0 bg-transparent p-0">
                    {[
                      { value: "detalle", label: "Detalle" },
                      { value: "financiero", label: "Financiero" },
                      { value: "historial", label: "Historial" },
                    ].map((tab) => (
                      <TabsTrigger
                        key={tab.value}
                        value={tab.value}
                        className="h-9 flex-1 rounded-none border-b-2 border-transparent text-xs data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none"
                      >
                        {tab.label}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                </div>

                <ScrollArea className="flex-1">
                  <div className="p-5">
                    <TabsContent value="detalle" className="mt-0">
                      <TabDetalle payment={payment} />
                    </TabsContent>
                    <TabsContent value="financiero" className="mt-0">
                      <TabFinanciero payment={payment} />
                    </TabsContent>
                    <TabsContent value="historial" className="mt-0">
                      <TabTimeline payment={payment} />
                    </TabsContent>
                  </div>
                </ScrollArea>

                <Separator />
                <div className="flex shrink-0 items-center justify-end gap-2 px-5 py-3">
                  <Button variant="outline" size="sm" onClick={onClose}>
                    Cerrar
                  </Button>
                  <Button size="sm" onClick={() => onEdit(payment.id)}>
                    <Pencil className="mr-1.5 h-3.5 w-3.5" />
                    Editar
                  </Button>
                </div>
              </Tabs>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
