import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface EventTemplate {
    id: string;
    name: string;
    description: string | null;
    image_url: string | null;
    created_at: string;
    updated_at: string;
}

export interface TemplateItem {
    id: string;
    template_id: string;
    item_id: string;
    quantity: number;
    created_at: string;
}

export function useTemplates() {
    const [templates, setTemplates] = useState<EventTemplate[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        const fetchTemplates = async () => {
            try {
                setIsLoading(true);
                const { data, error } = await supabase.from("event_templates").select("*").order("created_at", { ascending: true });

                if (error) throw error;
                setTemplates(data || []);
            } catch (err) {
                console.error("Error fetching templates:", err);
                setError(err as Error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchTemplates();
    }, []);

    return { templates, isLoading, error };
}

export function useTemplateItems(templateId: string | null) {
    const [templateItems, setTemplateItems] = useState<TemplateItem[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        if (!templateId) {
            setTemplateItems([]);
            return;
        }

        const fetchTemplateItems = async () => {
            try {
                setIsLoading(true);
                const { data, error } = await supabase.from("template_items").select("*").eq("template_id", templateId);

                if (error) throw error;
                setTemplateItems(data || []);
            } catch (err) {
                console.error("Error fetching template items:", err);
                setError(err as Error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchTemplateItems();
    }, [templateId]);

    return { templateItems, isLoading, error };
}
