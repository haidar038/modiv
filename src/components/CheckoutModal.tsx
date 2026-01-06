import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { SelectedItem } from "@/lib/types";
import { formatCurrency } from "@/lib/formatCurrency";
import { useToast } from "@/hooks/use-toast";

interface CheckoutModalProps {
    isOpen: boolean;
    onClose: () => void;
    selectedItems: SelectedItem[];
    total: number;
}

interface FormData {
    name: string;
    email: string;
    phone: string;
    eventDate: string;
    eventLocation: string;
    notes: string;
}

const CheckoutModal: React.FC<CheckoutModalProps> = ({ isOpen, onClose, selectedItems, total }) => {
    const navigate = useNavigate();
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [formData, setFormData] = useState<FormData>({
        name: "",
        email: "",
        phone: "",
        eventDate: "",
        eventLocation: "",
        notes: "",
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.name.trim()) {
            toast({ variant: "destructive", title: "Nama wajib diisi" });
            return;
        }

        if (!formData.phone.trim()) {
            toast({ variant: "destructive", title: "Nomor telepon wajib diisi" });
            return;
        }

        setIsSubmitting(true);

        try {
            // Generate local invoice ID (no database submission for MVP)
            const localId = `INV-${Date.now()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

            // Store inquiry data locally for Success page
            const inquiryData = {
                id: localId,
                customerName: formData.name,
                email: formData.email || null,
                phone: formData.phone || null,
                eventDate: formData.eventDate || null,
                eventLocation: formData.eventLocation || null,
                total,
                createdAt: new Date().toISOString(),
                items: selectedItems,
            };

            localStorage.setItem("lastInquiry", JSON.stringify(inquiryData));

            // Reset form and close dialog
            handleClose();

            // Navigate to success page
            navigate("/success");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClose = () => {
        setFormData({
            name: "",
            email: "",
            phone: "",
            eventDate: "",
            eventLocation: "",
            notes: "",
        });
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Minta Penawaran</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Selected Items Summary */}
                    <div className="rounded-xl border border-border bg-muted/30 p-4">
                        <h4 className="mb-3 text-sm font-semibold text-foreground">Item yang Dipilih ({selectedItems.length})</h4>
                        <div className="max-h-32 space-y-1 overflow-y-auto text-sm">
                            {selectedItems.map((item) => (
                                <div key={item.id} className="flex justify-between text-muted-foreground">
                                    <span className="truncate">
                                        {item.name} x{item.quantity}
                                    </span>
                                    <span>{formatCurrency(item.price * item.quantity)}</span>
                                </div>
                            ))}
                        </div>
                        <div className="mt-3 flex justify-between border-t border-border pt-3">
                            <span className="font-semibold text-foreground">Total</span>
                            <span className="font-bold text-primary">{formatCurrency(total)}</span>
                        </div>
                    </div>

                    {/* Form Fields */}
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="name">
                                Nama Lengkap <span className="text-destructive">*</span>
                            </Label>
                            <Input id="name" name="name" value={formData.name} onChange={handleInputChange} placeholder="Nama lengkap Anda" required />
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                            <div>
                                <Label htmlFor="email">Email</Label>
                                <Input id="email" name="email" type="email" value={formData.email} onChange={handleInputChange} placeholder="you@email.com" />
                            </div>
                            <div>
                                <Label htmlFor="phone">
                                    WhatsApp / Telepon <span className="text-destructive">*</span>
                                </Label>
                                <Input id="phone" name="phone" value={formData.phone} onChange={handleInputChange} placeholder="+62 812 3456 7890" required />
                            </div>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                            <div>
                                <Label htmlFor="eventDate">Tanggal Acara</Label>
                                <Input id="eventDate" name="eventDate" type="date" value={formData.eventDate} onChange={handleInputChange} />
                            </div>
                            <div>
                                <Label htmlFor="eventLocation">Lokasi Acara</Label>
                                <Input id="eventLocation" name="eventLocation" value={formData.eventLocation} onChange={handleInputChange} placeholder="Kota atau venue" />
                            </div>
                        </div>

                        <div>
                            <Label htmlFor="notes">Catatan Tambahan</Label>
                            <Textarea id="notes" name="notes" value={formData.notes} onChange={handleInputChange} placeholder="Kebutuhan khusus atau pertanyaan..." rows={3} />
                        </div>
                    </div>

                    <Button type="submit" className="w-full shadow-button" size="lg" disabled={isSubmitting}>
                        {isSubmitting ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Mengirim...
                            </>
                        ) : (
                            "Kirim Permintaan"
                        )}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default CheckoutModal;
