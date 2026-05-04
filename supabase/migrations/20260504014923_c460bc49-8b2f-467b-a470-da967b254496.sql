
-- Attach handle_new_user trigger to auth.users so profile + default role are created on signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Enforce mentorship session capacity
DROP TRIGGER IF EXISTS enforce_session_capacity_trg ON public.session_bookings;
CREATE TRIGGER enforce_session_capacity_trg
BEFORE INSERT ON public.session_bookings
FOR EACH ROW EXECUTE FUNCTION public.enforce_session_capacity();

-- Bootstrap: promote the first user (by created_at) to admin if no admin exists yet
CREATE OR REPLACE FUNCTION public.promote_first_user_to_admin()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.user_roles WHERE role = 'admin') THEN
    -- Replace this new user's default 'user' role with 'admin'
    DELETE FROM public.user_roles WHERE user_id = NEW.id;
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'admin');
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS promote_first_user_to_admin_trg ON auth.users;
CREATE TRIGGER promote_first_user_to_admin_trg
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.promote_first_user_to_admin();
