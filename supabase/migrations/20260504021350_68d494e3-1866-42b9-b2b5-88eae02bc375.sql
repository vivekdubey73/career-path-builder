CREATE SCHEMA IF NOT EXISTS private;
REVOKE ALL ON SCHEMA private FROM PUBLIC, anon, authenticated;

CREATE OR REPLACE FUNCTION private.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

REVOKE ALL ON FUNCTION private.has_role(uuid, public.app_role) FROM PUBLIC, anon, authenticated;

ALTER POLICY bookings_admin_all ON public.bookings
  USING (private.has_role(auth.uid(), 'admin'::public.app_role))
  WITH CHECK (private.has_role(auth.uid(), 'admin'::public.app_role));

ALTER POLICY bookings_owner_select ON public.bookings
  USING ((auth.uid() = student_id) OR private.has_role(auth.uid(), 'admin'::public.app_role));

ALTER POLICY availability_admin_all ON public.mentor_availability
  USING (private.has_role(auth.uid(), 'admin'::public.app_role))
  WITH CHECK (private.has_role(auth.uid(), 'admin'::public.app_role));

ALTER POLICY mentors_admin_all ON public.mentors
  USING (private.has_role(auth.uid(), 'admin'::public.app_role))
  WITH CHECK (private.has_role(auth.uid(), 'admin'::public.app_role));

ALTER POLICY sessions_admin_all ON public.mentorship_sessions
  USING (private.has_role(auth.uid(), 'admin'::public.app_role))
  WITH CHECK (private.has_role(auth.uid(), 'admin'::public.app_role));

ALTER POLICY profiles_admin_delete ON public.profiles
  USING (private.has_role(auth.uid(), 'admin'::public.app_role));

ALTER POLICY profiles_admin_update ON public.profiles
  USING (private.has_role(auth.uid(), 'admin'::public.app_role));

ALTER POLICY session_bookings_delete_owner ON public.session_bookings
  USING ((auth.uid() = student_id) OR private.has_role(auth.uid(), 'admin'::public.app_role));

ALTER POLICY roles_admin_delete ON public.user_roles
  USING (private.has_role(auth.uid(), 'admin'::public.app_role));

ALTER POLICY roles_admin_insert ON public.user_roles
  WITH CHECK (private.has_role(auth.uid(), 'admin'::public.app_role));

ALTER POLICY roles_admin_update ON public.user_roles
  USING (private.has_role(auth.uid(), 'admin'::public.app_role));

ALTER POLICY roles_select_own ON public.user_roles
  USING ((user_id = auth.uid()) OR private.has_role(auth.uid(), 'admin'::public.app_role));