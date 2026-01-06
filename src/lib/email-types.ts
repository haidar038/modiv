/**
 * Email notification types for future SMTP integration
 * These types define the structure of email payloads for the notification system
 */

export interface EmailRecipient {
    email: string;
    name?: string;
}

export interface InquirySubmittedEmail {
    type: "inquiry_submitted";
    to: EmailRecipient;
    data: {
        inquiryId: string;
        customerName: string;
        eventDate: string | null;
        eventType: string | null;
        total: number;
        itemsCount: number;
        createdAt: string;
    };
}

export interface VendorAlertEmail {
    type: "vendor_alert";
    to: EmailRecipient;
    data: {
        inquiryId: string;
        customerName: string;
        customerEmail: string | null;
        customerPhone: string | null;
        eventDate: string | null;
        eventType: string | null;
        total: number;
        notes: string | null;
        items: Array<{
            name: string;
            quantity: number;
            price: number;
        }>;
        createdAt: string;
    };
}

export interface InquiryStatusUpdateEmail {
    type: "inquiry_status_update";
    to: EmailRecipient;
    data: {
        inquiryId: string;
        customerName: string;
        oldStatus: string;
        newStatus: string;
        updatedAt: string;
    };
}

export type EmailPayload = InquirySubmittedEmail | VendorAlertEmail | InquiryStatusUpdateEmail;

/**
 * Email service configuration interface
 */
export interface EmailServiceConfig {
    smtpHost: string;
    smtpPort: number;
    smtpUser: string;
    smtpPass: string;
    fromEmail: string;
    fromName: string;
}
