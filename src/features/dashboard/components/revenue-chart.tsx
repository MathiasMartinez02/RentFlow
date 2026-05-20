"use client";

import {
  Area,
  Bar,
  ComposedChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/shared/utils/format";
import type { RevenueDataPoint, RevenueMetadata } from "@/types/dashboard";

interface RevenueChartProps {
  data?: RevenueDataPoint[];
  metadata?: RevenueMetadata;
  isLoading?: boolean;
}

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ value: number; name: string; color: string }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-lg border border-border bg-popover p-3 shadow-xl">
      <p className="mb-2 text-xs font-medium text-muted-foreground">{label}</p>
      {payload.map((entry) => (
        <div key={entry.name} className="flex items-center gap-2 text-xs">
          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: entry.color }} />
          <span className="text-muted-foreground">{entry.name}:</span>
          <span className="font-semibold text-foreground">
            {entry.name === "Pagos"
              ? `${entry.value} pago${entry.value !== 1 ? "s" : ""}`
              : formatCurrency(entry.value)}
          </span>
        </div>
      ))}
    </div>
  );
}

function GrowthBadge({ value }: { value: number }) {
  if (value > 0) {
    return (
      <Badge variant="outline" className="gap-1 text-emerald-600 border-emerald-200 bg-emerald-50 dark:bg-emerald-950/30 dark:border-emerald-800 dark:text-emerald-400">
        <TrendingUp className="h-3 w-3" />
        +{value}% vs año anterior
      </Badge>
    );
  }
  if (value < 0) {
    return (
      <Badge variant="outline" className="gap-1 text-destructive border-destructive/30 bg-destructive/5">
        <TrendingDown className="h-3 w-3" />
        {value}% vs año anterior
      </Badge>
    );
  }
  return (
    <Badge variant="outline" className="gap-1 text-muted-foreground">
      <Minus className="h-3 w-3" />
      Sin cambio vs año anterior
    </Badge>
  );
}

export function RevenueChart({ data, metadata, isLoading }: RevenueChartProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-48 mt-1" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[240px] w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.35 }}
    >
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <CardTitle>Resumen de Ingresos</CardTitle>
              <p className="mt-0.5 text-sm text-muted-foreground">Ingresos y pagos de los últimos 12 meses</p>
            </div>
            {metadata && <GrowthBadge value={metadata.growth} />}
          </div>

          {metadata && (
            <div className="flex flex-wrap gap-4 pt-1">
              <div>
                <p className="text-[11px] text-muted-foreground">Promedio mensual</p>
                <p className="text-sm font-semibold">{formatCurrency(metadata.promedioMensual)}</p>
              </div>
              {metadata.mejorMes && (
                <div>
                  <p className="text-[11px] text-muted-foreground">Mejor mes</p>
                  <p className="text-sm font-semibold">{metadata.mejorMes} — {formatCurrency(metadata.mejorMesIngresos)}</p>
                </div>
              )}
              <div>
                <p className="text-[11px] text-muted-foreground">Total período</p>
                <p className="text-sm font-semibold">{formatCurrency(metadata.totalPeriodo)}</p>
              </div>
            </div>
          )}
        </CardHeader>

        <CardContent>
          <ResponsiveContainer width="100%" height={240}>
            <ComposedChart data={data} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(239,84%,67%)" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="hsl(239,84%,67%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                yAxisId="revenue"
                tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `$${(v / 1_000_000).toFixed(1)}M`}
              />
              <YAxis
                yAxisId="payments"
                orientation="right"
                tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `${v}`}
                width={30}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ stroke: "hsl(var(--border))", strokeWidth: 1 }} />
              <Bar
                yAxisId="payments"
                dataKey="payments"
                name="Pagos"
                fill="hsl(239,84%,67%)"
                opacity={0.15}
                radius={[3, 3, 0, 0]}
                barSize={20}
              />
              <Area
                yAxisId="revenue"
                type="monotone"
                dataKey="revenue"
                name="Ingresos"
                stroke="hsl(239,84%,67%)"
                strokeWidth={2}
                fill="url(#revenueGradient)"
                dot={false}
                activeDot={{ r: 4, strokeWidth: 0, fill: "hsl(239,84%,67%)" }}
              />
            </ComposedChart>
          </ResponsiveContainer>

          <div className="mt-3 flex items-center gap-4">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span className="h-2 w-2 rounded-full bg-primary" />
              Ingresos
            </div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span className="h-2 w-2 rounded-full bg-primary/30" />
              Cantidad de pagos
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
