import { useAuthStore } from "@/store/auth.store";
import { can, type Resource, type Action } from "@/lib/permissions";
import type { UserRole } from "@/types/auth";

const DEFAULT_ROLE: UserRole = "INQUILINO";

export function usePermissions() {
  const user = useAuthStore((s) => s.user);
  const role = (user?.role ?? DEFAULT_ROLE) as UserRole;

  return {
    role,
    user,
    can: (resource: Resource, action: Action) => can(role, resource, action),
    canView: (resource: Resource) => can(role, resource, "view"),
    canCreate: (resource: Resource) => can(role, resource, "create"),
    canEdit: (resource: Resource) => can(role, resource, "edit"),
    canDelete: (resource: Resource) => can(role, resource, "delete"),
    is: (...roles: UserRole[]) => roles.includes(role),
    isAdmin: () => ["SUPER_ADMIN", "ADMIN", "CLIENTE"].includes(role),
  };
}
