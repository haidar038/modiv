import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface Item {
    id: string;
    category_id: string;
    name: string;
    price: number;
    unit: string;
    image_url: string | null;
    created_at: string;
    updated_at: string;
}

export interface ItemWithCategory extends Item {
    categories?: {
        id: string;
        name: string;
    };
}

export function useItems() {
    const [items, setItems] = useState<ItemWithCategory[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        const fetchItems = async () => {
            try {
                setIsLoading(true);
                const { data, error } = await supabase.from("items").select("*, categories(id, name)").order("name", { ascending: true });

                if (error) throw error;
                setItems(data || []);
            } catch (err) {
                console.error("Error fetching items:", err);
                setError(err as Error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchItems();
    }, []);

    const getItemsByCategory = (categoryId: string) => {
        return items.filter((item) => item.category_id === categoryId);
    };

    return { items, isLoading, error, getItemsByCategory };
}
