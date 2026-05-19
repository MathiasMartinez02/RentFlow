import { create } from "zustand";
import { persist } from "zustand/middleware";

type PropertiesView = "grid" | "table";

interface UIState {
  sidebarOpen: boolean;
  sidebarCollapsed: boolean;
  mobileSidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setMobileSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  toggleSidebarCollapsed: () => void;

  propertiesView: PropertiesView;
  selectedPropertyId: string | null;
  propertyDrawerOpen: boolean;
  propertyFormOpen: boolean;
  editingPropertyId: string | null;
  setPropertiesView: (view: PropertiesView) => void;
  openPropertyDrawer: (id: string) => void;
  closePropertyDrawer: () => void;
  openPropertyForm: (id?: string) => void;
  closePropertyForm: () => void;

  selectedTenantId: string | null;
  tenantDrawerOpen: boolean;
  tenantFormOpen: boolean;
  editingTenantId: string | null;
  openTenantDrawer: (id: string) => void;
  closeTenantDrawer: () => void;
  openTenantForm: (id?: string) => void;
  closeTenantForm: () => void;

  selectedContractId: string | null;
  contractDrawerOpen: boolean;
  contractFormOpen: boolean;
  editingContractId: string | null;
  openContractDrawer: (id: string) => void;
  closeContractDrawer: () => void;
  openContractForm: (id?: string) => void;
  closeContractForm: () => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      sidebarOpen: true,
      sidebarCollapsed: false,
      mobileSidebarOpen: false,

      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
      setMobileSidebarOpen: (open) => set({ mobileSidebarOpen: open }),
      toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
      toggleSidebarCollapsed: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),

      propertiesView: "grid",
      selectedPropertyId: null,
      propertyDrawerOpen: false,
      propertyFormOpen: false,
      editingPropertyId: null,

      setPropertiesView: (view) => set({ propertiesView: view }),
      openPropertyDrawer: (id) => set({ selectedPropertyId: id, propertyDrawerOpen: true }),
      closePropertyDrawer: () => set({ propertyDrawerOpen: false, selectedPropertyId: null }),
      openPropertyForm: (id) =>
        set({ propertyFormOpen: true, editingPropertyId: id ?? null }),
      closePropertyForm: () => set({ propertyFormOpen: false, editingPropertyId: null }),

      selectedTenantId: null,
      tenantDrawerOpen: false,
      tenantFormOpen: false,
      editingTenantId: null,

      openTenantDrawer: (id) => set({ selectedTenantId: id, tenantDrawerOpen: true }),
      closeTenantDrawer: () => set({ tenantDrawerOpen: false, selectedTenantId: null }),
      openTenantForm: (id) => set({ tenantFormOpen: true, editingTenantId: id ?? null }),
      closeTenantForm: () => set({ tenantFormOpen: false, editingTenantId: null }),

      selectedContractId: null,
      contractDrawerOpen: false,
      contractFormOpen: false,
      editingContractId: null,

      openContractDrawer: (id) => set({ selectedContractId: id, contractDrawerOpen: true }),
      closeContractDrawer: () => set({ contractDrawerOpen: false, selectedContractId: null }),
      openContractForm: (id) => set({ contractFormOpen: true, editingContractId: id ?? null }),
      closeContractForm: () => set({ contractFormOpen: false, editingContractId: null }),
    }),
    {
      name: "rentflow-ui",
      partialize: (state) => ({
        sidebarCollapsed: state.sidebarCollapsed,
        propertiesView: state.propertiesView,
      }),
    }
  )
);
