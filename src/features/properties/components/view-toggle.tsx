"use client";

import { LayoutGrid, List } from "lucide-react";
import { cn } from "@/lib/utils";

interface ViewToggleProps {
  view: "grid" | "table";
  onChange: (view: "grid" | "table") => void;
}

export function ViewToggle({ view, onChange }: ViewToggleProps) {
  return (
    <div className="flex h-8 items-center rounded-md border border-border bg-muted p-0.5">
      {(["grid", "table"] as const).map((v) => {
        const Icon = v === "grid" ? LayoutGrid : List;
        return (
          <button
            key={v}
            onClick={() => onChange(v)}
            className={cn(
              "flex h-7 w-7 items-center justify-center rounded-sm transition-all",
              view === v
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
            aria-label={v === "grid" ? "Vista en cuadrícula" : "Vista en tabla"}
          >
            <Icon className="h-3.5 w-3.5" />
          </button>
        );
      })}
    </div>
  );
}
