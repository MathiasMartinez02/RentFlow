"use client";

import { motion } from "framer-motion";
import { AlertTriangle, CheckCircle, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/shared/utils/format";
import type { PaymentsAnalytics } from "@/types/dashboard";

interface FinancialHealthCardProps {
  data?: PaymentsAnalytics;
  isLoading?: boolean;
}

export function FinancialHealthCard({ data, isLoading }: FinancialHealthCardProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-3 w-32" />
        </CardHeader>
        <CardContent className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  if (!data) return null;

  const rate = Math.round(data.collectionRate);
  const rateColor =
    rate >= 80 ? "text-emerald-600 dark:text-emerald-400" :
    rate >= 60 ? "text-amber-600 dark:text-amber-400" :
    "text-destructive";

  const trackWidth = `${Math.min(rate, 100)}%`;
  const trackColor =
    rate >= 80 ? "bg-emerald-500" :
    rate >= 60 ? "bg-amber-500" :
    "bg-destructive";

  const total30 = data.cobradoUltimos30 + data.pendienteUltimos30;
  const cobradoPct = total30 > 0 ? Math.round((data.cobradoUltimos30 / total30) * 100) : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.55 }}
    >
      <Card className="h-full">
        <CardHeader className="pb-3">
          <CardTitle>Salud Financiera</CardTitle>
          <CardDescription>Cobranza y riesgo de cartera</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">

          {/* Collection rate */}
          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Tasa de cobranza</span>
              <span className={`text-lg font-bold ${rateColor}`}>{rate}%</span>
            </div>
            <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
              <div className={`h-full rounded-full transition-all ${trackColor}`} style={{ width: trackWidth }} />
            </div>
          </div>

          {/* Risk indicators */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg bg-muted/50 p-3">
              <div className="mb-0.5 flex items-center gap-1.5">
                <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
                <span className="text-[11px] text-muted-foreground">Monto vencido</span>
              </div>
              <p className="text-sm font-semibold text-amber-600 dark:text-amber-400">
                {formatCurrency(data.montoVencido)}
              </p>
            </div>
            <div className="rounded-lg bg-muted/50 p-3">
              <div className="mb-0.5 flex items-center gap-1.5">
                <AlertTriangle className="h-3.5 w-3.5 text-destructive" />
                <span className="text-[11px] text-muted-foreground">Mora acumulada</span>
              </div>
              <p className="text-sm font-semibold text-destructive">
                {formatCurrency(data.mora)}
              </p>
            </div>
          </div>

          {/* Last 30 days */}
          <div>
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Últimos 30 días</span>
              <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                <TrendingUp className="h-3 w-3" />
                {cobradoPct}% cobrado
              </div>
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5">
                  <CheckCircle className="h-3 w-3 text-emerald-500" />
                  <span className="text-muted-foreground">Cobrado</span>
                </div>
                <span className="font-medium text-emerald-600 dark:text-emerald-400">
                  {formatCurrency(data.cobradoUltimos30)}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5">
                  <AlertTriangle className="h-3 w-3 text-amber-500" />
                  <span className="text-muted-foreground">Pendiente</span>
                </div>
                <span className="font-medium text-amber-600 dark:text-amber-400">
                  {formatCurrency(data.pendienteUltimos30)}
                </span>
              </div>
            </div>
            {total30 > 0 && (
              <div className="mt-2 h-1.5 w-full rounded-full bg-amber-200 dark:bg-amber-900 overflow-hidden">
                <div
                  className="h-full rounded-full bg-emerald-500 transition-all"
                  style={{ width: `${cobradoPct}%` }}
                />
              </div>
            )}
          </div>

        </CardContent>
      </Card>
    </motion.div>
  );
}
