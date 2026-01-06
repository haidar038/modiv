import { formatCurrency } from "./formatCurrency";
import { format } from "date-fns";

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
 * Generate customer confirmation email HTML
 */
export function generateCustomerConfirmationEmail(data: InquiryEmailData): string {
    const itemsHtml = data.items
        .map(
            (item) => `
            <tr>
                <td style="padding: 8px; border-bottom: 1px solid #eee;">${item.name}</td>
                <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
                <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">${formatCurrency(item.price * item.quantity)}</td>
            </tr>
        `
        )
        .join("");

    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Inquiry Confirmation</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f4;">
    <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); padding: 30px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 24px;">✨ Modiv EventCraft</h1>
            <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0;">Professional Event Production</p>
        </div>
        
        <!-- Content -->
        <div style="padding: 30px;">
            <h2 style="color: #333; margin-top: 0;">Thank You, ${data.customerName}!</h2>
            <p style="color: #666; line-height: 1.6;">
                We have received your event inquiry. Our team will review your requirements and 
                contact you within 24 hours.
            </p>
            
            <!-- Inquiry Details -->
            <div style="background-color: #f9f9f9; border-radius: 8px; padding: 20px; margin: 20px 0;">
                <h3 style="color: #333; margin-top: 0; border-bottom: 2px solid #f97316; padding-bottom: 10px;">
                    Inquiry Details
                </h3>
                <table style="width: 100%; font-size: 14px;">
                    <tr>
                        <td style="padding: 5px 0; color: #666;">Inquiry ID</td>
                        <td style="padding: 5px 0; font-weight: bold; color: #f97316;">${data.inquiryId.slice(0, 8).toUpperCase()}</td>
                    </tr>
                    <tr>
                        <td style="padding: 5px 0; color: #666;">Submitted</td>
                        <td style="padding: 5px 0;">${format(new Date(data.createdAt), "dd MMM yyyy, HH:mm")}</td>
                    </tr>
                    ${
                        data.eventDate
                            ? `
                    <tr>
                        <td style="padding: 5px 0; color: #666;">Event Date</td>
                        <td style="padding: 5px 0;">${format(new Date(data.eventDate), "dd MMM yyyy")}</td>
                    </tr>
                    `
                            : ""
                    }
                    ${
                        data.eventLocation
                            ? `
                    <tr>
                        <td style="padding: 5px 0; color: #666;">Location</td>
                        <td style="padding: 5px 0;">${data.eventLocation}</td>
                    </tr>
                    `
                            : ""
                    }
                </table>
            </div>
            
            <!-- Items Table -->
            <h3 style="color: #333;">Selected Items</h3>
            <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
                <thead>
                    <tr style="background-color: #f9f9f9;">
                        <th style="padding: 10px; text-align: left; border-bottom: 2px solid #eee;">Item</th>
                        <th style="padding: 10px; text-align: center; border-bottom: 2px solid #eee;">Qty</th>
                        <th style="padding: 10px; text-align: right; border-bottom: 2px solid #eee;">Subtotal</th>
                    </tr>
                </thead>
                <tbody>
                    ${itemsHtml}
                </tbody>
                <tfoot>
                    <tr>
                        <td colspan="2" style="padding: 15px 10px; font-weight: bold; font-size: 16px;">Total Estimate</td>
                        <td style="padding: 15px 10px; font-weight: bold; font-size: 16px; text-align: right; color: #f97316;">
                            ${formatCurrency(data.total)}
                        </td>
                    </tr>
                </tfoot>
            </table>
            
            <!-- Contact Info -->
            <div style="margin-top: 30px; padding: 20px; background-color: #fff7ed; border-radius: 8px; text-align: center;">
                <p style="margin: 0; color: #666;">Need immediate assistance?</p>
                <a href="https://wa.me/6281234567890" style="display: inline-block; margin-top: 10px; padding: 10px 20px; background-color: #25d366; color: white; text-decoration: none; border-radius: 5px; font-weight: bold;">
                    💬 Chat on WhatsApp
                </a>
            </div>
        </div>
        
        <!-- Footer -->
        <div style="background-color: #333; color: #999; padding: 20px; text-align: center; font-size: 12px;">
            <p style="margin: 0;">© 2025 Modiv EventCraft. All rights reserved.</p>
            <p style="margin: 10px 0 0 0;">This is an automated email. Please do not reply directly.</p>
        </div>
    </div>
