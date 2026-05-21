"use client";

import { useState, useEffect, useCallback } from "react";
import { UserCog, RefreshCw, Shield, CheckCircle2, XCircle, MoreHorizontal, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { RoleGuard } from "@/components/rbac/role-guard";
import { useAuthStore } from "@/store/auth.store";
import { usersService } from "@/services/users.service";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { getInitials, formatDate } from "@/shared/utils/format";
import type { OrgUser } from "@/types/user";
import type { UserRole } from "@/types/auth";

const ROLE_LABELS: Record<UserRole, string> = {
  SUPER_ADMIN: "Super Admin",
  ADMIN: "Administrador",
  CLIENTE: "Cliente",
  FINANZAS: "Finanzas",
  VENDEDOR: "Vendedor",
  MANTENIMIENTO: "Mantenimiento",
  INQUILINO: "Inquilino",
};

const ROLE_COLORS: Record<UserRole, string> = {
  SUPER_ADMIN: "bg-violet-500/15 text-violet-500 border-violet-500/20",
  ADMIN: "bg-primary/15 text-primary border-primary/20",
  CLIENTE: "bg-sky-500/15 text-sky-500 border-sky-500/20",
  FINANZAS: "bg-emerald-500/15 text-emerald-500 border-emerald-500/20",
  VENDEDOR: "bg-amber-500/15 text-amber-500 border-amber-500/20",
  MANTENIMIENTO: "bg-orange-500/15 text-orange-500 border-orange-500/20",
  INQUILINO: "bg-slate-500/15 text-slate-400 border-slate-500/20",
};

const ASSIGNABLE_ROLES: UserRole[] = ["FINANZAS", "VENDEDOR", "MANTENIMIENTO", "INQUILINO", "ADMIN", "CLIENTE"];

function UserRowSkeleton() {
  return (
    <tr className="border-b border-border">
      {Array.from({ length: 5 }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <Skeleton className="h-4 w-full" />
        </td>
      ))}
    </tr>
  );
}

interface ChangeRoleDialogProps {
  user: OrgUser | null;
  onConfirm: (role: UserRole) => Promise<void>;
  onClose: () => void;
  isMutating: boolean;
}

function ChangeRoleDialog({ user, onConfirm, onClose, isMutating }: ChangeRoleDialogProps) {
  const [selectedRole, setSelectedRole] = useState<UserRole>(user?.role ?? "INQUILINO");

  useEffect(() => {
    if (user) setSelectedRole(user.role);
  }, [user]);

  return (
    <Dialog open={!!user} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Cambiar Rol</DialogTitle>
        </DialogHeader>
        <div className="py-2 space-y-3">
          <p className="text-sm text-muted-foreground">
            Usuario: <span className="font-medium text-foreground">{user?.firstName} {user?.lastName}</span>
          </p>
          <div>
            <Select value={selectedRole} onValueChange={(v) => setSelectedRole(v as UserRole)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ASSIGNABLE_ROLES.map((role) => (
                  <SelectItem key={role} value={role}>{ROLE_LABELS[role]}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isMutating}>Cancelar</Button>
          <Button onClick={() => onConfirm(selectedRole)} disabled={isMutating || selectedRole === user?.role}>
            Guardar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function UsersView() {
  const currentUser = useAuthStore((s) => s.user);
  const [users, setUsers] = useState<OrgUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isMutating, setIsMutating] = useState(false);
  const [changingRoleUser, setChangingRoleUser] = useState<OrgUser | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await usersService.getAll();
      setUsers(data);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleChangeRole = async (role: UserRole) => {
    if (!changingRoleUser) return;
    setIsMutating(true);
    try {
      await usersService.changeRole(changingRoleUser.id, role, {
        organizationId: currentUser?.id,
      });
      setUsers((prev) =>
        prev.map((u) => u.id === changingRoleUser.id ? { ...u, role } : u)
      );
      setChangingRoleUser(null);
    } finally {
      setIsMutating(false);
    }
  };

  const handleToggleActive = async (user: OrgUser) => {
    setIsMutating(true);
    try {
      if (user.isActive) {
        await usersService.deactivate(user.id);
      } else {
        await usersService.activate(user.id);
      }
      setUsers((prev) =>
        prev.map((u) => u.id === user.id ? { ...u, isActive: !u.isActive } : u)
      );
    } finally {
      setIsMutating(false);
    }
  };

  const activeCount = users.filter((u) => u.isActive).length;
  const description = isLoading
    ? "Cargando usuarios..."
    : `${users.length} usuarios · ${activeCount} activos`;

  return (
    <RoleGuard resource="users" showFallback>
      <div className="flex flex-col gap-6">
        <PageHeader
          title="Usuarios"
          description={description}
          action={
            <Button
              variant="outline"
              size="sm"
              onClick={load}
              disabled={isLoading}
              className="gap-1.5"
            >
              <RefreshCw className={cn("h-3.5 w-3.5", isLoading && "animate-spin")} />
              Actualizar
            </Button>
          }
        />

        {!isLoading && users.length === 0 ? (
          <EmptyState
            icon={UserCog}
            title="Sin usuarios registrados"
            description="No hay usuarios en tu organización todavía."
            className="mt-4"
          />
        ) : (
          <div className="rounded-xl border border-border overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Usuario</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Rol</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Estado</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Registrado</th>
                  <th className="px-4 py-3 text-right font-medium text-muted-foreground">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {isLoading
                  ? Array.from({ length: 5 }).map((_, i) => <UserRowSkeleton key={i} />)
                  : users.map((user) => (
                      <tr
                        key={user.id}
                        className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors"
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className={cn(
                              "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold",
                              ROLE_COLORS[user.role]
                            )}>
                              {getInitials(user.firstName, user.lastName)}
                            </div>
                            <div>
                              <p className="font-medium leading-tight">
                                {user.firstName} {user.lastName}
                                {user.id === currentUser?.id && (
                                  <span className="ml-1.5 text-xs text-muted-foreground">(vos)</span>
                                )}
                              </p>
                              <p className="text-xs text-muted-foreground">{user.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <Badge
                            variant="outline"
                            className={cn("text-xs", ROLE_COLORS[user.role])}
                          >
                            <Shield className="mr-1 h-3 w-3" />
                            {ROLE_LABELS[user.role]}
                          </Badge>
                        </td>
                        <td className="px-4 py-3">
                          {user.isActive ? (
                            <span className="inline-flex items-center gap-1 text-xs text-emerald-500">
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              Activo
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                              <XCircle className="h-3.5 w-3.5" />
                              Inactivo
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground text-xs">
                          {formatDate(user.createdAt)}
                        </td>
                        <td className="px-4 py-3 text-right">
                          {user.id !== currentUser?.id && (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => setChangingRoleUser(user)}>
                                  <Shield className="mr-2 h-3.5 w-3.5" />
                                  Cambiar rol
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() => handleToggleActive(user)}
                                  className={user.isActive ? "text-destructive focus:text-destructive" : "text-emerald-500 focus:text-emerald-500"}
                                >
                                  {user.isActive ? (
                                    <><XCircle className="mr-2 h-3.5 w-3.5" />Desactivar</>
                                  ) : (
                                    <><CheckCircle2 className="mr-2 h-3.5 w-3.5" />Activar</>
                                  )}
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          )}
                        </td>
                      </tr>
                    ))
                }
              </tbody>
            </table>
          </div>
        )}
      </div>

      <ChangeRoleDialog
        user={changingRoleUser}
        onConfirm={handleChangeRole}
        onClose={() => setChangingRoleUser(null)}
        isMutating={isMutating}
      />
    </RoleGuard>
  );
}
