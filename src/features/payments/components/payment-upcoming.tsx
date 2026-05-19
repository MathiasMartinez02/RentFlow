"use client";

import { AlertTriangle, Clock, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { formatCurrency, formatDate, getInitials } from "@/shared/utils/format";
import { MOCK_TENANTS } from "@/mock/tenants";
import { MOCK_PROPERTIES } from "@/mock/properties";
import type { Payment } from "@/types/payment";

function getDaysOverdue(dueDate: string): number {
  return Math.floor((Date.now() - new Date(dueDate).getTime()) / 86400000);
}

function getDaysUntilDue(dueDate: string): number {
  return Math.ceil((new Date(dueDate).getTime() - Date.now()) / 86400000);
}

interface UpcomingItemProps {
  payment: Payment;
  onView: (id: string) => void;
  index: number;
}

function UpcomingItem({ payment, onView, index }: UpcomingItemProps) {
  const tenant = MOCK_TENANTS.find((t) => t.id === payment.tenantId);
  const property = MOCK_PROPERTIES.find((p) => p.id === payment.propertyId);
  const isOverdue = payment.status === "overdue";
  const daysOverdue = isOverdue ? getDaysOverdue(payment.dueDate) : null;
  const daysUntil = !isOverdue ? getDaysUntilDue(payment.dueDate) : null;
  const isUrgent = !isOverdue && daysUntil !== null && daysUntil <= 2;

  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.2, delay: index * 0.06 }}
    >
      <button
        onClick={() => onView(payment.id)}
        className={cn(
          "group flex w-full items-center gap-3 rounded-lg p-2.5 text-left transition-colors hover:bg-accent/60",
          isOverdue && "bg-destructive/5 hover:bg-destructive/10",
          isUrgent && "bg-warning/5 hover:bg-warning/10"
        )}
      >
        <div
          className={cn(
            "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[10px] font-bold",
            isOverdue ? "bg-destructive/15 text-destructive" : isUrgent ? "bg-warning/15 text-warning" : "bg-primary/10 text-primary"
          )}
        >
          {tenant ? getInitials(tenant.firstName, tenant.lastName) : "?"}
        </div>

        <div className="min-w-0 flex-1">
          <p className="truncate text-xs font-medium text-foreground">
            {tenant ? `${tenant.firstName} ${tenant.lastName}` : "Inquilino desconocido"}
          </p>
          <p className="truncate text-[11px] text-muted-foreground">
            {property?.name ?? payment.propertyId}
          </p>
        </div>

        <div className="flex flex-col items-end gap-0.5 shrink-0">
          <span className="text-xs font-semibold text-foreground">
            {formatCurrency(payment.amount)}
          </span>
          {isOverdue && daysOverdue !== null ? (
            <div className="flex items-center gap-1">
              <AlertTriangle className="h-2.5 w-2.5 text-destructive" />
              <span className="text-[10px] font-medium text-destructive">{daysOverdue}d mora</span>
            </div>
          ) : daysUntil !== null ? (
            <div className="flex items-center gap-1">
              <Clock className="h-2.5 w-2.5 text-muted-foreground" />
              <span className={cn("text-[10px]", isUrgent ? "font-medium text-warning" : "text-muted-foreground")}>
                {daysUntil === 0 ? "hoy" : daysUntil === 1 ? "mañana" : `en ${daysUntil}d`}
              </span>
            </div>
          ) : null}
        </div>
      </button>
    </motion.div>
  );
}

interface PaymentUpcomingProps {
  payments: Payment[];
  isLoading?: boolean;
  onView: (id: string) => void;
  onViewAll: () => void;
}

export function PaymentUpcoming({ payments, isLoading, onView, onViewAll }: PaymentUpcomingProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-3 w-48" />
        </CardHeader>
        <CardContent className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 rounded-lg p-2.5">
              <Skeleton className="h-7 w-7 rounded-full" />
              <div className="flex-1 space-y-1">
                <Skeleton className="h-3 w-28" />
                <Skeleton className="h-2.5 w-20" />
              </div>
              <Skeleton className="h-3 w-14" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  const overduePayments = payments
    .filter((p) => p.status === "overdue")
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());

  const pendingPayments = payments
    .filter((p) => p.status === "pending")
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());

  const items = [...overduePayments, ...pendingPayments].slice(0, 5);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.3 }}
    >
      <Card className="h-full">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Pagos Urgentes</CardTitle>
              <CardDescription className="mt-0.5">Vencidos y próximos a vencer</CardDescription>
            </div>
            {(overduePayments.length > 0 || pendingPayments.length > 0) && (
              <div className="flex items-center gap-1.5">
                {overduePayments.length > 0 && (
                  <Badge variant="destructive" className="text-[10px]">
                    {overduePayments.length} vencido{overduePayments.length !== 1 ? "s" : ""}
                  </Badge>
                )}
                {pendingPayments.length > 0 && (
                  <Badge variant="warning" className="text-[10px]">
                    {pendingPayments.length} pendiente{pendingPayments.length !== 1 ? "s" : ""}
                  </Badge>
                )}
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {items.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-8 text-center">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-success/10">
                <Clock className="h-5 w-5 text-success" />
              </div>
              <p className="text-sm font-medium text-foreground">Todo al día</p>
              <p className="text-xs text-muted-foreground">No hay pagos urgentes en este momento.</p>
            </div>
          ) : (
            <div className="space-y-1">
              {items.map((payment, index) => (
                <UpcomingItem key={payment.id} payment={payment} onView={onView} index={index} />
              ))}
            </div>
          )}

          {(overduePayments.length + pendingPayments.length > 5) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onViewAll}
              className="mt-2 h-7 w-full gap-1 text-xs text-muted-foreground hover:text-foreground"
            >
              Ver todos
              <ArrowRight className="h-3 w-3" />
            </Button>
          )}

          {items.length > 0 && (
            <div className="mt-3 rounded-lg bg-muted/40 p-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Total en riesgo</span>
                <span className="font-semibold text-foreground">
                  {formatCurrency(
                    [...overduePayments, ...pendingPayments].reduce((s, p) => s + p.amount, 0)
                  )}
                </span>
              </div>
              <div className="mt-1 flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Fecha más antigua</span>
                <span className="font-medium text-destructive">
                  {overduePayments.length > 0
                    ? formatDate(overduePayments[0].dueDate, "short")
                    : "—"}
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
