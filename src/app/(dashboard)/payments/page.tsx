import type { Metadata } from "next";
import { CreditCard, Plus } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/shared/utils/format";

export const metadata: Metadata = { title: "Pagos" };

const SUMMARY_CARDS = [
  { label: "Cobrado este mes", value: 44050, color: "text-success" },
  { label: "Pendiente de cobro", value: 4200, color: "text-warning" },
  { label: "Vencido", value: 0, color: "text-destructive" },
];

export default function PaymentsPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Pagos"
        description="Seguimiento de cobros y historial de pagos"
        action={
          <Button size="sm" className="gap-1.5">
            <Plus className="h-3.5 w-3.5" />
            Registrar Pago
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-3">
        {SUMMARY_CARDS.map((card) => (
          <Card key={card.label}>
            <CardContent className="p-5">
              <p className="text-xs text-muted-foreground">{card.label}</p>
              <p className={`mt-1 text-2xl font-bold ${card.color}`}>
                {formatCurrency(card.value)}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <EmptyState
        icon={CreditCard}
        title="Seguimiento de pagos próximamente"
        description="Recordatorios automáticos de cobro, recaudación online e informes financieros detallados están en desarrollo."
        action={
          <Button variant="outline" size="sm">
            Más información
          </Button>
        }
        className="mt-4"
      />
    </div>
  );
}
