import { mockFetch, simulateDelay } from "./base.service";
import { MOCK_PAYMENTS } from "@/mock/payments";
import type { Payment, PaymentFilters } from "@/types/payment";
import type { ApiResponse } from "@/types";

let _payments = [...MOCK_PAYMENTS];

function applyFilters(data: Payment[], filters?: PaymentFilters): Payment[] {
  let result = [...data];

  if (filters?.search) {
    const q = filters.search.toLowerCase();
    result = result.filter(
      (p) =>
        p.concept.toLowerCase().includes(q) ||
        p.tenantId.toLowerCase().includes(q) ||
        p.propertyId.toLowerCase().includes(q) ||
        p.contractId.toLowerCase().includes(q) ||
        (p.reference?.toLowerCase().includes(q) ?? false)
    );
  }

  if (filters?.status && filters.status !== "all") {
    result = result.filter((p) => p.status === filters.status);
  }

  if (filters?.period) {
    result = result.filter((p) => p.period === filters.period);
  }

  if (filters?.tenantId) {
    result = result.filter((p) => p.tenantId === filters.tenantId);
  }

  return result.sort((a, b) => {
    // Overdue first, then pending, then paid, then others
    const order: Record<string, number> = { overdue: 0, pending: 1, partial: 2, paid: 3, cancelled: 4 };
    const ao = order[a.status] ?? 5;
    const bo = order[b.status] ?? 5;
    if (ao !== bo) return ao - bo;
    return new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime();
  });
}

export const paymentsService = {
  async getAll(filters?: PaymentFilters): Promise<ApiResponse<Payment[]>> {
    const data = await mockFetch(_payments);
    const filtered = applyFilters(data, filters);
    return { data: filtered, total: filtered.length };
  },

  async getById(id: string): Promise<Payment | null> {
    await simulateDelay(300);
    return _payments.find((p) => p.id === id) ?? null;
  },

  async create(payload: Omit<Payment, "id" | "createdAt">): Promise<Payment> {
    await simulateDelay(700);
    const newPayment: Payment = {
      ...payload,
      id: `pay-${String(Date.now()).slice(-6)}`,
      createdAt: new Date().toISOString(),
    };
    _payments = [newPayment, ..._payments];
    return newPayment;
  },

  async update(id: string, payload: Partial<Payment>): Promise<Payment> {
    await simulateDelay(600);
    const idx = _payments.findIndex((p) => p.id === id);
    if (idx === -1) throw new Error(`Payment ${id} not found`);
    _payments[idx] = { ..._payments[idx], ...payload };
    return _payments[idx];
  },

  async delete(id: string): Promise<void> {
    await simulateDelay(500);
    _payments = _payments.filter((p) => p.id !== id);
  },
};