</body>
</html>
    `.trim();
}

/**
 * Generate vendor notification email HTML
 */
export function generateVendorNotificationEmail(data: InquiryEmailData): string {
    const itemsList = data.items.map((item) => `• ${item.name} x${item.quantity} (${formatCurrency(item.price * item.quantity)})`).join("\n");

    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>New Inquiry Alert</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f4;">
    <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #1f2937 0%, #374151 100%); padding: 20px; text-align: center;">
            <h1 style="color: #f97316; margin: 0; font-size: 20px;">🔔 New Inquiry Alert</h1>
        </div>
        
        <!-- Content -->
        <div style="padding: 25px;">
            <div style="background-color: #fef3c7; border-left: 4px solid #f97316; padding: 15px; margin-bottom: 20px;">
                <strong>New inquiry submitted!</strong><br>
                <span style="color: #666;">Inquiry ID: ${data.inquiryId.slice(0, 8).toUpperCase()}</span>
            </div>
            
            <h3 style="color: #333; margin-top: 0;">Customer Information</h3>
            <table style="width: 100%; font-size: 14px; margin-bottom: 20px;">
                <tr><td style="padding: 5px 0; color: #666; width: 120px;">Name</td><td><strong>${data.customerName}</strong></td></tr>
                <tr><td style="padding: 5px 0; color: #666;">Email</td><td>${data.email || "-"}</td></tr>
                <tr><td style="padding: 5px 0; color: #666;">Phone</td><td><a href="tel:${data.phone}">${data.phone}</a></td></tr>
                ${data.eventDate ? `<tr><td style="padding: 5px 0; color: #666;">Event Date</td><td>${format(new Date(data.eventDate), "dd MMM yyyy")}</td></tr>` : ""}
                ${data.eventLocation ? `<tr><td style="padding: 5px 0; color: #666;">Location</td><td>${data.eventLocation}</td></tr>` : ""}
            </table>
            
            <h3 style="color: #333;">Order Summary</h3>
            <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; font-family: monospace; white-space: pre-line; font-size: 13px;">
${itemsList}

─────────────────────
TOTAL: ${formatCurrency(data.total)}
            </div>
            
            <div style="margin-top: 20px; text-align: center;">
                <a href="${import.meta.env.VITE_APP_URL || "https://modiv.id"}/admin/inquiries" 
                   style="display: inline-block; padding: 12px 25px; background-color: #f97316; color: white; text-decoration: none; border-radius: 5px; font-weight: bold;">
                    View in Admin Panel →
                </a>
            </div>
        </div>
        
        <!-- Footer -->
        <div style="background-color: #1f2937; color: #9ca3af; padding: 15px; text-align: center; font-size: 11px;">
            Modiv EventCraft Admin Notification
        </div>
    </div>
</body>
</html>
    `.trim();
}

/**
 * Generate plain text version (for email clients that don't support HTML)
 */
export function generatePlainTextEmail(data: InquiryEmailData): string {
    const items = data.items.map((item) => `- ${item.name} x${item.quantity}: ${formatCurrency(item.price * item.quantity)}`).join("\n");

    return `
MODIV EVENTCRAFT - INQUIRY CONFIRMATION
========================================

Thank you, ${data.customerName}!

We have received your event inquiry. Our team will contact you within 24 hours.

INQUIRY DETAILS
---------------
Inquiry ID: ${data.inquiryId.slice(0, 8).toUpperCase()}
Submitted: ${format(new Date(data.createdAt), "dd MMM yyyy, HH:mm")}
${data.eventDate ? `Event Date: ${format(new Date(data.eventDate), "dd MMM yyyy")}` : ""}
${data.eventLocation ? `Location: ${data.eventLocation}` : ""}

SELECTED ITEMS
--------------
${items}

TOTAL ESTIMATE: ${formatCurrency(data.total)}

Need help? Contact us via WhatsApp: +62 812 3456 7890

---
© 2025 Modiv EventCraft
    `.trim();
}
