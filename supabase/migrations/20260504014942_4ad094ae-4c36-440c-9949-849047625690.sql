
REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.promote_first_user_to_admin() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.enforce_session_capacity() FROM PUBLIC, anon, authenticated;
