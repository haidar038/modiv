import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Loader2, Package, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency } from "@/lib/formatCurrency";

interface Template {
    id: string;
    name: string;
    description: string | null;
}

interface Item {
    id: string;
    name: string;
    price: number;
    unit: string;
    category_id: string;
}

interface Category {
    id: string;
    name: string;
}

interface TemplateItem {
    id: string;
    template_id: string;
    item_id: string;
    quantity: number;
    items: Item;
}

const TemplateItems = () => {
    const [templates, setTemplates] = useState<Template[]>([]);
    const [items, setItems] = useState<Item[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
    const [templateItems, setTemplateItems] = useState<TemplateItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingItems, setIsLoadingItems] = useState(false);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const [newItemId, setNewItemId] = useState("");
    const [newQuantity, setNewQuantity] = useState(1);
    const [isSaving, setIsSaving] = useState(false);
    const { toast } = useToast();

    // Fetch templates and items on mount
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [templatesRes, itemsRes, categoriesRes] = await Promise.all([
                    supabase.from("event_templates").select("id, name, description").order("name"),
                    supabase.from("items").select("id, name, price, unit, category_id").order("name"),
                    supabase.from("categories").select("id, name").order("display_order"),
                ]);

                if (templatesRes.error) throw templatesRes.error;
                if (itemsRes.error) throw itemsRes.error;
                if (categoriesRes.error) throw categoriesRes.error;

                setTemplates(templatesRes.data || []);
                setItems(itemsRes.data || []);
                setCategories(categoriesRes.data || []);

                // Auto-select first template
                if (templatesRes.data && templatesRes.data.length > 0) {
                    setSelectedTemplateId(templatesRes.data[0].id);
                }
            } catch (error) {
                console.error("Error fetching data:", error);
                toast({ variant: "destructive", title: "Error loading data" });
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, []);

    // Fetch template items when selected template changes
    useEffect(() => {
        if (!selectedTemplateId) {
            setTemplateItems([]);
            return;
        }

        const fetchTemplateItems = async () => {
            setIsLoadingItems(true);
            try {
                const { data, error } = await supabase.from("template_items").select("*, items(id, name, price, unit, category_id)").eq("template_id", selectedTemplateId).order("created_at");

                if (error) throw error;
                setTemplateItems(data || []);
            } catch (error) {
                console.error("Error fetching template items:", error);
                toast({ variant: "destructive", title: "Error loading template items" });
            } finally {
                setIsLoadingItems(false);
            }
        };

        fetchTemplateItems();
    }, [selectedTemplateId]);

    const getAvailableItems = () => {
        const existingItemIds = templateItems.map((ti) => ti.item_id);
        return items.filter((item) => !existingItemIds.includes(item.id));
    };

    const getCategoryName = (categoryId: string) => {
        const category = categories.find((c) => c.id === categoryId);
        return category?.name || "Unknown";
    };

    const handleAddItem = async () => {
        if (!newItemId || !selectedTemplateId) return;

        setIsSaving(true);
        try {
            const { error } = await supabase.from("template_items").insert({
                template_id: selectedTemplateId,
                item_id: newItemId,
                quantity: newQuantity,
            });

            if (error) throw error;

            toast({ title: "Item added to template" });
            setIsDialogOpen(false);
            setNewItemId("");
            setNewQuantity(1);

            // Refresh template items
            const { data } = await supabase.from("template_items").select("*, items(id, name, price, unit, category_id)").eq("template_id", selectedTemplateId).order("created_at");
            setTemplateItems(data || []);
        } catch (error) {
            console.error("Error adding item:", error);
            toast({ variant: "destructive", title: "Error adding item" });
        } finally {
            setIsSaving(false);
        }
    };

    const handleUpdateQuantity = async (templateItemId: string, quantity: number) => {
        if (quantity < 1) return;

        try {
            const { error } = await supabase.from("template_items").update({ quantity }).eq("id", templateItemId);

            if (error) throw error;

            setTemplateItems((prev) => prev.map((ti) => (ti.id === templateItemId ? { ...ti, quantity } : ti)));
        } catch (error) {
            console.error("Error updating quantity:", error);
            toast({ variant: "destructive", title: "Error updating quantity" });
        }
    };

    const handleRemoveItem = async (templateItemId: string) => {
        if (!confirm("Remove this item from the template?")) return;

        try {
            const { error } = await supabase.from("template_items").delete().eq("id", templateItemId);

            if (error) throw error;

            toast({ title: "Item removed from template" });
            setTemplateItems((prev) => prev.filter((ti) => ti.id !== templateItemId));
        } catch (error) {
            console.error("Error removing item:", error);
            toast({ variant: "destructive", title: "Error removing item" });
        }
    };

    const calculateTemplateTotal = () => {
        return templateItems.reduce((sum, ti) => sum + ti.items.price * ti.quantity, 0);
    };

    const selectedTemplate = templates.find((t) => t.id === selectedTemplateId);
    const availableItems = getAvailableItems();

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-32">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Template Items</h1>
                    <p className="text-muted-foreground">Manage items for each event template</p>
                </div>
            </div>

            {templates.length === 0 ? (
                <Card>
                    <CardContent className="py-12 text-center">
                        <Package className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                        <p className="text-muted-foreground">No templates found. Create templates first.</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-6 lg:grid-cols-4">
                    {/* Template Selector */}
                    <Card className="lg:col-span-1">
                        <CardHeader>
                            <CardTitle className="text-lg">Templates</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            {templates.map((template) => (
                                <button
                                    key={template.id}
                                    onClick={() => setSelectedTemplateId(template.id)}
                                    className={`w-full text-left p-3 rounded-lg transition-colors ${selectedTemplateId === template.id ? "bg-primary text-primary-foreground" : "hover:bg-secondary"}`}
                                >
                                    <div className="font-medium">{template.name}</div>
                                    {template.description && <div className={`text-xs mt-1 truncate ${selectedTemplateId === template.id ? "text-primary-foreground/80" : "text-muted-foreground"}`}>{template.description}</div>}
                                </button>
                            ))}
                        </CardContent>
                    </Card>

                    {/* Template Items */}
                    <Card className="lg:col-span-3">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle>{selectedTemplate?.name || "Select Template"}</CardTitle>
                                {selectedTemplate && (
                                    <p className="text-sm text-muted-foreground mt-1">
                                        {templateItems.length} items • Total: {formatCurrency(calculateTemplateTotal())}
                                    </p>
                                )}
                            </div>
                            <div className="flex gap-2">
                                <Button variant="outline" size="sm" onClick={() => setIsPreviewOpen(true)} disabled={templateItems.length === 0}>
                                    <Eye className="mr-2 h-4 w-4" />
                                    Preview
                                </Button>
                                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                                    <DialogTrigger asChild>
                                        <Button size="sm" disabled={availableItems.length === 0}>
                                            <Plus className="mr-2 h-4 w-4" />
                                            Add Item
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                        <DialogHeader>
                                            <DialogTitle>Add Item to Template</DialogTitle>
                                        </DialogHeader>
                                        <div className="space-y-4">
                                            <div className="space-y-2">
                                                <Label>Select Item</Label>
                                                <Select value={newItemId} onValueChange={setNewItemId}>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Choose an item" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {availableItems.map((item) => (
                                                            <SelectItem key={item.id} value={item.id}>
                                                                {item.name} - {formatCurrency(item.price)}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Default Quantity</Label>
                                                <Input type="number" min={1} value={newQuantity} onChange={(e) => setNewQuantity(Number(e.target.value))} />
                                            </div>
                                            <Button onClick={handleAddItem} className="w-full" disabled={isSaving || !newItemId}>
                                                {isSaving ? (
                                                    <>
                                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                        Adding...
                                                    </>
                                                ) : (
                                                    "Add to Template"
                                                )}
                                            </Button>
                                        </div>
                                    </DialogContent>
                                </Dialog>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {isLoadingItems ? (
                                <div className="flex justify-center py-8">
                                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                                </div>
                            ) : templateItems.length === 0 ? (
                                <div className="text-center py-12">
                                    <Package className="mx-auto h-10 w-10 text-muted-foreground mb-3" />
                                    <p className="text-muted-foreground">No items in this template yet.</p>
                                    <p className="text-sm text-muted-foreground">Add items to create a preset for this template.</p>
                                </div>
                            ) : (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Item</TableHead>
                                            <TableHead>Category</TableHead>
                                            <TableHead>Price</TableHead>
                                            <TableHead className="w-[100px]">Qty</TableHead>
                                            <TableHead className="text-right">Subtotal</TableHead>
                                            <TableHead className="w-[60px]"></TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {templateItems.map((ti) => (
                                            <TableRow key={ti.id}>
                                                <TableCell className="font-medium">{ti.items.name}</TableCell>
                                                <TableCell>
                                                    <Badge variant="outline">{getCategoryName(ti.items.category_id)}</Badge>
                                                </TableCell>
                                                <TableCell>{formatCurrency(ti.items.price)}</TableCell>
                                                <TableCell>
                                                    <Input type="number" min={1} value={ti.quantity} onChange={(e) => handleUpdateQuantity(ti.id, Number(e.target.value))} className="w-20 h-8" />
                                                </TableCell>
                                                <TableCell className="text-right font-medium">{formatCurrency(ti.items.price * ti.quantity)}</TableCell>
                                                <TableCell>
                                                    <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => handleRemoveItem(ti.id)}>
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            )}
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Preview Dialog */}
            <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Template Preview: {selectedTemplate?.name}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <p className="text-sm text-muted-foreground">{selectedTemplate?.description}</p>
                        <div className="rounded-lg border p-4 space-y-2">
                            {templateItems.map((ti) => (
                                <div key={ti.id} className="flex justify-between text-sm">
                                    <span>
                                        {ti.items.name} x{ti.quantity}
                                    </span>
                                    <span className="font-medium">{formatCurrency(ti.items.price * ti.quantity)}</span>
                                </div>
                            ))}
                            <div className="border-t pt-2 flex justify-between font-semibold">
                                <span>Template Total</span>
                                <span className="text-primary">{formatCurrency(calculateTemplateTotal())}</span>
                            </div>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default TemplateItems;
