import { getCategoryStyle } from "@/lib/categoryColors";
import { Button } from "@/components/ui/button";

interface CategoryFilterProps {
  categories: string[];
  counts: Record<string, number>;
  active: string | null;
  onSelect: (cat: string | null) => void;
}

const CategoryFilter = ({ categories, counts, active, onSelect }: CategoryFilterProps) => {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <Button
        variant={active === null ? "default" : "outline"}
        size="sm"
        className="h-8 text-xs"
        onClick={() => onSelect(null)}
      >
        All
      </Button>
      {categories.map((cat) => {
        const style = getCategoryStyle(cat);
        const isActive = active === cat;
        return (
          <Button
            key={cat}
            variant="outline"
            size="sm"
            className={`h-8 text-xs border transition-all ${
              isActive
                ? `${style.bg} ${style.text} ${style.border} shadow-sm`
                : "hover:shadow-sm"
            }`}
            onClick={() => onSelect(isActive ? null : cat)}
          >
            {cat} ({counts[cat] ?? 0})
          </Button>
        );
      })}
    </div>
  );
};

export default CategoryFilter;
