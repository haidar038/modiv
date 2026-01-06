import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { sendInquiryEmails } from "@/lib/email-service";
import { isEmailConfigured } from "@/lib/email-config";

export interface InquirySubmission {
    customerName: string;
    email: string;
    phone: string;
    eventDate: string;
    eventLocation: string;
    notes?: string;
    total: number;
    items: Array<{
        itemId: string;
        itemName: string;
        quantity: number;
        priceAtTime: number;
    }>;
}

export interface InquiryResult {
    id: string;
    customerName: string;
    email: string | null;
    phone: string | null;
    eventDate: string | null;
    eventLocation: string | null;
    total: number;
    createdAt: string;
    emailsSent: boolean;
}

export function useSubmitInquiry() {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    const submitInquiry = async (data: InquirySubmission): Promise<InquiryResult | null> => {
        setIsSubmitting(true);
        setError(null);

        try {
            // Calculate server-side total for verification
            const serverTotal = data.items.reduce((sum, item) => sum + item.priceAtTime * item.quantity, 0);

            // Verify client total matches server calculation (with small tolerance)
            if (Math.abs(serverTotal - data.total) > 1) {
                console.warn("Client total differs from server calculation", {
                    clientTotal: data.total,
                    serverTotal,
                });
            }

            // Insert inquiry
            const { data: inquiry, error: inquiryError } = await supabase
                .from("inquiries")
                .insert({
                    customer_name: data.customerName,
                    email: data.email || null,
                    phone: data.phone || null,
                    event_date: data.eventDate || null,
                    event_type: data.eventLocation || null,
                    notes: data.notes || null,
                    total: serverTotal,
                    status: "pending",
                })
                .select()
                .single();

            if (inquiryError) throw inquiryError;

            // Insert inquiry items
            if (data.items.length > 0) {
                const inquiryItems = data.items.map((item) => ({
                    inquiry_id: inquiry.id,
                    item_id: item.itemId,
                    item_name: item.itemName,
                    quantity: item.quantity,
                    price_at_time: item.priceAtTime,
                }));

                const { error: itemsError } = await supabase.from("inquiry_items").insert(inquiryItems);

                if (itemsError) {
                    console.error("Error inserting inquiry items:", itemsError);
                }
            }

            // Send emails (non-blocking - don't fail if email fails)
            let emailsSent = false;
            if (isEmailConfigured()) {
                try {
                    const emailData = {
                        inquiryId: inquiry.id,
                        customerName: inquiry.customer_name,
                        email: inquiry.email || "",
                        phone: inquiry.phone || "",
                        eventDate: inquiry.event_date,
                        eventLocation: inquiry.event_type,
                        total: inquiry.total,
                        items: data.items.map((item) => ({
                            name: item.itemName,
                            quantity: item.quantity,
                            price: item.priceAtTime,
                        })),
                        createdAt: inquiry.created_at,
                    };

                    const emailResults = await sendInquiryEmails(emailData);
                    emailsSent = emailResults.customerEmail.success || emailResults.vendorEmail.success;

                    if (!emailResults.customerEmail.success) {
                        console.warn("Customer email not sent:", emailResults.customerEmail.error);
                    }
                    if (!emailResults.vendorEmail.success) {
                        console.warn("Vendor email not sent:", emailResults.vendorEmail.error);
                    }
                } catch (emailError) {
                    console.error("Email sending failed:", emailError);
                }
            }

            return {
                id: inquiry.id,
                customerName: inquiry.customer_name,
                email: inquiry.email,
                phone: inquiry.phone,
                eventDate: inquiry.event_date,
                eventLocation: inquiry.event_type,
                total: inquiry.total,
                createdAt: inquiry.created_at,
                emailsSent,
            };
        } catch (err) {
            console.error("Error submitting inquiry:", err);
            setError(err as Error);
            return null;
        } finally {
            setIsSubmitting(false);
        }
    };

    return { submitInquiry, isSubmitting, error };
}
