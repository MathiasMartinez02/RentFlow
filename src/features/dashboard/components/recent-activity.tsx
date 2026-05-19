"use client";

import {
  CreditCard,
  FileText,
  Wrench,
  UserPlus,
  Building2,
  AlertTriangle,
} from "lucide-react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate } from "@/shared/utils/format";
import { cn } from "@/lib/utils";
import type { ActivityEvent } from "@/types/dashboard";

const ACTIVITY_ICONS = {
  payment_received: CreditCard,
  contract_signed: FileText,
  maintenance_request: Wrench,
  tenant_added: UserPlus,
  property_added: Building2,
  contract_expiring: AlertTriangle,
};

const ACTIVITY_COLORS = {
  payment_received: "bg-success/10 text-success",
  contract_signed: "bg-primary/10 text-primary",
  maintenance_request: "bg-orange-500/10 text-orange-500",
  tenant_added: "bg-violet-500/10 text-violet-500",
  property_added: "bg-blue-500/10 text-blue-500",
  contract_expiring: "bg-warning/10 text-warning",
};

interface RecentActivityProps {
  events?: ActivityEvent[];
  isLoading?: boolean;
}

export function RecentActivity({ events, isLoading }: RecentActivityProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-40" />
        </CardHeader>
        <CardContent className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-start gap-3">
              <Skeleton className="h-8 w-8 shrink-0 rounded-lg" />
              <div className="flex-1 space-y-1.5">
                <Skeleton className="h-3 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.45 }}
    >
      <Card className="flex flex-col">
        <CardHeader className="pb-3">
          <CardTitle>Actividad Reciente</CardTitle>
          <CardDescription>Últimas novedades de tu cartera</CardDescription>
        </CardHeader>
        <CardContent className="flex-1 space-y-1">
          {events?.map((event, index) => {
            const Icon = ACTIVITY_ICONS[event.type] ?? Building2;
            const colorClass = ACTIVITY_COLORS[event.type] ?? "bg-muted text-muted-foreground";

            return (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.25, delay: 0.45 + index * 0.04 }}
                className="group flex items-start gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-accent/50"
              >
                <div
                  className={cn(
                    "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-transform group-hover:scale-105",
                    colorClass
                  )}
                >
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <p className="truncate text-xs font-medium text-foreground">
                    {event.title}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {event.description}
                  </p>
                </div>
                <time className="shrink-0 text-[11px] text-muted-foreground/70">
                  {formatDate(event.timestamp, "relative")}
                </time>
              </motion.div>
            );
          })}
        </CardContent>
      </Card>
    </motion.div>
  );
}
