import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, AlertCircle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { SelectedItem } from "@/lib/types";
import { formatCurrency } from "@/lib/formatCurrency";
import { useSubmitInquiry } from "@/hooks/use-submit-inquiry";
import { useRateLimit } from "@/hooks/use-rate-limit";
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
    const { submitInquiry, isSubmitting } = useSubmitInquiry();
    const { checkRateLimit, isLimited, remainingTime } = useRateLimit("inquiry");
    const { toast } = useToast();

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

        // Check rate limit
        if (!checkRateLimit()) {
            toast({
                variant: "destructive",
                title: "Too many requests",
                description: `Please wait ${remainingTime} seconds before submitting again.`,
            });
            return;
        }

        if (!formData.name.trim()) {
            toast({ variant: "destructive", title: "Name is required" });
            return;
        }

        if (!formData.phone.trim()) {
            toast({ variant: "destructive", title: "Phone number is required" });
            return;
        }

        const result = await submitInquiry({
            customerName: formData.name,
            email: formData.email,
            phone: formData.phone,
            eventDate: formData.eventDate,
            eventLocation: formData.eventLocation,
            notes: formData.notes,
            total,
            items: selectedItems.map((item) => ({
                itemId: item.id,
                itemName: item.name,
                quantity: item.quantity,
                priceAtTime: item.price,
            })),
        });

        if (result) {
            // Store inquiry data for success page
            localStorage.setItem(
                "lastInquiry",
                JSON.stringify({
                    id: result.id,
                    customerName: result.customerName,
                    email: result.email,
                    phone: result.phone,
                    eventDate: result.eventDate,
                    total: result.total,
                    createdAt: result.createdAt,
                    items: selectedItems,
                })
            );

            // Reset form and close dialog
            handleClose();

            // Navigate to success page
            navigate("/success");
        } else {
            toast({
                variant: "destructive",
                title: "Failed to submit inquiry",
                description: "Please try again later.",
            });
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
                    <DialogTitle>Request a Quote</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Selected Items Summary */}
                    <div className="rounded-xl border border-border bg-muted/30 p-4">
                        <h4 className="mb-3 text-sm font-semibold text-foreground">Selected Items ({selectedItems.length})</h4>
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
                                Full Name <span className="text-destructive">*</span>
                            </Label>
                            <Input id="name" name="name" value={formData.name} onChange={handleInputChange} placeholder="Your full name" required />
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                            <div>
                                <Label htmlFor="email">Email</Label>
                                <Input id="email" name="email" type="email" value={formData.email} onChange={handleInputChange} placeholder="you@email.com" />
                            </div>
                            <div>
                                <Label htmlFor="phone">
                                    WhatsApp / Phone <span className="text-destructive">*</span>
                                </Label>
                                <Input id="phone" name="phone" value={formData.phone} onChange={handleInputChange} placeholder="+62 812 3456 7890" required />
                            </div>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                            <div>
                                <Label htmlFor="eventDate">Event Date</Label>
                                <Input id="eventDate" name="eventDate" type="date" value={formData.eventDate} onChange={handleInputChange} />
                            </div>
                            <div>
                                <Label htmlFor="eventLocation">Event Location</Label>
                                <Input id="eventLocation" name="eventLocation" value={formData.eventLocation} onChange={handleInputChange} placeholder="City or venue" />
                            </div>
                        </div>

                        <div>
                            <Label htmlFor="notes">Additional Notes</Label>
                            <Textarea id="notes" name="notes" value={formData.notes} onChange={handleInputChange} placeholder="Any special requirements or questions..." rows={3} />
                        </div>
                    </div>

                    <Button type="submit" className="w-full shadow-button" size="lg" disabled={isSubmitting}>
                        {isSubmitting ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Submitting...
                            </>
                        ) : (
                            "Submit Request"
                        )}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default CheckoutModal;
