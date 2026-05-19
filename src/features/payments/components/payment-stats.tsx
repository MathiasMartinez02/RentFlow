"use client";

import {
  TrendingUp,
  TrendingDown,
  Clock,
  AlertCircle,
  DollarSign,
  BarChart3,
} from "lucide-react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { formatCurrency, formatPercent } from "@/shared/utils/format";
import type { PaymentStats } from "@/types/payment";

interface StatCardProps {
  label: string;
  value: string;
  sub?: string;
  trend?: { value: number; label: string };
  icon: React.ElementType;
  iconClass: string;
  valueClass?: string;
  index: number;
}

function StatCard({ label, value, sub, trend, icon: Icon, iconClass, valueClass, index }: StatCardProps) {
  const isPositiveTrend = trend && trend.value >= 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: index * 0.05 }}
    >
      <Card className="overflow-hidden">
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium text-muted-foreground">{label}</p>
              <p className={cn("mt-1 text-xl font-bold leading-none", valueClass ?? "text-foreground")}>
                {value}
              </p>
              {sub && <p className="mt-1 text-xs text-muted-foreground">{sub}</p>}
              {trend && (
                <div className={cn("mt-1.5 flex items-center gap-1 text-xs font-medium", isPositiveTrend ? "text-success" : "text-destructive")}>
                  {isPositiveTrend ? (
                    <TrendingUp className="h-3 w-3" />
                  ) : (
                    <TrendingDown className="h-3 w-3" />
                  )}
                  <span>{isPositiveTrend ? "+" : ""}{formatPercent(Math.abs(trend.value), 0)} {trend.label}</span>
                </div>
              )}
            </div>
            <div className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-lg", iconClass)}>
              <Icon style={{ width: 16, height: 16 }} />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function StatCardSkeleton() {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1 space-y-2">
            <Skeleton className="h-3 w-28" />
            <Skeleton className="h-5 w-20" />
            <Skeleton className="h-3 w-16" />
          </div>
          <Skeleton className="h-9 w-9 rounded-lg" />
        </div>
      </CardContent>
    </Card>
  );
}

interface PaymentStatsBarProps {
  stats?: PaymentStats;
  isLoading?: boolean;
}

export function PaymentStatsBar({ stats, isLoading }: PaymentStatsBarProps) {
  if (isLoading || !stats) {
    return (
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => <StatCardSkeleton key={i} />)}
      </div>
    );
  }

  const monthDiff =
    stats.prevMonthCollected > 0
      ? ((stats.collectedThisMonth - stats.prevMonthCollected) / stats.prevMonthCollected) * 100
      : 0;

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
      <StatCard
        label="Cobrado este Mes"
        value={formatCurrency(stats.collectedThisMonth)}
        sub={`de ${formatCurrency(stats.totalExpected)} esperado`}
        trend={{ value: monthDiff, label: "vs mes anterior" }}
        icon={DollarSign}
        iconClass="bg-success/10 text-success"
        valueClass="text-success"
        index={0}
      />
      <StatCard
        label="Pendiente de Cobro"
        value={formatCurrency(stats.pendingAmount)}
        sub={`${stats.pendingCount} ${stats.pendingCount === 1 ? "pago" : "pagos"} pendiente${stats.pendingCount === 1 ? "" : "s"}`}
        icon={Clock}
        iconClass={stats.pendingCount > 0 ? "bg-warning/10 text-warning" : "bg-muted text-muted-foreground"}
        valueClass={stats.pendingCount > 0 ? "text-warning" : undefined}
        index={1}
      />
      <StatCard
        label="Pagos Vencidos"
        value={formatCurrency(stats.overdueAmount)}
        sub={`${stats.overdueCount} ${stats.overdueCount === 1 ? "pago" : "pagos"} vencido${stats.overdueCount === 1 ? "" : "s"}`}
        icon={AlertCircle}
        iconClass={stats.overdueCount > 0 ? "bg-destructive/10 text-destructive" : "bg-muted text-muted-foreground"}
        valueClass={stats.overdueCount > 0 ? "text-destructive" : undefined}
        index={2}
      />
      <StatCard
        label="Tasa de Cobranza"
        value={formatPercent(stats.collectionRate, 1)}
        sub={stats.collectionRate >= 90 ? "Excelente" : stats.collectionRate >= 70 ? "Regular" : "Requiere atención"}
        icon={BarChart3}
        iconClass={
          stats.collectionRate >= 90
            ? "bg-success/10 text-success"
            : stats.collectionRate >= 70
            ? "bg-warning/10 text-warning"
            : "bg-destructive/10 text-destructive"
        }
        index={3}
      />
      <StatCard
        label="Total Esperado"
        value={formatCurrency(stats.totalExpected)}
        sub="alquileres del período"
        icon={TrendingUp}
        iconClass="bg-primary/10 text-primary"
        index={4}
      />
    </div>
  );
}
