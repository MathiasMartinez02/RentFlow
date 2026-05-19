import type { Metadata } from "next";
import { MaintenanceView } from "@/features/maintenance";

export const metadata: Metadata = { title: "Mantenimiento" };

export default function MaintenancePage() {
  return <MaintenanceView />;
}
