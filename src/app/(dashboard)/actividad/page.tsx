"use client";

import { motion } from "framer-motion";
import {
  Activity, CreditCard, FileText, Wrench, Zap, Home, Users,
  CheckCircle2, AlertCircle, Clock, RefreshCw, FilePlus, UserPlus,
  AlertTriangle, Database, TrendingUp,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useActivity, type ActivityFilter } from "@/features/notifications/hooks/use-activity";
import { timeAgo, formatFullDate } from "@/features/notifications/utils/time.utils";
import type { ActivityEvent, ActivityEventType, ActivityCategory } from "@/features/notifications/types";

/* ─── Config maps ────────────────────────────────────────────────── */

const EVENT_ICON: Record<ActivityEventType, React.ComponentType<{ className?: string }>> = {
  payment_received:    CheckCircle2,
  payment_overdue:     AlertCircle,
  payment_late:        AlertCircle,
  contract_expiring:   Clock,
  contract_signed:     FilePlus,
  contract_renewed:    RefreshCw,
  contract_expired:    AlertTriangle,
  maintenance_created: Wrench,
  maintenance_resolved:CheckCircle2,
  maintenance_urgent:  AlertTriangle,
  tenant_added:        UserPlus,
  tenant_updated:      Users,
  property_added:      Home,
  property_updated:    Home,
  system_update:       Zap,
  system_backup:       Database,
};

const EVENT_COLORS: Record<ActivityEventType, { icon: string; ring: string; line: string }> = {
  payment_received:    { icon: "text-emerald-500 bg-emerald-500/10", ring: "ring-emerald-500/20", line: "bg-emerald-500/20" },
  payment_overdue:     { icon: "text-red-500 bg-red-500/10",         ring: "ring-red-500/20",     line: "bg-red-500/20" },
  payment_late:        { icon: "text-red-500 bg-red-500/10",         ring: "ring-red-500/20",     line: "bg-red-500/20" },
  contract_expiring:   { icon: "text-amber-500 bg-amber-500/10",     ring: "ring-amber-500/20",   line: "bg-amber-500/20" },
  contract_signed:     { icon: "text-blue-500 bg-blue-500/10",       ring: "ring-blue-500/20",    line: "bg-blue-500/20" },
  contract_renewed:    { icon: "text-blue-500 bg-blue-500/10",       ring: "ring-blue-500/20",    line: "bg-blue-500/20" },
  contract_expired:    { icon: "text-red-500 bg-red-500/10",         ring: "ring-red-500/20",     line: "bg-red-500/20" },
  maintenance_created: { icon: "text-amber-500 bg-amber-500/10",     ring: "ring-amber-500/20",   line: "bg-amber-500/20" },
  maintenance_resolved:{ icon: "text-emerald-500 bg-emerald-500/10", ring: "ring-emerald-500/20", line: "bg-emerald-500/20" },
  maintenance_urgent:  { icon: "text-red-500 bg-red-500/10",         ring: "ring-red-500/20",     line: "bg-red-500/20" },
  tenant_added:        { icon: "text-violet-500 bg-violet-500/10",   ring: "ring-violet-500/20",  line: "bg-violet-500/20" },
  tenant_updated:      { icon: "text-violet-500 bg-violet-500/10",   ring: "ring-violet-500/20",  line: "bg-violet-500/20" },
  property_added:      { icon: "text-indigo-500 bg-indigo-500/10",   ring: "ring-indigo-500/20",  line: "bg-indigo-500/20" },
  property_updated:    { icon: "text-indigo-500 bg-indigo-500/10",   ring: "ring-indigo-500/20",  line: "bg-indigo-500/20" },
  system_update:       { icon: "text-purple-500 bg-purple-500/10",   ring: "ring-purple-500/20",  line: "bg-purple-500/20" },
  system_backup:       { icon: "text-purple-500 bg-purple-500/10",   ring: "ring-purple-500/20",  line: "bg-purple-500/20" },
};

const CATEGORY_LABEL: Record<ActivityCategory, string> = {
  payment:     "Pagos",
  contract:    "Contratos",
  maintenance: "Mantenimiento",
  system:      "Sistema",
  property:    "Propiedades",
  tenant:      "Inquilinos",
};

