import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

function timestamp(): string {
  const d = new Date(Date.now() + 3 * 60 * 60 * 1000);
  const p = (n: number) => String(n).padStart(2, "0");
  return (
    d.getUTCFullYear().toString() +
    p(d.getUTCMonth() + 1) +
    p(d.getUTCDate()) +
    p(d.getUTCHours()) +
    p(d.getUTCMinutes()) +
    p(d.getUTCSeconds())
  );
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  try {
    const { checkoutRequestId } = await req.json().catch(() => ({}));
    if (!checkoutRequestId || typeof checkoutRequestId !== "string")
      return json({ error: "Missing checkoutRequestId" }, 400);

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { data: payment } = await supabase
      .from("mpesa_payments")
      .select("status, amount, result_desc, mpesa_receipt_number, product_name, phone_number")
      .eq("checkout_request_id", checkoutRequestId)
      .maybeSingle();

    if (!payment) return json({ error: "Payment not found" }, 404);
    if (payment.status !== "pending") return json({ success: true, payment });

    // Still pending — ask Daraja directly (callback may be delayed or unreachable)
    const env = (Deno.env.get("MPESA_ENV") || "sandbox").toLowerCase();
    const consumerKey = Deno.env.get("MPESA_CONSUMER_KEY")?.trim();
    const consumerSecret = Deno.env.get("MPESA_CONSUMER_SECRET")?.trim();
    const shortcode = Deno.env.get("MPESA_SHORTCODE") || "174379";
    const passkey =
      Deno.env.get("MPESA_PASSKEY") ||
      "bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919";
    if (!consumerKey || !consumerSecret) return json({ success: true, payment });

    const base = env === "live" ? "https://api.safaricom.co.ke" : "https://sandbox.safaricom.co.ke";
    const tokenRes = await fetch(`${base}/oauth/v1/generate?grant_type=client_credentials`, {
      headers: { Authorization: "Basic " + btoa(`${consumerKey}:${consumerSecret}`) },
    });
    const tokenJson = await tokenRes.json().catch(() => ({}));
    if (!tokenJson.access_token) return json({ success: true, payment });

    const ts = timestamp();
    const queryRes = await fetch(`${base}/mpesa/stkpushquery/v1/query`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${tokenJson.access_token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        BusinessShortCode: shortcode,
        Password: btoa(`${shortcode}${passkey}${ts}`),
        Timestamp: ts,
        CheckoutRequestID: checkoutRequestId,
      }),
    });
    const q = await queryRes.json().catch(() => ({}));
    const code = q?.ResultCode !== undefined ? Number(q.ResultCode) : null;

    if (code === null || Number.isNaN(code) || q?.errorCode)
      return json({ success: true, payment });

    // 1037/1032/1 etc. are terminal-ish; 1037 = timeout, 1032 = cancelled
    const status = code === 0 ? "success" : code === 1032 ? "cancelled" : "failed";
    const { data: updated } = await supabase
      .from("mpesa_payments")
      .update({ status, result_code: code, result_desc: q.ResultDesc ?? null })
      .eq("checkout_request_id", checkoutRequestId)
      .select("status, amount, result_desc, mpesa_receipt_number, product_name, phone_number")
      .maybeSingle();

    return json({ success: true, payment: updated ?? { ...payment, status } });
  } catch (e) {
    console.error("mpesa-status error", e);
    return json({ error: "Unexpected error checking payment status." }, 500);
  }
});
