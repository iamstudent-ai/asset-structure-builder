import { getCategoryStyle } from "@/lib/categoryColors";

const CategoryBadge = ({ category }: { category: string }) => {
  const style = getCategoryStyle(category);
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-semibold ${style.bg} ${style.text} ${style.border}`}
    >
      {category || "N/A"}
    </span>
  );
};

export default CategoryBadge;
