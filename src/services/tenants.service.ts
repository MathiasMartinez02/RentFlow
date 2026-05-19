import { mockFetch, simulateDelay } from "./base.service";
import { MOCK_TENANTS } from "@/mock/tenants";
import type { Tenant, TenantFilters } from "@/types/tenant";
import type { ApiResponse } from "@/types";

let _tenants = [...MOCK_TENANTS];

function applyFilters(data: Tenant[], filters?: TenantFilters): Tenant[] {
  let result = [...data];

  if (filters?.search) {
    const q = filters.search.toLowerCase();
    result = result.filter(
      (t) =>
        t.firstName.toLowerCase().includes(q) ||
        t.lastName.toLowerCase().includes(q) ||
        t.email.toLowerCase().includes(q) ||
        t.phone.includes(q) ||
        t.nationalId.toLowerCase().includes(q)
    );
  }
  if (filters?.status && filters.status !== "all") {
    result = result.filter((t) => t.status === filters.status);
  }
  if (filters?.paymentStatus && filters.paymentStatus !== "all") {
    result = result.filter((t) => t.paymentStatus === filters.paymentStatus);
  }

  return result;
}

export const tenantsService = {
  async getAll(filters?: TenantFilters): Promise<ApiResponse<Tenant[]>> {
    const data = await mockFetch(_tenants);
    const filtered = applyFilters(data, filters);
    return { data: filtered, total: filtered.length };
  },

  async getById(id: string): Promise<Tenant | null> {
    await simulateDelay(300);
    return _tenants.find((t) => t.id === id) ?? null;
  },

  async create(payload: Omit<Tenant, "id" | "createdAt" | "updatedAt">): Promise<Tenant> {
    await simulateDelay(700);
    const newTenant: Tenant = {
      ...payload,
      id: `ten-${String(Date.now()).slice(-6)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    _tenants = [newTenant, ..._tenants];
    return newTenant;
  },

  async update(id: string, payload: Partial<Tenant>): Promise<Tenant> {
    await simulateDelay(600);
    const idx = _tenants.findIndex((t) => t.id === id);
    if (idx === -1) throw new Error(`Tenant ${id} not found`);
    _tenants[idx] = { ..._tenants[idx], ...payload, updatedAt: new Date().toISOString() };
    return _tenants[idx];
  },

  async delete(id: string): Promise<void> {
    await simulateDelay(500);
    _tenants = _tenants.filter((t) => t.id !== id);
  },
};
