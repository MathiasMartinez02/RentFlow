"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { DashboardData } from "@/types/dashboard";

const COLORS = ["hsl(239,84%,67%)", "hsl(142,70%,45%)", "hsl(38,92%,50%)", "hsl(0,72%,51%)"];

interface PropertyDistributionProps {
  data?: DashboardData["propertyDistribution"];
  isLoading?: boolean;
}

export function PropertyDistribution({ data, isLoading }: PropertyDistributionProps) {
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
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-3 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.5 }}
    >
      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Composición del Portafolio</CardTitle>
          <CardDescription>Distribución por tipo de propiedad</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-6">
            <ResponsiveContainer width={100} height={100}>
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={28}
                  outerRadius={46}
                  dataKey="count"
                  strokeWidth={0}
                >
                  {data?.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  content={({ active, payload }) => {
                    if (!active || !payload?.length) return null;
                    const d = payload[0].payload;
                    return (
                      <div className="rounded-lg border border-border bg-popover p-2 shadow-xl text-xs">
                        <p className="font-medium">{d.type}</p>
                        <p className="text-muted-foreground">{d.count} unidades · {d.percentage}%</p>
                        <p className="text-muted-foreground">Ocupación: {d.occupancyRate}%</p>
                      </div>
                    );
                  }}
                />
              </PieChart>
            </ResponsiveContainer>

            <div className="flex-1 space-y-2.5">
              {data?.map((item, index) => (
                <div key={item.type} className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className="h-2 w-2 shrink-0 rounded-full"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <span className="truncate text-xs text-muted-foreground">{item.type}</span>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="text-xs font-medium text-foreground">{item.count}</span>
                    <span className="text-[10px] text-muted-foreground/60">({item.percentage}%)</span>
                    <span
                      className="text-[10px] font-medium px-1 py-0.5 rounded"
                      style={{
                        backgroundColor: item.occupancyRate >= 70
                          ? "hsl(142,70%,45%,0.1)"
                          : item.occupancyRate >= 40
                          ? "hsl(38,92%,50%,0.1)"
                          : "hsl(0,72%,51%,0.1)",
                        color: item.occupancyRate >= 70
                          ? "hsl(142,70%,35%)"
                          : item.occupancyRate >= 40
                          ? "hsl(38,92%,40%)"
                          : "hsl(0,72%,51%)",
                      }}
                    >
                      {item.occupancyRate}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
