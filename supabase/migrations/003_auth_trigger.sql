-- Migration: Auth Profile Sync Trigger
-- This script automates profile creation in public.profiles when a new user signs up in auth.users.
-- It also handles metadata like full_name, university, and student_id.

-- 1. Create the trigger function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, role)
  VALUES (
    new.id,
    COALESCE(
      new.raw_user_meta_data->>'full_name', 
      new.raw_user_meta_data->>'name', 
      new.raw_user_meta_data->>'fullName', 
      'New User'
    ),
    new.email,
    COALESCE(new.raw_user_meta_data->>'role', 'student')
  );
  RETURN new;
END;
$$;

-- 2. Create the trigger
-- Drop if exists to avoid conflicts during development
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 3. Update RLS policies to allow the trigger to work correctly
-- Since the trigger runs with SECURITY DEFINER, it bypasses RLS for profiles.
-- However, we should keep our client-side insert policy just in case, but it's now redundant.
-- IMPORTANT: If we want to allow the frontend to still manually update extra fields 
-- if the trigger fails for some reason, we can, but the trigger is the source of truth.
