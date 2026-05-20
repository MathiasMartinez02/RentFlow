import { api } from "@/lib/api-client";
import type {
  DashboardData,
  MetricCard,
  RevenueDataPoint,
  OccupancyDataPoint,
  ActivityEvent,
} from "@/types/dashboard";

// ─── Backend response shapes ──────────────────────────────────────────────────

interface BackendOverview {
  propiedades: { total: number; ocupadas: number; disponibles: number; enMantenimiento: number; occupancyRate: number };
  contratos: { activos: number; porVencer: number; vencidos: number };
  pagos: { pendientes: number; vencidos: number; pagados: number; montoPendiente: number; montoVencido: number; moraTotalVencida: number; ingresosMesActual: number; ingresosTotales: number; collectionRate: number };
  mantenimiento: { abiertos: number; urgentes: number; resueltosMes: number; costosTotales: number };
}

interface BackendRevenue {
  ultimos12Meses: Array<{ mes: string; mesLabel: string; ingresos: number; cantidadPagos: number }>;
  comparativaAnual: { anioActual: number; anioAnterior: number; crecimiento: number };
  promedioMensual: number;
  mejorMes: { mes: string; mesLabel: string; ingresos: number; cantidadPagos: number } | null;
  totalPeriodo: number;
}

interface BackendOccupancy {
  occupancyRate: number;
  totalPropiedades: number;
  ocupadas: number;
  disponibles: number;
  enMantenimiento: number;
  distribucionPorTipo: Array<{ tipo: string; total: number; ocupadas: number; disponibles: number; rate: number }>;
}

interface BackendActivity {
  pagosRecientes: Array<{ id: string; monto: string | number; estado: string; periodo: string; createdAt: string; tenant?: { nombre: string; apellido: string }; property?: { nombre: string } }>;
  contratosRecientes: Array<{ id: string; codigoContrato: string; estado: string; montoMensual: string | number; createdAt: string; tenant?: { nombre: string; apellido: string }; property?: { nombre: string } }>;
  ticketsRecientes: Array<{ id: string; titulo: string; prioridad: string; estado: string; categoria: string; createdAt: string; property?: { nombre: string } }>;
  actividadesRecientes: Array<{ id: string; action: string; entityType: string; entityId: string; descripcion?: string; createdAt: string }>;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function metricCard(value: number, label: string, prev?: number): MetricCard {
  const change = prev !== undefined && prev > 0 ? ((value - prev) / prev) * 100 : 0;
  return {
    label,
    value,
    change: Math.round(change * 10) / 10,
    changeLabel: prev !== undefined ? `vs. período anterior` : "",
    trend: change > 0 ? "up" : change < 0 ? "down" : "neutral",
  };
}

function buildDashboardData(
  overview: BackendOverview,
  revenue: BackendRevenue,
  occupancy: BackendOccupancy,
  activity: BackendActivity
): DashboardData {
  const metrics: DashboardData["metrics"] = {
    totalRevenue: metricCard(
      overview.pagos.ingresosMesActual,
      "Ingresos totales",
      overview.pagos.ingresosTotales
    ),
    activeProperties: metricCard(overview.propiedades.total, "Propiedades"),
    occupancyRate: {
      label: "Tasa de ocupación",
      value: `${Math.round(overview.propiedades.occupancyRate)}%`,
      change: 0,
      changeLabel: "",
      trend: "neutral",
    },
    activeTenants: metricCard(overview.contratos.activos, "Contratos activos"),
    pendingPayments: metricCard(overview.pagos.pendientes, "Pagos pendientes"),
    maintenanceRequests: metricCard(overview.mantenimiento.abiertos, "Mantenimiento abierto"),
  };

  const revenueHistory: RevenueDataPoint[] = revenue.ultimos12Meses.map((m) => ({
    month: m.mesLabel,
    revenue: m.ingresos,
    expenses: 0,
    net: m.ingresos,
  }));

  const occupancyHistory: OccupancyDataPoint[] = revenue.ultimos12Meses.map((m) => ({
    month: m.mesLabel,
    rate: occupancy.occupancyRate,
    occupied: occupancy.ocupadas,
    total: occupancy.totalPropiedades,
  }));

  const recentActivity: ActivityEvent[] = [
    ...activity.pagosRecientes.map((p) => ({
      id: p.id,
      type: "payment_received" as const,
      title: `Pago ${p.estado === "PAGADO" ? "recibido" : "pendiente"} — ${p.property?.nombre ?? ""}`,
      description: `$${Number(p.monto).toLocaleString("es-AR")}${p.tenant ? ` · ${p.tenant.nombre} ${p.tenant.apellido}` : ""}`,
      timestamp: p.createdAt,
      entityId: p.id,
    })),
    ...activity.contratosRecientes.map((c) => ({
      id: c.id,
      type: "contract_signed" as const,
      title: `${c.codigoContrato} — ${c.property?.nombre ?? ""}`,
      description: `${c.tenant ? `${c.tenant.nombre} ${c.tenant.apellido}` : ""} · $${Number(c.montoMensual).toLocaleString("es-AR")}/mes`,
      timestamp: c.createdAt,
      entityId: c.id,
    })),
    ...activity.ticketsRecientes.map((t) => ({
      id: t.id,
      type: "maintenance_request" as const,
      title: t.titulo,
      description: `${t.property?.nombre ?? ""} · Prioridad: ${t.prioridad}`,
      timestamp: t.createdAt,
      entityId: t.id,
    })),
  ]
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 10);

  const typeLabels: Record<string, string> = {
    APARTAMENTO: "Apartamento",
    CASA: "Casa",
    LOCAL: "Local",
    OFICINA: "Oficina",
    DUPLEX: "Dúplex",
  };

  const propertyDistribution = occupancy.distribucionPorTipo.map((d) => ({
    type: typeLabels[d.tipo] ?? d.tipo,
    count: d.total,
    percentage: occupancy.totalPropiedades > 0 ? Math.round((d.total / occupancy.totalPropiedades) * 100) : 0,
  }));

  return { metrics, revenueHistory, occupancyHistory, recentActivity, propertyDistribution };
}

// ─── Service ──────────────────────────────────────────────────────────────────

export const dashboardService = {
  async getData(): Promise<DashboardData> {
    const [overview, revenue, occupancy, activity] = await Promise.all([
      api.get<BackendOverview>("/dashboard/overview"),
      api.get<BackendRevenue>("/dashboard/revenue"),
      api.get<BackendOccupancy>("/dashboard/occupancy"),
      api.get<BackendActivity>("/dashboard/activity"),
    ]);
    return buildDashboardData(overview, revenue, occupancy, activity);
  },
};
