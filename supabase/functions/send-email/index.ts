// Supabase Edge Function: send-email
// Uses Gmail SMTP via Nodemailer to send emails securely
//
// Deploy: bunx supabase functions deploy send-email --no-verify-jwt
// Set secrets:
//   bunx supabase secrets set EMAIL_HOST=smtp.gmail.com
//   bunx supabase secrets set EMAIL_PORT=587
//   bunx supabase secrets set EMAIL_USER=your@gmail.com
//   bunx supabase secrets set EMAIL_PASSWORD=your-app-password

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { SmtpClient } from "https://deno.land/x/smtp@v0.7.0/mod.ts";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EmailRequest {
    to: string;
    subject: string;
    html: string;
    text?: string;
}

serve(async (req) => {
    // Handle CORS preflight
    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }

    try {
        const { to, subject, html, text } = (await req.json()) as EmailRequest;

        if (!to || !subject || !html) {
            return new Response(JSON.stringify({ error: "Missing required fields: to, subject, html" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
        }

        // Get SMTP config from environment
        const host = Deno.env.get("EMAIL_HOST") || "smtp.gmail.com";
        const port = parseInt(Deno.env.get("EMAIL_PORT") || "587");
        const user = Deno.env.get("EMAIL_USER");
        const password = Deno.env.get("EMAIL_PASSWORD");
        const fromName = Deno.env.get("EMAIL_FROM_NAME") || "Modiv EventCraft";

        if (!user || !password) {
            console.error("Email credentials not configured");
            return new Response(JSON.stringify({ error: "Email service not configured" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
        }

        // Create SMTP client
        const client = new SmtpClient();

        await client.connectTLS({
            hostname: host,
            port: port,
            username: user,
            password: password,
        });

        // Send email
        await client.send({
            from: `${fromName} <${user}>`,
            to: to,
            subject: subject,
            content: text || "",
            html: html,
        });

        await client.close();

        console.log(`Email sent successfully to ${to}`);

        return new Response(JSON.stringify({ success: true, message: "Email sent successfully" }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    } catch (error) {
        console.error("Error sending email:", error);

        return new Response(JSON.stringify({ error: error.message || "Failed to send email" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
});
