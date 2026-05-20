"use client";

import { RefreshCw } from "lucide-react";
import { MetricsGrid } from "./components/metrics-grid";
import { RevenueChart } from "./components/revenue-chart";
import { OccupancyChart } from "./components/occupancy-chart";
import { RecentActivity } from "./components/recent-activity";
import { PropertyDistribution } from "./components/property-distribution";
import { FinancialHealthCard } from "./components/financial-health-card";
import { PaymentMethodsChart } from "./components/payment-methods-chart";
import { MaintenanceStatsCard } from "./components/maintenance-stats-card";
import { useDashboardData } from "./hooks/use-dashboard-data";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/shared/utils/format";

export function DashboardView() {
  const { data, isLoading, refetch } = useDashboardData();
  const now = new Date().toISOString();

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Panel"
        description={`Resumen al ${formatDate(now, "long")}`}
        action={
          <Button
            variant="outline"
            size="sm"
            onClick={refetch}
            disabled={isLoading}
            className="gap-1.5"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`} />
            Actualizar
          </Button>
        }
      />

      {/* Metrics */}
      <MetricsGrid metrics={data?.metrics} isLoading={isLoading} />

      {/* Revenue + Occupancy */}
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <RevenueChart
            data={data?.revenueHistory}
            metadata={data?.revenueMetadata}
            isLoading={isLoading}
          />
        </div>
        <OccupancyChart
          data={data?.occupancyHistory}
          currentRate={
            typeof data?.metrics.occupancyRate.value === "string"
              ? parseFloat(data.metrics.occupancyRate.value)
              : undefined
          }
          isLoading={isLoading}
        />
      </div>

      {/* Financial Health + Payment Methods + Maintenance */}
      <div className="grid gap-4 lg:grid-cols-3">
        <FinancialHealthCard
          data={data?.paymentsAnalytics}
          isLoading={isLoading}
        />
        <PaymentMethodsChart
          data={data?.paymentsAnalytics?.porMetodoPago}
          isLoading={isLoading}
        />
        <MaintenanceStatsCard
          data={data?.maintenanceAnalytics}
          isLoading={isLoading}
        />
      </div>

      {/* Activity + Portfolio Distribution */}
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <RecentActivity events={data?.recentActivity} isLoading={isLoading} />
        </div>
        <PropertyDistribution
          data={data?.propertyDistribution}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}
