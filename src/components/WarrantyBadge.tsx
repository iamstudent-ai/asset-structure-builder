import { getWarrantyStatus } from "@/lib/warrantyUtils";

interface WarrantyBadgeProps {
  dateStr: string;
  compact?: boolean;
}

const WarrantyBadge = ({ dateStr, compact = false }: WarrantyBadgeProps) => {
  const info = getWarrantyStatus(dateStr);
  if (info.status === "unknown") return <span className="text-xs text-muted-foreground">N/A</span>;

  return (
    <span className={`inline-flex items-center gap-1 text-xs font-medium ${info.color}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${info.dot} ${info.status === "expiring" ? "animate-pulse" : ""}`} />
      {compact ? info.label.charAt(0) : info.label}
    </span>
  );
};

export default WarrantyBadge;
