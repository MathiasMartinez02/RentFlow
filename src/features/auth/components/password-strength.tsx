"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils";

interface PasswordStrengthProps {
  password: string;
}

function getStrength(password: string): {
  score: number;
  label: string;
  color: string;
  barColor: string;
} {
  if (!password) return { score: 0, label: "", color: "", barColor: "" };

  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score <= 1) return { score: 1, label: "Muy débil", color: "text-destructive", barColor: "bg-destructive" };
  if (score === 2) return { score: 2, label: "Débil", color: "text-orange-500", barColor: "bg-orange-500" };
  if (score === 3) return { score: 3, label: "Regular", color: "text-warning", barColor: "bg-warning" };
  if (score === 4) return { score: 4, label: "Buena", color: "text-primary", barColor: "bg-primary" };
  return { score: 5, label: "Muy fuerte", color: "text-success", barColor: "bg-success" };
}

export function PasswordStrength({ password }: PasswordStrengthProps) {
  const strength = useMemo(() => getStrength(password), [password]);

  if (!password) return null;

  return (
    <div className="mt-2 space-y-1.5">
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((level) => (
          <div
            key={level}
            className={cn(
              "h-1 flex-1 rounded-full transition-all duration-300",
              level <= strength.score ? strength.barColor : "bg-muted"
            )}
          />
        ))}
      </div>
      <p className={cn("text-[11px] font-medium", strength.color)}>
        {strength.label}
      </p>
    </div>
  );
}
