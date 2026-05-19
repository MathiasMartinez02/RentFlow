"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/shared/utils/format";
import type { RevenueDataPoint } from "@/types/dashboard";

interface RevenueChartProps {
  data?: RevenueDataPoint[];
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
          <span
            className="h-2 w-2 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <span className="capitalize text-muted-foreground">{entry.name}:</span>
          <span className="font-semibold text-foreground">
            {formatCurrency(entry.value)}
          </span>
        </div>
      ))}
    </div>
  );
}

export function RevenueChart({ data, isLoading }: RevenueChartProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-48" />
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
        <CardHeader className="pb-2">
          <CardTitle>Resumen de Ingresos</CardTitle>
          <CardDescription>Ingresos netos de los últimos 6 meses</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={data} margin={{ top: 4, right: 0, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(239,84%,67%)" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="hsl(239,84%,67%)" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="expensesGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(0,72%,51%)" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="hsl(0,72%,51%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="hsl(var(--border))"
                vertical={false}
              />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `$${(v / 1_000_000).toFixed(1)}M`}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ stroke: "hsl(var(--border))", strokeWidth: 1 }} />
              <Area
                type="monotone"
                dataKey="revenue"
                name="Ingresos"
                stroke="hsl(239,84%,67%)"
                strokeWidth={2}
                fill="url(#revenueGradient)"
                dot={false}
                activeDot={{ r: 4, strokeWidth: 0, fill: "hsl(239,84%,67%)" }}
              />
              <Area
                type="monotone"
                dataKey="expenses"
                name="Gastos"
                stroke="hsl(0,72%,51%)"
                strokeWidth={1.5}
                fill="url(#expensesGradient)"
                strokeDasharray="4 4"
                dot={false}
                activeDot={{ r: 3, strokeWidth: 0, fill: "hsl(0,72%,51%)" }}
              />
            </AreaChart>
          </ResponsiveContainer>

          {/* Legend */}
          <div className="mt-3 flex items-center gap-4">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span className="h-2 w-2 rounded-full bg-primary" />
              Ingresos
            </div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span className="h-2 w-2 rounded-full bg-destructive" />
              Gastos
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
