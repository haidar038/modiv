import { createContext } from "react";
import { SelectedItem } from "@/lib/types";
import { TemplateItem } from "@/hooks/use-templates";

export interface CalculatorContextType {
    selectedItems: Map<string, SelectedItem>;
    selectedTemplateId: string | null;
    toggleItem: (itemId: string) => void;
    updateQuantity: (itemId: string, quantity: number) => void;
    loadTemplate: (templateId: string, templateItems: TemplateItem[]) => void;
    setItems: (items: import("@/hooks/use-items").Item[]) => void;
    resetCalculator: () => void;
    getTotal: () => number;
    getSelectedItemsList: () => SelectedItem[];
}

export const CalculatorContext = createContext<CalculatorContextType | undefined>(undefined);
