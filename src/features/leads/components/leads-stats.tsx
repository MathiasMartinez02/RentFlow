"use client";

import { motion } from "framer-motion";
import { Users, Sparkles, Handshake, Trophy, TrendingUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatPercent } from "@/shared/utils/format";
import type { LeadStats } from "@/types/lead";

interface StatCardProps {
  icon: React.ElementType;
  label: string;
  value: string | number;
  sub?: string;
  highlight?: boolean;
  index: number;
}

// Tarjeta individual de métrica del pipeline de leads
function StatCard({ icon: Icon, label, value, sub, highlight, index }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
    >
      <Card className={highlight ? "border-success/40 bg-success/5" : ""}>
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <p className="text-xs text-muted-foreground truncate">{label}</p>
              <p className={`mt-1 text-2xl font-bold leading-none ${highlight ? "text-success" : "text-foreground"}`}>
                {value}
              </p>
              {sub && <p className="mt-1 text-[11px] text-muted-foreground/70">{sub}</p>}
            </div>
            <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${highlight ? "bg-success/10" : "bg-muted"}`}>
              <Icon className={`h-4 w-4 ${highlight ? "text-success" : "text-muted-foreground"}`} />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

interface LeadsStatsBarProps {
  stats: LeadStats;
  isLoading?: boolean;
}

// Barra de métricas del CRM de leads (total, nuevos, negociación, ganados, conversión)
export function LeadsStatsBar({ stats, isLoading }: LeadsStatsBarProps) {
  if (isLoading) {
    return (
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-4 space-y-2">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-7 w-12" />
              <Skeleton className="h-2.5 w-16" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const items: StatCardProps[] = [
    { icon: Users, label: "Total de Leads", value: stats.total, sub: "en el pipeline", index: 0 },
    { icon: Sparkles, label: "Nuevos", value: stats.byStatus.NUEVO, sub: "sin contactar", index: 1 },
    { icon: Handshake, label: "En Negociación", value: stats.byStatus.NEGOCIACION, sub: "cierres en curso", index: 2 },
    { icon: Trophy, label: "Ganados", value: stats.won, sub: `${stats.lost} perdidos`, highlight: stats.won > 0, index: 3 },
    { icon: TrendingUp, label: "Tasa de Conversión", value: formatPercent(stats.conversionRate), sub: "ganados / cerrados", index: 4 },
  ];

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
      {items.map((item) => (
        <StatCard key={item.label} {...item} />
      ))}
    </div>
  );
}
