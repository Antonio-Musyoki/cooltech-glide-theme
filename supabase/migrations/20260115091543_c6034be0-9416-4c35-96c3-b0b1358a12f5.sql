-- Update the trigger function to recognize antoniomusyoki@gmail.com as admin
CREATE OR REPLACE FUNCTION public.handle_new_admin_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only create admin entry for specific admin emails
  IF NEW.email IN ('admin@cooltech.com', 'antoniomusyoki@gmail.com') THEN
    INSERT INTO public.admins (user_id, email, username, role)
    VALUES (NEW.id, NEW.email, split_part(NEW.email, '@', 1), 'admin')
    ON CONFLICT (email) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;