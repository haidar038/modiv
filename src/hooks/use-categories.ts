import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface Category {
    id: string;
    name: string;
    display_order: number;
    created_at: string;
    updated_at: string;
}

export function useCategories() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                setIsLoading(true);
                const { data, error } = await supabase.from("categories").select("*").order("display_order", { ascending: true });

                if (error) throw error;
                setCategories(data || []);
            } catch (err) {
                console.error("Error fetching categories:", err);
                setError(err as Error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchCategories();
    }, []);

    return { categories, isLoading, error };
}
