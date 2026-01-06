import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Eye, Loader2, Download, History, FileDown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency } from "@/lib/formatCurrency";
import { generateQuotationPdf } from "@/lib/generateQuotationPdf";
import { exportInquiriesToCSV } from "@/lib/export-csv";
import { format } from "date-fns";

interface InquiryItem {
    id: string;
    item_name: string;
    quantity: number;
    price_at_time: number;
}

interface Inquiry {
    id: string;
    customer_name: string;
    email: string | null;
    phone: string | null;
    event_date: string | null;
    event_type: string | null;
    notes: string | null;
    total: number;
    status: string;
    created_at: string;
}

interface StatusHistoryItem {
    id: string;
    old_status: string;
    new_status: string;
    changed_at: string;
    notes: string | null;
}

const statusColors: Record<string, string> = {
    pending: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
    contacted: "bg-blue-500/10 text-blue-600 border-blue-500/20",
    completed: "bg-green-500/10 text-green-600 border-green-500/20",
    cancelled: "bg-red-500/10 text-red-600 border-red-500/20",
};

const Inquiries = () => {
    const [inquiries, setInquiries] = useState<Inquiry[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);
    const [inquiryItems, setInquiryItems] = useState<InquiryItem[]>([]);
    const [statusHistory, setStatusHistory] = useState<StatusHistoryItem[]>([]);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isLoadingDetails, setIsLoadingDetails] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);
    const { toast } = useToast();
    const { user } = useAuth();

    const fetchInquiries = async () => {
        try {
            const { data, error } = await supabase.from("inquiries").select("*").order("created_at", { ascending: false });

            if (error) throw error;
            setInquiries(data || []);
        } catch (error) {
            console.error("Error fetching inquiries:", error);
            toast({ variant: "destructive", title: "Gagal memuat permintaan" });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchInquiries();
    }, []);

    const viewInquiry = async (inquiry: Inquiry) => {
        setSelectedInquiry(inquiry);
        setIsDialogOpen(true);
        setIsLoadingDetails(true);

        try {
            // Fetch inquiry items and status history in parallel
            const [itemsRes, historyRes] = await Promise.all([
                supabase.from("inquiry_items").select("*").eq("inquiry_id", inquiry.id),
                supabase.from("inquiry_status_history").select("*").eq("inquiry_id", inquiry.id).order("changed_at", { ascending: false }),
            ]);

            if (itemsRes.error) throw itemsRes.error;
            setInquiryItems(itemsRes.data || []);
            setStatusHistory(historyRes.data || []);
        } catch (error) {
            console.error("Error fetching inquiry details:", error);
        } finally {
            setIsLoadingDetails(false);
        }
    };

    const updateStatus = async (inquiryId: string, newStatus: string) => {
        const inquiry = inquiries.find((i) => i.id === inquiryId);
        if (!inquiry) return;

        const oldStatus = inquiry.status;
        if (oldStatus === newStatus) return;

        try {
            // Update the inquiry status
            const { error: updateError } = await supabase.from("inquiries").update({ status: newStatus }).eq("id", inquiryId);

            if (updateError) throw updateError;

            // Record status change in history
            const { error: historyError } = await supabase.from("inquiry_status_history").insert({
                inquiry_id: inquiryId,
                old_status: oldStatus,
                new_status: newStatus,
                changed_by: user?.id,
            });

            if (historyError) {
                console.error("Error recording status history:", historyError);
                // Don't throw - status was still updated
            }

            toast({ title: "Status diperbarui" });
            fetchInquiries();

            // Refresh status history if viewing this inquiry
            if (selectedInquiry?.id === inquiryId) {
                const { data } = await supabase.from("inquiry_status_history").select("*").eq("inquiry_id", inquiryId).order("changed_at", { ascending: false });
                setStatusHistory(data || []);
            }
        } catch (error) {
            console.error("Error updating status:", error);
            toast({ variant: "destructive", title: "Gagal memperbarui status" });
        }
    };

    const handleDownloadPdf = () => {
        if (!selectedInquiry) return;
        setIsDownloading(true);

        try {
            generateQuotationPdf({
                id: selectedInquiry.id,
                customer_name: selectedInquiry.customer_name,
                email: selectedInquiry.email,
                phone: selectedInquiry.phone,
                event_date: selectedInquiry.event_date,
                event_type: selectedInquiry.event_type,
                notes: selectedInquiry.notes,
                total: selectedInquiry.total,
                created_at: selectedInquiry.created_at,
                items: inquiryItems,
            });
            toast({ title: "PDF berhasil diunduh" });
        } catch (error) {
            console.error("Error generating PDF:", error);
            toast({ variant: "destructive", title: "Gagal membuat PDF" });
        } finally {
            setIsDownloading(false);
        }
    };

    const handleExportCSV = () => {
        if (inquiries.length === 0) {
            toast({ variant: "destructive", title: "Tidak ada data untuk diekspor" });
            return;
        }
        exportInquiriesToCSV(inquiries);
        toast({ title: "CSV berhasil diekspor" });
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Permintaan</h1>
                    <p className="text-muted-foreground">Lihat dan kelola permintaan pelanggan</p>
                </div>
                <Button variant="outline" onClick={handleExportCSV} disabled={inquiries.length === 0} className="w-full sm:w-auto">
                    <FileDown className="mr-2 h-4 w-4" />
                    Ekspor CSV
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Semua Permintaan ({inquiries.length})</CardTitle>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="flex justify-center py-8">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                    ) : inquiries.length === 0 ? (
                        <p className="text-center py-8 text-muted-foreground">Belum ada permintaan.</p>
                    ) : (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Pelanggan</TableHead>
                                        <TableHead>Tanggal Acara</TableHead>
                                        <TableHead>Total</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Dibuat</TableHead>
                                        <TableHead className="w-[100px]">Aksi</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {inquiries.map((inquiry) => (
                                        <TableRow key={inquiry.id}>
                                            <TableCell>
                                                <div>
                                                    <div className="font-medium">{inquiry.customer_name}</div>
                                                    {inquiry.email && <div className="text-sm text-muted-foreground">{inquiry.email}</div>}
                                                </div>
                                            </TableCell>
                                            <TableCell>{inquiry.event_date ? format(new Date(inquiry.event_date), "MMM d, yyyy") : "-"}</TableCell>
                                            <TableCell className="font-medium">{formatCurrency(inquiry.total)}</TableCell>
                                            <TableCell>
                                                <Select value={inquiry.status} onValueChange={(value) => updateStatus(inquiry.id, value)}>
                                                    <SelectTrigger className="w-[130px]">
                                                        <Badge variant="outline" className={statusColors[inquiry.status] || ""}>
                                                            {inquiry.status}
                                                        </Badge>
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="pending">Tertunda</SelectItem>
                                                        <SelectItem value="contacted">Dihubungi</SelectItem>
                                                        <SelectItem value="completed">Selesai</SelectItem>
                                                        <SelectItem value="cancelled">Dibatalkan</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </TableCell>
                                            <TableCell className="text-muted-foreground">{format(new Date(inquiry.created_at), "MMM d, yyyy")}</TableCell>
                                            <TableCell>
                                                <Button variant="ghost" size="icon" onClick={() => viewInquiry(inquiry)}>
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center justify-between">
                            <span>Detail Permintaan</span>
                            <Button variant="outline" size="sm" onClick={handleDownloadPdf} disabled={isDownloading || isLoadingDetails}>
                                {isDownloading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
                                Unduh PDF
                            </Button>
                        </DialogTitle>
                    </DialogHeader>
                    {selectedInquiry && (
                        <Tabs defaultValue="details" className="w-full">
                            <TabsList className="grid w-full grid-cols-2">
                                <TabsTrigger value="details">Detail</TabsTrigger>
                                <TabsTrigger value="history" className="flex items-center gap-1">
                                    <History className="h-3 w-3" />
                                    Riwayat Status
                                </TabsTrigger>
                            </TabsList>

                            <TabsContent value="details" className="space-y-6 mt-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <div className="text-sm text-muted-foreground">Pelanggan</div>
                                        <div className="font-medium">{selectedInquiry.customer_name}</div>
                                    </div>
                                    <div>
                                        <div className="text-sm text-muted-foreground">Email</div>
                                        <div className="font-medium">{selectedInquiry.email || "-"}</div>
                                    </div>
                                    <div>
                                        <div className="text-sm text-muted-foreground">Telepon</div>
                                        <div className="font-medium">{selectedInquiry.phone || "-"}</div>
                                    </div>
                                    <div>
                                        <div className="text-sm text-muted-foreground">Tanggal Acara</div>
                                        <div className="font-medium">{selectedInquiry.event_date ? format(new Date(selectedInquiry.event_date), "MMM d, yyyy") : "-"}</div>
                                    </div>
                                    <div>
                                        <div className="text-sm text-muted-foreground">Jenis Acara</div>
                                        <div className="font-medium">{selectedInquiry.event_type || "-"}</div>
                                    </div>
                                    <div>
                                        <div className="text-sm text-muted-foreground">Total</div>
                                        <div className="font-medium text-primary">{formatCurrency(selectedInquiry.total)}</div>
                                    </div>
                                </div>

                                {selectedInquiry.notes && (
                                    <div>
                                        <div className="text-sm text-muted-foreground mb-1">Catatan</div>
                                        <div className="text-sm bg-secondary/50 rounded-lg p-3">{selectedInquiry.notes}</div>
                                    </div>
                                )}

                                <div>
                                    <div className="text-sm font-medium mb-2">Items</div>
                                    {isLoadingDetails ? (
                                        <div className="flex justify-center py-4">
                                            <Loader2 className="h-6 w-6 animate-spin text-primary" />
                                        </div>
                                    ) : inquiryItems.length === 0 ? (
                                        <p className="text-sm text-muted-foreground">Tidak ada item tercatat.</p>
                                    ) : (
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>Item</TableHead>
                                                    <TableHead className="text-right">Jml</TableHead>
                                                    <TableHead className="text-right">Harga</TableHead>
                                                    <TableHead className="text-right">Subtotal</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {inquiryItems.map((item) => (
                                                    <TableRow key={item.id}>
                                                        <TableCell>{item.item_name}</TableCell>
                                                        <TableCell className="text-right">{item.quantity}</TableCell>
                                                        <TableCell className="text-right">{formatCurrency(item.price_at_time)}</TableCell>
                                                        <TableCell className="text-right font-medium">{formatCurrency(item.price_at_time * item.quantity)}</TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    )}
                                </div>
                            </TabsContent>

                            <TabsContent value="history" className="mt-4">
                                {isLoadingDetails ? (
                                    <div className="flex justify-center py-4">
                                        <Loader2 className="h-6 w-6 animate-spin text-primary" />
                                    </div>
                                ) : statusHistory.length === 0 ? (
                                    <p className="text-sm text-muted-foreground text-center py-8">Belum ada perubahan status tercatat.</p>
                                ) : (
                                    <div className="space-y-3">
                                        {statusHistory.map((history) => (
                                            <div key={history.id} className="flex items-center gap-4 p-3 rounded-lg bg-secondary/30">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2">
                                                        <Badge variant="outline" className={statusColors[history.old_status] || ""}>
                                                            {history.old_status}
                                                        </Badge>
                                                        <span className="text-muted-foreground">→</span>
                                                        <Badge variant="outline" className={statusColors[history.new_status] || ""}>
                                                            {history.new_status}
                                                        </Badge>
                                                    </div>
                                                    {history.notes && <p className="text-sm text-muted-foreground mt-1">{history.notes}</p>}
                                                </div>
                                                <div className="text-sm text-muted-foreground">{format(new Date(history.changed_at), "MMM d, yyyy HH:mm")}</div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </TabsContent>
                        </Tabs>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default Inquiries;
