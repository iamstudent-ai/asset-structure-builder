import { getCategoryStyle } from "@/lib/categoryColors";
import { Button } from "@/components/ui/button";
import { AlertTriangle, AlertCircle } from "lucide-react";

interface CategoryFilterProps {
  categories: string[];
  counts: Record<string, number>;
  active: string | null;
  onSelect: (cat: string | null) => void;
  expiredCount?: number;
  expiringCount?: number;
  specialFilter?: string | null;
  onSpecialFilter?: (filter: string | null) => void;
}

const CategoryFilter = ({
  categories, counts, active, onSelect,
  expiredCount = 0, expiringCount = 0,
  specialFilter, onSpecialFilter,
}: CategoryFilterProps) => {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <Button
        variant={active === null && !specialFilter ? "default" : "outline"}
        size="sm"
        className={`h-8 text-xs ${active === null && !specialFilter ? "bg-green-600 hover:bg-green-700 text-white" : ""}`}
        onClick={() => { onSelect(null); onSpecialFilter?.(null); }}
      >
        All
      </Button>
      {categories.map((cat) => {
        const style = getCategoryStyle(cat);
        const isActive = active === cat && !specialFilter;
        return (
          <Button
            key={cat}
            variant="outline"
            size="sm"
            className={`h-8 text-xs border transition-all ${
              isActive
                ? `bg-green-600 text-white border-green-600 shadow-sm hover:bg-green-700`
                : "hover:shadow-sm"
            }`}
            onClick={() => { onSelect(isActive ? null : cat); onSpecialFilter?.(null); }}
          >
            {cat} ({counts[cat] ?? 0})
          </Button>
        );
      })}

      {/* Warranty quick filters */}
      {expiredCount > 0 && (
        <Button
          variant="outline"
          size="sm"
          className={`h-8 text-xs gap-1 ${
            specialFilter === "expired"
              ? "bg-red-600 text-white border-red-600 hover:bg-red-700"
              : "text-red-600 border-red-200 hover:bg-red-50"
          }`}
          onClick={() => { onSelect(null); onSpecialFilter?.(specialFilter === "expired" ? null : "expired"); }}
        >
          <AlertCircle className="h-3 w-3" />
          Expired ({expiredCount})
        </Button>
      )}
      {expiringCount > 0 && (
        <Button
          variant="outline"
          size="sm"
          className={`h-8 text-xs gap-1 ${
            specialFilter === "expiring"
              ? "bg-amber-600 text-white border-amber-600 hover:bg-amber-700"
              : "text-amber-600 border-amber-200 hover:bg-amber-50"
          }`}
          onClick={() => { onSelect(null); onSpecialFilter?.(specialFilter === "expiring" ? null : "expiring"); }}
        >
          <AlertTriangle className="h-3 w-3" />
          Expiring Soon ({expiringCount})
        </Button>
      )}
    </div>
  );
};

export default CategoryFilter;
