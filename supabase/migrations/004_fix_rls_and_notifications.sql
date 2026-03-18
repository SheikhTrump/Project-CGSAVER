-- Migration: Fix RLS for project updates and notification visibility

-- 1. Update Projects RLS to allow students to update status from 'delivered' to 'completed' or 'revision_requested'
-- Also allow updates from 'payment_pending' or 'quoted' to support accepting quotes and submitting payments.
DROP POLICY IF EXISTS "Students can update their own projects if submitted" ON public.projects;
DROP POLICY IF EXISTS "Students can update their own projects during workflow" ON public.projects;

CREATE POLICY "Students can update their own projects during workflow" 
ON public.projects FOR UPDATE 
USING (
  student_id = auth.uid() AND 
  status IN ('submitted', 'quoted', 'payment_pending', 'delivered')
)
WITH CHECK (
  student_id = auth.uid() AND 
  status IN ('submitted', 'quoted', 'payment_pending', 'delivered', 'completed', 'revision_requested')
);

-- 2. Update Profiles RLS to allow students to see BASIC info of admins for notifications
-- This is needed so notifyAdmins utility can fetch admin IDs.
DROP POLICY IF EXISTS "Admins can read all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Anyone can read admin profiles" ON public.profiles;

CREATE POLICY "Admins can read all profiles" 
ON public.profiles FOR SELECT USING (
  public.get_user_role() IN ('admin', 'superadmin') OR 
  role IN ('admin', 'superadmin')
);

-- Note: The above policy allows any user to see the ID and ROLE of admins. 
-- For better security, keep it limited to just SELECTing the id and role columns if possible in the app logic.
