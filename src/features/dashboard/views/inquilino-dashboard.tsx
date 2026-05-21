"use client";

import { useState, useEffect } from "react";
import { FileText, CreditCard, Wrench, Plus, CheckCircle, AlertTriangle, Clock } from "lucide-react";
import { motion } from "framer-motion";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate } from "@/shared/utils/format";
import { useAuthStore } from "@/store/auth.store";
import { useCatalogStore } from "@/store/catalog.store";
import { MaintenanceFormInquilino } from "@/features/maintenance/components/maintenance-form-inquilino";
import { useMaintenances } from "@/features/maintenance/hooks/use-maintenances";
import type { Payment } from "@/types/payment";
import { paymentsService } from "@/services/payments.service";

const CONTRACT_STATUS: Record<string, { label: string; class: string }> = {
  active: { label: "Activo", class: "bg-emerald-500/10 text-emerald-600" },
  expiring_soon: { label: "Por vencer", class: "bg-amber-500/10 text-amber-600" },
  expired: { label: "Vencido", class: "bg-destructive/10 text-destructive" },
  terminated: { label: "Rescindido", class: "bg-slate-500/10 text-slate-500" },
};

const PAYMENT_STATUS: Record<string, { label: string; icon: typeof CheckCircle; class: string }> = {
  paid: { label: "Pagado", icon: CheckCircle, class: "text-emerald-600" },
  pending: { label: "Pendiente", icon: Clock, class: "text-amber-600" },
  overdue: { label: "Vencido", icon: AlertTriangle, class: "text-destructive" },
};

