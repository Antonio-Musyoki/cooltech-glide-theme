-- Create a trigger to automatically add admin role for specific email
CREATE OR REPLACE FUNCTION public.handle_new_admin_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  -- Auto-add users with specific test email to admins table
  IF NEW.email = 'admin@cooltech.com' THEN
    INSERT INTO public.admins (user_id, email, username, role)
    VALUES (NEW.id, NEW.email, 'Admin', 'admin')
    ON CONFLICT DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;

-- Create trigger on auth.users
CREATE TRIGGER on_auth_user_created_admin
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_admin_user();