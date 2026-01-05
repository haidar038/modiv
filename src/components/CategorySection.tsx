import { useState } from "react";
import { ChevronDown, Volume2, Lightbulb, Layout, Monitor, Users, LucideIcon } from "lucide-react";
import { Category, Item, SelectedItem } from "@/lib/types";
import ItemRow from "./ItemRow";
import { cn } from "@/lib/utils";

const iconMap: Record<string, LucideIcon> = {
  "volume-2": Volume2,
  "lightbulb": Lightbulb,
  "layout": Layout,
  "monitor": Monitor,
  "users": Users,
};

interface CategorySectionProps {
  category: Category;
  items: Item[];
  selectedItems: Map<string, SelectedItem>;
  onToggle: (itemId: string) => void;
  onUpdateQuantity: (itemId: string, quantity: number) => void;
}

const CategorySection: React.FC<CategorySectionProps> = ({
  category,
  items,
  selectedItems,
  onToggle,
  onUpdateQuantity,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const Icon = iconMap[category.iconSlug] || Volume2;

  const selectedCount = items.filter(
    (item) => selectedItems.get(item.id)?.isSelected
  ).length;

  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex w-full items-center justify-between gap-4 p-5 text-left transition-colors hover:bg-muted/30"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <Icon className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="font-bold text-foreground">{category.name}</h3>
            <p className="text-sm text-muted-foreground">
              {selectedCount} of {items.length} selected
            </p>
          </div>
        </div>
        <ChevronDown
          className={cn(
            "h-5 w-5 text-muted-foreground transition-transform duration-200",
            isExpanded && "rotate-180"
          )}
        />
      </button>

      <div
        className={cn(
          "grid transition-all duration-300",
          isExpanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        )}
      >
        <div className="overflow-hidden">
          <div className="flex flex-col gap-3 p-5 pt-0">
            {items.map((item) => (
              <ItemRow
                key={item.id}
                item={item}
                selectedItem={selectedItems.get(item.id)}
                onToggle={onToggle}
                onUpdateQuantity={onUpdateQuantity}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategorySection;
