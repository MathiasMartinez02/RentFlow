import { api } from "@/lib/api-client";
import type { Payment, PaymentFilters, PaymentStatus, PaymentMethod } from "@/types/payment";
import type { ApiResponse } from "@/types";

// ─── Enum mappers ────────────────────────────────────────────────────────────

const PAYMENT_STATUS_TO_BACKEND: Record<string, string> = {
  paid: "PAGADO",
  pending: "PENDIENTE",
  overdue: "VENCIDO",
  partial: "PARCIAL",
  cancelled: "CANCELADO",
};

const PAYMENT_STATUS_FROM_BACKEND: Record<string, PaymentStatus> = {
  PAGADO: "paid",
  PENDIENTE: "pending",
  VENCIDO: "overdue",
  PARCIAL: "partial",
  CANCELADO: "cancelled",
};

const PAYMENT_METHOD_TO_BACKEND: Record<string, string> = {
  transfer: "TRANSFERENCIA",
  cash: "EFECTIVO",
  card: "TARJETA",
  auto_debit: "DEBITO_AUTOMATICO",
};

const PAYMENT_METHOD_FROM_BACKEND: Record<string, PaymentMethod> = {
  TRANSFERENCIA: "transfer",
  EFECTIVO: "cash",
  TARJETA: "card",
  DEBITO_AUTOMATICO: "auto_debit",
};

// ─── Backend DTO shape ───────────────────────────────────────────────────────

interface BackendPayment {
  id: string;
  contractId: string;
  tenantId: string;
  propertyId: string;
  periodo: string;
  concepto?: string;
  monto: number;
  totalPagado?: number;
  fechaVencimiento: string;
  fechaPago?: string;
  estado: string;
  metodoPago?: string;
  referenciaPago?: string;
  mora?: number;
  observaciones?: string;
  createdAt: string;
}

interface BackendPaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ─── Mapper ──────────────────────────────────────────────────────────────────

function fromBackend(raw: BackendPayment): Payment {
  return {
    id: raw.id,
    contractId: raw.contractId,
    tenantId: raw.tenantId,
    propertyId: raw.propertyId,
    period: raw.periodo,
    concept: raw.concepto ?? raw.periodo,
    amount: Number(raw.monto),
    paidAmount: raw.totalPagado != null ? Number(raw.totalPagado) : undefined,
    dueDate: raw.fechaVencimiento,
    paidDate: raw.fechaPago,
    status: PAYMENT_STATUS_FROM_BACKEND[raw.estado] ?? "pending",
    method: raw.metodoPago ? PAYMENT_METHOD_FROM_BACKEND[raw.metodoPago] : undefined,
    reference: raw.referenciaPago,
    lateFee: raw.mora,
    notes: raw.observaciones,
    createdAt: raw.createdAt,
  };
}

function buildQuery(filters?: PaymentFilters): string {
  const params = new URLSearchParams();
  if (filters?.search) params.set("search", filters.search);
  if (filters?.status && filters.status !== "all") {
    params.set("estado", PAYMENT_STATUS_TO_BACKEND[filters.status] ?? filters.status);
  }
  if (filters?.tenantId) params.set("tenantId", filters.tenantId);
  if (filters?.period) params.set("search", filters.period);
  params.set("limit", "100");
  params.set("sortBy", "fechaVencimiento");
  params.set("sortOrder", "desc");
  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

// ─── Service ──────────────────────────────────────────────────────────────────

export const paymentsService = {
  async getAll(filters?: PaymentFilters): Promise<ApiResponse<Payment[]>> {
    const qs = buildQuery(filters);
    const res = await api.get<BackendPaginatedResponse<BackendPayment>>(`/payments${qs}`);
    const items = (res.items ?? []).map(fromBackend);
    // Sort client-side: overdue → pending → partial → paid → cancelled
    const order: Record<string, number> = { overdue: 0, pending: 1, partial: 2, paid: 3, cancelled: 4 };
    items.sort((a, b) => {
      const ao = order[a.status] ?? 5;
      const bo = order[b.status] ?? 5;
      if (ao !== bo) return ao - bo;
      return new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime();
    });
    return { data: items, total: res.total ?? items.length };
  },

  async getById(id: string): Promise<Payment | null> {
    try {
      const raw = await api.get<BackendPayment>(`/payments/${id}`);
      return fromBackend(raw);
    } catch {
      return null;
    }
  },

  async create(payload: Omit<Payment, "id" | "createdAt">): Promise<Payment> {
    const body = {
      contractId: payload.contractId,
      periodo: payload.period,
      fechaVencimiento: payload.dueDate,
      monto: payload.amount,
      mora: payload.lateFee,
      totalPagado: payload.paidAmount,
      metodoPago: payload.method ? PAYMENT_METHOD_TO_BACKEND[payload.method] : undefined,
      referenciaPago: payload.reference,
      estado: payload.status ? PAYMENT_STATUS_TO_BACKEND[payload.status] : "PENDIENTE",
      observaciones: payload.notes,
      ...(payload.paidDate ? { fechaPago: payload.paidDate } : {}),
    };
    const raw = await api.post<BackendPayment>("/payments", body);
    return fromBackend(raw);
  },

  // Maps to PATCH /payments/:id/pay for registering payment details.
  async update(id: string, payload: Partial<Payment>): Promise<Payment> {
    const body: Record<string, unknown> = {};
    if (payload.method) body.metodoPago = PAYMENT_METHOD_TO_BACKEND[payload.method];
    if (payload.paidAmount !== undefined) body.totalPagado = payload.paidAmount;
    if (payload.lateFee !== undefined) body.mora = payload.lateFee;
    if (payload.reference) body.referenciaPago = payload.reference;
    if (payload.paidDate) body.fechaPago = payload.paidDate;
    if (payload.notes) body.observaciones = payload.notes;

    const raw = await api.patch<BackendPayment>(`/payments/${id}`, body);
    return fromBackend(raw);
  },

  async markOverdue(id: string): Promise<Payment> {
    const raw = await api.patch<BackendPayment>(`/payments/${id}/overdue`);
    return fromBackend(raw);
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/payments/${id}`);
  },

  async getStats() {
    return api.get<Record<string, unknown>>("/payments/stats/overview");
  },
};
