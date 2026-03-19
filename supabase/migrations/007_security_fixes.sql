-- ============================================
-- SECURITY FIX: Prevent Role Escalation
-- Students cannot change their own role column
-- ============================================

CREATE OR REPLACE FUNCTION public.prevent_role_change()
RETURNS TRIGGER AS $$
BEGIN
  -- Allow superadmins to change any role
  IF (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'superadmin' THEN
    RETURN NEW;
  END IF;

  -- Block all other users from modifying the role column
  IF NEW.role IS DISTINCT FROM OLD.role THEN
    RAISE EXCEPTION 'You are not authorized to change your role.';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_prevent_role_change
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_role_change();


-- ============================================
-- SECURITY FIX: Restrict Notification Inserts
-- Only admins/superadmins can insert notifications
-- ============================================

DROP POLICY IF EXISTS "Anyone can insert notifications (system level)" ON public.notifications;

CREATE POLICY "Admins can insert notifications"
  ON public.notifications FOR INSERT
  WITH CHECK (public.get_user_role() IN ('admin', 'superadmin'));
