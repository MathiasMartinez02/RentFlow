import { mockFetch, simulateDelay } from "./base.service";
import { MOCK_CONTRACTS } from "@/mock/contracts";
import type { Contract, ContractFilters } from "@/types/contract";
import type { ApiResponse } from "@/types";

let _contracts = [...MOCK_CONTRACTS];

const EXPIRING_SOON_DAYS = 90;

function isExpiringSoon(contract: Contract): boolean {
  if (contract.status !== "active") return false;
  const daysLeft = Math.ceil(
    (new Date(contract.endDate).getTime() - Date.now()) / 86400000
  );
  return daysLeft > 0 && daysLeft <= EXPIRING_SOON_DAYS;
}

function applyFilters(data: Contract[], filters?: ContractFilters): Contract[] {
  let result = [...data];

  if (filters?.search) {
    const q = filters.search.toLowerCase();
    result = result.filter(
      (c) =>
        c.id.toLowerCase().includes(q) ||
        c.propertyId.toLowerCase().includes(q) ||
        c.tenantId.toLowerCase().includes(q)
    );
  }

  if (filters?.status && filters.status !== "all") {
    if (filters.status === "expiring_soon") {
      result = result.filter(isExpiringSoon);
    } else {
      result = result.filter((c) => c.status === filters.status);
    }
  }

  return result;
}

export const contractsService = {
  async getAll(filters?: ContractFilters): Promise<ApiResponse<Contract[]>> {
    const data = await mockFetch(_contracts);
    const filtered = applyFilters(data, filters);
    return { data: filtered, total: filtered.length };
  },

  async getById(id: string): Promise<Contract | null> {
    await simulateDelay(300);
    return _contracts.find((c) => c.id === id) ?? null;
  },

  async create(payload: Omit<Contract, "id" | "createdAt" | "updatedAt">): Promise<Contract> {
    await simulateDelay(700);
    const newContract: Contract = {
      ...payload,
      id: `con-${String(Date.now()).slice(-6)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    _contracts = [newContract, ..._contracts];
    return newContract;
  },

  async update(id: string, payload: Partial<Contract>): Promise<Contract> {
    await simulateDelay(600);
    const idx = _contracts.findIndex((c) => c.id === id);
    if (idx === -1) throw new Error(`Contract ${id} not found`);
    _contracts[idx] = { ..._contracts[idx], ...payload, updatedAt: new Date().toISOString() };
    return _contracts[idx];
  },

  async delete(id: string): Promise<void> {
    await simulateDelay(500);
    _contracts = _contracts.filter((c) => c.id !== id);
  },
};
