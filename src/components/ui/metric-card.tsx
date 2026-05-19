"use client";

import { TrendingDown, TrendingUp, Minus, type LucideIcon } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "./card";
import { Skeleton } from "./skeleton";
import type { MetricCard as MetricCardType } from "@/types/dashboard";

interface MetricCardProps {
  data: MetricCardType;
  icon: LucideIcon;
  iconColor?: string;
  index?: number;
  isLoading?: boolean;
}

export function MetricCard({ data, icon: Icon, iconColor, index = 0, isLoading }: MetricCardProps) {
  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-5">
          <div className="flex items-start justify-between">
            <div className="space-y-2 flex-1">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-7 w-32" />
              <Skeleton className="h-3 w-28" />
            </div>
            <Skeleton className="h-9 w-9 rounded-lg" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const TrendIcon =
    data.trend === "up" ? TrendingUp : data.trend === "down" ? TrendingDown : Minus;

  const trendColor =
    data.trend === "up"
      ? "text-success"
      : data.trend === "down"
        ? "text-destructive"
        : "text-muted-foreground";

  const isPositiveChange = data.trend !== "down";

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
    >
      <Card className="group relative overflow-hidden transition-all duration-200 hover:border-border/80 hover:shadow-md">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.03] to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        <CardContent className="relative p-5">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1 min-w-0">
              <p className="text-xs font-medium text-muted-foreground">{data.label}</p>
              <p className="text-2xl font-bold tracking-tight text-foreground">{data.value}</p>
              <div className={cn("flex items-center gap-1 text-xs font-medium", trendColor)}>
                <TrendIcon className="h-3 w-3" />
                <span>
                  {data.change !== 0 && (
                    <>
                      {isPositiveChange ? "+" : ""}{data.change}%{" "}
                    </>
                  )}
                  {data.changeLabel}
                </span>
              </div>
            </div>
            <div
              className={cn(
                "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
                iconColor ?? "bg-primary/10"
              )}
            >
              <Icon
                className={cn(
                  "h-4.5 w-4.5",
                  iconColor ? "text-white" : "text-primary"
                )}
                style={{ width: 18, height: 18 }}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
