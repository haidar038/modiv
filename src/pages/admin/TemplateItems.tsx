import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
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

interface SelectedNewItem {
    itemId: string;
    quantity: number;
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
    const [isSaving, setIsSaving] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const { toast } = useToast();

    // Bulk selection state
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

    // Multi-item add state
    const [newItems, setNewItems] = useState<SelectedNewItem[]>([]);
    const [defaultQuantity, setDefaultQuantity] = useState(1);

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

                if (templatesRes.data && templatesRes.data.length > 0) {
                    setSelectedTemplateId(templatesRes.data[0].id);
                }
            } catch (error) {
                console.error("Error fetching data:", error);
                toast({ variant: "destructive", title: "Gagal memuat data" });
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Fetch template items when selected template changes
    useEffect(() => {
        if (!selectedTemplateId) {
            setTemplateItems([]);
            return;
        }

        const fetchTemplateItems = async () => {
            setIsLoadingItems(true);
            setSelectedIds(new Set()); // Clear selection on template change
            try {
                const { data, error } = await supabase.from("template_items").select("*, items(id, name, price, unit, category_id)").eq("template_id", selectedTemplateId).order("created_at");

                if (error) throw error;
                setTemplateItems(data || []);
            } catch (error) {
                console.error("Error fetching template items:", error);
                toast({ variant: "destructive", title: "Gagal memuat item template" });
            } finally {
                setIsLoadingItems(false);
            }
        };

        fetchTemplateItems();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedTemplateId]);

    const getAvailableItems = () => {
        const existingItemIds = templateItems.map((ti) => ti.item_id);
        return items.filter((item) => !existingItemIds.includes(item.id));
    };

    const getCategoryName = (categoryId: string) => {
        const category = categories.find((c) => c.id === categoryId);
        return category?.name || "Unknown";
    };

    // Bulk selection handlers
    const handleSelectAll = () => {
        if (selectedIds.size === templateItems.length) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(templateItems.map((ti) => ti.id)));
        }
    };

    const handleSelectItem = (id: string) => {
        const newSet = new Set(selectedIds);
        if (newSet.has(id)) {
            newSet.delete(id);
        } else {
            newSet.add(id);
        }
        setSelectedIds(newSet);
    };

    // Toggle item in new items list
    const toggleNewItem = (itemId: string) => {
        setNewItems((prev) => {
            const exists = prev.find((i) => i.itemId === itemId);
            if (exists) {
                return prev.filter((i) => i.itemId !== itemId);
            } else {
                return [...prev, { itemId, quantity: defaultQuantity }];
            }
        });
    };

    const updateNewItemQuantity = (itemId: string, quantity: number) => {
        setNewItems((prev) => prev.map((i) => (i.itemId === itemId ? { ...i, quantity: Math.max(1, quantity) } : i)));
    };

    const handleAddMultipleItems = async () => {
        if (newItems.length === 0 || !selectedTemplateId) return;

        setIsSaving(true);
        try {
            const insertData = newItems.map((item) => ({
                template_id: selectedTemplateId,
                item_id: item.itemId,
                quantity: item.quantity,
            }));

            const { error } = await supabase.from("template_items").insert(insertData);
            if (error) throw error;

            toast({ title: `${newItems.length} item ditambahkan ke template` });
            setIsDialogOpen(false);
            setNewItems([]);

            // Refresh template items
            const { data } = await supabase.from("template_items").select("*, items(id, name, price, unit, category_id)").eq("template_id", selectedTemplateId).order("created_at");
            setTemplateItems(data || []);
        } catch (error) {
            console.error("Error adding items:", error);
            toast({ variant: "destructive", title: "Gagal menambahkan item" });
        } finally {
            setIsSaving(false);
        }
    };

    const handleBulkDelete = async () => {
        if (selectedIds.size === 0) return;
        if (!confirm(`Hapus ${selectedIds.size} item terpilih dari template?`)) return;

        setIsDeleting(true);
        try {
            const { error } = await supabase.from("template_items").delete().in("id", Array.from(selectedIds));
            if (error) throw error;

            toast({ title: `${selectedIds.size} item dihapus` });
            setTemplateItems((prev) => prev.filter((ti) => !selectedIds.has(ti.id)));
            setSelectedIds(new Set());
        } catch (error) {
            console.error("Error deleting items:", error);
            toast({ variant: "destructive", title: "Gagal menghapus item" });
        } finally {
            setIsDeleting(false);
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
            toast({ variant: "destructive", title: "Gagal memperbarui jumlah" });
        }
    };

    const handleRemoveItem = async (templateItemId: string) => {
        if (!confirm("Hapus item ini dari template?")) return;

        try {
            const { error } = await supabase.from("template_items").delete().eq("id", templateItemId);
            if (error) throw error;

            toast({ title: "Item dihapus dari template" });
            setTemplateItems((prev) => prev.filter((ti) => ti.id !== templateItemId));
            selectedIds.delete(templateItemId);
            setSelectedIds(new Set(selectedIds));
        } catch (error) {
            console.error("Error removing item:", error);
            toast({ variant: "destructive", title: "Gagal menghapus item" });
        }
    };

    const calculateTemplateTotal = () => {
        return templateItems.reduce((sum, ti) => sum + ti.items.price * ti.quantity, 0);
    };

    const selectedTemplate = templates.find((t) => t.id === selectedTemplateId);
    const availableItems = getAvailableItems();

    // Group available items by category for better UX
    const groupedAvailableItems = categories
        .map((cat) => ({
            category: cat,
            items: availableItems.filter((item) => item.category_id === cat.id),
        }))
        .filter((group) => group.items.length > 0);

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
                    <h1 className="text-3xl font-bold">Item Template</h1>
                    <p className="text-muted-foreground">Kelola item untuk setiap template acara</p>
                </div>
            </div>

            {templates.length === 0 ? (
                <Card>
                    <CardContent className="py-12 text-center">
                        <Package className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                        <p className="text-muted-foreground">Template tidak ditemukan. Buat template terlebih dahulu.</p>
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
                                <CardTitle>{selectedTemplate?.name || "Pilih Template"}</CardTitle>
                                {selectedTemplate && (
                                    <p className="text-sm text-muted-foreground mt-1">
                                        {templateItems.length} item • Total: {formatCurrency(calculateTemplateTotal())}
                                    </p>
                                )}
                            </div>
                            <div className="flex gap-2">
                                {selectedIds.size > 0 && (
                                    <Button variant="destructive" size="sm" onClick={handleBulkDelete} disabled={isDeleting}>
                                        {isDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
                                        Delete ({selectedIds.size})
                                    </Button>
                                )}
                                <Button variant="outline" size="sm" onClick={() => setIsPreviewOpen(true)} disabled={templateItems.length === 0}>
                                    <Eye className="mr-2 h-4 w-4" />
                                    Pratinjau
                                </Button>
                                <Dialog
                                    open={isDialogOpen}
                                    onOpenChange={(open) => {
                                        setIsDialogOpen(open);
                                        if (!open) setNewItems([]);
                                    }}
                                >
                                    <DialogTrigger asChild>
                                        <Button size="sm" disabled={availableItems.length === 0}>
                                            <Plus className="mr-2 h-4 w-4" />
                                            Tambah Item
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent className="max-w-lg">
                                        <DialogHeader>
                                            <DialogTitle>Tambah Item ke Template</DialogTitle>
                                        </DialogHeader>
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-2">
                                                <Label>Jumlah Default:</Label>
                                                <Input type="number" min={1} value={defaultQuantity} onChange={(e) => setDefaultQuantity(Math.max(1, Number(e.target.value)))} className="w-20" />
                                            </div>
                                            <ScrollArea className="h-[300px] border rounded-lg p-2">
                                                {groupedAvailableItems.map((group) => (
                                                    <div key={group.category.id} className="mb-4">
                                                        <div className="text-sm font-semibold text-muted-foreground mb-2">{group.category.name}</div>
                                                        {group.items.map((item) => {
                                                            const selected = newItems.find((i) => i.itemId === item.id);
                                                            return (
                                                                <div key={item.id} className="flex items-center gap-3 py-2 px-2 hover:bg-secondary rounded-md">
                                                                    <Checkbox checked={!!selected} onCheckedChange={() => toggleNewItem(item.id)} />
                                                                    <div className="flex-1 min-w-0">
                                                                        <div className="font-medium text-sm truncate">{item.name}</div>
                                                                        <div className="text-xs text-muted-foreground">
                                                                            {formatCurrency(item.price)} / {item.unit}
                                                                        </div>
                                                                    </div>
                                                                    {selected && (
                                                                        <Input
                                                                            type="number"
                                                                            min={1}
                                                                            value={selected.quantity}
                                                                            onChange={(e) => updateNewItemQuantity(item.id, Number(e.target.value))}
                                                                            className="w-16 h-8"
                                                                            onClick={(e) => e.stopPropagation()}
                                                                        />
                                                                    )}
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                ))}
                                            </ScrollArea>
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm text-muted-foreground">{newItems.length} item dipilih</span>
                                                <Button onClick={handleAddMultipleItems} disabled={isSaving || newItems.length === 0}>
                                                    {isSaving ? (
                                                        <>
                                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                            Menambahkan...
                                                        </>
                                                    ) : (
                                                        `Tambah ${newItems.length} Item`
                                                    )}
                                                </Button>
                                            </div>
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
                                    <p className="text-muted-foreground">Belum ada item dalam template ini.</p>
                                    <p className="text-sm text-muted-foreground">Tambahkan item untuk membuat preset template ini.</p>
                                </div>
                            ) : (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="w-[40px]">
                                                <Checkbox checked={selectedIds.size === templateItems.length && templateItems.length > 0} onCheckedChange={handleSelectAll} />
                                            </TableHead>
                                            <TableHead>Item</TableHead>
                                            <TableHead>Kategori</TableHead>
                                            <TableHead>Harga</TableHead>
                                            <TableHead className="w-[100px]">Jml</TableHead>
                                            <TableHead className="text-right">Subtotal</TableHead>
                                            <TableHead className="w-[60px]"></TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {templateItems.map((ti) => (
                                            <TableRow key={ti.id} className={selectedIds.has(ti.id) ? "bg-secondary/50" : ""}>
                                                <TableCell>
                                                    <Checkbox checked={selectedIds.has(ti.id)} onCheckedChange={() => handleSelectItem(ti.id)} />
                                                </TableCell>
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
                        <DialogTitle>Pratinjau Template: {selectedTemplate?.name}</DialogTitle>
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
                                <span>Total Template</span>
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
