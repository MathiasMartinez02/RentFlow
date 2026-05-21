import type { Metadata } from "next";
import { DashboardRouter } from "@/features/dashboard/dashboard-router";

export const metadata: Metadata = {
  title: "Panel",
};

export default function DashboardPage() {
  return <DashboardRouter />;
}
