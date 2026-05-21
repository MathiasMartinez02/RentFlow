import type { Resource } from "@/lib/permissions";

export interface NavItem {
  label: string;
  href: string;
  icon: string;
  badge?: number;
  description?: string;
  resource?: Resource;
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
        resource: "dashboard",
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
        resource: "properties",
        description: "Administrá tus propiedades",
      },
      {
        label: "Inquilinos",
        href: "/tenants",
        icon: "Users",
        resource: "tenants",
        description: "Gestioná inquilinos",
      },
      {
        label: "Contratos",
        href: "/contracts",
        icon: "FileText",
        resource: "contracts",
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
        resource: "payments",
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
        resource: "maintenance",
        description: "Solicitudes de reparación",
      },
      {
        label: "Actividad",
        href: "/actividad",
        icon: "Activity",
        resource: "activity",
        description: "Historial global de eventos",
      },
    ],
  },
  {
    label: "Sistema",
    items: [
      {
        label: "Usuarios",
        href: "/users",
        icon: "UserCog",
        resource: "users",
        description: "Gestión de usuarios y roles",
      },
    ],
  },
];

export const BOTTOM_NAV_ITEMS: NavItem[] = [
  {
    label: "Configuración",
    href: "/settings",
    icon: "Settings",
    resource: "settings",
    description: "Ajustes de la cuenta",
  },
];
