
-- ============ Roles & profiles ============
CREATE TYPE public.app_role AS ENUM ('user', 'mentor', 'admin');

CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  name TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE POLICY "profiles_select_authed" ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);
CREATE POLICY "profiles_admin_update" ON public.profiles FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "profiles_admin_delete" ON public.profiles FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "profiles_insert_self" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

CREATE POLICY "roles_select_own" ON public.user_roles FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "roles_admin_insert" ON public.user_roles FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "roles_admin_update" ON public.user_roles FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "roles_admin_delete" ON public.user_roles FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY INVOKER SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;
CREATE TRIGGER profiles_set_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'name', NEW.email));
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'user');
  RETURN NEW;
END;
$$;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.set_updated_at() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon;

-- ============ Mentors ============
CREATE TABLE public.mentors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  initials TEXT NOT NULL DEFAULT '',
  role TEXT NOT NULL DEFAULT '',
  title TEXT NOT NULL DEFAULT '',
  company TEXT NOT NULL DEFAULT '',
  bio TEXT NOT NULL DEFAULT '',
  full_bio TEXT NOT NULL DEFAULT '',
  photo_url TEXT NOT NULL DEFAULT '',
  skills TEXT[] NOT NULL DEFAULT '{}',
  match_score INTEGER NOT NULL DEFAULT 0,
  category TEXT NOT NULL DEFAULT 'Technical',
  available BOOLEAN NOT NULL DEFAULT true,
  availability_status TEXT NOT NULL DEFAULT 'scheduled',
  is_featured BOOLEAN NOT NULL DEFAULT true,
  avatar_color TEXT NOT NULL DEFAULT 'bg-blue-600',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.mentors ENABLE ROW LEVEL SECURITY;
CREATE POLICY "mentors_select_public" ON public.mentors FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "mentors_admin_all" ON public.mentors FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER mentors_set_updated_at BEFORE UPDATE ON public.mentors FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
ALTER PUBLICATION supabase_realtime ADD TABLE public.mentors;

