import { getEmailFunctionUrl, isEmailConfigured } from "./email-config";
import { generateCustomerConfirmationEmail, generateVendorNotificationEmail, generatePlainTextEmail } from "./email-templates";
import { supabase } from "@/integrations/supabase/client";

interface EmailResult {
    success: boolean;
    error?: string;
}

interface InquiryEmailData {
    inquiryId: string;
    customerName: string;
    email: string;
    phone: string;
    eventDate: string | null;
    eventLocation: string | null;
    total: number;
    items: Array<{
        name: string;
        quantity: number;
        price: number;
    }>;
    createdAt: string;
}

/**
 * Send email via Supabase Edge Function
 * The Edge Function handles Gmail SMTP on the server side
 */
async function sendEmailViaEdgeFunction(to: string, subject: string, html: string, text: string): Promise<EmailResult> {
    if (!isEmailConfigured()) {
        return { success: false, error: "Email not configured" };
    }

    try {
        const { data: sessionData } = await supabase.auth.getSession();

        const response = await fetch(getEmailFunctionUrl(), {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${sessionData?.session?.access_token || import.meta.env.VITE_SUPABASE_ANON_KEY}`,
            },
            body: JSON.stringify({
                to,
                subject,
                html,
                text,
            }),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error("Edge Function error:", errorData);
            return {
                success: false,
                error: errorData.error || "Failed to send email",
            };
        }

        const result = await response.json();
        return { success: true, ...result };
    } catch (error) {
        console.error("Email sending error:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
        };
    }
}

/**
 * Send confirmation email to customer
 */
export async function sendCustomerConfirmationEmail(data: InquiryEmailData): Promise<EmailResult> {
    if (!data.email) {
        return { success: false, error: "No customer email provided" };
    }

    if (!isEmailConfigured()) {
        console.log("Email not configured, skipping customer confirmation");
        return { success: false, error: "Email not configured" };
    }

    const html = generateCustomerConfirmationEmail(data);
    const text = generatePlainTextEmail(data);
    const subject = `Your Event Inquiry #${data.inquiryId.slice(0, 8).toUpperCase()} - Modiv EventCraft`;

    return sendEmailViaEdgeFunction(data.email, subject, html, text);
}

/**
 * Send notification email to vendor
 */
export async function sendVendorNotificationEmail(data: InquiryEmailData): Promise<EmailResult> {
    if (!isEmailConfigured()) {
        console.log("Email not configured, skipping vendor notification");
        return { success: false, error: "Email not configured" };
    }

    const vendorEmail = import.meta.env.VITE_VENDOR_EMAIL || import.meta.env.VITE_EMAIL_USER;
    const html = generateVendorNotificationEmail(data);
    const subject = `🔔 New Inquiry: ${data.customerName} - ${data.total.toLocaleString("id-ID")}`;

    return sendEmailViaEdgeFunction(vendorEmail, subject, html, html);
}

/**
 * Send all inquiry-related emails
 */
export async function sendInquiryEmails(data: InquiryEmailData): Promise<{
    customerEmail: EmailResult;
    vendorEmail: EmailResult;
}> {
    const [customerResult, vendorResult] = await Promise.all([sendCustomerConfirmationEmail(data), sendVendorNotificationEmail(data)]);

    return {
        customerEmail: customerResult,
        vendorEmail: vendorResult,
    };
}
