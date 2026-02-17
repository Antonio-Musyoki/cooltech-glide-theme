
-- Add CHECK constraints for string length limits on contacts table
ALTER TABLE public.contacts
  ADD CONSTRAINT contacts_name_length CHECK (char_length(name) <= 200),
  ADD CONSTRAINT contacts_email_length CHECK (char_length(email) <= 254),
  ADD CONSTRAINT contacts_phone_length CHECK (phone IS NULL OR char_length(phone) <= 50),
  ADD CONSTRAINT contacts_subject_length CHECK (subject IS NULL OR char_length(subject) <= 300),
  ADD CONSTRAINT contacts_message_length CHECK (char_length(message) <= 10000);

-- Add CHECK constraints for string length limits on quotes table
ALTER TABLE public.quotes
  ADD CONSTRAINT quotes_name_length CHECK (char_length(name) <= 200),
  ADD CONSTRAINT quotes_email_length CHECK (char_length(email) <= 254),
  ADD CONSTRAINT quotes_phone_length CHECK (phone IS NULL OR char_length(phone) <= 50),
  ADD CONSTRAINT quotes_company_length CHECK (company IS NULL OR char_length(company) <= 300),
  ADD CONSTRAINT quotes_service_type_length CHECK (service_type IS NULL OR char_length(service_type) <= 200),
  ADD CONSTRAINT quotes_message_length CHECK (message IS NULL OR char_length(message) <= 10000);

-- Add CHECK constraints for string length limits on bookings table
ALTER TABLE public.bookings
  ADD CONSTRAINT bookings_name_length CHECK (char_length(name) <= 200),
  ADD CONSTRAINT bookings_email_length CHECK (char_length(email) <= 254),
  ADD CONSTRAINT bookings_phone_length CHECK (phone IS NULL OR char_length(phone) <= 50),
  ADD CONSTRAINT bookings_address_length CHECK (address IS NULL OR char_length(address) <= 500),
  ADD CONSTRAINT bookings_service_type_length CHECK (service_type IS NULL OR char_length(service_type) <= 200),
  ADD CONSTRAINT bookings_preferred_time_length CHECK (preferred_time IS NULL OR char_length(preferred_time) <= 50),
  ADD CONSTRAINT bookings_message_length CHECK (message IS NULL OR char_length(message) <= 10000);

-- Add basic email format validation using triggers (CHECK constraints must be immutable)
CREATE OR REPLACE FUNCTION public.validate_email_format()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.email !~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$' THEN
    RAISE EXCEPTION 'Invalid email format';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER validate_contacts_email
  BEFORE INSERT OR UPDATE ON public.contacts
  FOR EACH ROW EXECUTE FUNCTION public.validate_email_format();

CREATE TRIGGER validate_quotes_email
  BEFORE INSERT OR UPDATE ON public.quotes
  FOR EACH ROW EXECUTE FUNCTION public.validate_email_format();

CREATE TRIGGER validate_bookings_email
  BEFORE INSERT OR UPDATE ON public.bookings
  FOR EACH ROW EXECUTE FUNCTION public.validate_email_format();
