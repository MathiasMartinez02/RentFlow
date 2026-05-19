"use client";

import { AlertTriangle, Clock, Eye } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { formatDate, getDaysUntilDate } from "@/shared/utils/format";
import { MOCK_PROPERTIES } from "@/mock/properties";
import { MOCK_TENANTS } from "@/mock/tenants";
import type { Contract } from "@/types/contract";
import { isExpiringSoon, getDaysLeft } from "../hooks/use-contracts";

interface ContractAlertsProps {
  contracts: Contract[];
  onView: (id: string) => void;
}

function getUrgencyConfig(daysLeft: number) {
  if (daysLeft <= 15) {
    return {
      border: "border-destructive/40",
      bg: "bg-destructive/5",
      icon: "text-destructive",
      badge: "bg-destructive/15 text-destructive",
      badgeLabel: "Urgente",
      dotClass: "bg-destructive animate-pulse",
    };
  }
  if (daysLeft <= 30) {
    return {
      border: "border-orange-500/40",
      bg: "bg-orange-500/5",
      icon: "text-orange-500",
      badge: "bg-orange-500/15 text-orange-500",
      badgeLabel: "Crítico",
      dotClass: "bg-orange-500",
    };
  }
  return {
    border: "border-warning/40",
    bg: "bg-warning/5",
    icon: "text-warning",
    badge: "bg-warning/15 text-warning",
    badgeLabel: "Por vencer",
    dotClass: "bg-warning",
  };
}

export function ContractAlerts({ contracts, onView }: ContractAlertsProps) {
  const expiring = contracts
    .filter(isExpiringSoon)
    .sort((a, b) => getDaysLeft(a.endDate) - getDaysLeft(b.endDate));

  if (expiring.length === 0) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.25 }}
        className="rounded-xl border border-warning/30 bg-warning/5 p-4 space-y-3"
      >
        {/* Header */}
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-warning/20">
            <AlertTriangle className="h-3.5 w-3.5 text-warning" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">
              {expiring.length === 1
                ? "1 contrato requiere atención"
                : `${expiring.length} contratos requieren atención`}
            </p>
            <p className="text-xs text-muted-foreground">
              Contratos próximos a vencer en los próximos 90 días
            </p>
          </div>
        </div>

        {/* Alert items */}
        <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
          {expiring.map((contract) => {
            const daysLeft = getDaysLeft(contract.endDate);
            const config = getUrgencyConfig(daysLeft);
            const property = MOCK_PROPERTIES.find((p) => p.id === contract.propertyId);
            const tenant = MOCK_TENANTS.find((t) => t.id === contract.tenantId);

            return (
              <motion.div
                key={contract.id}
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.2 }}
                className={cn(
                  "flex items-start justify-between gap-3 rounded-lg border p-3",
                  config.border,
                  config.bg
                )}
              >
                <div className="flex items-start gap-2.5 min-w-0">
                  <div className="mt-1 flex items-center gap-1.5 shrink-0">
                    <span className={cn("h-1.5 w-1.5 rounded-full", config.dotClass)} />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span
                        className={cn(
                          "inline-flex items-center rounded-md px-1.5 py-0.5 text-[11px] font-semibold",
                          config.badge
                        )}
                      >
                        {daysLeft === 1 ? "1 día" : `${daysLeft} días`}
                      </span>
                    </div>
                    <p className="mt-0.5 text-xs font-medium text-foreground truncate">
                      {property?.name ?? contract.propertyId}
                    </p>
                    {tenant && (
                      <p className="text-[11px] text-muted-foreground">
                        {tenant.firstName} {tenant.lastName}
                      </p>
                    )}
                    <p className="mt-0.5 flex items-center gap-1 text-[11px] text-muted-foreground">
                      <Clock className="h-2.5 w-2.5 shrink-0" />
                      Vence {formatDate(contract.endDate, "long")}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn("h-7 shrink-0 px-2 text-xs", config.icon)}
                  onClick={() => onView(contract.id)}
                >
                  <Eye className="h-3 w-3" />
                </Button>
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

// Re-export for use without the hook import
export { getDaysUntilDate };
