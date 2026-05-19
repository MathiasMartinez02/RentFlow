export type PaymentStatus = "paid" | "pending" | "overdue" | "partial";
export type PaymentMethod = "transfer" | "cash" | "card" | "check";

export interface Payment {
  id: string;
  tenantId: string;
  propertyId: string;
  contractId: string;
  amount: number;
  dueDate: string;
  paidDate?: string;
  status: PaymentStatus;
  method?: PaymentMethod;
  concept: string;
  notes?: string;
  createdAt: string;
}

export interface PaymentSummary {
  totalCollected: number;
  totalPending: number;
  totalOverdue: number;
  collectionRate: number;
}
