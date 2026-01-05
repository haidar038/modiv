import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Eye, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency } from "@/lib/formatCurrency";
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
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoadingItems, setIsLoadingItems] = useState(false);
  const { toast } = useToast();

  const fetchInquiries = async () => {
    try {
      const { data, error } = await supabase
        .from("inquiries")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setInquiries(data || []);
    } catch (error) {
      console.error("Error fetching inquiries:", error);
      toast({ variant: "destructive", title: "Error loading inquiries" });
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
    setIsLoadingItems(true);

    try {
      const { data, error } = await supabase
        .from("inquiry_items")
        .select("*")
        .eq("inquiry_id", inquiry.id);

      if (error) throw error;
      setInquiryItems(data || []);
    } catch (error) {
      console.error("Error fetching inquiry items:", error);
    } finally {
      setIsLoadingItems(false);
    }
  };

  const updateStatus = async (inquiryId: string, status: string) => {
    try {
      const { error } = await supabase
        .from("inquiries")
        .update({ status })
        .eq("id", inquiryId);

      if (error) throw error;
      toast({ title: "Status updated" });
      fetchInquiries();
    } catch (error) {
      console.error("Error updating status:", error);
      toast({ variant: "destructive", title: "Error updating status" });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Inquiries</h1>
        <p className="text-muted-foreground">View and manage customer inquiries</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Inquiries</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : inquiries.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">
              No inquiries yet.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Event Date</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {inquiries.map((inquiry) => (
                  <TableRow key={inquiry.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{inquiry.customer_name}</div>
                        {inquiry.email && (
                          <div className="text-sm text-muted-foreground">
                            {inquiry.email}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {inquiry.event_date
                        ? format(new Date(inquiry.event_date), "MMM d, yyyy")
                        : "-"}
                    </TableCell>
                    <TableCell className="font-medium">
                      {formatCurrency(inquiry.total)}
                    </TableCell>
                    <TableCell>
                      <Select
                        value={inquiry.status}
                        onValueChange={(value) => updateStatus(inquiry.id, value)}
                      >
                        <SelectTrigger className="w-[130px]">
                          <Badge
                            variant="outline"
                            className={statusColors[inquiry.status] || ""}
                          >
                            {inquiry.status}
                          </Badge>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="contacted">Contacted</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                          <SelectItem value="cancelled">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {format(new Date(inquiry.created_at), "MMM d, yyyy")}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => viewInquiry(inquiry)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Inquiry Details</DialogTitle>
          </DialogHeader>
          {selectedInquiry && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-muted-foreground">Customer</div>
                  <div className="font-medium">{selectedInquiry.customer_name}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Email</div>
                  <div className="font-medium">{selectedInquiry.email || "-"}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Phone</div>
                  <div className="font-medium">{selectedInquiry.phone || "-"}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Event Date</div>
                  <div className="font-medium">
                    {selectedInquiry.event_date
                      ? format(new Date(selectedInquiry.event_date), "MMM d, yyyy")
                      : "-"}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Event Type</div>
                  <div className="font-medium">{selectedInquiry.event_type || "-"}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Total</div>
                  <div className="font-medium text-primary">
                    {formatCurrency(selectedInquiry.total)}
                  </div>
                </div>
              </div>

              {selectedInquiry.notes && (
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Notes</div>
                  <div className="text-sm bg-secondary/50 rounded-lg p-3">
                    {selectedInquiry.notes}
                  </div>
                </div>
              )}

              <div>
                <div className="text-sm font-medium mb-2">Items</div>
                {isLoadingItems ? (
                  <div className="flex justify-center py-4">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  </div>
                ) : inquiryItems.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No items recorded.</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Item</TableHead>
                        <TableHead className="text-right">Qty</TableHead>
                        <TableHead className="text-right">Price</TableHead>
                        <TableHead className="text-right">Subtotal</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {inquiryItems.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>{item.item_name}</TableCell>
                          <TableCell className="text-right">{item.quantity}</TableCell>
                          <TableCell className="text-right">
                            {formatCurrency(item.price_at_time)}
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            {formatCurrency(item.price_at_time * item.quantity)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Inquiries;
