import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { CheckCircle, Download, ArrowRight, Home, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import Header from "@/components/Header";
import { formatCurrency } from "@/lib/formatCurrency";
import { generateQuotationPdf } from "@/lib/generateQuotationPdf";
import { format } from "date-fns";
import { useCalculator } from "@/hooks/use-calculator";

interface InquiryData {
    id: string;
    customerName: string;
    email: string | null;
    phone: string | null;
    eventDate: string | null;
    total: number;
    createdAt: string;
    items: Array<{
        id: string;
        name: string;
        quantity: number;
        price: number;
    }>;
}

const Success = () => {
    const navigate = useNavigate();
    const { resetCalculator } = useCalculator();
    const [inquiry, setInquiry] = useState<InquiryData | null>(null);
    const [isDownloading, setIsDownloading] = useState(false);

    useEffect(() => {
        const stored = localStorage.getItem("lastInquiry");
        if (stored) {
            try {
                setInquiry(JSON.parse(stored));
                // Reset calculator after successful submission
                resetCalculator();
            } catch (e) {
                console.error("Error parsing inquiry data:", e);
                navigate("/");
            }
        } else {
            navigate("/");
        }
    }, [navigate, resetCalculator]);

    const handleDownloadPdf = () => {
        if (!inquiry) return;
        setIsDownloading(true);

        try {
            generateQuotationPdf({
                id: inquiry.id,
                customer_name: inquiry.customerName,
                email: inquiry.email,
                phone: inquiry.phone,
                event_date: inquiry.eventDate,
                event_type: null,
                notes: null,
                total: inquiry.total,
                created_at: inquiry.createdAt,
                items: inquiry.items.map((item) => ({
                    item_name: item.name,
                    quantity: item.quantity,
                    price_at_time: item.price,
                })),
            });
        } catch (error) {
            console.error("Error generating PDF:", error);
        } finally {
            setIsDownloading(false);
        }
    };

    const handleBackToHome = () => {
        localStorage.removeItem("lastInquiry");
        navigate("/");
    };

    if (!inquiry) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            <Header />

            <main className="container py-12">
                <div className="mx-auto max-w-2xl">
                    {/* Success Icon */}
                    <div className="mb-8 text-center">
                        <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
                            <CheckCircle className="h-10 w-10 text-green-600" />
                        </div>
                        <h1 className="mb-2 text-3xl font-extrabold text-foreground">Penawaran Harga Anda Siap!</h1>
                        <p className="text-muted-foreground">Unduh atau cetak penawaran Anda di bawah. Hubungi kami via WhatsApp untuk respon lebih cepat.</p>
                    </div>

                    {/* Inquiry Details Card */}
                    <Card className="mb-6">
                        <CardContent className="p-6">
                            <div className="mb-4 flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">ID Penawaran</p>
                                    <p className="font-mono text-lg font-bold text-primary">{inquiry.id.slice(0, 8).toUpperCase()}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm text-muted-foreground">Dibuat pada</p>
                                    <p className="font-medium">{format(new Date(inquiry.createdAt), "dd MMM yyyy, HH:mm")}</p>
                                </div>
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2 border-t border-border pt-4">
                                <div>
                                    <p className="text-sm text-muted-foreground">Nama</p>
                                    <p className="font-medium">{inquiry.customerName}</p>
                                </div>
                                {inquiry.phone && (
                                    <div>
                                        <p className="text-sm text-muted-foreground">Telepon</p>
                                        <p className="font-medium">{inquiry.phone}</p>
                                    </div>
                                )}
                                {inquiry.email && (
                                    <div>
                                        <p className="text-sm text-muted-foreground">Email</p>
                                        <p className="font-medium">{inquiry.email}</p>
                                    </div>
                                )}
                                {inquiry.eventDate && (
                                    <div>
                                        <p className="text-sm text-muted-foreground">Tanggal Acara</p>
                                        <p className="font-medium">{format(new Date(inquiry.eventDate), "dd MMM yyyy")}</p>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Items Table */}
                    <Card className="mb-6">
                        <CardContent className="p-6">
                            <h3 className="mb-4 font-semibold">Item yang Dipilih</h3>
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
                                    {inquiry.items.map((item) => (
                                        <TableRow key={item.id}>
                                            <TableCell>{item.name}</TableCell>
                                            <TableCell className="text-right">{item.quantity}</TableCell>
                                            <TableCell className="text-right">{formatCurrency(item.price)}</TableCell>
                                            <TableCell className="text-right font-medium">{formatCurrency(item.price * item.quantity)}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>

                            <div className="mt-4 flex justify-between border-t border-border pt-4">
                                <span className="text-lg font-semibold">Total Keseluruhan</span>
                                <span className="text-lg font-bold text-primary">{formatCurrency(inquiry.total)}</span>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Action Buttons */}
                    <div className="flex flex-col gap-3 sm:flex-row">
                        <Button onClick={handleDownloadPdf} variant="outline" className="flex-1" disabled={isDownloading}>
                            {isDownloading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
                            Unduh PDF Penawaran
                        </Button>
                        <Button onClick={handleBackToHome} className="flex-1">
                            <Home className="mr-2 h-4 w-4" />
                            Kembali ke Beranda
                        </Button>
                    </div>

                    {/* WhatsApp CTA */}
                    <div className="mt-8 rounded-xl bg-muted/50 p-6 text-center">
                        <p className="mb-2 font-medium">Butuh bantuan segera?</p>
                        <p className="mb-4 text-sm text-muted-foreground">Hubungi kami via WhatsApp untuk respon lebih cepat</p>
                        <Button asChild variant="outline" className="gap-2">
                            <a href={`https://wa.me/6281234567890?text=Halo, saya tertarik dengan penawaran (ID: ${inquiry.id.slice(0, 8).toUpperCase()}). Bisakah kita diskusikan detailnya?`} target="_blank" rel="noopener noreferrer">
                                Chat via WhatsApp
                                <ArrowRight className="h-4 w-4" />
                            </a>
                        </Button>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Success;
