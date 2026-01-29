-- Fix RLS policies for quotes table - change from RESTRICTIVE to PERMISSIVE for public INSERT
DROP POLICY IF EXISTS "Anyone can submit quotes" ON public.quotes;

CREATE POLICY "Anyone can submit quotes" 
ON public.quotes 
FOR INSERT 
TO anon, authenticated
WITH CHECK (true);

-- Fix RLS policies for bookings table - change from RESTRICTIVE to PERMISSIVE for public INSERT
DROP POLICY IF EXISTS "Anyone can submit bookings" ON public.bookings;

CREATE POLICY "Anyone can submit bookings" 
ON public.bookings 
FOR INSERT 
TO anon, authenticated
WITH CHECK (true);

-- Fix RLS policies for contacts table - change from RESTRICTIVE to PERMISSIVE for public INSERT
DROP POLICY IF EXISTS "Anyone can submit contacts" ON public.contacts;

CREATE POLICY "Anyone can submit contacts" 
ON public.contacts 
FOR INSERT 
TO anon, authenticated
WITH CHECK (true);