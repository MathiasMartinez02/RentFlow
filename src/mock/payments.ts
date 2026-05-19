import type { Payment, PaymentRecord } from "@/types/payment";

// ─── MOCK_PAYMENTS ───────────────────────────────────────────────────────────
// 30 registros · 5 contratos activos · 6 meses (Dic 2025 → May 2026)
// Hoy = 2026-05-19 · Todos los montos en ARS
// ten-001 $850.000 · ten-002 $520.000 · ten-003 $720.000 · ten-004 $950.000 · ten-005 $1.550.000

export const MOCK_PAYMENTS: Payment[] = [
  // ─── Diciembre 2025 ─────────────────────────────────────────────────────
  {
    id: "pay-001", contractId: "con-001", tenantId: "ten-001", propertyId: "prop-001",
    period: "2025-12", concept: "Alquiler Diciembre 2025",
    amount: 850000, dueDate: "2025-12-05", paidDate: "2025-12-04",
    status: "paid", method: "transfer", reference: "TRF-251204-001",
    createdAt: "2025-11-28T10:00:00Z",
  },
  {
    id: "pay-002", contractId: "con-002", tenantId: "ten-002", propertyId: "prop-002",
    period: "2025-12", concept: "Alquiler Diciembre 2025",
    amount: 520000, dueDate: "2025-12-05", paidDate: "2025-12-09",
    status: "paid", method: "cash",
    notes: "Pago con 4 días de demora",
    createdAt: "2025-11-28T10:00:00Z",
  },
  {
    id: "pay-003", contractId: "con-003", tenantId: "ten-003", propertyId: "prop-003",
    period: "2025-12", concept: "Alquiler Diciembre 2025",
    amount: 720000, dueDate: "2025-12-01", paidDate: "2025-12-01",
    status: "paid", method: "transfer", reference: "TRF-251201-003",
    createdAt: "2025-11-25T10:00:00Z",
  },
  {
    id: "pay-004", contractId: "con-004", tenantId: "ten-004", propertyId: "prop-005",
    period: "2025-12", concept: "Alquiler Diciembre 2025",
    amount: 950000, dueDate: "2025-12-05", paidDate: "2025-12-05",
    status: "paid", method: "transfer", reference: "TRF-251205-004",
    createdAt: "2025-11-28T10:00:00Z",
  },
  {
    id: "pay-005", contractId: "con-005", tenantId: "ten-005", propertyId: "prop-008",
    period: "2025-12", concept: "Alquiler Diciembre 2025",
    amount: 1550000, dueDate: "2025-12-10", paidDate: "2025-12-08",
    status: "paid", method: "transfer", reference: "TRF-251208-005",
    createdAt: "2025-11-30T10:00:00Z",
  },

  // ─── Enero 2026 ─────────────────────────────────────────────────────────
  {
    id: "pay-006", contractId: "con-001", tenantId: "ten-001", propertyId: "prop-001",
    period: "2026-01", concept: "Alquiler Enero 2026",
    amount: 850000, dueDate: "2026-01-05", paidDate: "2026-01-04",
    status: "paid", method: "transfer", reference: "TRF-260104-006",
    createdAt: "2025-12-29T10:00:00Z",
  },
  {
    id: "pay-007", contractId: "con-002", tenantId: "ten-002", propertyId: "prop-002",
    period: "2026-01", concept: "Alquiler Enero 2026",
    amount: 520000, dueDate: "2026-01-05", paidDate: "2026-01-08",
    status: "paid", method: "cash",
    createdAt: "2025-12-29T10:00:00Z",
  },
  {
    id: "pay-008", contractId: "con-003", tenantId: "ten-003", propertyId: "prop-003",
    period: "2026-01", concept: "Alquiler Enero 2026",
    amount: 720000, dueDate: "2026-01-01", paidDate: "2026-01-01",
    status: "paid", method: "transfer", reference: "TRF-260101-008",
    createdAt: "2025-12-26T10:00:00Z",
  },
  {
    id: "pay-009", contractId: "con-004", tenantId: "ten-004", propertyId: "prop-005",
    period: "2026-01", concept: "Alquiler Enero 2026",
    amount: 950000, dueDate: "2026-01-05", paidDate: "2026-01-05",
    status: "paid", method: "transfer", reference: "TRF-260105-009",
    createdAt: "2025-12-29T10:00:00Z",
  },
  {
    id: "pay-010", contractId: "con-005", tenantId: "ten-005", propertyId: "prop-008",
    period: "2026-01", concept: "Alquiler Enero 2026",
    amount: 1550000, dueDate: "2026-01-10", paidDate: "2026-01-09",
    status: "paid", method: "transfer", reference: "TRF-260109-010",
    createdAt: "2025-12-31T10:00:00Z",
  },

  // ─── Febrero 2026 ────────────────────────────────────────────────────────
  {
    id: "pay-011", contractId: "con-001", tenantId: "ten-001", propertyId: "prop-001",
    period: "2026-02", concept: "Alquiler Febrero 2026",
    amount: 850000, dueDate: "2026-02-05", paidDate: "2026-02-05",
    status: "paid", method: "transfer", reference: "TRF-260205-011",
    createdAt: "2026-01-28T10:00:00Z",
  },
  {
    id: "pay-012", contractId: "con-002", tenantId: "ten-002", propertyId: "prop-002",
    period: "2026-02", concept: "Alquiler Febrero 2026",
    amount: 520000, dueDate: "2026-02-05", paidDate: "2026-02-22",
    status: "paid", method: "cash",
    lateFee: 52000,
    notes: "Pago realizado con 17 días de mora. Se aplicó cargo del 10% por mora.",
    createdAt: "2026-01-28T10:00:00Z",
  },
  {
    id: "pay-013", contractId: "con-003", tenantId: "ten-003", propertyId: "prop-003",
    period: "2026-02", concept: "Alquiler Febrero 2026",
    amount: 720000, dueDate: "2026-02-01", paidDate: "2026-01-31",
    status: "paid", method: "transfer", reference: "TRF-260131-013",
    notes: "Pago anticipado",
    createdAt: "2026-01-25T10:00:00Z",
  },
  {
    id: "pay-014", contractId: "con-004", tenantId: "ten-004", propertyId: "prop-005",
    period: "2026-02", concept: "Alquiler Febrero 2026",
    amount: 950000, dueDate: "2026-02-05", paidDate: "2026-02-06",
    status: "paid", method: "transfer", reference: "TRF-260206-014",
    createdAt: "2026-01-28T10:00:00Z",
  },
  {
    id: "pay-015", contractId: "con-005", tenantId: "ten-005", propertyId: "prop-008",
    period: "2026-02", concept: "Alquiler Febrero 2026",
    amount: 1550000, dueDate: "2026-02-10", paidDate: "2026-02-10",
    status: "paid", method: "transfer", reference: "TRF-260210-015",
    createdAt: "2026-01-31T10:00:00Z",
  },

  // ─── Marzo 2026 ──────────────────────────────────────────────────────────
  {
    id: "pay-016", contractId: "con-001", tenantId: "ten-001", propertyId: "prop-001",
    period: "2026-03", concept: "Alquiler Marzo 2026",
    amount: 850000, dueDate: "2026-03-05", paidDate: "2026-03-04",
    status: "paid", method: "transfer", reference: "TRF-260304-016",
    createdAt: "2026-02-26T10:00:00Z",
  },
  {
    id: "pay-017", contractId: "con-002", tenantId: "ten-002", propertyId: "prop-002",
    period: "2026-03", concept: "Alquiler Marzo 2026",
    amount: 520000, dueDate: "2026-03-05", paidDate: "2026-03-19",
    status: "paid", method: "auto_debit",
    notes: "Débito procesado con demora por rechazo inicial",
    createdAt: "2026-02-26T10:00:00Z",
  },
  {
    id: "pay-018", contractId: "con-003", tenantId: "ten-003", propertyId: "prop-003",
    period: "2026-03", concept: "Alquiler Marzo 2026",
    amount: 720000, dueDate: "2026-03-01", paidDate: "2026-03-01",
    status: "paid", method: "transfer", reference: "TRF-260301-018",
    createdAt: "2026-02-24T10:00:00Z",
  },
  {
    id: "pay-019", contractId: "con-004", tenantId: "ten-004", propertyId: "prop-005",
    period: "2026-03", concept: "Alquiler Marzo 2026",
    amount: 950000, dueDate: "2026-03-05", paidDate: "2026-03-05",
    status: "paid", method: "transfer", reference: "TRF-260305-019",
    createdAt: "2026-02-26T10:00:00Z",
  },
  {
    id: "pay-020", contractId: "con-005", tenantId: "ten-005", propertyId: "prop-008",
    period: "2026-03", concept: "Alquiler Marzo 2026",
    amount: 1550000, dueDate: "2026-03-10", paidDate: "2026-03-08",
    status: "paid", method: "transfer", reference: "TRF-260308-020",
    createdAt: "2026-02-28T10:00:00Z",
  },

  // ─── Abril 2026 ──────────────────────────────────────────────────────────
  {
    id: "pay-021", contractId: "con-001", tenantId: "ten-001", propertyId: "prop-001",
    period: "2026-04", concept: "Alquiler Abril 2026",
    amount: 850000, dueDate: "2026-04-05", paidDate: "2026-04-03",
    status: "paid", method: "transfer", reference: "TRF-260403-021",
    createdAt: "2026-03-28T10:00:00Z",
  },
  {
    id: "pay-022", contractId: "con-002", tenantId: "ten-002", propertyId: "prop-002",
    period: "2026-04", concept: "Alquiler Abril 2026",
    amount: 520000, paidAmount: 390000,
    dueDate: "2026-04-05", paidDate: "2026-04-18",
    status: "partial", method: "cash",
    notes: "Pago parcial. Saldo pendiente: $130.000. Inquilino comprometió saldo para el 30/04.",
    createdAt: "2026-03-28T10:00:00Z",
  },
  {
    id: "pay-023", contractId: "con-003", tenantId: "ten-003", propertyId: "prop-003",
    period: "2026-04", concept: "Alquiler Abril 2026",
    amount: 720000, dueDate: "2026-04-01", paidDate: "2026-04-01",
    status: "paid", method: "transfer", reference: "TRF-260401-023",
    createdAt: "2026-03-26T10:00:00Z",
  },
  {
    id: "pay-024", contractId: "con-004", tenantId: "ten-004", propertyId: "prop-005",
    period: "2026-04", concept: "Alquiler Abril 2026",
    amount: 950000, dueDate: "2026-04-05", paidDate: "2026-04-04",
    status: "paid", method: "transfer", reference: "TRF-260404-024",
    createdAt: "2026-03-28T10:00:00Z",
  },
  {
    id: "pay-025", contractId: "con-005", tenantId: "ten-005", propertyId: "prop-008",
    period: "2026-04", concept: "Alquiler Abril 2026",
    amount: 1550000, dueDate: "2026-04-10", paidDate: "2026-04-09",
    status: "paid", method: "transfer", reference: "TRF-260409-025",
    createdAt: "2026-03-31T10:00:00Z",
  },

  // ─── Mayo 2026 (mes actual · hoy = 2026-05-19) ────────────────────────────
  {
    id: "pay-026", contractId: "con-001", tenantId: "ten-001", propertyId: "prop-001",
    period: "2026-05", concept: "Alquiler Mayo 2026",
    amount: 850000, dueDate: "2026-05-05",
    status: "overdue",
    notes: "Sin respuesta tras dos recordatorios. Se enviará aviso formal.",
    createdAt: "2026-04-28T10:00:00Z",
  },
  {
    id: "pay-027", contractId: "con-002", tenantId: "ten-002", propertyId: "prop-002",
    period: "2026-05", concept: "Alquiler Mayo 2026",
    amount: 520000, dueDate: "2026-05-05",
    status: "overdue",
    notes: "Patrón recurrente de demoras. Contrato próximo a vencer.",
    createdAt: "2026-04-28T10:00:00Z",
  },
  {
    id: "pay-028", contractId: "con-003", tenantId: "ten-003", propertyId: "prop-003",
    period: "2026-05", concept: "Alquiler Mayo 2026",
    amount: 720000, dueDate: "2026-05-01", paidDate: "2026-05-01",
    status: "paid", method: "transfer", reference: "TRF-260501-028",
    createdAt: "2026-04-26T10:00:00Z",
  },
  {
    id: "pay-029", contractId: "con-004", tenantId: "ten-004", propertyId: "prop-005",
    period: "2026-05", concept: "Alquiler Mayo 2026",
    amount: 950000, dueDate: "2026-05-20",
    status: "pending",
    createdAt: "2026-04-28T10:00:00Z",
  },
  {
    id: "pay-030", contractId: "con-005", tenantId: "ten-005", propertyId: "prop-008",
    period: "2026-05", concept: "Alquiler Mayo 2026",
    amount: 1550000, dueDate: "2026-05-10", paidDate: "2026-05-08",
    status: "paid", method: "transfer", reference: "TRF-260508-030",
    createdAt: "2026-04-30T10:00:00Z",
  },
];

