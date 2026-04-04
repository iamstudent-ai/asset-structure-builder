// Category color mapping using design tokens from index.css

export type CategoryKey = "Laptop" | "Desktop" | "Server" | "Monitor";

interface CategoryStyle {
  bg: string;
  text: string;
  border: string;
  icon: string;
}

/** Returns Tailwind classes for a given asset category */
export const getCategoryStyle = (category: string): CategoryStyle => {
  const key = category.trim();
  switch (key) {
    case "Laptop":
      return {
        bg: "bg-[hsl(var(--category-laptop)/0.1)]",
        text: "text-[hsl(var(--category-laptop))]",
        border: "border-[hsl(var(--category-laptop)/0.25)]",
        icon: "text-[hsl(var(--category-laptop))]",
      };
    case "Desktop":
      return {
        bg: "bg-[hsl(var(--category-desktop)/0.1)]",
        text: "text-[hsl(var(--category-desktop))]",
        border: "border-[hsl(var(--category-desktop)/0.25)]",
        icon: "text-[hsl(var(--category-desktop))]",
      };
    case "Server":
      return {
        bg: "bg-[hsl(var(--category-server)/0.1)]",
        text: "text-[hsl(var(--category-server))]",
        border: "border-[hsl(var(--category-server)/0.25)]",
        icon: "text-[hsl(var(--category-server))]",
      };
    case "Monitor":
      return {
        bg: "bg-[hsl(var(--category-monitor)/0.1)]",
        text: "text-[hsl(var(--category-monitor))]",
        border: "border-[hsl(var(--category-monitor)/0.25)]",
        icon: "text-[hsl(var(--category-monitor))]",
      };
    default:
      return {
        bg: "bg-[hsl(var(--category-default)/0.1)]",
        text: "text-[hsl(var(--category-default))]",
        border: "border-[hsl(var(--category-default)/0.25)]",
        icon: "text-[hsl(var(--category-default))]",
      };
  }
};
