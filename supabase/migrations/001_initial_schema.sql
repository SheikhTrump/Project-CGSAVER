CREATE EXTENSION IF NOT EXISTS "pgcrypto";


CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  university TEXT,
  student_id TEXT,
  role TEXT DEFAULT 'student' CHECK (role IN ('student', 'admin', 'superadmin')),
  created_at TIMESTAMPTZ DEFAULT now()
);


CREATE TABLE public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.profiles(id),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  tech_stack TEXT,
  deadline DATE,
  budget_range TEXT,
  status TEXT DEFAULT 'submitted' CHECK (status IN ('submitted', 'in_review', 'quoted', 'payment_pending', 'in_progress', 'delivered', 'revision_requested', 'completed', 'cancelled')),
  assigned_admin_id UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT now()
);


CREATE TABLE public.project_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  file_url TEXT NOT NULL,
  file_name TEXT NOT NULL,
  uploaded_by UUID NOT NULL REFERENCES public.profiles(id),
  file_type TEXT CHECK (file_type IN ('requirement', 'deliverable')),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES public.profiles(id),
  content TEXT,
  file_url TEXT,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.quotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  admin_id UUID NOT NULL REFERENCES public.profiles(id),
  price NUMERIC NOT NULL,
  currency TEXT DEFAULT 'BDT',
  delivery_date DATE,
  scope_notes TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT now()
);


CREATE TABLE public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  amount NUMERIC NOT NULL,
  method TEXT CHECK (method IN ('bkash', 'nagad', 'bank')),
  transaction_id TEXT NOT NULL,
  screenshot_url TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'rejected')),
  admin_note TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);


CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id),
  type TEXT,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  link TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.profiles(id),
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL REFERENCES public.profiles(id),
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  is_pinned BOOLEAN DEFAULT false,
  is_urgent BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);


ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;

-- Create helper function for RLS checks (superadmin/admin roles)
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS text AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid() LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER;

-- Profiles
CREATE POLICY "Users can read their own profile" ON public.profiles FOR SELECT USING (id = auth.uid());
CREATE POLICY "Admins can read all profiles" ON public.profiles FOR SELECT USING (public.get_user_role() IN ('admin', 'superadmin'));
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (id = auth.uid());
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (id = auth.uid());
CREATE POLICY "Superadmin can manage roles" ON public.profiles FOR ALL USING (public.get_user_role() = 'superadmin');

-- Projects
CREATE POLICY "Students can read their own projects" ON public.projects FOR SELECT USING (student_id = auth.uid());
CREATE POLICY "Admins can read all projects" ON public.projects FOR SELECT USING (public.get_user_role() IN ('admin', 'superadmin'));
CREATE POLICY "Showcase completed projects publicly if featured" ON public.projects FOR SELECT USING (
  status = 'completed' AND EXISTS (SELECT 1 FROM public.reviews WHERE reviews.project_id = projects.id AND reviews.is_featured = true)
);
CREATE POLICY "Students can insert projects" ON public.projects FOR INSERT WITH CHECK (student_id = auth.uid());
CREATE POLICY "Students can update their own projects if submitted" ON public.projects FOR UPDATE USING (student_id = auth.uid() AND status = 'submitted');
CREATE POLICY "Admins can update all projects" ON public.projects FOR UPDATE USING (public.get_user_role() IN ('admin', 'superadmin'));

-- Project Files
CREATE POLICY "Students can access files for their projects" ON public.project_files FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.projects WHERE projects.id = project_files.project_id AND projects.student_id = auth.uid())
);
CREATE POLICY "Admins can access all files" ON public.project_files FOR SELECT USING (public.get_user_role() IN ('admin', 'superadmin'));
CREATE POLICY "Students can insert files for their projects" ON public.project_files FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.projects WHERE projects.id = project_files.project_id AND projects.student_id = auth.uid())
);
CREATE POLICY "Admins can insert files for any project" ON public.project_files FOR INSERT WITH CHECK (public.get_user_role() IN ('admin', 'superadmin'));

-- Messages
CREATE POLICY "Students can view messages for their projects" ON public.messages FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.projects WHERE projects.id = messages.project_id AND projects.student_id = auth.uid())
);
CREATE POLICY "Admins can view all messages" ON public.messages FOR SELECT USING (public.get_user_role() IN ('admin', 'superadmin'));
CREATE POLICY "Students can send messages to their projects" ON public.messages FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.projects WHERE projects.id = messages.project_id AND projects.student_id = auth.uid())
);
CREATE POLICY "Admins can send messages to any project" ON public.messages FOR INSERT WITH CHECK (public.get_user_role() IN ('admin', 'superadmin'));
CREATE POLICY "Users can mark messages as read" ON public.messages FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.projects WHERE projects.id = messages.project_id AND (projects.student_id = auth.uid() OR public.get_user_role() IN ('admin', 'superadmin')))
);

-- Quotes
CREATE POLICY "Students can view quotes for their projects" ON public.quotes FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.projects WHERE projects.id = quotes.project_id AND projects.student_id = auth.uid())
);
CREATE POLICY "Admins can view all quotes" ON public.quotes FOR SELECT USING (public.get_user_role() IN ('admin', 'superadmin'));
CREATE POLICY "Admins can insert quotes" ON public.quotes FOR INSERT WITH CHECK (public.get_user_role() IN ('admin', 'superadmin'));
CREATE POLICY "Students can update quote status" ON public.quotes FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.projects WHERE projects.id = quotes.project_id AND projects.student_id = auth.uid())
);

-- Payments
CREATE POLICY "Students can view their payments" ON public.payments FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.projects WHERE projects.id = payments.project_id AND projects.student_id = auth.uid())
);
CREATE POLICY "Admins can view all payments" ON public.payments FOR SELECT USING (public.get_user_role() IN ('admin', 'superadmin'));
CREATE POLICY "Students can insert payments for their projects" ON public.payments FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.projects WHERE projects.id = payments.project_id AND projects.student_id = auth.uid())
);
CREATE POLICY "Admins can update payments" ON public.payments FOR UPDATE USING (public.get_user_role() IN ('admin', 'superadmin'));

-- Notifications
CREATE POLICY "Users can view own notifications" ON public.notifications FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can update own notifications" ON public.notifications FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Anyone can insert notifications (system level)" ON public.notifications FOR INSERT WITH CHECK (true);

-- Reviews
CREATE POLICY "Anyone can view featured reviews" ON public.reviews FOR SELECT USING (is_featured = true);
CREATE POLICY "Students can view their own reviews" ON public.reviews FOR SELECT USING (student_id = auth.uid());
CREATE POLICY "Admins can view all reviews" ON public.reviews FOR SELECT USING (public.get_user_role() IN ('admin', 'superadmin'));
CREATE POLICY "Students can insert reviews" ON public.reviews FOR INSERT WITH CHECK (student_id = auth.uid());
CREATE POLICY "Superadmin can manage featuring" ON public.reviews FOR UPDATE USING (public.get_user_role() = 'superadmin');

-- Announcements
CREATE POLICY "Anyone can view announcements" ON public.announcements FOR SELECT USING (true);
CREATE POLICY "Superadmin can manage announcements" ON public.announcements FOR ALL USING (public.get_user_role() = 'superadmin');
