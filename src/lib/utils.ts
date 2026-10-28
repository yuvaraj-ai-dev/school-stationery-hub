export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(" ");
}

export function formatDate(dateStr: string): string {
  if (!dateStr) return "-";
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function formatDateTime(dateStr: string): string {
  if (!dateStr) return "-";
  return new Date(dateStr).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function generateVariantLabel(attrs: Record<string, string>): string {
  return Object.values(attrs)
    .filter(Boolean)
    .join(" - ");
}

export function getStockStatusColor(current: number, threshold: number): string {
  if (current === 0) return "text-red-400 bg-red-400/10";
  if (current <= threshold) return "text-amber-400 bg-amber-400/10";
  return "text-emerald-400 bg-emerald-400/10";
}

export function getStockStatusText(current: number, threshold: number): string {
  if (current === 0) return "Out of Stock";
  if (current <= threshold) return "Low Stock";
  return "In Stock";
}

export function getStockStatusDot(current: number, threshold: number): string {
  if (current === 0) return "bg-red-500";
  if (current <= threshold) return "bg-amber-500";
  return "bg-emerald-500";
}
