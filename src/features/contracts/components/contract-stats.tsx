"use client";

import { FileText, Clock, AlertCircle, RefreshCw } from "lucide-react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { ContractStats } from "@/types/contract";

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
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-5 w-12" />
        </div>
      </CardContent>
    </Card>
  );
}

interface ContractStatsBarProps {
  stats?: ContractStats;
  isLoading?: boolean;
}

export function ContractStatsBar({ stats, isLoading }: ContractStatsBarProps) {
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
        label="Contratos Activos"
        value={stats.active}
        sub={`${stats.total} en total`}
        icon={FileText}
        iconClass="bg-primary/10 text-primary"
        index={0}
      />
      <StatCard
        label="Próximos a Vencer"
        value={stats.expiringSoon}
        sub="en los próximos 90 días"
        icon={Clock}
        iconClass={stats.expiringSoon > 0 ? "bg-warning/10 text-warning" : "bg-muted text-muted-foreground"}
        index={1}
      />
      <StatCard
        label="Vencidos / Rescindidos"
        value={stats.expired}
        sub="requieren atención"
        icon={AlertCircle}
        iconClass={stats.expired > 0 ? "bg-destructive/10 text-destructive" : "bg-muted text-muted-foreground"}
        index={2}
      />
      <StatCard
        label="Renovaciones este Mes"
        value={stats.renewalsThisMonth}
        sub={stats.renewalsThisMonth > 0 ? "pendientes de acción" : "sin vencimientos"}
        icon={RefreshCw}
        iconClass="bg-emerald-500/10 text-emerald-500"
        index={3}
      />
    </div>
  );
}
