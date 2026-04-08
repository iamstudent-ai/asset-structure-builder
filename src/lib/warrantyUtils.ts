// Warranty / EOL status helpers

export type WarrantyStatus = "expired" | "expiring" | "active" | "unknown";

export interface WarrantyInfo {
  status: WarrantyStatus;
  label: string;
  color: string; // tailwind classes
  dot: string;
}

const EXPIRING_DAYS = 30;

export function getWarrantyStatus(dateStr: string): WarrantyInfo {
  if (!dateStr || dateStr === "N/A" || dateStr.trim() === "") {
    return { status: "unknown", label: "N/A", color: "text-muted-foreground", dot: "bg-muted-foreground" };
  }

  const d = new Date(dateStr);
  if (isNaN(d.getTime())) {
    return { status: "unknown", label: "N/A", color: "text-muted-foreground", dot: "bg-muted-foreground" };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diff = (d.getTime() - today.getTime()) / (1000 * 60 * 60 * 24);

  if (diff < 0) {
    return { status: "expired", label: "Expired", color: "text-red-600", dot: "bg-red-500" };
  }
  if (diff <= EXPIRING_DAYS) {
    return { status: "expiring", label: "Expiring Soon", color: "text-amber-600", dot: "bg-amber-500" };
  }
  return { status: "active", label: "Active", color: "text-green-600", dot: "bg-green-500" };
}
