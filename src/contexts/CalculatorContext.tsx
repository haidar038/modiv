import React, { createContext, useContext, useState, useCallback } from "react";
import { SelectedItem, Item } from "@/lib/types";
import { items, templateItems } from "@/lib/mockData";

interface CalculatorContextType {
  selectedItems: Map<string, SelectedItem>;
  selectedTemplateId: string | null;
  toggleItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  loadTemplate: (templateId: string) => void;
  resetCalculator: () => void;
  getTotal: () => number;
  getSelectedItemsList: () => SelectedItem[];
}

const CalculatorContext = createContext<CalculatorContextType | undefined>(undefined);

export const CalculatorProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedItems, setSelectedItems] = useState<Map<string, SelectedItem>>(new Map());
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);

  const getItemById = (itemId: string): Item | undefined => {
    return items.find((item) => item.id === itemId);
  };

  const toggleItem = useCallback((itemId: string) => {
    setSelectedItems((prev) => {
      const newMap = new Map(prev);
      const existing = newMap.get(itemId);
      
      if (existing) {
        newMap.set(itemId, { ...existing, isSelected: !existing.isSelected });
      } else {
        const item = getItemById(itemId);
        if (item) {
          newMap.set(itemId, { ...item, quantity: 1, isSelected: true });
        }
      }
      
      return newMap;
    });
  }, []);

  const updateQuantity = useCallback((itemId: string, quantity: number) => {
    if (quantity < 1) return;
    
    setSelectedItems((prev) => {
      const newMap = new Map(prev);
      const existing = newMap.get(itemId);
      
      if (existing) {
        newMap.set(itemId, { ...existing, quantity });
      } else {
        const item = getItemById(itemId);
        if (item) {
          newMap.set(itemId, { ...item, quantity, isSelected: true });
        }
      }
      
      return newMap;
    });
  }, []);

  const loadTemplate = useCallback((templateId: string) => {
    const newMap = new Map<string, SelectedItem>();
    
    // Initialize all items as not selected
    items.forEach((item) => {
      newMap.set(item.id, { ...item, quantity: 1, isSelected: false });
    });
    
    // Pre-select items from template
    const templatePresets = templateItems.filter((ti) => ti.templateId === templateId);
    templatePresets.forEach((preset) => {
      const item = getItemById(preset.itemId);
      if (item) {
        newMap.set(preset.itemId, {
          ...item,
          quantity: preset.defaultQuantity,
          isSelected: true,
        });
      }
    });
    
    setSelectedItems(newMap);
    setSelectedTemplateId(templateId);
  }, []);

  const resetCalculator = useCallback(() => {
    setSelectedItems(new Map());
    setSelectedTemplateId(null);
  }, []);

  const getTotal = useCallback(() => {
    let total = 0;
    selectedItems.forEach((item) => {
      if (item.isSelected) {
        total += item.price * item.quantity;
      }
    });
    return total;
  }, [selectedItems]);

  const getSelectedItemsList = useCallback(() => {
    return Array.from(selectedItems.values()).filter((item) => item.isSelected);
  }, [selectedItems]);

  return (
    <CalculatorContext.Provider
      value={{
        selectedItems,
        selectedTemplateId,
        toggleItem,
        updateQuantity,
        loadTemplate,
        resetCalculator,
        getTotal,
        getSelectedItemsList,
      }}
    >
      {children}
    </CalculatorContext.Provider>
  );
};

export const useCalculator = () => {
  const context = useContext(CalculatorContext);
  if (!context) {
    throw new Error("useCalculator must be used within a CalculatorProvider");
  }
  return context;
};
