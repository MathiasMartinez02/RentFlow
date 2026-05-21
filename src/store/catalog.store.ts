import { create } from "zustand";
import type { Property } from "@/types/property";
import type { Tenant } from "@/types/tenant";
import type { Contract } from "@/types/contract";
import type { MaintenanceTicket } from "@/types/maintenance";

interface CatalogState {
  properties: Property[];
  tenants: Tenant[];
  contracts: Contract[];
  tickets: MaintenanceTicket[];
  isLoaded: boolean;

  setProperties: (v: Property[]) => void;
  setTenants: (v: Tenant[]) => void;
  setContracts: (v: Contract[]) => void;
  setTickets: (v: MaintenanceTicket[]) => void;
  refresh: () => Promise<void>;
}

export const useCatalogStore = create<CatalogState>()((set) => ({
  properties: [],
  tenants: [],
  contracts: [],
  tickets: [],
  isLoaded: false,

  setProperties: (v) => set({ properties: v }),
  setTenants: (v) => set({ tenants: v }),
  setContracts: (v) => set({ contracts: v }),
  setTickets: (v) => set({ tickets: v }),

  refresh: async () => {
    const [
      { propertiesService },
      { tenantsService },
      { contractsService },
      { maintenanceService },
    ] = await Promise.all([
      import("@/services/properties.service"),
      import("@/services/tenants.service"),
      import("@/services/contracts.service"),
      import("@/services/maintenance.service"),
    ]);

    // allSettled so one 403 (role restriction) doesn't kill the whole catalog
    const [propsR, tensR, consR, ticksR] = await Promise.allSettled([
      propertiesService.getAll(),
      tenantsService.getAll(),
      contractsService.getAll(),
      maintenanceService.getAll(),
    ]);

    set({
      properties: propsR.status === "fulfilled" ? propsR.value.data : [],
      tenants: tensR.status === "fulfilled" ? tensR.value.data : [],
      contracts: consR.status === "fulfilled" ? consR.value.data : [],
      tickets: ticksR.status === "fulfilled" ? ticksR.value.data : [],
      isLoaded: true,
    });
  },
}));
