"use client";

import { useState, useEffect, useCallback } from "react";
import { contractsService } from "@/services/contracts.service";
import { useUIStore } from "@/store";
import type { Contract, ContractFilters, ContractStats } from "@/types/contract";
import type { ContractFormValues } from "../schemas/contract.schema";

const EXPIRING_SOON_DAYS = 90;

export function getDaysLeft(endDate: string): number {
  return Math.ceil((new Date(endDate).getTime() - Date.now()) / 86400000);
}

export function isExpiringSoon(contract: Contract): boolean {
  if (contract.status !== "active") return false;
  const d = getDaysLeft(contract.endDate);
  return d > 0 && d <= EXPIRING_SOON_DAYS;
}

function computeStats(contracts: Contract[]): ContractStats {
  const now = new Date();
  const renewalsThisMonth = contracts.filter((c) => {
    const end = new Date(c.endDate);
    return end.getMonth() === now.getMonth() && end.getFullYear() === now.getFullYear();
  }).length;

  return {
    total: contracts.length,
    active: contracts.filter((c) => c.status === "active").length,
    expiringSoon: contracts.filter(isExpiringSoon).length,
    expired: contracts.filter((c) => c.status === "expired" || c.status === "terminated").length,
    renewalsThisMonth,
  };
}

interface UseContractsReturn {
  contracts: Contract[];
  stats: ContractStats;
  isLoading: boolean;
  isMutating: boolean;
  error: Error | null;
  refetch: () => void;
  createContract: (data: ContractFormValues) => Promise<void>;
  updateContract: (id: string, data: ContractFormValues) => Promise<void>;
  deleteContract: (id: string) => Promise<void>;
}

export function useContracts(filters?: ContractFilters): UseContractsReturn {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isMutating, setIsMutating] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const { closeContractForm, closeContractDrawer } = useUIStore();

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await contractsService.getAll(filters);
      setContracts(result.data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Error al cargar los contratos"));
    } finally {
      setIsLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters?.search, filters?.status]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const createContract = async (data: ContractFormValues) => {
    setIsMutating(true);
    try {
      const newContract = await contractsService.create({
        propertyId: data.propertyId,
        tenantId: data.tenantId,
        startDate: data.startDate,
        endDate: data.endDate,
        status: data.status,
        monthlyRent: data.monthlyRent,
        deposit: data.deposit,
        expenses: data.expenses !== "" ? Number(data.expenses) : undefined,
        annualIncreasePercent:
          data.annualIncreasePercent !== "" ? Number(data.annualIncreasePercent) : undefined,
        renewalOption: data.renewalOption,
        noticePeriodDays: data.noticePeriodDays,
        terms: data.terms || undefined,
      });
      setContracts((prev) => [newContract, ...prev]);
      closeContractForm();
    } finally {
      setIsMutating(false);
    }
  };

  const updateContract = async (id: string, data: ContractFormValues) => {
    setIsMutating(true);
    try {
      const updated = await contractsService.update(id, {
        propertyId: data.propertyId,
        tenantId: data.tenantId,
        startDate: data.startDate,
        endDate: data.endDate,
        status: data.status,
        monthlyRent: data.monthlyRent,
        deposit: data.deposit,
        expenses: data.expenses !== "" ? Number(data.expenses) : undefined,
        annualIncreasePercent:
          data.annualIncreasePercent !== "" ? Number(data.annualIncreasePercent) : undefined,
        renewalOption: data.renewalOption,
        noticePeriodDays: data.noticePeriodDays,
        terms: data.terms || undefined,
      });
      setContracts((prev) => prev.map((c) => (c.id === id ? updated : c)));
      closeContractForm();
    } finally {
      setIsMutating(false);
    }
  };

  const deleteContract = async (id: string) => {
    setIsMutating(true);
    setContracts((prev) => prev.filter((c) => c.id !== id));
    closeContractDrawer();
    try {
      await contractsService.delete(id);
    } catch {
      await fetchData();
    } finally {
      setIsMutating(false);
    }
  };

  return {
    contracts,
    stats: computeStats(contracts),
    isLoading,
    isMutating,
    error,
    refetch: fetchData,
    createContract,
    updateContract,
    deleteContract,
  };
}
