"use client";

import { useState, useEffect, useCallback } from "react";
import { paymentsService } from "@/services/payments.service";
import { useUIStore } from "@/store";
import type { Payment, PaymentFilters, PaymentStats, MonthlyRevenue } from "@/types/payment";
import type { PaymentFormValues } from "../schemas/payment.schema";

const MONTH_LABELS: Record<string, string> = {
  "01": "Ene", "02": "Feb", "03": "Mar", "04": "Abr",
  "05": "May", "06": "Jun", "07": "Jul", "08": "Ago",
  "09": "Sep", "10": "Oct", "11": "Nov", "12": "Dic",
};

function getCurrentPeriod(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

function getPrevPeriod(): string {
  const now = new Date(new Date().getFullYear(), new Date().getMonth() - 1);
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

export function computePaymentStats(payments: Payment[]): PaymentStats {
  const currentPeriod = getCurrentPeriod();
  const prevPeriod = getPrevPeriod();

  const thisMonth = payments.filter((p) => p.period === currentPeriod);
  const prevMonth = payments.filter((p) => p.period === prevPeriod);

  const collectedThisMonth = thisMonth
    .filter((p) => p.status === "paid" || p.status === "partial")
    .reduce((sum, p) => sum + (p.paidAmount ?? (p.status === "paid" ? p.amount : 0)), 0);

  const pendingAmount = thisMonth
    .filter((p) => p.status === "pending")
    .reduce((sum, p) => sum + p.amount, 0);

  const overdueAmount = thisMonth
    .filter((p) => p.status === "overdue")
    .reduce((sum, p) => sum + p.amount, 0);

  const totalExpected = thisMonth.reduce((sum, p) => sum + p.amount, 0);
  const collectionRate = totalExpected > 0 ? (collectedThisMonth / totalExpected) * 100 : 0;

  const prevMonthCollected = prevMonth
    .filter((p) => p.status === "paid" || p.status === "partial")
    .reduce((sum, p) => sum + (p.paidAmount ?? (p.status === "paid" ? p.amount : 0)), 0);

  return {
    collectedThisMonth,
    pendingAmount,
    overdueAmount,
    collectionRate,
    pendingCount: thisMonth.filter((p) => p.status === "pending").length,
    overdueCount: thisMonth.filter((p) => p.status === "overdue").length,
    prevMonthCollected,
    totalExpected,
  };
}

export function computeMonthlyRevenue(payments: Payment[]): MonthlyRevenue[] {
  const periods = Array.from(new Set(payments.map((p) => p.period))).sort();

  return periods.map((period) => {
    const [year, month] = period.split("-");
    const periodPayments = payments.filter((p) => p.period === period);

    const collected = periodPayments
      .filter((p) => p.status === "paid" || p.status === "partial")
      .reduce((sum, p) => sum + (p.paidAmount ?? (p.status === "paid" ? p.amount : 0)), 0);

    const pending = periodPayments
      .filter((p) => p.status === "pending")
      .reduce((sum, p) => sum + p.amount, 0);

    const overdue = periodPayments
      .filter((p) => p.status === "overdue")
      .reduce((sum, p) => sum + p.amount, 0);

    const expected = periodPayments.reduce((sum, p) => sum + p.amount, 0);

    return {
      period,
      label: `${MONTH_LABELS[month] ?? month} ${year}`,
      collected,
      pending,
      overdue,
      expected,
    };
  });
}

interface UsePaymentsReturn {
  payments: Payment[];
  stats: PaymentStats;
  monthlyRevenue: MonthlyRevenue[];
  isLoading: boolean;
  isMutating: boolean;
  error: Error | null;
  refetch: () => void;
  createPayment: (data: PaymentFormValues) => Promise<void>;
  updatePayment: (id: string, data: PaymentFormValues) => Promise<void>;
  deletePayment: (id: string) => Promise<void>;
}

export function usePayments(filters?: PaymentFilters): UsePaymentsReturn {
  const [allPayments, setAllPayments] = useState<Payment[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isMutating, setIsMutating] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const { closePaymentForm, closePaymentDrawer } = useUIStore();

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [all, filtered] = await Promise.all([
        paymentsService.getAll(),
        paymentsService.getAll(filters),
      ]);
      setAllPayments(all.data);
      setPayments(filtered.data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Error al cargar los pagos"));
    } finally {
      setIsLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters?.search, filters?.status, filters?.period, filters?.tenantId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const createPayment = async (data: PaymentFormValues) => {
    setIsMutating(true);
    try {
      const newPayment = await paymentsService.create({
        contractId: data.contractId,
        tenantId: data.tenantId,
        propertyId: data.propertyId,
        period: data.period,
        concept: data.concept,
        amount: Number(data.amount),
        paidAmount: data.paidAmount !== "" ? Number(data.paidAmount) : undefined,
        dueDate: data.dueDate,
        paidDate: data.paidDate || undefined,
        status: data.status,
        method: data.method || undefined,
        reference: data.reference || undefined,
        notes: data.notes || undefined,
      });
      setPayments((prev) => [newPayment, ...prev]);
      setAllPayments((prev) => [newPayment, ...prev]);
      closePaymentForm();
    } finally {
      setIsMutating(false);
    }
  };

  const updatePayment = async (id: string, data: PaymentFormValues) => {
    setIsMutating(true);
    try {
      const updated = await paymentsService.update(id, {
        contractId: data.contractId,
        tenantId: data.tenantId,
        propertyId: data.propertyId,
        period: data.period,
        concept: data.concept,
        amount: Number(data.amount),
        paidAmount: data.paidAmount !== "" ? Number(data.paidAmount) : undefined,
        dueDate: data.dueDate,
        paidDate: data.paidDate || undefined,
        status: data.status,
        method: data.method || undefined,
        reference: data.reference || undefined,
        notes: data.notes || undefined,
      });
      setPayments((prev) => prev.map((p) => (p.id === id ? updated : p)));
      setAllPayments((prev) => prev.map((p) => (p.id === id ? updated : p)));
      closePaymentForm();
    } finally {
      setIsMutating(false);
    }
  };

  const deletePayment = async (id: string) => {
    setIsMutating(true);
    setPayments((prev) => prev.filter((p) => p.id !== id));
    setAllPayments((prev) => prev.filter((p) => p.id !== id));
    closePaymentDrawer();
    try {
      await paymentsService.delete(id);
    } catch {
      await fetchData();
    } finally {
      setIsMutating(false);
    }
  };

  return {
    payments,
    stats: computePaymentStats(allPayments),
    monthlyRevenue: computeMonthlyRevenue(allPayments),
    isLoading,
    isMutating,
    error,
    refetch: fetchData,
    createPayment,
    updatePayment,
    deletePayment,
  };
}
