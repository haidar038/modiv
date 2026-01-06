import { ArrowRight, Users } from "lucide-react";
import { EventTemplate } from "@/lib/types";
import { cn } from "@/lib/utils";

interface TemplateCardProps {
    template: EventTemplate;
    onSelect: (templateId: string) => void;
    index: number;
}

// Dark-theme compatible gradients with subtle backgrounds
const gradients = ["from-orange-500/10 to-amber-500/10 border-orange-500/20", "from-blue-500/10 to-cyan-500/10 border-blue-500/20", "from-purple-500/10 to-pink-500/10 border-purple-500/20"];

const TemplateCard: React.FC<TemplateCardProps> = ({ template, onSelect, index }) => {
    return (
        <div
            className={cn(
                "group relative overflow-hidden rounded-2xl bg-gradient-to-br border p-6 shadow-card transition-all duration-300 hover:shadow-card-hover hover:-translate-y-1 cursor-pointer bg-card",
                gradients[index % gradients.length]
            )}
            onClick={() => onSelect(template.id)}
        >
            <div className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-secondary shadow-sm">
                <Users className="h-5 w-5 text-muted-foreground" />
            </div>

            {template.capacityLabel && (
                <div className="mb-4">
                    <span className="inline-flex items-center rounded-full bg-secondary px-3 py-1 text-xs font-medium text-muted-foreground">{template.capacityLabel}</span>
                </div>
            )}

            <h3 className="mb-2 text-xl font-bold text-foreground">{template.name}</h3>
            <p className="mb-6 text-sm text-muted-foreground leading-relaxed">{template.description}</p>

            <div className="flex items-center gap-2 text-sm font-semibold text-primary transition-all group-hover:gap-3">
                <span>Pilih Template</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </div>
        </div>
    );
};

export default TemplateCard;
