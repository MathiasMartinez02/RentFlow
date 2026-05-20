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
  payments: number;
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

export interface PaymentsAnalytics {
  collectionRate: number;
  montoVencido: number;
  mora: number;
  cobradoUltimos30: number;
  pendienteUltimos30: number;
  porMetodoPago: Array<{ method: string; count: number; total: number }>;
}

export interface MaintenanceAnalytics {
  costosTotales: number;
  costoEstimadoAbiertos: number;
  costosUltimos30Dias: number;
  promedioResolucionDias: number | null;
  porCategoria: Array<{ category: string; count: number; total: number }>;
  porPrioridad: Array<{ priority: string; count: number }>;
}

export interface RevenueMetadata {
  growth: number;
  promedioMensual: number;
  mejorMes: string;
  mejorMesIngresos: number;
  totalPeriodo: number;
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
  revenueMetadata: RevenueMetadata;
  occupancyHistory: OccupancyDataPoint[];
  recentActivity: ActivityEvent[];
  propertyDistribution: Array<{ type: string; count: number; percentage: number; occupancyRate: number }>;
  paymentsAnalytics: PaymentsAnalytics;
  maintenanceAnalytics: MaintenanceAnalytics;
}
