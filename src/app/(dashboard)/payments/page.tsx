import type { Metadata } from "next";
import { PaymentsView } from "@/features/payments";

export const metadata: Metadata = { title: "Pagos" };

export default function PaymentsPage() {
  return <PaymentsView/>;
}
