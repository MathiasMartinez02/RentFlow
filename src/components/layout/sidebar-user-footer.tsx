"use client";

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

const MOCK_USER = {
  firstName: "Alex",
  lastName: "Rivera",
  email: "alex.rivera@rentflow.io",
  role: "Propietario",
};

interface SidebarUserFooterProps {
  isCollapsed: boolean;
}

export function SidebarUserFooter({ isCollapsed }: SidebarUserFooterProps) {
  const initials = getInitials(MOCK_USER.firstName, MOCK_USER.lastName);

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
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/20 text-xs font-semibold text-primary">
              {initials}
            </div>
            {!isCollapsed && (
              <>
                <div className="flex min-w-0 flex-1 flex-col">
                  <span className="truncate text-xs font-medium text-sidebar-foreground">
                    {MOCK_USER.firstName} {MOCK_USER.lastName}
                  </span>
                  <span className="truncate text-[11px] text-sidebar-foreground/50">
                    {MOCK_USER.role}
                  </span>
                </div>
                <ChevronUp className="h-3.5 w-3.5 shrink-0 text-sidebar-foreground/40" />
              </>
            )}
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" side="top" className="w-48" sideOffset={8}>
          <div className="px-2 py-1.5">
            <p className="text-sm font-medium">{MOCK_USER.firstName} {MOCK_USER.lastName}</p>
            <p className="truncate text-xs text-muted-foreground">{MOCK_USER.email}</p>
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
          <DropdownMenuItem className="text-destructive focus:text-destructive">
            <LogOut className="mr-2 h-4 w-4" />
            Cerrar sesión
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
