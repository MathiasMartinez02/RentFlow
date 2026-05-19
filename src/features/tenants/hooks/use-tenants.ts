"use client";

import { useState, useEffect, useCallback } from "react";
import { tenantsService } from "@/services/tenants.service";
import { useUIStore } from "@/store";
import type { Tenant, TenantFilters, TenantStats } from "@/types/tenant";
import type { TenantFormValues } from "../schemas/tenant.schema";

function computeStats(tenants: Tenant[]): TenantStats {
  return {
    total: tenants.length,
    active: tenants.filter((t) => t.status === "active").length,
    inactive: tenants.filter((t) => t.status === "inactive").length,
    alDia: tenants.filter((t) => t.paymentStatus === "al_dia").length,
    atrasados: tenants.filter((t) => t.paymentStatus === "atrasado").length,
  };
}

interface UseTenantsReturn {
  tenants: Tenant[];
  stats: TenantStats;
  isLoading: boolean;
  isMutating: boolean;
  error: Error | null;
  refetch: () => void;
  createTenant: (data: TenantFormValues) => Promise<void>;
  updateTenant: (id: string, data: TenantFormValues) => Promise<void>;
  deleteTenant: (id: string) => Promise<void>;
}

export function useTenants(filters?: TenantFilters): UseTenantsReturn {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isMutating, setIsMutating] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const { closeTenantForm, closeTenantDrawer } = useUIStore();

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await tenantsService.getAll(filters);
      setTenants(result.data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Error al cargar los inquilinos"));
    } finally {
      setIsLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters?.search, filters?.status, filters?.paymentStatus]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const createTenant = async (data: TenantFormValues) => {
    setIsMutating(true);
    try {
      const newTenant = await tenantsService.create({
        firstName: data.firstName,
        lastName: data.lastName,
        nationalId: data.nationalId,
        email: data.email,
        phone: data.phone,
        address: data.address,
        status: data.status,
        paymentStatus: data.paymentStatus,
        propertyId: data.propertyId,
        moveInDate: data.moveInDate || undefined,
        observations: data.observations,
        emergencyContact: {
          name: data.emergencyContactName,
          phone: data.emergencyContactPhone,
          relationship: data.emergencyContactRelationship,
        },
      });
      setTenants((prev) => [newTenant, ...prev]);
      closeTenantForm();
    } finally {
      setIsMutating(false);
    }
  };

  const updateTenant = async (id: string, data: TenantFormValues) => {
    setIsMutating(true);
    try {
      const updated = await tenantsService.update(id, {
        firstName: data.firstName,
        lastName: data.lastName,
        nationalId: data.nationalId,
        email: data.email,
        phone: data.phone,
        address: data.address,
        status: data.status,
        paymentStatus: data.paymentStatus,
        propertyId: data.propertyId,
        moveInDate: data.moveInDate || undefined,
        observations: data.observations,
        emergencyContact: {
          name: data.emergencyContactName,
          phone: data.emergencyContactPhone,
          relationship: data.emergencyContactRelationship,
        },
      });
      setTenants((prev) => prev.map((t) => (t.id === id ? updated : t)));
      closeTenantForm();
    } finally {
      setIsMutating(false);
    }
  };

  const deleteTenant = async (id: string) => {
    setIsMutating(true);
    setTenants((prev) => prev.filter((t) => t.id !== id));
    closeTenantDrawer();
    try {
      await tenantsService.delete(id);
    } catch {
      await fetchData();
    } finally {
      setIsMutating(false);
    }
  };

  return {
    tenants,
    stats: computeStats(tenants),
    isLoading,
    isMutating,
    error,
    refetch: fetchData,
    createTenant,
    updateTenant,
    deleteTenant,
  };
}
