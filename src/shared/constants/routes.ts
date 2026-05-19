export const ROUTES = {
  DASHBOARD: "/dashboard",
  PROPERTIES: "/properties",
  PROPERTY_DETAIL: (id: string) => `/properties/${id}`,
  TENANTS: "/tenants",
  TENANT_DETAIL: (id: string) => `/tenants/${id}`,
  CONTRACTS: "/contracts",
  CONTRACT_DETAIL: (id: string) => `/contracts/${id}`,
  PAYMENTS: "/payments",
  MAINTENANCE: "/maintenance",
  SETTINGS: "/settings",
} as const;

export const BREADCRUMBS: Record<string, string> = {
  "/dashboard": "Panel",
  "/properties": "Propiedades",
  "/tenants": "Inquilinos",
  "/contracts": "Contratos",
  "/payments": "Pagos",
  "/maintenance": "Mantenimiento",
  "/settings": "Configuración",
};
