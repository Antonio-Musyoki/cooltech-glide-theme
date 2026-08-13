import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Smartphone, Loader2, CheckCircle2, XCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { formatPrice } from "@/data/products";
import { useToast } from "@/hooks/use-toast";

interface MpesaPayButtonProps {
  productId: string;
  productName: string;
  price: number;
  className?: string;
}

type Stage = "form" | "waiting" | "success" | "failed";

const isValidPhone = (v: string) => /^(?:254|0)?(7|1)\d{8}$/.test(v.replace(/\D/g, ""));

export const MpesaPayButton = ({ productId, productName, price, className }: MpesaPayButtonProps) => {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [stage, setStage] = useState<Stage>("form");
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [receipt, setReceipt] = useState<string | null>(null);
  const [chargedAmount, setChargedAmount] = useState<number | null>(null);
  const [isSandbox, setIsSandbox] = useState(false);
  const pollRef = useRef<number | null>(null);

  const stopPolling = () => {
    if (pollRef.current) {
      window.clearInterval(pollRef.current);
      pollRef.current = null;
    }
  };

  useEffect(() => stopPolling, []);

  const reset = () => {
    stopPolling();
    setStage("form");
    setSubmitting(false);
    setStatusMessage("");
    setReceipt(null);
  };

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (!next) reset();
  };

  const pollStatus = (checkoutRequestId: string) => {
    let elapsed = 0;
    pollRef.current = window.setInterval(async () => {
      elapsed += 4;
      const { data, error } = await supabase.functions.invoke("mpesa-status", {
        body: { checkoutRequestId },
      });

      if (error) return;
      const status = data?.payment?.status;
      if (status === "success") {
        stopPolling();
        setReceipt(data.payment.mpesa_receipt_number ?? null);
        setStage("success");
      } else if (status === "failed" || status === "cancelled") {
        stopPolling();
        setStatusMessage(
          data.payment.result_desc ||
            (status === "cancelled" ? "You cancelled the payment request." : "Payment was not completed."),
        );
        setStage("failed");
      } else if (elapsed >= 120) {
        stopPolling();
        setStatusMessage(
          "We didn't get a confirmation in time. If your money was deducted, contact us with your M-Pesa message.",
        );
        setStage("failed");
      }
    }, 4000);
  };

  const handlePay = async () => {
    if (!isValidPhone(phone)) {
      toast({
        title: "Invalid phone number",
        description: "Enter a valid Safaricom number, e.g. 0712345678.",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);
    const { data, error } = await supabase.functions.invoke("mpesa-stk-push", {
      body: { productId, phone, name, email, quantity: 1 },
    });
    setSubmitting(false);

    if (error || data?.error) {
      toast({
        title: "Payment could not be started",
        description: data?.error || error?.message || "Please try again shortly.",
        variant: "destructive",
      });
      return;
    }

    setChargedAmount(typeof data.chargedAmount === "number" ? data.chargedAmount : null);
    setIsSandbox(Boolean(data.sandbox));
    setStatusMessage(data.message || "Check your phone to enter your M-Pesa PIN.");
    setStage("waiting");
    pollStatus(data.checkoutRequestId);
  };

  return (
    <>
      <Button size="lg" className={className} onClick={() => setOpen(true)}>
        <Smartphone className="h-5 w-5 mr-2" />
        Pay with M-Pesa
      </Button>

      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-md">
          {stage === "form" && (
            <>
              <DialogHeader>
                <DialogTitle>Pay with M-Pesa</DialogTitle>
                <DialogDescription>
                  {productName} — {formatPrice(price)}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="mpesa-phone">M-Pesa phone number *</Label>
                  <Input
                    id="mpesa-phone"
                    inputMode="tel"
                    placeholder="0712345678"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="mpesa-name">Your name</Label>
                  <Input
                    id="mpesa-name"
                    placeholder="Jane Wanjiru"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="mpesa-email">Email (for your receipt)</Label>
                  <Input
                    id="mpesa-email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <Button className="w-full" size="lg" onClick={handlePay} disabled={submitting}>
                  {submitting ? (
                    <>
                      <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                      Sending request...
                    </>
                  ) : (
                    <>
                      <Smartphone className="h-5 w-5 mr-2" />
                      Send M-Pesa prompt
                    </>
                  )}
                </Button>
              </div>
            </>
          )}

          {stage === "waiting" && (
            <div className="py-6 text-center space-y-4">
              <Loader2 className="h-12 w-12 mx-auto animate-spin text-primary" />
              <div>
                <h3 className="text-lg font-semibold">Check your phone</h3>
                <p className="text-muted-foreground text-sm mt-1">{statusMessage}</p>
                {isSandbox && chargedAmount !== null && (
                  <p className="text-xs text-muted-foreground mt-3">
                    Test mode: only {formatPrice(chargedAmount)} is requested instead of the full price.
                  </p>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                Keep this window open — we'll confirm automatically.
              </p>
            </div>
          )}

          {stage === "success" && (
            <div className="py-6 text-center space-y-4">
              <CheckCircle2 className="h-14 w-14 mx-auto text-green-600" />
              <div>
                <h3 className="text-lg font-semibold">Payment received</h3>
                <p className="text-muted-foreground text-sm mt-1">
                  Thank you! We've received your payment for {productName}.
                </p>
                {receipt && (
                  <p className="text-sm mt-3">
                    M-Pesa receipt: <span className="font-mono font-semibold">{receipt}</span>
                  </p>
                )}
              </div>
              <Button className="w-full" onClick={() => handleOpenChange(false)}>
                Done
              </Button>
            </div>
          )}

          {stage === "failed" && (
            <div className="py-6 text-center space-y-4">
              <XCircle className="h-14 w-14 mx-auto text-destructive" />
              <div>
                <h3 className="text-lg font-semibold">Payment not completed</h3>
                <p className="text-muted-foreground text-sm mt-1">{statusMessage}</p>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" className="flex-1" onClick={() => handleOpenChange(false)}>
                  Close
                </Button>
                <Button className="flex-1" onClick={reset}>
                  Try again
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};
