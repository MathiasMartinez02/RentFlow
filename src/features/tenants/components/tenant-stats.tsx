"use client";

import { Users, UserCheck, CheckCircle2, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { TenantStats } from "@/types/tenant";

interface StatCardProps {
  label: string;
  value: string | number;
  sub?: string;
  icon: React.ElementType;
  iconClass: string;
  index: number;
}

function StatCard({ label, value, sub, icon: Icon, iconClass, index }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: index * 0.04 }}
    >
      <Card className="overflow-hidden">
        <CardContent className="flex items-center gap-4 p-4">
          <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-lg", iconClass)}>
            <Icon style={{ width: 18, height: 18 }} />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-medium text-muted-foreground">{label}</p>
            <p className="mt-0.5 text-xl font-bold text-foreground leading-none">{value}</p>
            {sub && <p className="mt-0.5 text-xs text-muted-foreground">{sub}</p>}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function StatCardSkeleton() {
  return (
    <Card>
      <CardContent className="flex items-center gap-4 p-4">
        <Skeleton className="h-10 w-10 shrink-0 rounded-lg" />
        <div className="space-y-1.5 flex-1">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-5 w-16" />
        </div>
      </CardContent>
    </Card>
  );
}

interface TenantStatsBarProps {
  stats?: TenantStats;
  isLoading?: boolean;
}

export function TenantStatsBar({ stats, isLoading }: TenantStatsBarProps) {
  if (isLoading || !stats) {
    return (
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)}
      </div>
    );
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard
        label="Total Inquilinos"
        value={stats.total}
        sub={`${stats.inactive} inactivos`}
        icon={Users}
        iconClass="bg-primary/10 text-primary"
        index={0}
      />
      <StatCard
        label="Contratos Activos"
        value={stats.active}
        sub={`${Math.round((stats.active / (stats.total || 1)) * 100)}% del total`}
        icon={UserCheck}
        iconClass="bg-success/10 text-success"
        index={1}
      />
      <StatCard
        label="Pagos al Día"
        value={stats.alDia}
        sub="sin deuda pendiente"
        icon={CheckCircle2}
        iconClass="bg-emerald-500/10 text-emerald-500"
        index={2}
      />
      <StatCard
        label="Con Atrasos"
        value={stats.atrasados}
        sub={stats.atrasados > 0 ? "requieren seguimiento" : "sin atrasos"}
        icon={AlertCircle}
        iconClass={stats.atrasados > 0 ? "bg-destructive/10 text-destructive" : "bg-muted text-muted-foreground"}
        index={3}
      />
    </div>
  );
}
