import { formatIDR } from "@/lib/formatCurrency";
import { Button } from "@/components/ui/button";
import { ChevronUp } from "lucide-react";

interface MobileSummaryBarProps {
    total: number;
    itemCount: number;
    onOpenDetails: () => void;
}

const MobileSummaryBar: React.FC<MobileSummaryBarProps> = ({ total, itemCount, onOpenDetails }) => {
    return (
        <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-card/95 backdrop-blur p-4 lg:hidden">
            <div className="container flex items-center justify-between gap-4">
                <div>
                    <p className="text-xs text-muted-foreground">{itemCount} item dipilih</p>
                    <p className="text-xl font-extrabold text-primary">{formatIDR(total)}</p>
                </div>
                <Button onClick={onOpenDetails} className="shadow-button">
                    <span>Lihat Detail</span>
                    <ChevronUp className="ml-2 h-4 w-4" />
                </Button>
            </div>
        </div>
    );
};

export default MobileSummaryBar;
