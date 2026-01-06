/**
 * Email Configuration for Gmail SMTP
 *
 * IMPORTANT: SMTP cannot be done directly from browser for security reasons.
 * This configuration is used with Supabase Edge Function.
 *
 * Environment Variables:
 * - VITE_EMAIL_HOST: SMTP host (smtp.gmail.com)
 * - VITE_EMAIL_PORT: SMTP port (587 for TLS)
 * - VITE_EMAIL_USER: Gmail address
 * - VITE_EMAIL_PASSWORD: Gmail App Password (not your regular password)
 *
 * To get App Password:
 * 1. Enable 2-Factor Authentication on your Google Account
 * 2. Go to https://myaccount.google.com/apppasswords
 * 3. Generate new app password for "Mail"
 */

export interface EmailConfig {
    host: string;
    port: number;
    user: string;
    password: string;
    fromEmail: string;
    fromName: string;
    vendorEmail: string;
}

export const getEmailConfig = (): EmailConfig | null => {
    const host = import.meta.env.VITE_EMAIL_HOST;
    const user = import.meta.env.VITE_EMAIL_USER;
    const password = import.meta.env.VITE_EMAIL_PASSWORD;

    if (!host || !user || !password) {
        console.warn("Email not configured: Missing SMTP credentials");
        return null;
    }

    return {
        host,
        port: parseInt(import.meta.env.VITE_EMAIL_PORT || "587"),
        user,
        password,
        fromEmail: user, // Use same email for from
        fromName: import.meta.env.VITE_EMAIL_FROM_NAME || "Modiv EventCraft",
        vendorEmail: import.meta.env.VITE_VENDOR_EMAIL || user,
    };
};

export const isEmailConfigured = (): boolean => {
    const host = import.meta.env.VITE_EMAIL_HOST;
    const user = import.meta.env.VITE_EMAIL_USER;
    const password = import.meta.env.VITE_EMAIL_PASSWORD;
    return !!(host && user && password);
};

/**
 * Get Supabase Edge Function URL for sending emails
 * The Edge Function handles SMTP securely on the server side
 */
export const getEmailFunctionUrl = (): string => {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    return `${supabaseUrl}/functions/v1/send-email`;
};
