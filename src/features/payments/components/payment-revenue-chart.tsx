"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Cell,
} from "recharts";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/shared/utils/format";
import type { MonthlyRevenue } from "@/types/payment";

interface TooltipPayload {
  value: number;
  name: string;
  color: string;
}

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: TooltipPayload[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;

  const labelMap: Record<string, string> = {
    collected: "Cobrado",
    pending: "Pendiente",
    overdue: "Vencido",
  };

  return (
    <div className="rounded-lg border border-border bg-popover p-3 shadow-xl">
      <p className="mb-2 text-xs font-medium text-muted-foreground">{label}</p>
      {payload.map((entry) => (
        <div key={entry.name} className="flex items-center gap-2 text-xs">
          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: entry.color }} />
          <span className="text-muted-foreground">{labelMap[entry.name] ?? entry.name}:</span>
          <span className="font-semibold text-foreground">{formatCurrency(entry.value)}</span>
        </div>
      ))}
    </div>
  );
}

interface PaymentRevenueChartProps {
  data?: MonthlyRevenue[];
  isLoading?: boolean;
}

export function PaymentRevenueChart({ data, isLoading }: PaymentRevenueChartProps) {
  if (isLoading || !data?.length) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-3 w-56" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[220px] w-full" />
        </CardContent>
      </Card>
    );
  }

  const recentData = data.slice(-6);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
    >
      <Card className="h-full">
        <CardHeader className="pb-2">
          <CardTitle>Recaudación Mensual</CardTitle>
          <CardDescription>Cobrado, pendiente y vencido por mes</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={recentData} margin={{ top: 4, right: 0, left: -20, bottom: 0 }} barGap={2}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: "hsl(var(--accent))", opacity: 0.5 }} />
              <Bar dataKey="collected" name="collected" radius={[4, 4, 0, 0]} maxBarSize={32}>
                {recentData.map((entry, index) => (
                  <Cell
                    key={`cell-collected-${index}`}
                    fill={entry.collected > 0 ? "hsl(142,71%,45%)" : "hsl(var(--muted))"}
                    fillOpacity={0.85}
                  />
                ))}
              </Bar>
              <Bar dataKey="pending" name="pending" radius={[4, 4, 0, 0]} maxBarSize={32} fill="hsl(38,92%,50%)" fillOpacity={0.7} />
              <Bar dataKey="overdue" name="overdue" radius={[4, 4, 0, 0]} maxBarSize={32} fill="hsl(0,72%,51%)" fillOpacity={0.8} />
            </BarChart>
          </ResponsiveContainer>

          <div className="mt-2 flex items-center gap-4">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: "hsl(142,71%,45%)" }} />
              Cobrado
            </div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: "hsl(38,92%,50%)" }} />
              Pendiente
            </div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: "hsl(0,72%,51%)" }} />
              Vencido
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
