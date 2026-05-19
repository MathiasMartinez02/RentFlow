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

export const MOCK_PAYMENT_HISTORY: PaymentRecord[] = [
  // Sarah Mitchell (ten-001) - prop-001 - $3200 - Al día
  { id: "pr-001", tenantId: "ten-001", propertyId: "prop-001", month: "2024-06", amount: 3200, dueDate: "2024-06-05", paidDate: "2024-06-03", status: "pagado", method: "transferencia" },
  { id: "pr-002", tenantId: "ten-001", propertyId: "prop-001", month: "2024-07", amount: 3200, dueDate: "2024-07-05", paidDate: "2024-07-04", status: "pagado", method: "transferencia" },
  { id: "pr-003", tenantId: "ten-001", propertyId: "prop-001", month: "2024-08", amount: 3200, dueDate: "2024-08-05", paidDate: "2024-08-06", status: "pagado", method: "transferencia" },
  { id: "pr-004", tenantId: "ten-001", propertyId: "prop-001", month: "2024-09", amount: 3200, dueDate: "2024-09-05", paidDate: "2024-09-03", status: "pagado", method: "transferencia" },
  { id: "pr-005", tenantId: "ten-001", propertyId: "prop-001", month: "2024-10", amount: 3200, dueDate: "2024-10-05", paidDate: "2024-10-07", status: "pagado", method: "efectivo" },
  { id: "pr-006", tenantId: "ten-001", propertyId: "prop-001", month: "2024-11", amount: 3200, dueDate: "2024-11-05", paidDate: "2024-11-04", status: "pagado", method: "transferencia" },

  // Marcus Chen (ten-002) - prop-002 - $2100 - Atrasado (contrato por vencer)
  { id: "pr-007", tenantId: "ten-002", propertyId: "prop-002", month: "2024-06", amount: 2100, dueDate: "2024-06-05", paidDate: "2024-06-08", status: "pagado", method: "transferencia" },
  { id: "pr-008", tenantId: "ten-002", propertyId: "prop-002", month: "2024-07", amount: 2100, dueDate: "2024-07-05", paidDate: "2024-07-03", status: "pagado", method: "transferencia" },
  { id: "pr-009", tenantId: "ten-002", propertyId: "prop-002", month: "2024-08", amount: 2100, dueDate: "2024-08-05", paidDate: "2024-08-12", status: "pagado", method: "efectivo", notes: "Pago con demora" },
  { id: "pr-010", tenantId: "ten-002", propertyId: "prop-002", month: "2024-09", amount: 2100, dueDate: "2024-09-05", paidDate: "2024-09-04", status: "pagado", method: "transferencia" },
  { id: "pr-011", tenantId: "ten-002", propertyId: "prop-002", month: "2024-10", amount: 2100, dueDate: "2024-10-05", paidDate: "2024-10-15", status: "pagado", method: "efectivo", notes: "Segundo aviso enviado" },
  { id: "pr-012", tenantId: "ten-002", propertyId: "prop-002", month: "2024-11", amount: 2100, dueDate: "2024-11-05", status: "atrasado", notes: "Sin pago registrado" },

  // Amanda Rodriguez (ten-003) - prop-003 - $4500 - Al día
  { id: "pr-013", tenantId: "ten-003", propertyId: "prop-003", month: "2024-06", amount: 4500, dueDate: "2024-06-01", paidDate: "2024-06-01", status: "pagado", method: "transferencia" },
  { id: "pr-014", tenantId: "ten-003", propertyId: "prop-003", month: "2024-07", amount: 4500, dueDate: "2024-07-01", paidDate: "2024-07-01", status: "pagado", method: "transferencia" },
  { id: "pr-015", tenantId: "ten-003", propertyId: "prop-003", month: "2024-08", amount: 4500, dueDate: "2024-08-01", paidDate: "2024-07-31", status: "pagado", method: "transferencia", notes: "Pago anticipado" },
  { id: "pr-016", tenantId: "ten-003", propertyId: "prop-003", month: "2024-09", amount: 4500, dueDate: "2024-09-01", paidDate: "2024-09-01", status: "pagado", method: "transferencia" },
  { id: "pr-017", tenantId: "ten-003", propertyId: "prop-003", month: "2024-10", amount: 4500, dueDate: "2024-10-01", paidDate: "2024-10-01", status: "pagado", method: "cheque" },
  { id: "pr-018", tenantId: "ten-003", propertyId: "prop-003", month: "2024-11", amount: 4500, dueDate: "2024-11-01", paidDate: "2024-11-01", status: "pagado", method: "transferencia" },

  // James O'Brien (ten-004) - prop-005 - $3800 - Al día
  { id: "pr-019", tenantId: "ten-004", propertyId: "prop-005", month: "2024-06", amount: 3800, dueDate: "2024-06-05", paidDate: "2024-06-04", status: "pagado", method: "transferencia" },
  { id: "pr-020", tenantId: "ten-004", propertyId: "prop-005", month: "2024-07", amount: 3800, dueDate: "2024-07-05", paidDate: "2024-07-05", status: "pagado", method: "transferencia" },
  { id: "pr-021", tenantId: "ten-004", propertyId: "prop-005", month: "2024-08", amount: 3800, dueDate: "2024-08-05", paidDate: "2024-08-04", status: "pagado", method: "tarjeta" },
  { id: "pr-022", tenantId: "ten-004", propertyId: "prop-005", month: "2024-09", amount: 3800, dueDate: "2024-09-05", paidDate: "2024-09-06", status: "pagado", method: "transferencia" },
  { id: "pr-023", tenantId: "ten-004", propertyId: "prop-005", month: "2024-10", amount: 3800, dueDate: "2024-10-05", paidDate: "2024-10-05", status: "pagado", method: "transferencia" },
  { id: "pr-024", tenantId: "ten-004", propertyId: "prop-005", month: "2024-11", amount: 3800, dueDate: "2024-11-05", paidDate: "2024-11-04", status: "pagado", method: "transferencia" },

  // Elena Kowalski (ten-005) - prop-008 - $6200 - Al día
  { id: "pr-025", tenantId: "ten-005", propertyId: "prop-008", month: "2024-06", amount: 6200, dueDate: "2024-06-10", paidDate: "2024-06-09", status: "pagado", method: "transferencia" },
  { id: "pr-026", tenantId: "ten-005", propertyId: "prop-008", month: "2024-07", amount: 6200, dueDate: "2024-07-10", paidDate: "2024-07-08", status: "pagado", method: "transferencia" },
  { id: "pr-027", tenantId: "ten-005", propertyId: "prop-008", month: "2024-08", amount: 6200, dueDate: "2024-08-10", paidDate: "2024-08-10", status: "pagado", method: "transferencia" },
  { id: "pr-028", tenantId: "ten-005", propertyId: "prop-008", month: "2024-09", amount: 6200, dueDate: "2024-09-10", paidDate: "2024-09-09", status: "pagado", method: "transferencia" },
  { id: "pr-029", tenantId: "ten-005", propertyId: "prop-008", month: "2024-10", amount: 6200, dueDate: "2024-10-10", paidDate: "2024-10-10", status: "pagado", method: "transferencia" },
  { id: "pr-030", tenantId: "ten-005", propertyId: "prop-008", month: "2024-11", amount: 6200, dueDate: "2024-11-10", paidDate: "2024-11-08", status: "pagado", method: "transferencia" },
];
