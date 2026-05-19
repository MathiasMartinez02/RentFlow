import type { Metadata } from "next";
import { Wrench, Plus } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

export const metadata: Metadata = { title: "Mantenimiento" };

const MOCK_REQUESTS = [
  {
    id: "mnt-001",
    title: "Calefón sin funcionamiento",
    property: "Penthouse Costanera",
    priority: "high" as const,
    status: "open" as const,
    date: "2024-11-14",
  },
  {
    id: "mnt-002",
    title: "Falleba de ventana rota",
    property: "El Meridiano - Dpto. 4A",
    priority: "low" as const,
    status: "in_progress" as const,
    date: "2024-11-10",
  },
  {
    id: "mnt-003",
    title: "Aire acondicionado no enfría",
    property: "Alturas del Palermo - 2B",
    priority: "medium" as const,
    status: "open" as const,
    date: "2024-11-08",
  },
];

const PRIORITY_MAP = {
  urgent: { label: "Urgente", variant: "destructive" as const },
  high: { label: "Alta", variant: "destructive" as const },
  medium: { label: "Media", variant: "warning" as const },
  low: { label: "Baja", variant: "secondary" as const },
};

const STATUS_MAP = {
  open: { label: "Abierto", variant: "default" as const },
  in_progress: { label: "En curso", variant: "warning" as const },
  completed: { label: "Resuelto", variant: "success" as const },
  cancelled: { label: "Cancelado", variant: "secondary" as const },
};

export default function MaintenancePage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Mantenimiento"
        description={`${MOCK_REQUESTS.length} solicitudes abiertas`}
        action={
          <Button size="sm" className="gap-1.5">
            <Plus className="h-3.5 w-3.5" />
            Nueva Solicitud
          </Button>
        }
      />

      <div className="grid gap-3">
        {MOCK_REQUESTS.map((req) => (
          <Card
            key={req.id}
            className="group cursor-pointer transition-all duration-150 hover:border-border/70 hover:shadow-sm"
          >
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-orange-500/10">
                <Wrench className="h-4 w-4 text-orange-500" />
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                  {req.title}
                </p>
                <p className="truncate text-xs text-muted-foreground">{req.property}</p>
              </div>

              <div className="flex items-center gap-2">
                <Badge variant={PRIORITY_MAP[req.priority].variant}>
                  {PRIORITY_MAP[req.priority].label}
                </Badge>
                <Badge variant={STATUS_MAP[req.status].variant}>
                  {STATUS_MAP[req.status].label}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
