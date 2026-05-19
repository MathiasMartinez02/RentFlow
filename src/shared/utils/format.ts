export function formatCurrency(
  value: number,
  currency = "ARS",
  locale = "es-AR"
): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatDate(dateString: string, format: "short" | "long" | "relative" = "short"): string {
  const date = new Date(dateString);

  if (format === "relative") {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "ahora mismo";
    if (diffMins < 60) return `hace ${diffMins}m`;
    if (diffHours < 24) return `hace ${diffHours}h`;
    if (diffDays < 7) return `hace ${diffDays}d`;
  }

  if (format === "long") {
    return date.toLocaleDateString("es-AR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }

  return date.toLocaleDateString("es-AR", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatPercent(value: number, decimals = 1): string {
  return `${value.toFixed(decimals)}%`;
}

export function formatArea(sqm: number): string {
  return `${sqm.toLocaleString("es-AR")} m²`;
}

export function getInitials(firstName: string, lastName: string): string {
  return `${firstName[0]}${lastName[0]}`.toUpperCase();
}

export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return `${str.slice(0, maxLength)}...`;
}

export function getDaysUntilDate(dateString: string): number {
  return Math.ceil((new Date(dateString).getTime() - Date.now()) / 86400000);
}

export function getContractCode(contractId: string, startDate: string): string {
  const year = new Date(startDate).getFullYear();
  const num = contractId.replace(/[^0-9]/g, "").padStart(3, "0");
  return `CON-${year}-${num}`;
}
