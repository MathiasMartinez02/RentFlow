import { useCatalogStore } from "@/store/catalog.store";
import type { SearchHit } from "../types";

const MAX_PER_GROUP = 5;

/* ─── Display labels ─────────────────────────────────────────────── */

const PROPERTY_STATUS: Record<string, { label: string; className: string }> = {
  available:   { label: "Disponible",     className: "text-emerald-600 bg-emerald-500/10" },
  occupied:    { label: "Ocupado",        className: "text-blue-600 bg-blue-500/10" },
  maintenance: { label: "Mantenimiento",  className: "text-amber-600 bg-amber-500/10" },
  reserved:    { label: "Reservado",      className: "text-violet-600 bg-violet-500/10" },
};

const CONTRACT_STATUS: Record<string, { label: string; className: string }> = {
  active:     { label: "Activo",      className: "text-emerald-600 bg-emerald-500/10" },
  expired:    { label: "Vencido",     className: "text-red-600 bg-red-500/10" },
  pending:    { label: "Pendiente",   className: "text-amber-600 bg-amber-500/10" },
  terminated: { label: "Rescindido",  className: "text-zinc-600 bg-zinc-500/10" },
};

const PAYMENT_STATUS: Record<string, { label: string; className: string }> = {
  paid:      { label: "Pagado",    className: "text-emerald-600 bg-emerald-500/10" },
  pending:   { label: "Pendiente", className: "text-amber-600 bg-amber-500/10" },
  overdue:   { label: "Vencido",   className: "text-red-600 bg-red-500/10" },
  partial:   { label: "Parcial",   className: "text-blue-600 bg-blue-500/10" },
  cancelled: { label: "Cancelado", className: "text-zinc-600 bg-zinc-500/10" },
};

const MAINTENANCE_PRIORITY: Record<string, { label: string; className: string }> = {
  urgent: { label: "Urgente", className: "text-red-600 bg-red-500/10" },
  high:   { label: "Alta",    className: "text-orange-600 bg-orange-500/10" },
  medium: { label: "Media",   className: "text-amber-600 bg-amber-500/10" },
  low:    { label: "Baja",    className: "text-zinc-600 bg-zinc-500/10" },
};

const TENANT_PAYMENT: Record<string, { label: string; className: string }> = {
  al_dia:    { label: "Al día",    className: "text-emerald-600 bg-emerald-500/10" },
  atrasado:  { label: "Atrasado",  className: "text-red-600 bg-red-500/10" },
  pendiente: { label: "Pendiente", className: "text-amber-600 bg-amber-500/10" },
};

/* ─── Helpers ────────────────────────────────────────────────────── */

function matches(q: string, ...fields: (string | undefined)[]): boolean {
  const lower = q.toLowerCase();
  return fields.some((f) => f?.toLowerCase().includes(lower));
}

function formatARS(n: number): string {
  return `$${new Intl.NumberFormat("es-AR").format(n)}`;
}

function lookupBadge(
  map: Record<string, { label: string; className: string }>,
  key: string | undefined
): { label: string; className: string } | undefined {
  if (!key) return undefined;
  return map[key];
}

function tenantName(id: string): string {
  const { tenants } = useCatalogStore.getState();
  const t = tenants.find((t) => t.id === id);
  return t ? `${t.firstName} ${t.lastName}` : id;
}

function propertyName(id: string): string {
  const { properties } = useCatalogStore.getState();
  return properties.find((p) => p.id === id)?.name ?? id;
}

/* ─── Per-entity search ──────────────────────────────────────────── */

function searchProperties(q: string): SearchHit[] {
  const { properties } = useCatalogStore.getState();
  return properties
    .filter((p) => matches(q, p.name, p.address, p.city, p.state, p.id))
    .slice(0, MAX_PER_GROUP)
    .map((p) => ({
      type: "property" as const,
      id: p.id,
      label: p.name,
      sublabel: `${p.address}, ${p.city}`,
      badge: lookupBadge(PROPERTY_STATUS, p.status),
    }));
}

function searchTenants(q: string): SearchHit[] {
  const { tenants } = useCatalogStore.getState();
  return tenants
    .filter((t) =>
      matches(q, t.firstName, t.lastName, t.email, t.phone, t.id, `${t.firstName} ${t.lastName}`)
    )
    .slice(0, MAX_PER_GROUP)
    .map((t) => ({
      type: "tenant" as const,
      id: t.id,
      label: `${t.firstName} ${t.lastName}`,
      sublabel: t.email,
      badge: lookupBadge(TENANT_PAYMENT, t.paymentStatus),
    }));
}

function searchContracts(q: string): SearchHit[] {
  const { contracts } = useCatalogStore.getState();
  return contracts
    .filter((c) => {
      const tn = tenantName(c.tenantId);
      const pn = propertyName(c.propertyId);
      return matches(q, c.id, tn, pn, c.status);
    })
    .slice(0, MAX_PER_GROUP)
    .map((c) => ({
      type: "contract" as const,
      id: c.id,
      label: `${tenantName(c.tenantId)} · ${propertyName(c.propertyId)}`,
      sublabel: `${formatARS(c.monthlyRent)}/mes`,
      badge: lookupBadge(CONTRACT_STATUS, c.status),
    }));
}

function searchPayments(_q: string): SearchHit[] {
  return [];
}

function searchMaintenance(q: string): SearchHit[] {
  const { tickets } = useCatalogStore.getState();
  return tickets
    .filter((m) =>
      matches(q, m.id, m.title, m.description, propertyName(m.propertyId), m.category, m.notes)
    )
    .slice(0, MAX_PER_GROUP)
    .map((m) => ({
      type: "maintenance" as const,
      id: m.id,
      label: m.title,
      sublabel: propertyName(m.propertyId),
      badge: lookupBadge(MAINTENANCE_PRIORITY, m.priority),
    }));
}

/* ─── Public API ─────────────────────────────────────────────────── */

export type SearchResults = {
  property: SearchHit[];
  tenant: SearchHit[];
  contract: SearchHit[];
  payment: SearchHit[];
  maintenance: SearchHit[];
};

export function runSearch(q: string): SearchResults {
  const trimmed = q.trim();
  if (!trimmed) {
    return { property: [], tenant: [], contract: [], payment: [], maintenance: [] };
  }
  return {
    property: searchProperties(trimmed),
    tenant: searchTenants(trimmed),
    contract: searchContracts(trimmed),
    payment: searchPayments(trimmed),
    maintenance: searchMaintenance(trimmed),
  };
}
