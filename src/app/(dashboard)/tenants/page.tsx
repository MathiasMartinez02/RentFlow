import type { Metadata } from "next";
import { TenantsView } from "@/features/tenants";

export const metadata: Metadata = { title: "Inquilinos" };

export default function TenantsPage() {
  return <TenantsView />;
}
