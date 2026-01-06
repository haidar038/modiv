import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Category {
    id: string;
    name: string;
    display_order: number;
    created_at: string;
}

const Categories = () => {
    const [categories, setCategories] = useState<Category[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);
    const [name, setName] = useState("");
    const [displayOrder, setDisplayOrder] = useState(0);
    const [isSaving, setIsSaving] = useState(false);
    const { toast } = useToast();

    const fetchCategories = async () => {
        try {
            const { data, error } = await supabase.from("categories").select("*").order("display_order", { ascending: true });

            if (error) throw error;
            setCategories(data || []);
        } catch (error) {
            console.error("Error fetching categories:", error);
            toast({ variant: "destructive", title: "Gagal memuat kategori" });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    const openDialog = (category?: Category) => {
        if (category) {
            setEditingCategory(category);
            setName(category.name);
            setDisplayOrder(category.display_order);
        } else {
            setEditingCategory(null);
            setName("");
            setDisplayOrder(categories.length);
        }
        setIsDialogOpen(true);
    };

    const handleSave = async () => {
        if (!name.trim()) {
            toast({ variant: "destructive", title: "Nama wajib diisi" });
            return;
        }

        setIsSaving(true);
        try {
            if (editingCategory) {
                const { error } = await supabase.from("categories").update({ name, display_order: displayOrder }).eq("id", editingCategory.id);

                if (error) throw error;
                toast({ title: "Kategori diperbarui" });
            } else {
                const { error } = await supabase.from("categories").insert({ name, display_order: displayOrder });

                if (error) throw error;
                toast({ title: "Kategori dibuat" });
            }

            setIsDialogOpen(false);
            fetchCategories();
        } catch (error) {
            console.error("Error saving category:", error);
            toast({ variant: "destructive", title: "Gagal menyimpan kategori" });
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Apakah Anda yakin ingin menghapus kategori ini? Semua item dalam kategori ini juga akan dihapus.")) {
            return;
        }

        try {
            const { error } = await supabase.from("categories").delete().eq("id", id);
            if (error) throw error;
            toast({ title: "Kategori dihapus" });
            fetchCategories();
        } catch (error) {
            console.error("Error deleting category:", error);
            toast({ variant: "destructive", title: "Gagal menghapus kategori" });
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Kategori</h1>
                    <p className="text-muted-foreground">Kelola kategori item acara</p>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button onClick={() => openDialog()}>
                            <Plus className="mr-2 h-4 w-4" />
                            Tambah Kategori
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>{editingCategory ? "Edit Kategori" : "Tambah Kategori"}</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Nama</Label>
                                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Nama kategori" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="order">Urutan Tampilan</Label>
                                <Input id="order" type="number" value={displayOrder} onChange={(e) => setDisplayOrder(Number(e.target.value))} />
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

            <Card>
                <CardHeader>
                    <CardTitle>Semua Kategori</CardTitle>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="flex justify-center py-8">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                    ) : categories.length === 0 ? (
                        <p className="text-center py-8 text-muted-foreground">Belum ada kategori. Buat kategori pertama Anda.</p>
                    ) : (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Nama</TableHead>
                                        <TableHead>Urutan Tampilan</TableHead>
                                        <TableHead className="w-[100px]">Aksi</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {categories.map((category) => (
                                        <TableRow key={category.id}>
                                            <TableCell className="font-medium">{category.name}</TableCell>
                                            <TableCell>{category.display_order}</TableCell>
                                            <TableCell>
                                                <div className="flex gap-2">
                                                    <Button variant="ghost" size="icon" onClick={() => openDialog(category)}>
                                                        <Pencil className="h-4 w-4" />
                                                    </Button>
                                                    <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => handleDelete(category.id)}>
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default Categories;
