import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const ADMIN_EMAILS = [
  "antoniomusyoki@gmail.com",
  "mwendwapaul2016@gmail.com",
];

interface NotificationRequest {
  type: "quote" | "booking";
  data: {
    name: string;
    email: string;
    phone?: string;
    company?: string;
    service_type?: string;
    message?: string;
    address?: string;
    preferred_date?: string;
    preferred_time?: string;
  };
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY is not configured");
    }

    const { type, data }: NotificationRequest = await req.json();

    if (!type || !data) {
      throw new Error("Missing required fields: type and data");
    }

    const isQuote = type === "quote";
    const subject = isQuote
      ? `🔔 New Quote Request from ${data.name}`
      : `📅 New Booking from ${data.name}`;

    const htmlContent = isQuote
      ? `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #0066cc; border-bottom: 2px solid #0066cc; padding-bottom: 10px;">
            New Quote Request
          </h2>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold;">Customer Name:</td>
              <td style="padding: 10px; border-bottom: 1px solid #eee;">${data.name}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold;">Email:</td>
              <td style="padding: 10px; border-bottom: 1px solid #eee;"><a href="mailto:${data.email}">${data.email}</a></td>
            </tr>
            ${data.phone ? `
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold;">Phone:</td>
              <td style="padding: 10px; border-bottom: 1px solid #eee;"><a href="tel:${data.phone}">${data.phone}</a></td>
            </tr>
            ` : ""}
            ${data.company ? `
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold;">Company:</td>
              <td style="padding: 10px; border-bottom: 1px solid #eee;">${data.company}</td>
            </tr>
            ` : ""}
            ${data.service_type ? `
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold;">Service Type:</td>
              <td style="padding: 10px; border-bottom: 1px solid #eee;">${data.service_type}</td>
            </tr>
            ` : ""}
            ${data.message ? `
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold;">Message:</td>
              <td style="padding: 10px; border-bottom: 1px solid #eee;">${data.message}</td>
            </tr>
            ` : ""}
          </table>
          <p style="margin-top: 20px; color: #666;">
            Please respond to this quote request within 24 hours.
          </p>
        </div>
      `
      : `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #0066cc; border-bottom: 2px solid #0066cc; padding-bottom: 10px;">
            New Booking Request
          </h2>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold;">Customer Name:</td>
              <td style="padding: 10px; border-bottom: 1px solid #eee;">${data.name}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold;">Email:</td>
              <td style="padding: 10px; border-bottom: 1px solid #eee;"><a href="mailto:${data.email}">${data.email}</a></td>
            </tr>
            ${data.phone ? `
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold;">Phone:</td>
              <td style="padding: 10px; border-bottom: 1px solid #eee;"><a href="tel:${data.phone}">${data.phone}</a></td>
            </tr>
            ` : ""}
            ${data.address ? `
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold;">Address:</td>
              <td style="padding: 10px; border-bottom: 1px solid #eee;">${data.address}</td>
            </tr>
            ` : ""}
            ${data.service_type ? `
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold;">Service:</td>
              <td style="padding: 10px; border-bottom: 1px solid #eee;">${data.service_type}</td>
            </tr>
            ` : ""}
            ${data.preferred_date ? `
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold;">Preferred Date:</td>
              <td style="padding: 10px; border-bottom: 1px solid #eee;">${data.preferred_date}</td>
            </tr>
            ` : ""}
            ${data.preferred_time ? `
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold;">Preferred Time:</td>
              <td style="padding: 10px; border-bottom: 1px solid #eee;">${data.preferred_time}</td>
            </tr>
            ` : ""}
            ${data.message ? `
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold;">Notes:</td>
              <td style="padding: 10px; border-bottom: 1px solid #eee;">${data.message}</td>
            </tr>
            ` : ""}
          </table>
          <p style="margin-top: 20px; color: #666;">
            Please confirm this appointment within 2 hours.
          </p>
        </div>
      `;

    // Send email using Resend API directly
    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "CoolTech <onboarding@resend.dev>",
        to: ADMIN_EMAILS,
        subject,
        html: htmlContent,
      }),
    });

    const emailData = await emailResponse.json();

    if (!emailResponse.ok) {
      console.error("Resend API error:", emailData);
      throw new Error(emailData.message || "Failed to send email");
    }

    console.log("Notification email sent:", emailData);

    return new Response(JSON.stringify({ success: true, data: emailData }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error sending notification:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
