"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { ShieldOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePermissions } from "@/hooks/use-permissions";
import type { Resource } from "@/lib/permissions";
import type { UserRole } from "@/types/auth";

interface RoleGuardProps {
  children: React.ReactNode;
  resource?: Resource;
  roles?: UserRole[];
  redirectTo?: string;
  showFallback?: boolean;
}

function AccessDenied({ onBack }: { onBack: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
        <ShieldOff className="h-8 w-8 text-destructive" />
      </div>
      <div>
        <h2 className="text-lg font-semibold">Acceso denegado</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          No tenés permisos para ver esta sección.
        </p>
      </div>
      <Button variant="outline" size="sm" onClick={onBack}>
        Volver al Panel
      </Button>
    </div>
  );
}

export function RoleGuard({
  children,
  resource,
  roles,
  redirectTo = "/dashboard",
  showFallback = false,
}: RoleGuardProps) {
  const router = useRouter();
  const { can, is } = usePermissions();

  let hasAccess = true;
  if (resource) hasAccess = can(resource, "view");
  if (roles?.length) hasAccess = hasAccess && is(...roles);

  useEffect(() => {
    if (!hasAccess && !showFallback) {
      router.replace(redirectTo);
    }
  }, [hasAccess, showFallback, router, redirectTo]);

  if (!hasAccess) {
    return showFallback ? (
      <AccessDenied onBack={() => router.replace("/dashboard")} />
    ) : null;
  }

  return <>{children}</>;
}
