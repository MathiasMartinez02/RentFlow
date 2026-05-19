import type { Metadata } from "next";
import { ContractsView } from "@/features/contracts";

export const metadata: Metadata = { title: "Contratos" };

export default function ContractsPage() {
  return <ContractsView />;
}
