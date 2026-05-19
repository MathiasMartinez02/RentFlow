export type PaymentStatus = "paid" | "pending" | "overdue" | "partial" | "cancelled";
export type PaymentMethod = "transfer" | "cash" | "card" | "auto_debit";

export interface Payment {
  id: string;
  contractId: string;
  tenantId: string;
  propertyId: string;
  period: string;
  concept: string;
  amount: number;
  paidAmount?: number;
  dueDate: string;
  paidDate?: string;
  status: PaymentStatus;
  method?: PaymentMethod;
  reference?: string;
  lateFee?: number;
  notes?: string;
  createdAt: string;
}

export interface PaymentFilters {
  search?: string;
  status?: PaymentStatus | "all";
  period?: string;
  tenantId?: string;
}

export interface PaymentStats {
  collectedThisMonth: number;
  pendingAmount: number;
  overdueAmount: number;
  collectionRate: number;
  pendingCount: number;
  overdueCount: number;
  prevMonthCollected: number;
  totalExpected: number;
}

export interface MonthlyRevenue {
  period: string;
  label: string;
  collected: number;
  pending: number;
  overdue: number;
  expected: number;
}

// Legacy — kept for backward compat with tenant-drawer
export type PaymentRecordStatus = "pagado" | "pendiente" | "atrasado";
export type PaymentRecordMethod = "transferencia" | "efectivo" | "cheque" | "tarjeta";

export interface PaymentRecord {
  id: string;
  tenantId: string;
  propertyId: string;
  month: string;
  amount: number;
  dueDate: string;
  paidDate?: string;
  status: PaymentRecordStatus;
  method?: PaymentRecordMethod;
  notes?: string;
}

export interface PaymentSummary {
  totalCollected: number;
  totalPending: number;
  totalOverdue: number;
  collectionRate: number;
}
