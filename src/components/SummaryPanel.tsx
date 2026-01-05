import { SelectedItem } from "@/lib/types";
import { formatIDR } from "@/lib/formatCurrency";
import { Button } from "@/components/ui/button";
import { FileText, Trash2 } from "lucide-react";

interface SummaryPanelProps {
  selectedItems: SelectedItem[];
  total: number;
  onRequestQuote: () => void;
  onReset: () => void;
}

const SummaryPanel: React.FC<SummaryPanelProps> = ({
  selectedItems,
  total,
  onRequestQuote,
  onReset,
}) => {
  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
      <div className="mb-6 flex items-center justify-between">
        <h3 className="text-lg font-bold text-foreground">Your Selection</h3>
        {selectedItems.length > 0 && (
          <button
            onClick={onReset}
            className="flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-destructive"
          >
            <Trash2 className="h-3 w-3" />
            Clear
          </button>
        )}
      </div>

      {selectedItems.length === 0 ? (
        <div className="py-8 text-center">
          <p className="text-sm text-muted-foreground">
            Select items from the inventory to see your budget breakdown
          </p>
        </div>
      ) : (
        <div className="space-y-3 mb-6 max-h-[300px] overflow-y-auto pr-2">
          {selectedItems.map((item) => (
            <div
              key={item.id}
              className="flex items-start justify-between gap-2 border-b border-border/50 pb-3 last:border-0"
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {item.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {item.quantity}x @ {formatIDR(item.price)}
                </p>
              </div>
              <p className="text-sm font-semibold text-foreground whitespace-nowrap">
                {formatIDR(item.price * item.quantity)}
              </p>
            </div>
          ))}
        </div>
      )}

      <div className="border-t border-border pt-4">
        <div className="mb-4 flex items-center justify-between">
          <span className="text-sm font-medium text-muted-foreground">
            Estimated Total
          </span>
          <span className="text-2xl font-extrabold text-primary">
            {formatIDR(total)}
          </span>
        </div>

        <Button
          className="w-full shadow-button"
          size="lg"
          onClick={onRequestQuote}
          disabled={selectedItems.length === 0}
        >
          <FileText className="mr-2 h-4 w-4" />
          Review & Request Quote
        </Button>
      </div>
    </div>
  );
};

export default SummaryPanel;
