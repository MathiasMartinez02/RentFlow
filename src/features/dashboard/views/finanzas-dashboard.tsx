"use client";

import { RefreshCw } from "lucide-react";
import { motion } from "framer-motion";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency, formatDate } from "@/shared/utils/format";
import { useDashboardData } from "../hooks/use-dashboard-data";
import { RevenueChart } from "../components/revenue-chart";
import { FinancialHealthCard } from "../components/financial-health-card";
import { PaymentMethodsChart } from "../components/payment-methods-chart";
import type { MetricCard } from "@/types/dashboard";

function FinancialMetricCard({ metric, isLoading, delay = 0 }: { metric?: MetricCard; isLoading: boolean; delay?: number }) {
  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <Skeleton className="h-3 w-24 mb-2" />
          <Skeleton className="h-7 w-32" />
        </CardContent>
      </Card>
    );
  }
  if (!metric) return null;

  const trendColor =
    metric.trend === "up" ? "text-emerald-600 dark:text-emerald-400" :
    metric.trend === "down" ? "text-destructive" :
    "text-muted-foreground";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay }}
    >
      <Card>
        <CardHeader className="pb-1 pt-5">
          <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            {metric.label}
          </CardTitle>
        </CardHeader>
        <CardContent className="pb-5">
          <p className="text-2xl font-bold">
            {typeof metric.value === "number" && metric.label.toLowerCase().includes("ingreso")
              ? formatCurrency(metric.value)
              : metric.value}
          </p>
          <p className={`mt-1 text-xs ${trendColor}`}>
            {metric.changeLabel}
          </p>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export function FinanzasDashboard() {
  const { data, isLoading, refetch } = useDashboardData();
  const now = new Date().toISOString();

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Panel Financiero"
        description={`Resumen al ${formatDate(now, "long")}`}
        action={
          <Button variant="outline" size="sm" onClick={refetch} disabled={isLoading} className="gap-1.5">
            <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`} />
            Actualizar
          </Button>
        }
      />

      {/* Financial metrics */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <FinancialMetricCard metric={data?.metrics.totalRevenue} isLoading={isLoading} delay={0} />
        <FinancialMetricCard metric={data?.metrics.pendingPayments} isLoading={isLoading} delay={0.05} />
        <FinancialMetricCard metric={data?.metrics.activeTenants} isLoading={isLoading} delay={0.1} />
      </div>

      {/* Revenue chart — full width */}
      <RevenueChart
        data={data?.revenueHistory}
        metadata={data?.revenueMetadata}
        isLoading={isLoading}
      />

      {/* Financial health + payment methods */}
      <div className="grid gap-4 lg:grid-cols-2">
        <FinancialHealthCard data={data?.paymentsAnalytics} isLoading={isLoading} />
        <PaymentMethodsChart data={data?.paymentsAnalytics?.porMetodoPago} isLoading={isLoading} />
      </div>
    </div>
  );
}
