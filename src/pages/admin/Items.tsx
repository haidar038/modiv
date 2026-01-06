import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Pencil, Trash2, Loader2, History, ImageIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency } from "@/lib/formatCurrency";
import { ImageUpload } from "@/components/ui/image-upload";
import { format } from "date-fns";

interface Category {
    id: string;
    name: string;
}

interface Item {
    id: string;
    category_id: string;
    name: string;
    description: string | null;
    price: number;
    unit: string;
    image_url: string | null;
    created_at: string;
    categories?: Category;
}

interface PriceHistoryItem {
    id: string;
    old_price: number;
    new_price: number;
    changed_at: string;
}

const Items = () => {
    const [items, setItems] = useState<Item[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isHistoryDialogOpen, setIsHistoryDialogOpen] = useState(false);
    const [priceHistory, setPriceHistory] = useState<PriceHistoryItem[]>([]);
    const [historyItemName, setHistoryItemName] = useState("");
    const [isLoadingHistory, setIsLoadingHistory] = useState(false);
    const [editingItem, setEditingItem] = useState<Item | null>(null);
    const [name, setName] = useState("");
    const [categoryId, setCategoryId] = useState("");
    const [price, setPrice] = useState(0);
    const [unit, setUnit] = useState("unit");
    const [description, setDescription] = useState("");
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const { toast } = useToast();
    const { user } = useAuth();

    const fetchData = async () => {
        try {
            const [itemsRes, categoriesRes] = await Promise.all([supabase.from("items").select("*, categories(id, name)").order("name", { ascending: true }), supabase.from("categories").select("id, name").order("display_order")]);

            if (itemsRes.error) throw itemsRes.error;
            if (categoriesRes.error) throw categoriesRes.error;

            setItems(itemsRes.data || []);
            setCategories(categoriesRes.data || []);
        } catch (error) {
            console.error("Error fetching data:", error);
            toast({ variant: "destructive", title: "Gagal memuat data" });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const openDialog = (item?: Item) => {
        if (item) {
            setEditingItem(item);
            setName(item.name);
            setDescription(item.description || "");
            setCategoryId(item.category_id);
            setPrice(item.price);
            setUnit(item.unit);
            setImageUrl(item.image_url);
        } else {
            setEditingItem(null);
            setName("");
            setDescription("");
            setCategoryId(categories[0]?.id || "");
            setPrice(0);
            setUnit("unit");
            setImageUrl(null);
        }
        setIsDialogOpen(true);
    };

    const viewPriceHistory = async (item: Item) => {
        setHistoryItemName(item.name);
        setIsHistoryDialogOpen(true);
        setIsLoadingHistory(true);

        try {
            const { data, error } = await supabase.from("price_history").select("*").eq("item_id", item.id).order("changed_at", { ascending: false });

            if (error) throw error;
            setPriceHistory(data || []);
        } catch (error) {
            console.error("Error fetching price history:", error);
            toast({ variant: "destructive", title: "Gagal memuat riwayat harga" });
        } finally {
            setIsLoadingHistory(false);
        }
    };

    const handleSave = async () => {
        if (!name.trim() || !categoryId) {
            toast({ variant: "destructive", title: "Nama dan kategori wajib diisi" });
            return;
        }

        setIsSaving(true);
        try {
            if (editingItem) {
                // Check if price changed for history tracking
                const priceChanged = editingItem.price !== price;

                const { error } = await supabase
                    .from("items")
                    .update({ name, description: description || null, category_id: categoryId, price, unit, image_url: imageUrl })
                    .eq("id", editingItem.id);

                if (error) throw error;

                // Record price change in history if price changed
                if (priceChanged) {
                    const { error: historyError } = await supabase.from("price_history").insert({
                        item_id: editingItem.id,
                        old_price: editingItem.price,
                        new_price: price,
                        changed_by: user?.id,
                    });

                    if (historyError) {
                        console.error("Error recording price history:", historyError);
                    }
                }

                toast({ title: "Item diperbarui" });
            } else {
                const { error } = await supabase.from("items").insert({ name, description: description || null, category_id: categoryId, price, unit, image_url: imageUrl });

                if (error) throw error;
                toast({ title: "Item dibuat" });
            }

            setIsDialogOpen(false);
            fetchData();
        } catch (error) {
            console.error("Error saving item:", error);
            toast({ variant: "destructive", title: "Gagal menyimpan item" });
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Apakah Anda yakin ingin menghapus item ini?")) return;

        try {
            const { error } = await supabase.from("items").delete().eq("id", id);
            if (error) throw error;
            toast({ title: "Item dihapus" });
            fetchData();
        } catch (error) {
            console.error("Error deleting item:", error);
            toast({ variant: "destructive", title: "Gagal menghapus item" });
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Item</h1>
                    <p className="text-muted-foreground">Kelola item dan harga acara</p>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button onClick={() => openDialog()} disabled={categories.length === 0}>
                            <Plus className="mr-2 h-4 w-4" />
                            Tambah Item
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                        <DialogHeader>
                            <DialogTitle>{editingItem ? "Edit Item" : "Tambah Item"}</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label>Gambar</Label>
                                <ImageUpload value={imageUrl} onChange={setImageUrl} folder="items" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="name">Nama</Label>
                                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Nama item" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="category">Kategori</Label>
                                <Select value={categoryId} onValueChange={setCategoryId}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Pilih kategori" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {categories.map((cat) => (
                                            <SelectItem key={cat.id} value={cat.id}>
                                                {cat.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="price">Price (IDR)</Label>
                                <Input id="price" type="number" value={price} onChange={(e) => setPrice(Number(e.target.value))} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="unit">Satuan</Label>
                                <Input id="unit" value={unit} onChange={(e) => setUnit(e.target.value)} placeholder="contoh: unit, pax, set" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="description">Deskripsi</Label>
                                <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Deskripsi item (opsional)" rows={3} />
                            </div>
                            <Button onClick={handleSave} className="w-full" disabled={isSaving}>
                                {isSaving ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Menyimpan...
                                    </>
                                ) : (
                                    "Simpan"
                                )}
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            {categories.length === 0 && !isLoading && (
                <Card>
                    <CardContent className="py-8 text-center text-muted-foreground">Silakan buat minimal satu kategori sebelum menambahkan item.</CardContent>
                </Card>
            )}

            <Card>
                <CardHeader>
                    <CardTitle>Semua Item</CardTitle>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="flex justify-center py-8">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                    ) : items.length === 0 ? (
                        <p className="text-center py-8 text-muted-foreground">Belum ada item. Buat item pertama Anda.</p>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[60px]">Gambar</TableHead>
                                    <TableHead>Nama</TableHead>
                                    <TableHead>Kategori</TableHead>
                                    <TableHead>Harga</TableHead>
                                    <TableHead>Satuan</TableHead>
                                    <TableHead className="w-[140px]">Aksi</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {items.map((item) => (
                                    <TableRow key={item.id}>
                                        <TableCell>
                                            {item.image_url ? (
                                                <img src={item.image_url} alt={item.name} className="h-10 w-10 rounded object-cover" />
                                            ) : (
                                                <div className="h-10 w-10 rounded bg-secondary flex items-center justify-center">
                                                    <ImageIcon className="h-4 w-4 text-muted-foreground" />
                                                </div>
                                            )}
                                        </TableCell>
                                        <TableCell className="font-medium">{item.name}</TableCell>
                                        <TableCell>{item.categories?.name || "-"}</TableCell>
                                        <TableCell>{formatCurrency(item.price)}</TableCell>
                                        <TableCell>{item.unit}</TableCell>
                                        <TableCell>
                                            <div className="flex gap-1">
                                                <Button variant="ghost" size="icon" onClick={() => viewPriceHistory(item)} title="Lihat Riwayat Harga">
                                                    <History className="h-4 w-4" />
                                                </Button>
                                                <Button variant="ghost" size="icon" onClick={() => openDialog(item)}>
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                                <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => handleDelete(item.id)}>
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            {/* Price History Dialog */}
            <Dialog open={isHistoryDialogOpen} onOpenChange={setIsHistoryDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Riwayat Harga - {historyItemName}</DialogTitle>
                    </DialogHeader>
                    {isLoadingHistory ? (
                        <div className="flex justify-center py-4">
                            <Loader2 className="h-6 w-6 animate-spin text-primary" />
                        </div>
                    ) : priceHistory.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-8">Belum ada perubahan harga tercatat.</p>
                    ) : (
                        <div className="space-y-3 max-h-[400px] overflow-y-auto">
                            {priceHistory.map((history) => (
                                <div key={history.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/30">
                                    <div className="flex items-center gap-3">
                                        <span className="text-muted-foreground line-through">{formatCurrency(history.old_price)}</span>
                                        <span className="text-muted-foreground">→</span>
                                        <span className="font-medium text-primary">{formatCurrency(history.new_price)}</span>
                                    </div>
                                    <div className="text-sm text-muted-foreground">{format(new Date(history.changed_at), "MMM d, yyyy HH:mm")}</div>
                                </div>
                            ))}
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default Items;
