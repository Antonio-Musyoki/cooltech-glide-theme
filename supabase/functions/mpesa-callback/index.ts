import { createClient } from "npm:@supabase/supabase-js@2";

// Safaricom posts here server-to-server; always answer 200 so it does not retry forever.
Deno.serve(async (req) => {
  const ok = () =>
    new Response(JSON.stringify({ ResultCode: 0, ResultDesc: "Accepted" }), {
      headers: { "Content-Type": "application/json" },
    });

  try {
    const payload = await req.json().catch(() => ({}));
    console.log("M-Pesa callback", JSON.stringify(payload));

    const cb = payload?.Body?.stkCallback;
    if (!cb?.CheckoutRequestID) return ok();

    const items: Array<{ Name: string; Value?: string | number }> =
      cb.CallbackMetadata?.Item ?? [];
    const pick = (name: string) => items.find((i) => i.Name === name)?.Value;

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const resultCode = Number(cb.ResultCode);
    await supabase
      .from("mpesa_payments")
      .update({
        status: resultCode === 0 ? "success" : resultCode === 1032 ? "cancelled" : "failed",
        result_code: resultCode,
        result_desc: cb.ResultDesc ?? null,
        mpesa_receipt_number: pick("MpesaReceiptNumber")?.toString() ?? null,
        transaction_date: pick("TransactionDate")?.toString() ?? null,
      })
      .eq("checkout_request_id", cb.CheckoutRequestID);

    return ok();
  } catch (e) {
    console.error("mpesa-callback error", e);
    return ok();
  }
});
