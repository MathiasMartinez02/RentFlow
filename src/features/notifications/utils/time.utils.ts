/* Fixed "now" for demo consistency — all relative times are computed from this */
export const DEMO_NOW = new Date("2026-05-19T18:00:00Z");

export function timeAgo(dateStr: string): string {
  const past = new Date(dateStr);
  const diffMs = DEMO_NOW.getTime() - past.getTime();

  if (diffMs < 0) return "ahora mismo";

  const minutes = Math.floor(diffMs / 60_000);
  const hours = Math.floor(diffMs / 3_600_000);
  const days = Math.floor(diffMs / 86_400_000);
  const weeks = Math.floor(diffMs / 604_800_000);
  const months = Math.floor(diffMs / 2_592_000_000);

  if (minutes < 1) return "ahora mismo";
  if (minutes < 60) return `hace ${minutes} minuto${minutes !== 1 ? "s" : ""}`;
  if (hours < 24) return `hace ${hours} hora${hours !== 1 ? "s" : ""}`;
  if (days === 1) return "ayer";
  if (days < 7) return `hace ${days} días`;
  if (weeks === 1) return "hace 1 semana";
  if (weeks < 4) return `hace ${weeks} semanas`;
  if (months === 1) return "hace 1 mes";
  return `hace ${months} meses`;
}

export function formatFullDate(dateStr: string): string {
  return new Intl.DateTimeFormat("es-AR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(dateStr));
}

export function formatShortDate(dateStr: string): string {
  return new Intl.DateTimeFormat("es-AR", {
    day: "numeric",
    month: "short",
  }).format(new Date(dateStr));
}

export function getDateKey(dateStr: string): string {
  return new Date(dateStr).toISOString().split("T")[0];
}

function getDayMidnight(date: Date): Date {
  const d = new Date(date);
  d.setUTCHours(0, 0, 0, 0);
  return d;
}

export function formatDateGroupLabel(dateStr: string): string {
  const date = getDayMidnight(new Date(dateStr));
  const today = getDayMidnight(DEMO_NOW);
  const yesterday = new Date(today);
  yesterday.setUTCDate(yesterday.getUTCDate() - 1);

  if (date.getTime() === today.getTime()) return "Hoy";
  if (date.getTime() === yesterday.getTime()) return "Ayer";

  const diffDays = Math.floor((today.getTime() - date.getTime()) / 86_400_000);
  if (diffDays < 7) {
    return new Intl.DateTimeFormat("es-AR", { weekday: "long", day: "numeric", month: "long" }).format(
      new Date(dateStr)
    );
  }
  return new Intl.DateTimeFormat("es-AR", { day: "numeric", month: "long", year: "numeric" }).format(
    new Date(dateStr)
  );
}

export interface DateGroup<T> {
  label: string;
  fullDate: string;
  dateKey: string;
  items: T[];
}

export function groupByDate<T extends { createdAt: string }>(items: T[]): DateGroup<T>[] {
  const map = new Map<string, DateGroup<T>>();

  for (const item of items) {
    const key = getDateKey(item.createdAt);
    if (!map.has(key)) {
      map.set(key, {
        label: formatDateGroupLabel(item.createdAt),
        fullDate: formatFullDate(item.createdAt),
        dateKey: key,
        items: [],
      });
    }
    map.get(key)!.items.push(item);
  }

  return [...map.values()].sort((a, b) => b.dateKey.localeCompare(a.dateKey));
}