-- ============ Mentor availability slots ============
CREATE TABLE public.mentor_availability (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mentor_id UUID NOT NULL REFERENCES public.mentors(id) ON DELETE CASCADE,
  start_at TIMESTAMPTZ NOT NULL,
  duration_minutes INTEGER NOT NULL DEFAULT 30,
  is_booked BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.mentor_availability ENABLE ROW LEVEL SECURITY;
CREATE POLICY "availability_select_public" ON public.mentor_availability FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "availability_admin_all" ON public.mentor_availability FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
ALTER PUBLICATION supabase_realtime ADD TABLE public.mentor_availability;
CREATE INDEX mentor_availability_mentor_idx ON public.mentor_availability(mentor_id, start_at);

-- ============ Bookings (1:1) ============
CREATE TABLE public.bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mentor_id UUID NOT NULL REFERENCES public.mentors(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  scheduled_at TIMESTAMPTZ NOT NULL,
  duration_minutes INTEGER NOT NULL DEFAULT 30,
  jitsi_room_id TEXT,
  notes TEXT DEFAULT '',
  status TEXT NOT NULL DEFAULT 'confirmed',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "bookings_owner_select" ON public.bookings FOR SELECT TO authenticated USING (auth.uid() = student_id OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "bookings_owner_insert" ON public.bookings FOR INSERT TO authenticated WITH CHECK (auth.uid() = student_id);
CREATE POLICY "bookings_owner_update" ON public.bookings FOR UPDATE TO authenticated USING (auth.uid() = student_id);
CREATE POLICY "bookings_admin_all" ON public.bookings FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- ============ Mentorship sessions ============
CREATE TABLE public.mentorship_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  topic TEXT NOT NULL DEFAULT '',
  mentor_id UUID REFERENCES public.mentors(id) ON DELETE SET NULL,
  mentor_name TEXT NOT NULL,
  scheduled_at TIMESTAMPTZ NOT NULL,
  duration_minutes INTEGER NOT NULL DEFAULT 60,
  max_capacity INTEGER NOT NULL DEFAULT 5,
  zoom_meeting_url TEXT NOT NULL,
  zoom_meeting_id TEXT,
  status TEXT NOT NULL DEFAULT 'scheduled',
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.mentorship_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "sessions_select_public" ON public.mentorship_sessions FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "sessions_admin_all" ON public.mentorship_sessions FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER mentorship_sessions_set_updated_at BEFORE UPDATE ON public.mentorship_sessions FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
ALTER PUBLICATION supabase_realtime ADD TABLE public.mentorship_sessions;
CREATE INDEX mentorship_sessions_scheduled_idx ON public.mentorship_sessions(scheduled_at DESC);

-- ============ Group session bookings ============
CREATE TABLE public.session_bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES public.mentorship_sessions(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (session_id, student_id)
);
ALTER TABLE public.session_bookings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "session_bookings_select_authed" ON public.session_bookings FOR SELECT TO authenticated USING (true);
CREATE POLICY "session_bookings_insert_self" ON public.session_bookings FOR INSERT TO authenticated WITH CHECK (auth.uid() = student_id);
CREATE POLICY "session_bookings_delete_owner" ON public.session_bookings FOR DELETE TO authenticated USING (auth.uid() = student_id OR public.has_role(auth.uid(), 'admin'));
ALTER PUBLICATION supabase_realtime ADD TABLE public.session_bookings;

-- enforce capacity at write time
CREATE OR REPLACE FUNCTION public.enforce_session_capacity()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _cap INTEGER; _count INTEGER;
BEGIN
  SELECT max_capacity INTO _cap FROM public.mentorship_sessions WHERE id = NEW.session_id;
  SELECT COUNT(*) INTO _count FROM public.session_bookings WHERE session_id = NEW.session_id;
  IF _count >= _cap THEN RAISE EXCEPTION 'Session is full'; END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER session_bookings_capacity BEFORE INSERT ON public.session_bookings FOR EACH ROW EXECUTE FUNCTION public.enforce_session_capacity();

-- ============ Student projects ============
CREATE TABLE public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  tech TEXT NOT NULL DEFAULT '',
  repo_url TEXT,
  demo_url TEXT,
  file_path TEXT,
  target_role TEXT,
  is_public BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "projects_owner_all" ON public.projects FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "projects_public_read" ON public.projects FOR SELECT TO anon, authenticated USING (is_public = true);
CREATE INDEX projects_user_id_idx ON public.projects(user_id);
CREATE INDEX projects_public_idx ON public.projects(is_public, created_at DESC);
CREATE TRIGGER projects_set_updated_at BEFORE UPDATE ON public.projects FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============ Storage ============
INSERT INTO storage.buckets (id, name, public) VALUES ('project-files', 'project-files', true) ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('mentor-photos', 'mentor-photos', true) ON CONFLICT (id) DO NOTHING;

CREATE POLICY "project_files_public_read" ON storage.objects FOR SELECT TO anon, authenticated USING (bucket_id = 'project-files');
CREATE POLICY "project_files_owner_insert" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'project-files' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "project_files_owner_update" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'project-files' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "project_files_owner_delete" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'project-files' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "mentor_photos_public_read" ON storage.objects FOR SELECT TO anon, authenticated USING (bucket_id = 'mentor-photos');
CREATE POLICY "mentor_photos_admin_write" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'mentor-photos' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "mentor_photos_admin_update" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'mentor-photos' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "mentor_photos_admin_delete" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'mentor-photos' AND public.has_role(auth.uid(), 'admin'));

-- ============ Seed mentors ============
INSERT INTO public.mentors (name, initials, role, title, company, bio, full_bio, skills, match_score, category, available, availability_status, avatar_color, photo_url, is_featured) VALUES
  ('Sarah Chen', 'SC', 'Senior Product Manager', 'Senior Product Manager (Ex-Google)', 'Stripe',
   'Product strategy & 0-to-1 launches.',
   'Sarah led growth on Stripe Checkout after 6 years as a Senior PM at Google. Stanford MBA, advisor to YC startups, and mentor to 200+ aspiring PMs.',
   ARRAY['Product Management','Strategy','User Research','Roadmapping'], 96, 'Product', true, 'available_now', 'bg-violet-600',
   'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&fit=crop', true),
  ('Michael Reyes', 'MR', 'Engagement Manager', 'Engagement Manager', 'McKinsey & Company',
   'Strategy consulting & business analysis.',
   'Michael advises Fortune 500 CEOs on digital transformation. Wharton MBA, ex-Bain. 9 years driving multi-billion dollar strategic engagements across tech and finance.',
   ARRAY['Strategy','Consulting','Business Analysis'], 92, 'Career', true, 'available_now', 'bg-blue-600',
   'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&h=400&fit=crop', true),
  ('Priya Patel', 'PP', 'Vice President', 'VP, Investment Banking', 'Goldman Sachs',
   'M&A and capital markets specialist.',
   'Priya leads tech M&A coverage at Goldman Sachs. Harvard Business School, ex-Morgan Stanley. Closed $20B+ in deals across AI, fintech, and SaaS.',
   ARRAY['Finance','M&A','Valuation','Excel'], 90, 'Career', false, 'scheduled', 'bg-rose-500',
   'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&h=400&fit=crop', true),
  ('Dr. James Carter', 'JC', 'Associate Professor', 'Associate Professor of Computer Science', 'Harvard University',
   'AI research & academic mentorship.',
   'James leads the Applied ML lab at Harvard SEAS, advising 20+ PhD candidates. PhD MIT. Author of 60+ papers on deep learning, NeurIPS area chair.',
   ARRAY['Research','Deep Learning','PyTorch'], 88, 'Technical', true, 'available_now', 'bg-purple-600',
   'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop', true),
  ('Emily Nguyen', 'EN', 'Group Product Manager', 'Group Product Manager', 'Meta',
   'Consumer products & growth.',
   'Emily leads Instagram Reels growth at Meta. Stanford GSB, ex-Stripe PM. Shipped products used by 500M+ users; expert in PM interviews and product strategy.',
   ARRAY['Product Strategy','User Research','Analytics','SQL'], 94, 'Product', true, 'available_now', 'bg-pink-500',
   'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop', true),
  ('David Okafor', 'DO', 'Principal Designer', 'Principal Designer', 'Apple',
   'Human Interface design at Apple.',
   'David is a principal designer on the Apple Human Interface team. RISD alum, ex-Airbnb design lead. 11 years shaping iconic consumer experiences.',
   ARRAY['UI/UX','Figma','Design Systems','Prototyping'], 89, 'Design', false, 'scheduled', 'bg-amber-500',
   'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=400&h=400&fit=crop', true),
  ('Ananya Iyer', 'AI', 'Senior Data Scientist', 'Senior Data Scientist', 'OpenAI',
   'LLM evaluation & alignment.',
   'Ananya works on LLM evaluation and post-training at OpenAI. CMU MS in ML, ex-DeepMind. Published research on RLHF and model interpretability.',
   ARRAY['Data Science','LLMs','Statistics','Python'], 95, 'Data', true, 'available_now', 'bg-emerald-500',
   'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop', true),
  ('Thomas Becker', 'TB', 'Partner', 'Partner', 'Boston Consulting Group',
   'Tech strategy & operations.',
   'Thomas is a BCG Partner in the TMT practice. INSEAD MBA, ex-Microsoft. Advises hyperscalers and unicorns on go-to-market and operating model design.',
   ARRAY['Strategy','Operations','Leadership'], 87, 'Career', false, 'scheduled', 'bg-indigo-500',
   'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&h=400&fit=crop', true);
