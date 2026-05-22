import { getCategoryStyle } from "@/lib/categoryColors";
import { Button } from "@/components/ui/button";
import { AlertTriangle, AlertCircle, Copy, HelpCircle } from "lucide-react";

interface CategoryFilterProps {
  categories: string[];
  counts: Record<string, number>;
  active: string | null;
  onSelect: (cat: string | null) => void;
  expiredCount?: number;
  expiringCount?: number;
  duplicateCount?: number;
  missingCount?: number;
  specialFilter?: string | null;
  onSpecialFilter?: (filter: string | null) => void;
}

const CategoryFilter = ({
  categories, counts, active, onSelect,
  expiredCount = 0, expiringCount = 0,
  duplicateCount = 0, missingCount = 0,
  specialFilter, onSpecialFilter,
}: CategoryFilterProps) => {
  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-1 -mx-1 px-1 snap-x scrollbar-thin md:flex-wrap md:overflow-visible">
      <Button
        variant="outline"
        size="sm"
        className={`shrink-0 h-8 text-xs rounded-full px-3.5 ${
          active === null && !specialFilter
            ? "bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-600"
            : "hover:border-emerald-400/60"
        }`}
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
            className={`shrink-0 h-8 text-xs rounded-full px-3.5 border transition-all ${
              isActive
                ? "bg-emerald-600 text-white border-emerald-600 shadow-sm hover:bg-emerald-700"
                : `${style.bg} ${style.text} ${style.border} hover:shadow-sm hover:brightness-95`
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
          className={`shrink-0 h-8 text-xs rounded-full px-3.5 gap-1 ${
            specialFilter === "expired"
              ? "bg-red-600 text-white border-red-600 hover:bg-red-700"
              : "bg-red-50 text-red-600 border-red-200 hover:bg-red-100"
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
          className={`shrink-0 h-8 text-xs rounded-full px-3.5 gap-1 ${
            specialFilter === "expiring"
              ? "bg-amber-500 text-white border-amber-500 hover:bg-amber-600"
              : "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100"
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
