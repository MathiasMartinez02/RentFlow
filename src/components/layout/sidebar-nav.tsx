"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Building2,
  Users,
  FileText,
  CreditCard,
  Wrench,
  Settings,
  Activity,
  type LucideProps,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { NAV_GROUPS, BOTTOM_NAV_ITEMS } from "@/shared/constants/navigation";
import type { NavItem } from "@/shared/constants/navigation";

const ICON_MAP: Record<string, React.ComponentType<LucideProps>> = {
  LayoutDashboard,
  Building2,
  Users,
  FileText,
  CreditCard,
  Wrench,
  Settings,
  Activity,
};

interface NavItemProps {
  item: NavItem;
  isCollapsed: boolean;
  isActive: boolean;
}

function SidebarNavItem({ item, isCollapsed, isActive }: NavItemProps) {
  const Icon = ICON_MAP[item.icon];

  return (
    <Link
      href={item.href}
      className={cn(
        "group relative flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-all duration-150",
        "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
        isActive
          ? "bg-sidebar-accent text-sidebar-accent-foreground"
          : "text-sidebar-foreground/70",
        isCollapsed && "justify-center px-2"
      )}
      title={isCollapsed ? item.label : undefined}
    >
      {isActive && (
        <span className="absolute inset-y-1 left-0 w-0.5 rounded-full bg-sidebar-primary" />
      )}
      {Icon && (
        <Icon
          className={cn(
            "shrink-0 transition-colors",
            isActive ? "text-sidebar-primary" : "text-sidebar-foreground/50 group-hover:text-sidebar-foreground/80",
            isCollapsed ? "h-5 w-5" : "h-4 w-4"
          )}
        />
      )}
      {!isCollapsed && (
        <span className="truncate">{item.label}</span>
      )}
      {!isCollapsed && item.badge !== undefined && item.badge > 0 && (
        <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-sidebar-primary px-1 text-[10px] font-semibold text-sidebar-primary-foreground">
          {item.badge}
        </span>
      )}
    </Link>
  );
}

interface SidebarNavProps {
  isCollapsed: boolean;
}

export function SidebarNav({ isCollapsed }: SidebarNavProps) {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard" || pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <div className="flex flex-1 flex-col gap-1 overflow-y-auto px-3 py-2">
      {NAV_GROUPS.map((group, groupIdx) => (
        <div key={groupIdx} className={cn("flex flex-col gap-0.5", groupIdx > 0 && "mt-4")}>
          {group.label && !isCollapsed && (
            <p className="mb-1 px-3 text-[11px] font-semibold uppercase tracking-wider text-sidebar-foreground/30">
              {group.label}
            </p>
          )}
          {isCollapsed && group.label && (
            <div className="my-1 h-px bg-sidebar-border" />
          )}
          {group.items.map((item) => (
            <SidebarNavItem
              key={item.href}
              item={item}
              isCollapsed={isCollapsed}
              isActive={isActive(item.href)}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

export function SidebarBottomNav({ isCollapsed }: SidebarNavProps) {
  const pathname = usePathname();

  return (
    <div className="px-3 pb-3 pt-2">
      <div className="h-px bg-sidebar-border mb-2" />
      {BOTTOM_NAV_ITEMS.map((item) => {
        const Icon = ICON_MAP[item.icon];
        const active = pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "group flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-all",
              "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
              active ? "text-sidebar-accent-foreground" : "text-sidebar-foreground/60",
              isCollapsed && "justify-center px-2"
            )}
            title={isCollapsed ? item.label : undefined}
          >
            {Icon && (
              <Icon className={cn("shrink-0", isCollapsed ? "h-5 w-5" : "h-4 w-4")} />
            )}
            {!isCollapsed && <span>{item.label}</span>}
          </Link>
        );
      })}
    </div>
  );
}
