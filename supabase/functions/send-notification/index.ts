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

const generateAdminEmail = (type: string, data: NotificationRequest["data"]) => {
  const isQuote = type === "quote";
  return isQuote
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
};

const generateUserConfirmationEmail = (type: string, data: NotificationRequest["data"]) => {
  const isQuote = type === "quote";
  return isQuote
    ? `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f9fafb; padding: 20px;">
        <div style="background: white; border-radius: 12px; padding: 30px; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">
          <div style="text-align: center; margin-bottom: 20px;">
            <h1 style="color: #0077b6; margin: 0;">CoolTech Kenya</h1>
            <p style="color: #666; margin: 5px 0 0;">Refrigeration & HVAC Solutions</p>
          </div>
          
          <h2 style="color: #333; border-bottom: 2px solid #0077b6; padding-bottom: 10px;">
            ✅ Quote Request Received
          </h2>
          
          <p style="color: #333; font-size: 16px;">Dear ${data.name},</p>
          
          <p style="color: #555; line-height: 1.6;">
            Thank you for requesting a quote from CoolTech Kenya! We have received your request and our team will review it promptly.
          </p>
          
          <div style="background: #f0f9ff; border-left: 4px solid #0077b6; padding: 15px; margin: 20px 0; border-radius: 4px;">
            <h3 style="color: #0077b6; margin: 0 0 10px;">Your Request Details:</h3>
            ${data.service_type ? `<p style="margin: 5px 0;"><strong>Service:</strong> ${data.service_type}</p>` : ""}
            ${data.company ? `<p style="margin: 5px 0;"><strong>Company:</strong> ${data.company}</p>` : ""}
            ${data.message ? `<p style="margin: 5px 0;"><strong>Message:</strong> ${data.message}</p>` : ""}
          </div>
          
          <p style="color: #555; line-height: 1.6;">
            <strong>What happens next?</strong><br>
            Our team will review your requirements and get back to you within <strong>24 hours</strong> with a detailed quotation.
          </p>
          
          <div style="background: #e8f5e9; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0; color: #2e7d32;">
              <strong>Need urgent assistance?</strong><br>
              Call us at <a href="tel:+254707154948" style="color: #0077b6;">+254 707 154 948</a>
            </p>
          </div>
          
          <p style="color: #555;">
            Best regards,<br>
            <strong>The CoolTech Kenya Team</strong>
          </p>
        </div>
        
        <p style="text-align: center; color: #999; font-size: 12px; margin-top: 20px;">
          © ${new Date().getFullYear()} CoolTech Kenya. All rights reserved.
        </p>
      </div>
    `
    : `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f9fafb; padding: 20px;">
        <div style="background: white; border-radius: 12px; padding: 30px; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">
          <div style="text-align: center; margin-bottom: 20px;">
            <h1 style="color: #0077b6; margin: 0;">CoolTech Kenya</h1>
            <p style="color: #666; margin: 5px 0 0;">Refrigeration & HVAC Solutions</p>
          </div>
          
          <h2 style="color: #333; border-bottom: 2px solid #0077b6; padding-bottom: 10px;">
            📅 Booking Confirmed
          </h2>
          
          <p style="color: #333; font-size: 16px;">Dear ${data.name},</p>
          
          <p style="color: #555; line-height: 1.6;">
            Thank you for booking a service with CoolTech Kenya! We have received your booking request and our team will confirm your appointment shortly.
          </p>
          
          <div style="background: #f0f9ff; border-left: 4px solid #0077b6; padding: 15px; margin: 20px 0; border-radius: 4px;">
            <h3 style="color: #0077b6; margin: 0 0 10px;">Your Booking Details:</h3>
            ${data.service_type ? `<p style="margin: 5px 0;"><strong>Service:</strong> ${data.service_type}</p>` : ""}
            ${data.preferred_date ? `<p style="margin: 5px 0;"><strong>Preferred Date:</strong> ${data.preferred_date}</p>` : ""}
            ${data.preferred_time ? `<p style="margin: 5px 0;"><strong>Preferred Time:</strong> ${data.preferred_time}</p>` : ""}
            ${data.address ? `<p style="margin: 5px 0;"><strong>Location:</strong> ${data.address}</p>` : ""}
            ${data.message ? `<p style="margin: 5px 0;"><strong>Notes:</strong> ${data.message}</p>` : ""}
          </div>
          
          <p style="color: #555; line-height: 1.6;">
            <strong>What happens next?</strong><br>
            Our team will call you within <strong>2 hours</strong> to confirm your appointment and discuss any specific requirements.
          </p>
          
          <div style="background: #fff3e0; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0; color: #e65100;">
              <strong>Need to reschedule?</strong><br>
              Call us at <a href="tel:+254707154948" style="color: #0077b6;">+254 707 154 948</a> or reply to this email.
            </p>
          </div>
          
          <p style="color: #555;">
            Best regards,<br>
            <strong>The CoolTech Kenya Team</strong>
          </p>
        </div>
        
        <p style="text-align: center; color: #999; font-size: 12px; margin-top: 20px;">
          © ${new Date().getFullYear()} CoolTech Kenya. All rights reserved.
        </p>
      </div>
    `;
};

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
    const adminSubject = isQuote
      ? `🔔 New Quote Request from ${data.name}`
      : `📅 New Booking from ${data.name}`;
    
    const userSubject = isQuote
      ? `Your Quote Request - CoolTech Kenya`
      : `Booking Confirmation - CoolTech Kenya`;

    // Send admin notification email
    const adminEmailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "CoolTech Kenya <noreply@cooltechrefrigeration.co.ke>",
        to: ADMIN_EMAILS,
        subject: adminSubject,
        html: generateAdminEmail(type, data),
      }),
    });

    const adminEmailData = await adminEmailResponse.json();

    if (!adminEmailResponse.ok) {
      console.error("Resend API error (admin):", adminEmailData);
    } else {
      console.log("Admin notification email sent:", adminEmailData);
    }

    // Send user confirmation email
    const userEmailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "CoolTech Kenya <noreply@cooltechrefrigeration.co.ke>",
        to: [data.email],
        subject: userSubject,
        html: generateUserConfirmationEmail(type, data),
      }),
    });

    const userEmailData = await userEmailResponse.json();

    if (!userEmailResponse.ok) {
      console.error("Resend API error (user):", userEmailData);
    } else {
      console.log("User confirmation email sent:", userEmailData);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        adminEmail: adminEmailData,
        userEmail: userEmailData 
      }), 
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
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
