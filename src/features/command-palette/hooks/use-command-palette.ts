"use client";

import { useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Building2, Users, FileText, CreditCard, Wrench,
  LayoutDashboard, Settings, Clock,
} from "lucide-react";
import type { CommandGroup, CommandItem, CommandItemType } from "../types";
import { runSearch } from "../services/search.service";
import { useCommandPaletteStore } from "../store/command-palette.store";
import { useUIStore } from "@/store/ui.store";

/* ─── Constants ──────────────────────────────────────────────────── */

const ENTITY_ICONS: Record<string, CommandItem["icon"]> = {
  property:    Building2,
  tenant:      Users,
  contract:    FileText,
  payment:     CreditCard,
  maintenance: Wrench,
};

const ENTITY_LABELS: Record<string, string> = {
  property:    "Propiedades",
  tenant:      "Inquilinos",
  contract:    "Contratos",
  payment:     "Pagos",
  maintenance: "Mantenimiento",
};

const ENTITY_PATHS: Record<string, string> = {
  property:    "/properties",
  tenant:      "/tenants",
  contract:    "/contracts",
  payment:     "/payments",
  maintenance: "/maintenance",
};

/* ─── Hook ───────────────────────────────────────────────────────── */

export function useCommandPaletteItems(query: string): CommandGroup[] {
  const router = useRouter();
  const { close, pushRecentItem, recentItems } = useCommandPaletteStore();
  const {
    openPropertyDrawer,  openPropertyForm,
    openTenantDrawer,    openTenantForm,
    openContractDrawer,  openContractForm,
    openPaymentDrawer,   openPaymentForm,
    openMaintenanceDrawer, openMaintenanceForm,
  } = useUIStore();

  /* ─── Stable handlers ──────────────────────────────────────────── */

  const goTo = useCallback(
    (path: string) => {
      router.push(path);
      close();
    },
    [router, close]
  );

  // Opens the entity drawer then navigates to its page
  const selectEntity = useCallback(
    (
      type: string,
      id: string,
      label: string,
      sublabel: string | undefined,
      openDrawer: () => void
    ) => {
      openDrawer();
      pushRecentItem({ type, id, label, sublabel });
      router.push(ENTITY_PATHS[type] ?? "/dashboard");
      close();
    },
    [router, close, pushRecentItem]
  );

  /* ─── Drawer opener map ─────────────────────────────────────────── */

  const drawerOpeners: Record<string, (id: string) => void> = useMemo(
    () => ({
      property:    (id) => openPropertyDrawer(id),
      tenant:      (id) => openTenantDrawer(id),
      contract:    (id) => openContractDrawer(id),
      payment:     (id) => openPaymentDrawer(id),
      maintenance: (id) => openMaintenanceDrawer(id),
    }),
    [openPropertyDrawer, openTenantDrawer, openContractDrawer, openPaymentDrawer, openMaintenanceDrawer]
  );

  /* ─── Groups computation ────────────────────────────────────────── */

  const groups = useMemo((): CommandGroup[] => {
    const trimmed = query.trim();
    const results = runSearch(trimmed);
    const hasAnyResult = Object.values(results).some((arr) => arr.length > 0);

    /* ── Search mode ── */
    if (trimmed) {
      if (!hasAnyResult) return [];

      const entityTypes = ["property", "tenant", "contract", "payment", "maintenance"] as const;
      return entityTypes
        .filter((type) => results[type].length > 0)
        .map((type) => ({
          id: type,
          label: ENTITY_LABELS[type],
          items: results[type].map((hit) => ({
            id: `${type}-${hit.id}`,
            type: type as CommandItemType,
            label: hit.label,
            sublabel: hit.sublabel,
            icon: ENTITY_ICONS[type],
            badge: hit.badge,
            onSelect: () =>
              selectEntity(type, hit.id, hit.label, hit.sublabel, () =>
                drawerOpeners[type]?.(hit.id)
              ),
          })),
        }));
    }

    /* ── Default mode: recents + actions + navigation ── */
    const groupsList: CommandGroup[] = [];

    // Recents
    if (recentItems.length > 0) {
      groupsList.push({
        id: "recent",
        label: "Recientes",
        items: recentItems.slice(0, 6).map((item) => ({
          id: `recent-${item.type}-${item.id}`,
          type: item.type as CommandItemType,
          label: item.label,
          sublabel: item.sublabel,
          icon: ENTITY_ICONS[item.type] ?? Clock,
          onSelect: () =>
            selectEntity(item.type, item.id, item.label, item.sublabel, () =>
              drawerOpeners[item.type]?.(item.id)
            ),
        })),
      });
    }

    // Quick actions
    groupsList.push({
      id: "actions",
      label: "Acciones rápidas",
      items: [
        {
          id: "action-new-property",
          type: "action",
          label: "Nueva propiedad",
          sublabel: "Agregar una propiedad a tu cartera",
          icon: Building2,
          shortcut: ["N", "P"],
          onSelect: () => { openPropertyForm(); goTo("/properties"); },
        },
        {
          id: "action-new-tenant",
          type: "action",
          label: "Nuevo inquilino",
          sublabel: "Registrar un nuevo inquilino",
          icon: Users,
          shortcut: ["N", "I"],
          onSelect: () => { openTenantForm(); goTo("/tenants"); },
        },
        {
          id: "action-new-contract",
          type: "action",
          label: "Nuevo contrato",
          sublabel: "Crear un contrato de alquiler",
          icon: FileText,
          shortcut: ["N", "C"],
          onSelect: () => { openContractForm(); goTo("/contracts"); },
        },
        {
          id: "action-register-payment",
          type: "action",
          label: "Registrar pago",
          sublabel: "Registrar un cobro recibido",
          icon: CreditCard,
          shortcut: ["N", "G"],
          onSelect: () => { openPaymentForm(); goTo("/payments"); },
        },
        {
          id: "action-new-maintenance",
          type: "action",
          label: "Nuevo ticket de mantenimiento",
          sublabel: "Reportar un problema o solicitud",
          icon: Wrench,
          shortcut: ["N", "M"],
          onSelect: () => { openMaintenanceForm(); goTo("/maintenance"); },
        },
      ],
    });

    // Navigation
    groupsList.push({
      id: "navigation",
      label: "Navegación",
      items: [
        {
          id: "nav-dashboard",
          type: "navigation",
          label: "Dashboard",
          sublabel: "Resumen y métricas generales",
          icon: LayoutDashboard,
          shortcut: ["G", "D"],
          onSelect: () => goTo("/dashboard"),
        },
        {
          id: "nav-properties",
          type: "navigation",
          label: "Propiedades",
          sublabel: "Tu cartera de propiedades",
          icon: Building2,
          shortcut: ["G", "P"],
          onSelect: () => goTo("/properties"),
        },
        {
          id: "nav-tenants",
          type: "navigation",
          label: "Inquilinos",
          sublabel: "Gestionar inquilinos y contratos",
          icon: Users,
          shortcut: ["G", "I"],
          onSelect: () => goTo("/tenants"),
        },
        {
          id: "nav-contracts",
          type: "navigation",
          label: "Contratos",
          sublabel: "Contratos activos y vencidos",
          icon: FileText,
          shortcut: ["G", "C"],
          onSelect: () => goTo("/contracts"),
        },
        {
          id: "nav-payments",
          type: "navigation",
          label: "Pagos",
          sublabel: "Historial y gestión de cobros",
          icon: CreditCard,
          shortcut: ["G", "G"],
          onSelect: () => goTo("/payments"),
        },
        {
          id: "nav-maintenance",
          type: "navigation",
          label: "Mantenimiento",
          sublabel: "Tickets y órdenes de trabajo",
          icon: Wrench,
          shortcut: ["G", "M"],
          onSelect: () => goTo("/maintenance"),
        },
        {
          id: "nav-settings",
          type: "navigation",
          label: "Configuración",
          sublabel: "Ajustes de cuenta y preferencias",
          icon: Settings,
          onSelect: () => goTo("/settings"),
        },
      ],
    });

    return groupsList;
  }, [
    query,
    recentItems,
    goTo,
    selectEntity,
    drawerOpeners,
    openPropertyForm,
    openTenantForm,
    openContractForm,
    openPaymentForm,
    openMaintenanceForm,
  ]);

  return groups;
}
