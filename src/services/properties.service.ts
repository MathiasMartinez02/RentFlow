import { mockFetch, simulateDelay } from "./base.service";
import { MOCK_PROPERTIES } from "@/mock/properties";
import type { Property, PropertyFilters } from "@/types/property";
import type { ApiResponse } from "@/types";

let _properties = [...MOCK_PROPERTIES];

function applyFilters(data: Property[], filters?: PropertyFilters): Property[] {
  let result = [...data];

  if (filters?.search) {
    const q = filters.search.toLowerCase();
    result = result.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.address.toLowerCase().includes(q) ||
        p.city.toLowerCase().includes(q)
    );
  }
  if (filters?.status && filters.status !== "all") {
    result = result.filter((p) => p.status === filters.status);
  }
  if (filters?.type && filters.type !== "all") {
    result = result.filter((p) => p.type === filters.type);
  }
  if (filters?.city) {
    result = result.filter((p) => p.city.toLowerCase().includes(filters.city!.toLowerCase()));
  }
  if (filters?.minRent !== undefined) {
    result = result.filter((p) => p.rent >= filters.minRent!);
  }
  if (filters?.maxRent !== undefined) {
    result = result.filter((p) => p.rent <= filters.maxRent!);
  }

  return result;
}

export const propertiesService = {
  async getAll(filters?: PropertyFilters): Promise<ApiResponse<Property[]>> {
    const data = await mockFetch(_properties);
    const filtered = applyFilters(data, filters);
    return { data: filtered, total: filtered.length };
  },

  async getById(id: string): Promise<Property | null> {
    await simulateDelay(300);
    return _properties.find((p) => p.id === id) ?? null;
  },

  async create(payload: Omit<Property, "id" | "createdAt" | "updatedAt">): Promise<Property> {
    await simulateDelay(700);
    const newProperty: Property = {
      ...payload,
      id: `prop-${String(Date.now()).slice(-6)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    _properties = [newProperty, ..._properties];
    return newProperty;
  },

  async update(id: string, payload: Partial<Property>): Promise<Property> {
    await simulateDelay(600);
    const idx = _properties.findIndex((p) => p.id === id);
    if (idx === -1) throw new Error(`Property ${id} not found`);
    _properties[idx] = { ..._properties[idx], ...payload, updatedAt: new Date().toISOString() };
    return _properties[idx];
  },

  async delete(id: string): Promise<void> {
    await simulateDelay(500);
    _properties = _properties.filter((p) => p.id !== id);
  },
};
