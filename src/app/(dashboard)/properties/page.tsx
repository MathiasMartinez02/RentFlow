import type { Metadata } from "next";
import { PropertiesView } from "@/features/properties";

export const metadata: Metadata = { title: "Propiedades" };

export default function PropertiesPage() {
  return <PropertiesView />;
}
