"use client";

import { usePermissions } from "@/hooks/use-permissions";
import { DashboardView } from "./index";
import { FinanzasDashboard } from "./views/finanzas-dashboard";
import { MantenimientoDashboard } from "./views/mantenimiento-dashboard";
import { InquilinoDashboard } from "./views/inquilino-dashboard";

export function DashboardRouter() {
  const { role } = usePermissions();

  switch (role) {
    case "FINANZAS":
      return <FinanzasDashboard />;
    case "MANTENIMIENTO":
      return <MantenimientoDashboard />;
    case "INQUILINO":
      return <InquilinoDashboard />;
    default:
      return <DashboardView />;
  }
}
