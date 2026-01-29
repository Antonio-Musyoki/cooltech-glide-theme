-- Drop and recreate INSERT policies as explicitly PERMISSIVE for public submissions

-- QUOTES table
DROP POLICY IF EXISTS "Anyone can submit quotes" ON public.quotes;
CREATE POLICY "Anyone can submit quotes" 
ON public.quotes 
AS PERMISSIVE
FOR INSERT 
TO public
WITH CHECK (true);

-- BOOKINGS table
DROP POLICY IF EXISTS "Anyone can submit bookings" ON public.bookings;
CREATE POLICY "Anyone can submit bookings" 
ON public.bookings 
AS PERMISSIVE
FOR INSERT 
TO public
WITH CHECK (true);

-- CONTACTS table  
DROP POLICY IF EXISTS "Anyone can submit contacts" ON public.contacts;
CREATE POLICY "Anyone can submit contacts" 
ON public.contacts 
AS PERMISSIVE
FOR INSERT 
TO public
WITH CHECK (true);