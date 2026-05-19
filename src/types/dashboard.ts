export interface MetricCard {
  label: string;
  value: string | number;
  change: number;
  changeLabel: string;
  trend: "up" | "down" | "neutral";
}

export interface RevenueDataPoint {
  month: string;
  revenue: number;
  expenses: number;
  net: number;
}

export interface OccupancyDataPoint {
  month: string;
  rate: number;
  occupied: number;
  total: number;
}

export interface ActivityEvent {
  id: string;
  type:
    | "payment_received"
    | "contract_signed"
    | "maintenance_request"
    | "tenant_added"
    | "property_added"
    | "contract_expiring";
  title: string;
  description: string;
  timestamp: string;
  entityId: string;
  metadata?: Record<string, unknown>;
}

export interface DashboardData {
  metrics: {
    totalRevenue: MetricCard;
    activeProperties: MetricCard;
    occupancyRate: MetricCard;
    activeTenants: MetricCard;
    pendingPayments: MetricCard;
    maintenanceRequests: MetricCard;
  };
  revenueHistory: RevenueDataPoint[];
  occupancyHistory: OccupancyDataPoint[];
  recentActivity: ActivityEvent[];
  propertyDistribution: Array<{ type: string; count: number; percentage: number }>;
}
