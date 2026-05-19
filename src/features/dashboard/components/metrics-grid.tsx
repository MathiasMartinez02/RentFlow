"use client";

import {
  DollarSign,
  Building2,
  Users,
  Percent,
  AlertCircle,
  Wrench,
} from "lucide-react";
import { MetricCard } from "@/components/ui/metric-card";
import type { DashboardData } from "@/types/dashboard";

interface MetricsGridProps {
  metrics?: DashboardData["metrics"];
  isLoading?: boolean;
}

const METRIC_CONFIG = [
  { key: "totalRevenue", icon: DollarSign, iconColor: "bg-primary/10" },
  { key: "activeProperties", icon: Building2, iconColor: "bg-blue-500/10" },
  { key: "occupancyRate", icon: Percent, iconColor: "bg-success/10" },
  { key: "activeTenants", icon: Users, iconColor: "bg-violet-500/10" },
  { key: "pendingPayments", icon: AlertCircle, iconColor: "bg-warning/10" },
  { key: "maintenanceRequests", icon: Wrench, iconColor: "bg-orange-500/10" },
] as const;

const LOADING_PLACEHOLDER = {
  label: "",
  value: "",
  change: 0,
  changeLabel: "",
  trend: "neutral" as const,
};

export function MetricsGrid({ metrics, isLoading }: MetricsGridProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {METRIC_CONFIG.map(({ key, icon, iconColor }, index) => (
        <MetricCard
          key={key}
          data={metrics?.[key] ?? LOADING_PLACEHOLDER}
          icon={icon}
          iconColor={iconColor}
          index={index}
          isLoading={isLoading}
        />
      ))}
    </div>
  );
}
