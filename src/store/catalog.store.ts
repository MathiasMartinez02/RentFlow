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
    try {
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
      const [props, tens, cons, ticks] = await Promise.all([
        propertiesService.getAll(),
        tenantsService.getAll(),
        contractsService.getAll(),
        maintenanceService.getAll(),
      ]);
      set({
        properties: props.data,
        tenants: tens.data,
        contracts: cons.data,
        tickets: ticks.data,
        isLoaded: true,
      });
    } catch {
      // Catalog load failures are non-fatal; forms fall back to empty lists
    }
  },
}));
