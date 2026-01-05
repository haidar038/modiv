import { Minus, Plus } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Item, SelectedItem } from "@/lib/types";
import { formatIDR } from "@/lib/formatCurrency";
import { cn } from "@/lib/utils";

interface ItemRowProps {
  item: Item;
  selectedItem?: SelectedItem;
  onToggle: (itemId: string) => void;
  onUpdateQuantity: (itemId: string, quantity: number) => void;
}

const ItemRow: React.FC<ItemRowProps> = ({
  item,
  selectedItem,
  onToggle,
  onUpdateQuantity,
}) => {
  const isSelected = selectedItem?.isSelected ?? false;
  const quantity = selectedItem?.quantity ?? 1;
  const rowTotal = isSelected ? item.price * quantity : 0;

  return (
    <div
      className={cn(
        "flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border bg-card p-4 transition-all duration-200",
        isSelected ? "border-primary/30 shadow-sm" : "border-border hover:border-muted-foreground/20"
      )}
    >
      <div className="flex items-start gap-4 flex-1">
        <Switch
          checked={isSelected}
          onCheckedChange={() => onToggle(item.id)}
          className="mt-1"
        />
        <div className="flex-1 min-w-0">
          <h4 className={cn(
            "font-semibold transition-colors",
            isSelected ? "text-foreground" : "text-muted-foreground"
          )}>
            {item.name}
          </h4>
          <p className="text-sm text-muted-foreground line-clamp-1">{item.description}</p>
          <p className="mt-1 text-sm font-medium text-primary">
            {formatIDR(item.price)} <span className="text-muted-foreground font-normal">/ {item.unit}</span>
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between sm:justify-end gap-4">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => onUpdateQuantity(item.id, quantity - 1)}
            disabled={!isSelected || quantity <= 1}
          >
            <Minus className="h-3 w-3" />
          </Button>
          <span className={cn(
            "w-8 text-center font-semibold",
            isSelected ? "text-foreground" : "text-muted-foreground"
          )}>
            {quantity}
          </span>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => onUpdateQuantity(item.id, quantity + 1)}
            disabled={!isSelected}
          >
            <Plus className="h-3 w-3" />
          </Button>
        </div>

        <div className="w-28 text-right">
          <span className={cn(
            "font-bold",
            isSelected ? "text-foreground" : "text-muted-foreground/50"
          )}>
            {formatIDR(rowTotal)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ItemRow;