const CATEGORY_PILL: Record<ActivityCategory, string> = {
  payment:     "bg-emerald-500/10 text-emerald-600",
  contract:    "bg-blue-500/10 text-blue-600",
  maintenance: "bg-amber-500/10 text-amber-600",
  system:      "bg-purple-500/10 text-purple-600",
  property:    "bg-indigo-500/10 text-indigo-600",
  tenant:      "bg-violet-500/10 text-violet-600",
};

/* ─── Filter tabs ────────────────────────────────────────────────── */

const FILTERS: { id: ActivityFilter; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: "all",         label: "Todos",          icon: Activity },
  { id: "payment",     label: "Pagos",          icon: CreditCard },
  { id: "contract",    label: "Contratos",      icon: FileText },
  { id: "maintenance", label: "Mantenimiento",  icon: Wrench },
  { id: "property",    label: "Propiedades",    icon: Home },
  { id: "tenant",      label: "Inquilinos",     icon: Users },
  { id: "system",      label: "Sistema",        icon: Zap },
];

/* ─── Metadata chips ─────────────────────────────────────────────── */

function formatARS(n: number): string {
  return `$${new Intl.NumberFormat("es-AR").format(n)}`;
}

function MetadataChips({ event }: { event: ActivityEvent }) {
  const { metadata } = event;
  if (!metadata) return null;

  return (
    <div className="mt-2 flex flex-wrap gap-1.5">
      {metadata.amount !== undefined && (
        <span className="inline-flex items-center gap-1 rounded-md bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-600">
          <TrendingUp className="h-2.5 w-2.5" />
          {formatARS(metadata.amount)} ARS
        </span>
      )}
      {metadata.propertyName && (
        <span className="inline-flex items-center gap-1 rounded-md bg-indigo-500/10 px-1.5 py-0.5 text-[10px] font-medium text-indigo-600">
          <Home className="h-2.5 w-2.5" />
          {metadata.propertyName}
        </span>
      )}
      {metadata.tenantName && (
        <span className="inline-flex items-center gap-1 rounded-md bg-violet-500/10 px-1.5 py-0.5 text-[10px] font-medium text-violet-600">
          <Users className="h-2.5 w-2.5" />
          {metadata.tenantName}
        </span>
      )}
      {metadata.period && (
        <span className="rounded-md bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
          {metadata.period}
        </span>
      )}
      {metadata.daysUntilExpiry !== undefined && (
        <span className="inline-flex items-center gap-1 rounded-md bg-amber-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-amber-600">
          <Clock className="h-2.5 w-2.5" />
          Vence en {metadata.daysUntilExpiry} días
        </span>
      )}
      {metadata.daysOverdue !== undefined && (
        <span className="inline-flex items-center gap-1 rounded-md bg-red-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-red-600">
          <AlertCircle className="h-2.5 w-2.5" />
          {metadata.daysOverdue} días de atraso
        </span>
      )}
      {metadata.note && (
        <span className="rounded-md bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
          {metadata.note}
        </span>
      )}
    </div>
  );
}

/* ─── Activity item ──────────────────────────────────────────────── */

