import type { Metadata } from "next";
import { User, Bell, Shield, Building2, CreditCard } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export const metadata: Metadata = { title: "Configuración" };

const SETTINGS_SECTIONS = [
  {
    icon: User,
    title: "Perfil",
    description: "Tu información personal y preferencias",
    color: "bg-primary/10 text-primary",
  },
  {
    icon: Building2,
    title: "Organización",
    description: "Datos de la empresa e información de facturación",
    color: "bg-blue-500/10 text-blue-500",
  },
  {
    icon: Bell,
    title: "Notificaciones",
    description: "Preferencias de correo y notificaciones push",
    color: "bg-success/10 text-success",
  },
  {
    icon: Shield,
    title: "Seguridad",
    description: "Contraseña, 2FA y gestión de sesiones",
    color: "bg-warning/10 text-warning",
  },
  {
    icon: CreditCard,
    title: "Facturación",
    description: "Plan de suscripción y métodos de pago",
    color: "bg-violet-500/10 text-violet-500",
  },
];

export default function SettingsPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Configuración"
        description="Administrá tu cuenta y preferencias de la aplicación"
      />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {SETTINGS_SECTIONS.map((section) => {
          const Icon = section.icon;
          return (
            <Card
              key={section.title}
              className="group cursor-pointer transition-all duration-150 hover:border-border/70 hover:shadow-sm"
            >
              <CardContent className="flex items-start gap-3 p-5">
                <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${section.color}`}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                    {section.title}
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{section.description}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Plan Actual</CardTitle>
          <CardDescription>Estás en el plan Profesional</CardDescription>
        </CardHeader>
        <Separator />
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-foreground">Profesional</p>
              <p className="text-xs text-muted-foreground">Hasta 50 propiedades · Inquilinos ilimitados · Soporte prioritario</p>
            </div>
            <Button variant="outline" size="sm">Mejorar Plan</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
