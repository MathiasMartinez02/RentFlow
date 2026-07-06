import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useContracts } from "./use-contracts";
import type { Contract } from "@/types/contract";
import type { ContractFormValues } from "../schemas/contract.schema";

const mockGetAll = vi.fn();
const mockCreate = vi.fn();

vi.mock("@/services/contracts.service", () => ({
  contractsService: {
    getAll: (...args: unknown[]) => mockGetAll(...args),
    create: (...args: unknown[]) => mockCreate(...args),
  },
}));

const mockCloseContractForm = vi.fn();
const mockCloseContractDrawer = vi.fn();

vi.mock("@/store", () => ({
  useUIStore: () => ({
    closeContractForm: mockCloseContractForm,
    closeContractDrawer: mockCloseContractDrawer,
  }),
}));

const existingContract: Contract = {
  id: "c1",
  propertyId: "p1",
  tenantId: "t1",
  startDate: "2026-01-01",
  endDate: "2026-12-31",
  status: "active",
  monthlyRent: 1000,
  deposit: 1000,
  renewalOption: false,
  noticePeriodDays: 30,
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
};

describe("useContracts", () => {
  beforeEach(() => {
    mockGetAll.mockReset();
    mockCreate.mockReset();
    mockCloseContractForm.mockReset();
    mockCloseContractDrawer.mockReset();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("carga los contratos al montar y calcula las estadisticas", async () => {
    mockGetAll.mockResolvedValueOnce({ data: [existingContract], total: 1 });

    const { result } = renderHook(() => useContracts());

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(mockGetAll).toHaveBeenCalledTimes(1);
    expect(result.current.contracts).toEqual([existingContract]);
    expect(result.current.stats.total).toBe(1);
    expect(result.current.stats.active).toBe(1);
    expect(result.current.error).toBeNull();
  });

  it("crea un contrato, lo agrega al listado y cierra el formulario", async () => {
    mockGetAll.mockResolvedValueOnce({ data: [], total: 0 });
    const { result } = renderHook(() => useContracts());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    const newContract: Contract = { ...existingContract, id: "c2" };
    mockCreate.mockResolvedValueOnce(newContract);

    const formValues: ContractFormValues = {
      propertyId: "p1",
      tenantId: "t1",
      startDate: "2026-01-01",
      endDate: "2026-12-31",
      status: "active",
      monthlyRent: 1000,
      deposit: 1000,
      expenses: "",
      annualIncreasePercent: "",
      renewalOption: false,
      noticePeriodDays: 30,
      terms: "",
    };

    await act(async () => {
      await result.current.createContract(formValues);
    });

    expect(mockCreate).toHaveBeenCalledTimes(1);
    expect(result.current.contracts).toEqual([newContract]);
    expect(mockCloseContractForm).toHaveBeenCalledTimes(1);
    expect(result.current.isMutating).toBe(false);
  });
});
