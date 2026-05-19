"use client";

import { motion } from "framer-motion";
import { AlertTriangle, Clock, Package, CheckCircle2, DollarSign } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/shared/utils/format";
import type { MaintenanceStats } from "@/types/maintenance";

interface StatCardProps {
  icon: React.ElementType;
  label: string;
  value: string | number;
  sub?: string;
  highlight?: boolean;
  index: number;
}

function StatCard({ icon: Icon, label, value, sub, highlight, index }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
    >
      <Card className={highlight ? "border-destructive/40 bg-destructive/5" : ""}>
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <p className="text-xs text-muted-foreground truncate">{label}</p>
              <p className={`mt-1 text-2xl font-bold leading-none ${highlight ? "text-destructive" : "text-foreground"}`}>
                {value}
              </p>
              {sub && <p className="mt-1 text-[11px] text-muted-foreground/70">{sub}</p>}
            </div>
            <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${highlight ? "bg-destructive/10" : "bg-muted"}`}>
              <Icon className={`h-4 w-4 ${highlight ? "text-destructive" : "text-muted-foreground"}`} />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

interface MaintenanceStatsBarProps {
  stats: MaintenanceStats;
  isLoading?: boolean;
}

export function MaintenanceStatsBar({ stats, isLoading }: MaintenanceStatsBarProps) {
  if (isLoading) {
    return (
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-4 space-y-2">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-7 w-12" />
              <Skeleton className="h-2.5 w-16" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const items: StatCardProps[] = [
    {
      icon: AlertTriangle,
      label: "Urgentes Activos",
      value: stats.urgent,
      sub: "requieren atención",
      highlight: stats.urgent > 0,
      index: 0,
    },
    {
      icon: Clock,
      label: "Pendientes",
      value: stats.open,
      sub: "sin asignar",
      index: 1,
    },
    {
      icon: Package,
      label: "En Progreso",
      value: stats.inProgress + stats.waitingParts,
      sub: `${stats.waitingParts} esperando repuestos`,
      index: 2,
    },
    {
      icon: CheckCircle2,
      label: "Resueltos / Cerrados",
      value: stats.resolved,
      sub: `prom. ${stats.avgResolutionDays.toFixed(1)} días`,
      index: 3,
    },
    {
      icon: DollarSign,
      label: "Costo Estimado Activo",
      value: formatCurrency(stats.totalEstimatedCost),
      sub: "tickets abiertos",
      index: 4,
    },
  ];

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
      {items.map((item) => (
        <StatCard key={item.label} {...item} />
      ))}
    </div>
  );
}
