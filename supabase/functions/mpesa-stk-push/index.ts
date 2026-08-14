import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

// Normalise Kenyan phone numbers to 2547XXXXXXXX / 2541XXXXXXXX
function normalisePhone(input: string): string | null {
  const digits = (input || "").replace(/\D/g, "");
  let msisdn = digits;
  if (msisdn.startsWith("0")) msisdn = "254" + msisdn.slice(1);
  else if (msisdn.startsWith("7") || msisdn.startsWith("1")) msisdn = "254" + msisdn;
  else if (msisdn.startsWith("+254")) msisdn = msisdn.slice(1);
  if (!/^254(7|1)\d{8}$/.test(msisdn)) return null;
  return msisdn;
}

function timestamp(): string {
  // Daraja expects Nairobi local time (UTC+3)
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
    const env = (Deno.env.get("MPESA_ENV") || "sandbox").toLowerCase();
    const consumerKey = Deno.env.get("MPESA_CONSUMER_KEY")?.trim();
    const consumerSecret = Deno.env.get("MPESA_CONSUMER_SECRET")?.trim();
    const shortcode = Deno.env.get("MPESA_SHORTCODE") || "174379";
    const passkey =
      Deno.env.get("MPESA_PASSKEY") ||
      "bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919";
    const txType =
      (Deno.env.get("MPESA_TRANSACTION_TYPE") || "CustomerPayBillOnline").trim();

    if (!consumerKey || !consumerSecret) {
      return json(
        { error: "M-Pesa is not configured yet. Missing Daraja consumer key/secret." },
        503,
      );
    }

    const body = await req.json().catch(() => ({}));
    const productId: string | undefined = body.productId;
    const quantity = Math.max(1, Math.min(50, Number(body.quantity) || 1));
    const phone = normalisePhone(String(body.phone || ""));
    const customerName = String(body.name || "").slice(0, 120) || null;
    const customerEmail = String(body.email || "").slice(0, 200) || null;

    if (!phone) return json({ error: "Enter a valid Safaricom number, e.g. 0712345678" }, 400);
    if (!productId || !/^[0-9a-f-]{36}$/i.test(productId))
      return json({ error: "Invalid product" }, 400);

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { data: product, error: prodErr } = await supabase
      .from("products")
      .select("id, name, price")
      .eq("id", productId)
      .maybeSingle();

    if (prodErr) throw prodErr;
    if (!product) return json({ error: "Product not found" }, 404);
    if (!product.price || Number(product.price) <= 0)
      return json({ error: "This product is quote-only and cannot be paid for online." }, 400);

    // Sandbox: Daraja rejects large amounts, and we never want to charge real money in test mode
    const rawAmount = Math.round(Number(product.price) * quantity);
    const amount = env === "sandbox" ? 1 : rawAmount;

    // 1. OAuth token
    const base = env === "live" ? "https://api.safaricom.co.ke" : "https://sandbox.safaricom.co.ke";
    const tokenRes = await fetch(`${base}/oauth/v1/generate?grant_type=client_credentials`, {
      headers: { Authorization: "Basic " + btoa(`${consumerKey}:${consumerSecret}`) },
    });
    const tokenText = await tokenRes.text();
    let tokenJson: any = {};
    try { tokenJson = JSON.parse(tokenText); } catch { /* non-JSON */ }
    if (!tokenRes.ok || !tokenJson.access_token) {
      console.error("Daraja token error", tokenRes.status, tokenText.slice(0, 300));
      return json({ error: "Could not authenticate with M-Pesa. Check your Daraja credentials." }, 502);
    }

    // 2. STK push
    const ts = timestamp();
    const password = btoa(`${shortcode}${passkey}${ts}`);
    const callbackUrl = `${Deno.env.get("SUPABASE_URL")}/functions/v1/mpesa-callback`;
    const accountRef = (product.name || "CoolTech").slice(0, 12);

    const stkRes = await fetch(`${base}/mpesa/stkpush/v1/processrequest`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${tokenJson.access_token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        BusinessShortCode: shortcode,
        Password: password,
        Timestamp: ts,
        TransactionType: txType,
        Amount: amount,
        PartyA: phone,
        PartyB: shortcode,
        PhoneNumber: phone,
        CallBackURL: callbackUrl,
        AccountReference: accountRef,
        TransactionDesc: `Payment for ${product.name}`.slice(0, 60),
      }),
    });

    const stk = await stkRes.json().catch(() => ({}));
    console.log("STK response", stkRes.status, JSON.stringify(stk));

    if (!stkRes.ok || stk.ResponseCode !== "0") {
      return json(
        { error: stk.errorMessage || stk.CustomerMessage || "M-Pesa request failed. Try again." },
        502,
      );
    }

    const { data: payment, error: insErr } = await supabase
      .from("mpesa_payments")
      .insert({
        product_id: product.id,
        product_name: product.name,
        customer_name: customerName,
        customer_email: customerEmail,
        phone_number: phone,
        amount,
        quantity,
        merchant_request_id: stk.MerchantRequestID,
        checkout_request_id: stk.CheckoutRequestID,
        status: "pending",
        environment: env,
      })
      .select("id, checkout_request_id, amount, status")
      .single();

    if (insErr) throw insErr;

    return json({
      success: true,
      paymentId: payment.id,
      checkoutRequestId: payment.checkout_request_id,
      amount: payment.amount,
      chargedAmount: amount,
      listedAmount: rawAmount,
      sandbox: env !== "live",
      message: stk.CustomerMessage || "Check your phone to enter your M-Pesa PIN.",
    });
  } catch (e) {
    console.error("mpesa-stk-push error", e);
    return json({ error: "Unexpected error initiating payment." }, 500);
  }
});
