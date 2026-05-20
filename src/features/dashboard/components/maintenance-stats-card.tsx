"use client";

import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { motion } from "framer-motion";
import { Clock, DollarSign, Wrench } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/shared/utils/format";
import type { MaintenanceAnalytics } from "@/types/dashboard";

const PRIORITY_COLORS: Record<string, string> = {
  URGENTE: "hsl(0,72%,51%)",
  ALTA: "hsl(22,95%,50%)",
  MEDIA: "hsl(38,92%,50%)",
  BAJA: "hsl(142,70%,45%)",
};

const BAR_COLOR = "hsl(239,84%,67%)";

interface MaintenanceStatsCardProps {
  data?: MaintenanceAnalytics;
  isLoading?: boolean;
}

export function MaintenanceStatsCard({ data, isLoading }: MaintenanceStatsCardProps) {
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

  const hasCategories = data.porCategoria.length > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.65 }}
    >
      <Card className="h-full">
        <CardHeader className="pb-3">
          <CardTitle>Mantenimiento</CardTitle>
          <CardDescription>Costos y resolución de tickets</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">

          {/* Cost stats */}
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-lg bg-muted/50 p-2.5">
              <div className="mb-0.5 flex items-center gap-1">
                <DollarSign className="h-3 w-3 text-muted-foreground" />
                <span className="text-[10px] text-muted-foreground">Total</span>
              </div>
              <p className="text-xs font-semibold">{formatCurrency(data.costosTotales)}</p>
            </div>
            <div className="rounded-lg bg-muted/50 p-2.5">
              <div className="mb-0.5 flex items-center gap-1">
                <Wrench className="h-3 w-3 text-muted-foreground" />
                <span className="text-[10px] text-muted-foreground">Abiertos</span>
              </div>
              <p className="text-xs font-semibold text-amber-600 dark:text-amber-400">
                {formatCurrency(data.costoEstimadoAbiertos)}
              </p>
            </div>
            <div className="rounded-lg bg-muted/50 p-2.5">
              <div className="mb-0.5 flex items-center gap-1">
                <Clock className="h-3 w-3 text-muted-foreground" />
                <span className="text-[10px] text-muted-foreground">30 días</span>
              </div>
              <p className="text-xs font-semibold">{formatCurrency(data.costosUltimos30Dias)}</p>
            </div>
          </div>

          {/* Resolution time */}
          {data.promedioResolucionDias != null && (
            <div className="flex items-center justify-between rounded-lg bg-muted/50 px-3 py-2">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Tiempo promedio de resolución</span>
              </div>
              <span className="text-sm font-semibold">
                {data.promedioResolucionDias.toFixed(1)} días
              </span>
            </div>
          )}

          {/* Priority breakdown */}
          {data.porPrioridad.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {data.porPrioridad.map((p) => (
                <div
                  key={p.priority}
                  className="flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium"
                  style={{
                    backgroundColor: `${PRIORITY_COLORS[p.priority] ?? "hsl(var(--muted))"}20`,
                    color: PRIORITY_COLORS[p.priority] ?? "hsl(var(--muted-foreground))",
                  }}
                >
                  {p.count} {p.priority.charAt(0) + p.priority.slice(1).toLowerCase()}
                </div>
              ))}
            </div>
          )}

          {/* Category chart */}
          {hasCategories && (
            <div>
              <p className="mb-2 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                Por categoría
              </p>
              <ResponsiveContainer width="100%" height={90}>
                <BarChart
                  data={data.porCategoria}
                  layout="vertical"
                  margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
                >
                  <XAxis type="number" hide />
                  <YAxis
                    type="category"
                    dataKey="category"
                    width={80}
                    tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (!active || !payload?.length) return null;
                      const d = payload[0].payload;
                      return (
                        <div className="rounded-lg border border-border bg-popover p-2 shadow-xl text-xs">
                          <p className="font-medium">{d.category}</p>
                          <p className="text-muted-foreground">{d.count} tickets</p>
                          {d.total > 0 && <p className="text-muted-foreground">{formatCurrency(d.total)}</p>}
                        </div>
                      );
                    }}
                    cursor={{ fill: "hsl(var(--muted))" }}
                  />
                  <Bar dataKey="count" radius={[0, 3, 3, 0]} barSize={10}>
                    {data.porCategoria.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={BAR_COLOR} opacity={0.7 + (index * 0.05)} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

        </CardContent>
      </Card>
    </motion.div>
  );
}
