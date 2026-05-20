"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/shared/utils/format";
import type { PaymentsAnalytics } from "@/types/dashboard";

const COLORS = [
  "hsl(239,84%,67%)",
  "hsl(142,70%,45%)",
  "hsl(38,92%,50%)",
  "hsl(280,70%,55%)",
];

interface PaymentMethodsChartProps {
  data?: PaymentsAnalytics["porMetodoPago"];
  isLoading?: boolean;
}

export function PaymentMethodsChart({ data, isLoading }: PaymentMethodsChartProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-3 w-32" />
        </CardHeader>
        <CardContent>
          <Skeleton className="mx-auto h-[120px] w-[120px] rounded-full" />
          <div className="mt-4 space-y-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-3 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data?.length) return null;

  const totalCount = data.reduce((acc, m) => acc + m.count, 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.6 }}
    >
      <Card className="h-full">
        <CardHeader className="pb-2">
          <CardTitle>Métodos de Pago</CardTitle>
          <CardDescription>Distribución de pagos por método</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-5">
            <ResponsiveContainer width={110} height={110}>
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={30}
                  outerRadius={50}
                  dataKey="count"
                  strokeWidth={0}
                >
                  {data.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  content={({ active, payload }) => {
                    if (!active || !payload?.length) return null;
                    const d = payload[0].payload;
                    const pct = totalCount > 0 ? Math.round((d.count / totalCount) * 100) : 0;
                    return (
                      <div className="rounded-lg border border-border bg-popover p-2 shadow-xl text-xs">
                        <p className="font-medium">{d.method}</p>
                        <p className="text-muted-foreground">{d.count} pagos · {pct}%</p>
                        <p className="text-muted-foreground">{formatCurrency(d.total)}</p>
                      </div>
                    );
                  }}
                />
              </PieChart>
            </ResponsiveContainer>

            <div className="flex-1 space-y-2.5">
              {data.map((item, index) => {
                const pct = totalCount > 0 ? Math.round((item.count / totalCount) * 100) : 0;
                return (
                  <div key={item.method}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-1.5">
                        <span
                          className="h-2 w-2 shrink-0 rounded-full"
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        />
                        <span className="text-xs text-muted-foreground">{item.method}</span>
                      </div>
                      <span className="text-xs font-medium">{pct}%</span>
                    </div>
                    <div className="h-1 w-full rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${pct}%`,
                          backgroundColor: COLORS[index % COLORS.length],
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