export function InquilinoDashboard() {
  const user = useAuthStore((s) => s.user);
  const contracts = useCatalogStore((s) => s.contracts);
  const tickets = useCatalogStore((s) => s.tickets);

  const [payments, setPayments] = useState<Payment[]>([]);
  const [loadingPayments, setLoadingPayments] = useState(true);
  const [ticketFormOpen, setTicketFormOpen] = useState(false);

  const { createTicket, isMutating } = useMaintenances({});

  const myContract = contracts[0] ?? null;
  const myTickets = tickets.slice(0, 5);
  const openTickets = tickets.filter((t) => t.status === "pending" || t.status === "in_progress");

  const now = new Date().toISOString();

  useEffect(() => {
    paymentsService.getAll()
      .then((res) => setPayments(res.data.slice(0, 6)))
      .catch(() => setPayments([]))
      .finally(() => setLoadingPayments(false));
  }, []);

  const nextPayment = payments.find((p) => p.status === "pending");
  const propertyId = myContract?.propertyId ?? "";

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={`Bienvenido, ${user?.firstName ?? "Inquilino"}`}
        description={`Resumen al ${formatDate(now, "long")}`}
        action={
          <Button size="sm" className="gap-1.5" onClick={() => setTicketFormOpen(true)}>
            <Plus className="h-3.5 w-3.5" />
            Reportar Problema
          </Button>
        }
      />

      {/* Quick stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          {
            icon: FileText,
            label: "Mi Contrato",
            value: myContract ? (CONTRACT_STATUS[myContract.status]?.label ?? myContract.status) : "Sin contrato",
            sub: myContract ? `Vence: ${formatDate(myContract.endDate, "short")}` : "—",
            color: myContract ? CONTRACT_STATUS[myContract.status]?.class ?? "" : "text-muted-foreground",
            delay: 0,
          },
          {
            icon: CreditCard,
            label: "Próximo Pago",
            value: nextPayment ? formatCurrency(nextPayment.amount) : "Al día",
            sub: nextPayment ? `Período: ${nextPayment.period}` : "Sin pendientes",
            color: nextPayment ? "text-amber-600" : "text-emerald-600",
            delay: 0.05,
          },
          {
            icon: Wrench,
            label: "Mis Tickets",
            value: openTickets.length,
            sub: openTickets.length > 0 ? "tickets activos" : "sin tickets activos",
            color: openTickets.length > 0 ? "text-amber-600" : "text-emerald-600",
            delay: 0.1,
          },
        ].map(({ icon: Icon, label, value, sub, color, delay }) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay }}
          >
            <Card>
              <CardContent className="pt-5 pb-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">{label}</p>
                    <p className="mt-1 text-lg font-bold">{value}</p>
                    <p className={`mt-0.5 text-xs ${color}`}>{sub}</p>
                  </div>
                  <div className="rounded-lg bg-muted p-2.5">
                    <Icon className="h-5 w-5 text-muted-foreground" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Contract details */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <Card className="h-full">
            <CardHeader className="pb-3">
              <CardTitle>Mi Contrato</CardTitle>
              <CardDescription>Detalles del contrato vigente</CardDescription>
            </CardHeader>
            <CardContent>
              {!myContract ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <FileText className="h-8 w-8 text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">Sin contrato activo</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Estado</span>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${CONTRACT_STATUS[myContract.status]?.class ?? ""}`}>
                      {CONTRACT_STATUS[myContract.status]?.label ?? myContract.status}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Código</span>
                    <span className="text-xs font-medium font-mono">{myContract.id.slice(0, 8).toUpperCase()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Monto mensual</span>
                    <span className="text-sm font-bold">{formatCurrency(myContract.monthlyRent)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Inicio</span>
                    <span className="text-xs">{formatDate(myContract.startDate, "short")}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Vencimiento</span>
                    <span className="text-xs">{formatDate(myContract.endDate, "short")}</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent payments */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
        >
          <Card className="h-full">
            <CardHeader className="pb-3">
              <CardTitle>Mis Pagos Recientes</CardTitle>
              <CardDescription>Historial de los últimos pagos</CardDescription>
            </CardHeader>
            <CardContent>
              {loadingPayments ? (
                <div className="space-y-3">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton key={i} className="h-10 w-full" />
                  ))}
                </div>
              ) : payments.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <CreditCard className="h-8 w-8 text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">Sin pagos registrados</p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {payments.map((payment) => {
                    const cfg = PAYMENT_STATUS[payment.status];
                    const Icon = cfg?.icon ?? Clock;
                    return (
                      <div key={payment.id} className="flex items-center justify-between gap-2 rounded-lg p-2 hover:bg-muted/50">
                        <div className="flex items-center gap-2">
                          <Icon className={`h-4 w-4 shrink-0 ${cfg?.class ?? ""}`} />
                          <div>
                            <p className="text-xs font-medium">{payment.period}</p>
                            <p className="text-[11px] text-muted-foreground">{formatDate(payment.dueDate, "short")}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold">{formatCurrency(payment.amount)}</p>
                          <p className={`text-[11px] ${cfg?.class ?? "text-muted-foreground"}`}>{cfg?.label}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* My tickets */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.4 }}
      >
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Mis Tickets de Mantenimiento</CardTitle>
                <CardDescription>Solicitudes reportadas</CardDescription>
              </div>
              <Button size="sm" variant="outline" className="gap-1.5" onClick={() => setTicketFormOpen(true)}>
                <Plus className="h-3.5 w-3.5" />
                Nuevo
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {myTickets.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Wrench className="h-8 w-8 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">Sin tickets reportados</p>
                <Button
                  size="sm"
                  variant="outline"
                  className="mt-3 gap-1.5"
                  onClick={() => setTicketFormOpen(true)}
                >
                  <Plus className="h-3.5 w-3.5" />
                  Reportar un problema
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                {myTickets.map((ticket) => (
                  <div key={ticket.id} className="flex items-center justify-between gap-2 rounded-lg border border-border p-3">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">{ticket.title}</p>
                      <p className="text-xs text-muted-foreground truncate">{formatDate(ticket.reportedAt, "short")}</p>
                    </div>
                    <Badge variant="outline" className="shrink-0 text-[10px]">
                      {ticket.status === "pending" ? "Pendiente" :
                       ticket.status === "in_progress" ? "En Progreso" :
                       ticket.status === "resolved" ? "Resuelto" : ticket.status}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Simplified maintenance form */}
      <MaintenanceFormInquilino
        isOpen={ticketFormOpen}
        isMutating={isMutating}
        propertyId={propertyId}
        tenantId={user?.linkedTenantId ?? ""}
        onSubmit={async (data) => {
          await createTicket(data);
          setTicketFormOpen(false);
        }}
        onClose={() => setTicketFormOpen(false)}
      />
    </div>
  );
}
