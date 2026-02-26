import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface SendQuoteRequest {
  to: string;
  customerName: string;
  quoteNumber: string;
  pdfBase64: string;
  fileName: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY is not configured");
    }

    const { to, customerName, quoteNumber, pdfBase64, fileName }: SendQuoteRequest = await req.json();

    if (!to || !pdfBase64 || !quoteNumber) {
      throw new Error("Missing required fields");
    }

    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f9fafb; padding: 20px;">
        <div style="background: white; border-radius: 12px; padding: 30px; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">
          <div style="text-align: center; margin-bottom: 20px;">
            <h1 style="color: #0077b6; margin: 0;">CoolTech Kenya</h1>
            <p style="color: #666; margin: 5px 0 0;">Refrigeration & HVAC Solutions</p>
          </div>
          
          <h2 style="color: #333; border-bottom: 2px solid #0077b6; padding-bottom: 10px;">
            📄 Your Quotation - ${quoteNumber}
          </h2>
          
          <p style="color: #333; font-size: 16px;">Dear ${customerName},</p>
          
          <p style="color: #555; line-height: 1.6;">
            Thank you for your interest in CoolTech Kenya's services. Please find attached your detailed quotation as requested.
          </p>
          
          <div style="background: #f0f9ff; border-left: 4px solid #0077b6; padding: 15px; margin: 20px 0; border-radius: 4px;">
            <p style="margin: 0; color: #0077b6;">
              <strong>Quote Reference:</strong> ${quoteNumber}<br>
              Please refer to the attached PDF for full details including pricing, terms, and conditions.
            </p>
          </div>
          
          <p style="color: #555; line-height: 1.6;">
            If you have any questions or would like to proceed, please don't hesitate to contact us.
          </p>
          
          <div style="background: #e8f5e9; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0; color: #2e7d32;">
              <strong>Ready to proceed?</strong><br>
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

    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "CoolTech Kenya <noreply@cooltechrefrigeration.co.ke>",
        to: [to],
        subject: `Your Quotation ${quoteNumber} - CoolTech Kenya`,
        html: emailHtml,
        attachments: [
          {
            filename: fileName,
            content: pdfBase64,
          },
        ],
      }),
    });

    const emailData = await emailResponse.json();

    if (!emailResponse.ok) {
      console.error("Resend API error:", emailData);
      throw new Error(emailData.message || "Failed to send email");
    }

    console.log("Quote email sent successfully:", emailData);

    return new Response(JSON.stringify({ success: true, data: emailData }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in send-quote-pdf:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
