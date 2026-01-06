import React, { useState, useCallback } from "react";
import { SelectedItem } from "@/lib/types";
import { Item as DBItem } from "@/hooks/use-items";
import { TemplateItem } from "@/hooks/use-templates";
import { CalculatorContext } from "./calculator-context";

export const CalculatorProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [allItems, setAllItems] = useState<DBItem[]>([]);
    const [selectedItems, setSelectedItems] = useState<Map<string, SelectedItem>>(new Map());
    const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);

    const getItemById = useCallback(
        (itemId: string): DBItem | undefined => {
            return allItems.find((item) => item.id === itemId);
        },
        [allItems]
    );

    const setItems = useCallback((items: DBItem[]) => {
        setAllItems(items);
    }, []);

    const dbItemToSelectedItem = (item: DBItem, quantity: number, isSelected: boolean): SelectedItem => ({
        id: item.id,
        categoryId: item.category_id,
        name: item.name,
        price: item.price,
        unit: item.unit,
        imageUrl: item.image_url,
        quantity,
        isSelected,
    });

    const toggleItem = useCallback(
        (itemId: string) => {
            setSelectedItems((prev) => {
                const newMap = new Map(prev);
                const existing = newMap.get(itemId);

                if (existing) {
                    newMap.set(itemId, { ...existing, isSelected: !existing.isSelected });
                } else {
                    const item = getItemById(itemId);
                    if (item) {
                        newMap.set(itemId, dbItemToSelectedItem(item, 1, true));
                    }
                }

                return newMap;
            });
        },
        [getItemById]
    );

    const updateQuantity = useCallback(
        (itemId: string, quantity: number) => {
            if (quantity < 1) return;

            setSelectedItems((prev) => {
                const newMap = new Map(prev);
                const existing = newMap.get(itemId);

                if (existing) {
                    newMap.set(itemId, { ...existing, quantity });
                } else {
                    const item = getItemById(itemId);
                    if (item) {
                        newMap.set(itemId, dbItemToSelectedItem(item, quantity, true));
                    }
                }

                return newMap;
            });
        },
        [getItemById]
    );

    const loadTemplate = useCallback(
        (templateId: string, templateItems: TemplateItem[]) => {
            const newMap = new Map<string, SelectedItem>();

            // Initialize all items as not selected
            allItems.forEach((item) => {
                newMap.set(item.id, dbItemToSelectedItem(item, 1, false));
            });

            // Pre-select items from template
            templateItems.forEach((preset) => {
                const item = getItemById(preset.item_id);
                if (item) {
                    newMap.set(preset.item_id, dbItemToSelectedItem(item, preset.quantity, true));
                }
            });

            setSelectedItems(newMap);
            setSelectedTemplateId(templateId);
        },
        [allItems, getItemById]
    );

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
                setItems,
                resetCalculator,
                getTotal,
                getSelectedItemsList,
            }}
        >
            {children}
        </CalculatorContext.Provider>
    );
};
