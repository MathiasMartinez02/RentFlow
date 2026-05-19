"use client";

import { Bell, Menu, Search, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useSidebar } from "@/hooks/use-sidebar";
import { useMounted } from "@/hooks/use-mounted";
import { Breadcrumbs } from "./breadcrumbs";
import { cn } from "@/lib/utils";

export function Navbar() {
  const { openMobile } = useSidebar();
  const { theme, setTheme } = useTheme();
  const mounted = useMounted();

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b border-border bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60 md:px-6">
      {/* Mobile menu button */}
      <button
        onClick={openMobile}
        className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground lg:hidden"
        aria-label="Abrir menú"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Breadcrumbs */}
      <div className="flex-1">
        <Breadcrumbs />
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-1">
        {/* Search */}
        <button
          className={cn(
            "flex items-center gap-2 rounded-md px-2.5 py-1.5",
            "text-sm text-muted-foreground transition-colors",
            "hover:bg-accent hover:text-foreground",
            "hidden sm:flex"
          )}
          aria-label="Buscar"
        >
          <Search className="h-4 w-4" />
          <span className="text-xs">Buscar...</span>
          <kbd className="ml-1 hidden rounded border border-border bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground md:inline-block">
            ⌘K
          </kbd>
        </button>

        {/* Notifications */}
        <button
          className="relative rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          aria-label="Notificaciones"
        >
          <Bell className="h-4 w-4" />
          <span className="absolute right-1 top-1 flex h-2 w-2 items-center justify-center rounded-full bg-primary">
            <span className="absolute h-full w-full animate-ping rounded-full bg-primary opacity-75" />
          </span>
        </button>

        {/* Theme toggle */}
        {mounted && (
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            aria-label="Cambiar tema"
          >
            {theme === "dark" ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
          </button>
        )}
      </div>
    </header>
  );
}