function ActivityItem({ event, isLast }: { event: ActivityEvent; isLast: boolean }) {
  const Icon = EVENT_ICON[event.type];
  const colors = EVENT_COLORS[event.type];

  return (
    <div className="relative flex gap-5">
      {/* Timeline track */}
      <div className="flex flex-col items-center">
        <div
          className={cn(
            "flex h-9 w-9 shrink-0 items-center justify-center rounded-full ring-4 ring-background",
            colors.icon
          )}
        >
          <Icon className="h-4 w-4" />
        </div>
        {!isLast && <div className={cn("mt-1 w-px flex-1", colors.line, "min-h-[24px]")} />}
      </div>

      {/* Content card */}
      <div className={cn("flex-1 pb-6", isLast && "pb-2")}>
        <div className="group rounded-xl border border-border/50 bg-card p-4 transition-all duration-150 hover:border-border hover:shadow-sm">
          <div className="flex items-start justify-between gap-3">
            {/* Left: content */}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 mb-0.5">
                <span className={cn("rounded-md px-1.5 py-0.5 text-[10px] font-semibold", CATEGORY_PILL[event.category])}>
                  {CATEGORY_LABEL[event.category]}
                </span>
              </div>
              <p className="text-sm font-semibold text-foreground leading-snug">
                {event.title}
              </p>
              <p className="mt-0.5 text-[13px] text-muted-foreground leading-relaxed">
                {event.description}
              </p>
              <MetadataChips event={event} />

              {/* Actor */}
              {event.actor && (
                <div className="mt-3 flex items-center gap-2">
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/15 text-[9px] font-bold text-primary">
                    {event.actor.initials}
                  </div>
                  <span className="text-[11px] text-muted-foreground">
                    {event.actor.name}
                    <span className="mx-1 text-muted-foreground/40">·</span>
                    {event.actor.role}
                  </span>
                </div>
              )}
              {!event.actor && (
                <div className="mt-3 flex items-center gap-2">
                  <Zap className="h-3 w-3 text-muted-foreground/40" />
                  <span className="text-[11px] text-muted-foreground/60">Generado automáticamente</span>
                </div>
              )}
            </div>

            {/* Right: time */}
            <time
              className="shrink-0 text-[11px] text-muted-foreground/60 whitespace-nowrap"
              title={formatFullDate(event.createdAt)}
            >
              {timeAgo(event.createdAt)}
            </time>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Page ───────────────────────────────────────────────────────── */

export default function ActividadPage() {
  const { grouped, filter, setFilter, totalCount, todayCount } = useActivity();

  return (
    <div className="space-y-6">
      {/* ─── Header ──────────────────────────────────────────────── */}
      <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Actividad global
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Seguí todo lo que pasa en tu cartera en tiempo real.
          </p>
        </div>

        {/* Stats chips */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 rounded-lg border border-border bg-muted/30 px-3 py-1.5">
            <Activity className="h-3.5 w-3.5 text-primary" />
            <span className="text-xs font-semibold text-foreground">{totalCount}</span>
            <span className="text-xs text-muted-foreground">eventos</span>
          </div>
          <div className="flex items-center gap-1.5 rounded-lg border border-border bg-muted/30 px-3 py-1.5">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
            <span className="text-xs font-semibold text-foreground">{todayCount}</span>
            <span className="text-xs text-muted-foreground">hoy</span>
          </div>
        </div>
      </div>

      {/* ─── Filter tabs ─────────────────────────────────────────── */}
      <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none">
        {FILTERS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => setFilter(id)}
            className={cn(
              "flex shrink-0 items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-all duration-150",
              filter === id
                ? "border-primary/30 bg-primary/10 text-primary"
                : "border-border bg-background text-muted-foreground hover:border-border/80 hover:bg-accent hover:text-foreground"
            )}
          >
            <Icon className="h-3.5 w-3.5" />
            {label}
          </button>
        ))}
      </div>

      {/* ─── Timeline ────────────────────────────────────────────── */}
      {grouped.length === 0 ? (
        <div className="flex flex-col items-center gap-4 py-20 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-border bg-muted/40">
            <Activity className="h-6 w-6 text-muted-foreground/40" />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-foreground">Sin eventos</p>
            <p className="text-xs text-muted-foreground">
              No hay actividad registrada para este filtro.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          {grouped.map((group, groupIdx) => (
            <motion.div
              key={group.dateKey}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: groupIdx * 0.05 }}
            >
              {/* Date group header */}
              <div className="mb-5 flex items-center gap-3">
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-foreground">{group.label}</span>
                  {group.label !== "Hoy" && group.label !== "Ayer" && (
                    <span className="text-[11px] text-muted-foreground">{group.fullDate}</span>
                  )}
                </div>
                <div className="h-px flex-1 bg-border/50" />
                <span className="shrink-0 rounded-md bg-muted/50 px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                  {group.items.length} evento{group.items.length !== 1 ? "s" : ""}
                </span>
              </div>

              {/* Events */}
              <div>
                {group.items.map((event, idx) => (
                  <ActivityItem
                    key={event.id}
                    event={event}
                    isLast={idx === group.items.length - 1}
                  />
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
