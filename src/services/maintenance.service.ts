import { mockFetch, simulateDelay } from "./base.service";
import { MOCK_MAINTENANCE } from "@/mock/maintenance";
import type { MaintenanceTicket, MaintenanceFilters, MaintenanceStatus } from "@/types/maintenance";
import type { ApiResponse } from "@/types";

let _tickets = [...MOCK_MAINTENANCE];

function applyFilters(data: MaintenanceTicket[], filters?: MaintenanceFilters): MaintenanceTicket[] {
  let result = [...data];

  if (filters?.search) {
    const q = filters.search.toLowerCase();
    result = result.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        t.propertyId.toLowerCase().includes(q) ||
        (t.notes?.toLowerCase().includes(q) ?? false)
    );
  }

  if (filters?.status && filters.status !== "all") {
    result = result.filter((t) => t.status === filters.status);
  }

  if (filters?.priority && filters.priority !== "all") {
    result = result.filter((t) => t.priority === filters.priority);
  }

  if (filters?.category && filters.category !== "all") {
    result = result.filter((t) => t.category === filters.category);
  }

  return result.sort((a, b) => {
    const priorityOrder: Record<string, number> = { urgent: 0, high: 1, medium: 2, low: 3 };
    const pa = priorityOrder[a.priority] ?? 4;
    const pb = priorityOrder[b.priority] ?? 4;
    if (pa !== pb) return pa - pb;
    return new Date(b.reportedAt).getTime() - new Date(a.reportedAt).getTime();
  });
}

export const maintenanceService = {
  async getAll(filters?: MaintenanceFilters): Promise<ApiResponse<MaintenanceTicket[]>> {
    const data = await mockFetch(_tickets);
    const filtered = applyFilters(data, filters);
    return { data: filtered, total: filtered.length };
  },

  async getById(id: string): Promise<MaintenanceTicket | null> {
    await simulateDelay(300);
    return _tickets.find((t) => t.id === id) ?? null;
  },

  async create(payload: Omit<MaintenanceTicket, "id" | "createdAt" | "updatedAt">): Promise<MaintenanceTicket> {
    await simulateDelay(700);
    const now = new Date().toISOString();
    const newTicket: MaintenanceTicket = {
      ...payload,
      id: `mnt-${String(Date.now()).slice(-6)}`,
      createdAt: now,
      updatedAt: now,
    };
    _tickets = [newTicket, ..._tickets];
    return newTicket;
  },

  async update(id: string, payload: Partial<MaintenanceTicket>): Promise<MaintenanceTicket> {
    await simulateDelay(600);
    const idx = _tickets.findIndex((t) => t.id === id);
    if (idx === -1) throw new Error(`Ticket ${id} not found`);
    _tickets[idx] = { ..._tickets[idx], ...payload, updatedAt: new Date().toISOString() };
    return _tickets[idx];
  },

  async updateStatus(id: string, status: MaintenanceStatus): Promise<MaintenanceTicket> {
    await simulateDelay(400);
    const idx = _tickets.findIndex((t) => t.id === id);
    if (idx === -1) throw new Error(`Ticket ${id} not found`);
    const now = new Date().toISOString();
    const extra: Partial<MaintenanceTicket> = { status, updatedAt: now };
    if (status === "in_progress" && !_tickets[idx].startedAt) extra.startedAt = now;
    if (status === "resolved" && !_tickets[idx].resolvedAt) extra.resolvedAt = now;
    if (status === "closed" && !_tickets[idx].closedAt) extra.closedAt = now;
    _tickets[idx] = { ..._tickets[idx], ...extra };
    return _tickets[idx];
  },

  async delete(id: string): Promise<void> {
    await simulateDelay(500);
    _tickets = _tickets.filter((t) => t.id !== id);
  },
};
