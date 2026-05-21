"use client";

import { useRouter } from "next/navigation";
import { ChevronUp, LogOut, User, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { getInitials } from "@/shared/utils/format";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuthStore } from "@/store/auth.store";

interface SidebarUserFooterProps {
  isCollapsed: boolean;
}

const ROLE_LABELS: Record<string, string> = {
  SUPER_ADMIN: "Super Administrador",
  ADMIN: "Administrador",
  CLIENTE: "Cliente",
  FINANZAS: "Finanzas",
  VENDEDOR: "Vendedor",
  MANTENIMIENTO: "Mantenimiento",
  INQUILINO: "Inquilino",
};

const ROLE_COLORS: Record<string, string> = {
  SUPER_ADMIN: "bg-violet-500/20 text-violet-500",
  ADMIN: "bg-primary/20 text-primary",
  CLIENTE: "bg-sky-500/20 text-sky-500",
  FINANZAS: "bg-emerald-500/20 text-emerald-500",
  VENDEDOR: "bg-amber-500/20 text-amber-500",
  MANTENIMIENTO: "bg-orange-500/20 text-orange-500",
  INQUILINO: "bg-slate-500/20 text-slate-400",
};

export function SidebarUserFooter({ isCollapsed }: SidebarUserFooterProps) {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  const firstName = user?.firstName ?? "Usuario";
  const lastName = user?.lastName ?? "";
  const email = user?.email ?? "";
  const role = user?.role ?? "";
  const roleLabel = ROLE_LABELS[role] ?? role;
  const avatarClass = ROLE_COLORS[role] ?? "bg-primary/20 text-primary";
  const initials = getInitials(firstName, lastName);

  const handleLogout = () => {
    logout();
    router.replace("/login");
  };

  return (
    <div className="border-t border-sidebar-border px-3 py-3">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            className={cn(
              "flex w-full items-center gap-2.5 rounded-md px-2 py-1.5",
              "text-left text-sm transition-colors",
              "hover:bg-sidebar-accent focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
              isCollapsed && "justify-center"
            )}
          >
            <div className={cn(
              "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold",
              avatarClass
            )}>
              {initials}
            </div>
            {!isCollapsed && (
              <>
                <div className="flex min-w-0 flex-1 flex-col">
                  <span className="truncate text-xs font-medium text-sidebar-foreground">
                    {firstName} {lastName}
                  </span>
                  <span className="truncate text-[11px] text-sidebar-foreground/50">
                    {roleLabel}
                  </span>
                </div>
                <ChevronUp className="h-3.5 w-3.5 shrink-0 text-sidebar-foreground/40" />
              </>
            )}
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" side="top" className="w-52" sideOffset={8}>
          <div className="px-2 py-1.5">
            <p className="text-sm font-medium">{firstName} {lastName}</p>
            <p className="truncate text-xs text-muted-foreground">{email}</p>
            {roleLabel && (
              <span className={cn(
                "mt-1 inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium",
                avatarClass
              )}>
                {roleLabel}
              </span>
            )}
          </div>
          <DropdownMenuSeparator />
          <DropdownMenuItem>
            <User className="mr-2 h-4 w-4" />
            Perfil
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Settings className="mr-2 h-4 w-4" />
            Configuración
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="text-destructive focus:text-destructive"
            onClick={handleLogout}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Cerrar sesión
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
