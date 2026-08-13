CREATE TABLE public.mpesa_payments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  product_name TEXT,
  customer_name TEXT,
  customer_email TEXT,
  phone_number TEXT NOT NULL,
  amount NUMERIC NOT NULL CHECK (amount > 0),
  quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
  merchant_request_id TEXT,
  checkout_request_id TEXT UNIQUE,
  status TEXT NOT NULL DEFAULT 'pending',
  result_code INTEGER,
  result_desc TEXT,
  mpesa_receipt_number TEXT,
  transaction_date TEXT,
  environment TEXT NOT NULL DEFAULT 'sandbox',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

GRANT ALL ON public.mpesa_payments TO service_role;
GRANT SELECT ON public.mpesa_payments TO authenticated;

ALTER TABLE public.mpesa_payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view payments"
ON public.mpesa_payments FOR SELECT TO authenticated
USING (EXISTS (SELECT 1 FROM public.admins a WHERE a.user_id = auth.uid()));

CREATE TRIGGER update_mpesa_payments_updated_at
BEFORE UPDATE ON public.mpesa_payments
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_mpesa_payments_checkout ON public.mpesa_payments(checkout_request_id);