// ─── MOCK_PAYMENT_HISTORY ────────────────────────────────────────────────────
// Legacy — usado por tenant-drawer · montos en ARS
export const MOCK_PAYMENT_HISTORY: PaymentRecord[] = [
  { id: "pr-001", tenantId: "ten-001", propertyId: "prop-001", month: "2024-06", amount: 850000, dueDate: "2024-06-05", paidDate: "2024-06-03", status: "pagado", method: "transferencia" },
  { id: "pr-002", tenantId: "ten-001", propertyId: "prop-001", month: "2024-07", amount: 850000, dueDate: "2024-07-05", paidDate: "2024-07-04", status: "pagado", method: "transferencia" },
  { id: "pr-003", tenantId: "ten-001", propertyId: "prop-001", month: "2024-08", amount: 850000, dueDate: "2024-08-05", paidDate: "2024-08-06", status: "pagado", method: "transferencia" },
  { id: "pr-004", tenantId: "ten-001", propertyId: "prop-001", month: "2024-09", amount: 850000, dueDate: "2024-09-05", paidDate: "2024-09-03", status: "pagado", method: "transferencia" },
  { id: "pr-005", tenantId: "ten-001", propertyId: "prop-001", month: "2024-10", amount: 850000, dueDate: "2024-10-05", paidDate: "2024-10-07", status: "pagado", method: "efectivo" },
  { id: "pr-006", tenantId: "ten-001", propertyId: "prop-001", month: "2024-11", amount: 850000, dueDate: "2024-11-05", paidDate: "2024-11-04", status: "pagado", method: "transferencia" },
  { id: "pr-007", tenantId: "ten-002", propertyId: "prop-002", month: "2024-06", amount: 520000, dueDate: "2024-06-05", paidDate: "2024-06-08", status: "pagado", method: "transferencia" },
  { id: "pr-008", tenantId: "ten-002", propertyId: "prop-002", month: "2024-07", amount: 520000, dueDate: "2024-07-05", paidDate: "2024-07-03", status: "pagado", method: "transferencia" },
  { id: "pr-009", tenantId: "ten-002", propertyId: "prop-002", month: "2024-08", amount: 520000, dueDate: "2024-08-05", paidDate: "2024-08-12", status: "pagado", method: "efectivo", notes: "Pago con demora" },
  { id: "pr-010", tenantId: "ten-002", propertyId: "prop-002", month: "2024-09", amount: 520000, dueDate: "2024-09-05", paidDate: "2024-09-04", status: "pagado", method: "transferencia" },
  { id: "pr-011", tenantId: "ten-002", propertyId: "prop-002", month: "2024-10", amount: 520000, dueDate: "2024-10-05", paidDate: "2024-10-15", status: "pagado", method: "efectivo", notes: "Segundo aviso enviado" },
  { id: "pr-012", tenantId: "ten-002", propertyId: "prop-002", month: "2024-11", amount: 520000, dueDate: "2024-11-05", status: "atrasado", notes: "Sin pago registrado" },
  { id: "pr-013", tenantId: "ten-003", propertyId: "prop-003", month: "2024-06", amount: 720000, dueDate: "2024-06-01", paidDate: "2024-06-01", status: "pagado", method: "transferencia" },
  { id: "pr-014", tenantId: "ten-003", propertyId: "prop-003", month: "2024-07", amount: 720000, dueDate: "2024-07-01", paidDate: "2024-07-01", status: "pagado", method: "transferencia" },
  { id: "pr-015", tenantId: "ten-003", propertyId: "prop-003", month: "2024-08", amount: 720000, dueDate: "2024-08-01", paidDate: "2024-07-31", status: "pagado", method: "transferencia", notes: "Pago anticipado" },
  { id: "pr-016", tenantId: "ten-003", propertyId: "prop-003", month: "2024-09", amount: 720000, dueDate: "2024-09-01", paidDate: "2024-09-01", status: "pagado", method: "transferencia" },
  { id: "pr-017", tenantId: "ten-003", propertyId: "prop-003", month: "2024-10", amount: 720000, dueDate: "2024-10-01", paidDate: "2024-10-01", status: "pagado", method: "cheque" },
  { id: "pr-018", tenantId: "ten-003", propertyId: "prop-003", month: "2024-11", amount: 720000, dueDate: "2024-11-01", paidDate: "2024-11-01", status: "pagado", method: "transferencia" },
  { id: "pr-019", tenantId: "ten-004", propertyId: "prop-005", month: "2024-06", amount: 950000, dueDate: "2024-06-05", paidDate: "2024-06-04", status: "pagado", method: "transferencia" },
  { id: "pr-020", tenantId: "ten-004", propertyId: "prop-005", month: "2024-07", amount: 950000, dueDate: "2024-07-05", paidDate: "2024-07-05", status: "pagado", method: "transferencia" },
  { id: "pr-021", tenantId: "ten-004", propertyId: "prop-005", month: "2024-08", amount: 950000, dueDate: "2024-08-05", paidDate: "2024-08-04", status: "pagado", method: "tarjeta" },
  { id: "pr-022", tenantId: "ten-004", propertyId: "prop-005", month: "2024-09", amount: 950000, dueDate: "2024-09-05", paidDate: "2024-09-06", status: "pagado", method: "transferencia" },
  { id: "pr-023", tenantId: "ten-004", propertyId: "prop-005", month: "2024-10", amount: 950000, dueDate: "2024-10-05", paidDate: "2024-10-05", status: "pagado", method: "transferencia" },
  { id: "pr-024", tenantId: "ten-004", propertyId: "prop-005", month: "2024-11", amount: 950000, dueDate: "2024-11-05", paidDate: "2024-11-04", status: "pagado", method: "transferencia" },
  { id: "pr-025", tenantId: "ten-005", propertyId: "prop-008", month: "2024-06", amount: 1550000, dueDate: "2024-06-10", paidDate: "2024-06-09", status: "pagado", method: "transferencia" },
  { id: "pr-026", tenantId: "ten-005", propertyId: "prop-008", month: "2024-07", amount: 1550000, dueDate: "2024-07-10", paidDate: "2024-07-08", status: "pagado", method: "transferencia" },
  { id: "pr-027", tenantId: "ten-005", propertyId: "prop-008", month: "2024-08", amount: 1550000, dueDate: "2024-08-10", paidDate: "2024-08-10", status: "pagado", method: "transferencia" },
  { id: "pr-028", tenantId: "ten-005", propertyId: "prop-008", month: "2024-09", amount: 1550000, dueDate: "2024-09-10", paidDate: "2024-09-09", status: "pagado", method: "transferencia" },
  { id: "pr-029", tenantId: "ten-005", propertyId: "prop-008", month: "2024-10", amount: 1550000, dueDate: "2024-10-10", paidDate: "2024-10-10", status: "pagado", method: "transferencia" },
  { id: "pr-030", tenantId: "ten-005", propertyId: "prop-008", month: "2024-11", amount: 1550000, dueDate: "2024-11-10", paidDate: "2024-11-08", status: "pagado", method: "transferencia" },
];

export type { PaymentRecord } from "@/types/payment";
