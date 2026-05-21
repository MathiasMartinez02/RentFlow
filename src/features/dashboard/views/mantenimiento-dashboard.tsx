"use client";

import { RefreshCw, Wrench, AlertTriangle, CheckCircle, Clock } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/shared/utils/format";
import { useDashboardData } from "../hooks/use-dashboard-data";
import { MaintenanceStatsCard } from "../components/maintenance-stats-card";
import { useCatalogStore } from "@/store/catalog.store";

const STATUS_CONFIG = {
  pending: { label: "Pendiente", class: "bg-amber-500/10 text-amber-600 dark:text-amber-400" },
  in_progress: { label: "En Progreso", class: "bg-sky-500/10 text-sky-600 dark:text-sky-400" },
  waiting_parts: { label: "Esperando Repuestos", class: "bg-violet-500/10 text-violet-600 dark:text-violet-400" },
  resolved: { label: "Resuelto", class: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" },
  closed: { label: "Cerrado", class: "bg-slate-500/10 text-slate-500" },
};

const PRIORITY_CONFIG = {
  urgent: { label: "Urgente", class: "bg-destructive/10 text-destructive" },
  high: { label: "Alta", class: "bg-orange-500/10 text-orange-600" },
  medium: { label: "Media", class: "bg-amber-500/10 text-amber-600" },
  low: { label: "Baja", class: "bg-emerald-500/10 text-emerald-600" },
};

export function MantenimientoDashboard() {
  const { data, isLoading, refetch } = useDashboardData();
  const tickets = useCatalogStore((s) => s.tickets);
  const now = new Date().toISOString();

  const openTickets = tickets.filter((t) => t.status === "pending" || t.status === "in_progress" || t.status === "waiting_parts");
  const urgentTickets = tickets.filter((t) => t.priority === "urgent");
  const resolvedTickets = tickets.filter((t) => t.status === "resolved" || t.status === "closed");

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Panel de Mantenimiento"
        description={`Resumen al ${formatDate(now, "long")}`}
        action={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={refetch} disabled={isLoading} className="gap-1.5">
              <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`} />
              Actualizar
            </Button>
            <Button size="sm" asChild className="gap-1.5">
              <Link href="/maintenance">
                <Wrench className="h-3.5 w-3.5" />
                Ver todos los tickets
              </Link>
            </Button>
          </div>
        }
      />

      {/* Quick stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          {
            icon: AlertTriangle,
            label: "Tickets Activos",
            value: openTickets.length,
            sub: urgentTickets.length > 0 ? `${urgentTickets.length} urgente${urgentTickets.length !== 1 ? "s" : ""}` : "sin urgentes",
            color: urgentTickets.length > 0 ? "text-destructive" : "text-muted-foreground",
            delay: 0,
          },
          {
            icon: Clock,
            label: "Urgentes",
            value: urgentTickets.length,
            sub: "requieren atención inmediata",
            color: urgentTickets.length > 0 ? "text-destructive" : "text-muted-foreground",
            delay: 0.05,
          },
          {
            icon: CheckCircle,
            label: "Resueltos",
            value: resolvedTickets.length,
            sub: "tickets cerrados",
            color: "text-emerald-600",
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
                    <p className="mt-1 text-3xl font-bold">{value}</p>
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

      {/* Maintenance stats + recent tickets */}
      <div className="grid gap-4 lg:grid-cols-2">
        <MaintenanceStatsCard data={data?.maintenanceAnalytics} isLoading={isLoading} />

        {/* Recent active tickets */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <Card className="h-full">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Tickets Activos</CardTitle>
                  <CardDescription>Requieren atención</CardDescription>
                </div>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/maintenance">Ver todos</Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {openTickets.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <CheckCircle className="h-8 w-8 text-emerald-500 mb-2" />
                  <p className="text-sm font-medium">Sin tickets activos</p>
                  <p className="text-xs text-muted-foreground">Todo al día</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {openTickets.slice(0, 6).map((ticket) => {
                    const statusCfg = STATUS_CONFIG[ticket.status as keyof typeof STATUS_CONFIG];
                    const priorityCfg = PRIORITY_CONFIG[ticket.priority as keyof typeof PRIORITY_CONFIG];
                    return (
                      <Link
                        key={ticket.id}
                        href="/maintenance"
                        className="flex items-start gap-3 rounded-lg p-2.5 hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{ticket.title}</p>
                          <p className="text-xs text-muted-foreground truncate mt-0.5">
                            {formatDate(ticket.reportedAt, "short")}
                          </p>
                        </div>
                        <div className="flex flex-col items-end gap-1 shrink-0">
                          {priorityCfg && (
                            <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${priorityCfg.class}`}>
                              {priorityCfg.label}
                            </span>
                          )}
                          {statusCfg && (
                            <Badge variant="outline" className={`text-[10px] ${statusCfg.class}`}>
                              {statusCfg.label}
                            </Badge>
                          )}
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
