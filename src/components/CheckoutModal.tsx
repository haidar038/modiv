import { useState } from "react";
import { X, CheckCircle, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SelectedItem } from "@/lib/types";
import { formatIDR } from "@/lib/formatCurrency";

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
}

const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  selectedItems,
  total,
}) => {
  const [step, setStep] = useState<"form" | "submitting" | "success">("form");
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    phone: "",
    eventDate: "",
    eventLocation: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStep("submitting");
    
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));
    
    setStep("success");
  };

  const handleClose = () => {
    setStep("form");
    setFormData({
      name: "",
      email: "",
      phone: "",
      eventDate: "",
      eventLocation: "",
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {step === "success" ? "Request Submitted!" : "Request a Quote"}
          </DialogTitle>
        </DialogHeader>

        {step === "success" ? (
          <div className="py-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="mb-2 text-xl font-bold text-foreground">
              Thank You, {formData.name}!
            </h3>
            <p className="mb-6 text-muted-foreground">
              We've received your event request. Our team will contact you within 24 hours.
            </p>

            <div className="rounded-xl border border-border bg-muted/30 p-4 text-left">
              <h4 className="mb-3 text-sm font-semibold text-foreground">
                Quote Summary
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Event Date</span>
                  <span className="font-medium">{formData.eventDate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Location</span>
                  <span className="font-medium">{formData.eventLocation}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Items</span>
                  <span className="font-medium">{selectedItems.length} selected</span>
                </div>
                <div className="flex justify-between border-t border-border pt-2 mt-2">
                  <span className="font-semibold text-foreground">Estimated Budget</span>
                  <span className="font-bold text-primary">{formatIDR(total)}</span>
                </div>
              </div>
            </div>

            <Button onClick={handleClose} className="mt-6 w-full">
              Close
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Selected Items Summary */}
            <div className="rounded-xl border border-border bg-muted/30 p-4">
              <h4 className="mb-3 text-sm font-semibold text-foreground">
                Selected Items ({selectedItems.length})
              </h4>
              <div className="max-h-32 space-y-1 overflow-y-auto text-sm">
                {selectedItems.map((item) => (
                  <div key={item.id} className="flex justify-between text-muted-foreground">
                    <span className="truncate">{item.name} x{item.quantity}</span>
                    <span>{formatIDR(item.price * item.quantity)}</span>
                  </div>
                ))}
              </div>
              <div className="mt-3 flex justify-between border-t border-border pt-3">
                <span className="font-semibold text-foreground">Total</span>
                <span className="font-bold text-primary">{formatIDR(total)}</span>
              </div>
            </div>

            {/* Form Fields */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Your full name"
                  required
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="you@email.com"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="phone">WhatsApp / Phone</Label>
                  <Input
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="+62 812 3456 7890"
                    required
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="eventDate">Event Date</Label>
                  <Input
                    id="eventDate"
                    name="eventDate"
                    type="date"
                    value={formData.eventDate}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="eventLocation">Event Location</Label>
                  <Input
                    id="eventLocation"
                    name="eventLocation"
                    value={formData.eventLocation}
                    onChange={handleInputChange}
                    placeholder="City or venue"
                    required
                  />
                </div>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full shadow-button"
              size="lg"
              disabled={step === "submitting"}
            >
              {step === "submitting" ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                "Submit Request"
              )}
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default CheckoutModal;
