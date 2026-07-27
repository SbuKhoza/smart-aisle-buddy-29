import { CATEGORIES, getCategory, type CategoryId } from "@/constants/categories";
import { cn } from "@/lib/utils";

export function CategoryChip({
  categoryId,
  size = "sm",
  showIcon = true,
  className,
}: {
  categoryId?: string;
  size?: "sm" | "md";
  showIcon?: boolean;
  className?: string;
}) {
  const cat = getCategory(categoryId);
  const Icon = cat.icon;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full font-medium",
        cat.color,
        cat.text,
        size === "sm" ? "px-2 py-0.5 text-[11px]" : "px-3 py-1 text-xs",
        className,
      )}
    >
      {showIcon && <Icon size={size === "sm" ? 12 : 14} />}
      {cat.label}
    </span>
  );
}

export function CategoryFilter({
  value,
  onChange,
}: {
  value: CategoryId | "all";
  onChange: (v: CategoryId | "all") => void;
}) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2">
      <button
        onClick={() => onChange("all")}
        className={cn(
          "shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
          value === "all"
            ? "bg-primary text-primary-foreground"
            : "bg-muted text-muted-foreground hover:bg-accent",
        )}
      >
        All
      </button>
      {CATEGORIES.map((c) => {
        const Icon = c.icon;
        const active = value === c.id;
        return (
          <button
            key={c.id}
            onClick={() => onChange(c.id)}
            className={cn(
              "flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
              active
                ? "bg-primary text-primary-foreground"
                : cn(c.color, c.text, "hover:opacity-80"),
            )}
          >
            <Icon size={13} />
            {c.label}
          </button>
        );
      })}
    </div>
  );
}