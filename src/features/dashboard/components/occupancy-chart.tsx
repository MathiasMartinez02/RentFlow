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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import type { OccupancyDataPoint } from "@/types/dashboard";

interface OccupancyChartProps {
  data?: OccupancyDataPoint[];
  currentRate?: number;
  isLoading?: boolean;
}

export function OccupancyChart({ data, currentRate, isLoading }: OccupancyChartProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-48" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-[160px] w-full" />
          <Skeleton className="h-4 w-full" />
        </CardContent>
      </Card>
    );
  }

  const lastPoint = data?.[data.length - 1];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.4 }}
    >
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between">
            <div>
              <CardTitle>Tasa de Ocupación</CardTitle>
              <CardDescription>Unidades ocupadas por mes</CardDescription>
            </div>
            {lastPoint && (
              <div className="text-right">
                <p className="text-2xl font-bold text-foreground">
                  {lastPoint.rate.toFixed(1)}%
                </p>
                <p className="text-xs text-muted-foreground">
                  {lastPoint.occupied}/{lastPoint.total} unidades
                </p>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={data} margin={{ top: 4, right: 0, left: -30, bottom: 0 }} barSize={22}>
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
                domain={[60, 100]}
                tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `${v}%`}
              />
              <Tooltip
                cursor={{ fill: "hsl(var(--accent))", radius: 4 }}
                content={({ active, payload, label }) => {
                  if (!active || !payload?.length) return null;
                  const d = payload[0].payload as OccupancyDataPoint;
                  return (
                    <div className="rounded-lg border border-border bg-popover p-3 shadow-xl">
                      <p className="mb-1 text-xs font-medium text-muted-foreground">{label}</p>
                      <p className="text-sm font-semibold text-foreground">{d.rate.toFixed(1)}%</p>
                      <p className="text-xs text-muted-foreground">{d.occupied}/{d.total} unidades</p>
                    </div>
                  );
                }}
              />
              <Bar dataKey="rate" radius={[4, 4, 0, 0]}>
                {data?.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={
                      index === (data.length - 1)
                        ? "hsl(239,84%,67%)"
                        : "hsl(var(--muted))"
                    }
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>

          <div className="space-y-1.5">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Ocupación general</span>
              <span className="font-medium text-foreground">{currentRate?.toFixed(1)}%</span>
            </div>
            <Progress value={currentRate} className="h-1.5" />
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
