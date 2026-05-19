"use client";

import * as React from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");
    return (
      <label
        htmlFor={inputId}
        className="flex cursor-pointer items-center gap-2 select-none group"
      >
        <div className="relative flex h-4 w-4 shrink-0 items-center justify-center">
          <input
            id={inputId}
            type="checkbox"
            ref={ref}
            className="peer sr-only"
            {...props}
          />
          <div
            className={cn(
              "h-4 w-4 rounded border border-input bg-transparent transition-all",
              "peer-checked:bg-primary peer-checked:border-primary",
              "peer-focus-visible:ring-1 peer-focus-visible:ring-ring",
              "group-hover:border-primary/60",
              className
            )}
          />
          <Check className="pointer-events-none absolute h-2.5 w-2.5 text-primary-foreground opacity-0 peer-checked:opacity-100 transition-opacity" />
        </div>
        {label && (
          <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
            {label}
          </span>
        )}
      </label>
    );
  }
);
Checkbox.displayName = "Checkbox";

export { Checkbox };
