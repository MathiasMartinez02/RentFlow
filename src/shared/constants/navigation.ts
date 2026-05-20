export interface NavItem {
  label: string;
  href: string;
  icon: string;
  badge?: number;
  description?: string;
}

export interface NavGroup {
  label?: string;
  items: NavItem[];
}

export const NAV_GROUPS: NavGroup[] = [
  {
    items: [
      {
        label: "Panel",
        href: "/dashboard",
        icon: "LayoutDashboard",
        description: "Resumen y métricas",
      },
    ],
  },
  {
    label: "Gestión",
    items: [
      {
        label: "Propiedades",
        href: "/properties",
        icon: "Building2",
        description: "Administrá tus propiedades",
      },
      {
        label: "Inquilinos",
        href: "/tenants",
        icon: "Users",
        description: "Gestioná inquilinos",
      },
      {
        label: "Contratos",
        href: "/contracts",
        icon: "FileText",
        description: "Contratos de alquiler",
      },
    ],
  },
  {
    label: "Finanzas",
    items: [
      {
        label: "Pagos",
        href: "/payments",
        icon: "CreditCard",
        description: "Cobro de alquileres",
      },
    ],
  },
  {
    label: "Operaciones",
    items: [
      {
        label: "Mantenimiento",
        href: "/maintenance",
        icon: "Wrench",
        description: "Solicitudes de reparación",
      },
      {
        label: "Actividad",
        href: "/actividad",
        icon: "Activity",
        description: "Historial global de eventos",
      },
    ],
  },
];

export const BOTTOM_NAV_ITEMS: NavItem[] = [
  {
    label: "Configuración",
    href: "/settings",
    icon: "Settings",
    description: "Ajustes de la cuenta",
  },
];
