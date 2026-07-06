import type { Metadata } from "next";
import { LeadsView } from "@/features/leads";

export const metadata: Metadata = { title: "Leads" };

// Página del CRM de leads dentro del dashboard
export default function LeadsPage() {
  return <LeadsView />;
}
