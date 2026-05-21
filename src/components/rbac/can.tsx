"use client";

import { usePermissions } from "@/hooks/use-permissions";
import type { Resource, Action } from "@/lib/permissions";
import type { UserRole } from "@/types/auth";

interface CanProps {
  resource?: Resource;
  action?: Action;
  roles?: UserRole[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function Can({ resource, action = "view", roles, children, fallback = null }: CanProps) {
  const { can: checkCan, is } = usePermissions();

  let allowed = true;
  if (resource) allowed = checkCan(resource, action);
  if (roles?.length) allowed = allowed && is(...roles);

  return allowed ? <>{children}</> : <>{fallback}</>;
}
