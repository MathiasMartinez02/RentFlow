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

interface BackendMaintenance {
  costos: { costosTotales: number; costoEstimadoAbiertos: number; costosUltimos30Dias: number };
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
  maintenance: BackendMaintenance,
  activity: BackendActivity
): DashboardData {
  const revChange = Math.round(revenue.comparativaAnual.crecimiento * 10) / 10;
  const metrics: DashboardData["metrics"] = {
    totalRevenue: {
      label: "Ingresos año actual",
      value: revenue.comparativaAnual.anioActual,
      change: revChange,
      changeLabel: "vs. año anterior",
      trend: revChange > 0 ? "up" : revChange < 0 ? "down" : "neutral",
    },
    activeProperties: {
      label: "Propiedades",
      value: overview.propiedades.total,
      change: 0,
      changeLabel: `${overview.propiedades.ocupadas} ocupadas · ${overview.propiedades.disponibles} disponibles`,
      trend: "neutral",
    },
    occupancyRate: {
      label: "Tasa de ocupación",
      value: `${Math.round(overview.propiedades.occupancyRate)}%`,
      change: 0,
      changeLabel: `${overview.propiedades.ocupadas} de ${overview.propiedades.total} propiedades`,
      trend: overview.propiedades.occupancyRate >= 70 ? "up" : overview.propiedades.occupancyRate >= 40 ? "neutral" : "down",
    },
    activeTenants: {
      label: "Contratos activos",
      value: overview.contratos.activos,
      change: 0,
      changeLabel: overview.contratos.porVencer > 0
        ? `${overview.contratos.porVencer} por vencer`
        : "todos al día",
      trend: overview.contratos.porVencer > 0 ? "down" : "neutral",
    },
    pendingPayments: {
      label: "Pagos pendientes",
      value: overview.pagos.pendientes,
      change: Math.round(overview.pagos.collectionRate * 10) / 10,
      changeLabel: "% cobranza",
      trend: overview.pagos.collectionRate >= 80 ? "up" : overview.pagos.collectionRate >= 60 ? "neutral" : "down",
    },
    maintenanceRequests: {
      label: "Mantenimiento abierto",
      value: overview.mantenimiento.abiertos,
      change: 0,
      changeLabel: overview.mantenimiento.urgentes > 0
        ? `${overview.mantenimiento.urgentes} urgente${overview.mantenimiento.urgentes !== 1 ? "s" : ""}`
        : "sin urgentes",
      trend: overview.mantenimiento.urgentes > 0 ? "down" : "neutral",
    },
  };

  const monthCount = revenue.ultimos12Meses.length || 12;
  const monthlyExpenses = Math.round(maintenance.costos.costosTotales / monthCount);
  const revenueHistory: RevenueDataPoint[] = revenue.ultimos12Meses.map((m) => ({
    month: m.mesLabel,
    revenue: m.ingresos,
    expenses: monthlyExpenses,
    net: m.ingresos - monthlyExpenses,
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
    const [overview, revenue, occupancy, maintenance, activity] = await Promise.all([
      api.get<BackendOverview>("/dashboard/overview"),
      api.get<BackendRevenue>("/dashboard/revenue"),
      api.get<BackendOccupancy>("/dashboard/occupancy"),
      api.get<BackendMaintenance>("/dashboard/maintenance"),
      api.get<BackendActivity>("/dashboard/activity"),
    ]);
    return buildDashboardData(overview, revenue, occupancy, maintenance, activity);
  },
};
