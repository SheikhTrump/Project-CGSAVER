-- ============================================
-- FIX: Missing Showcase Columns in Projects Table
-- ============================================

-- 1. Add missing columns with safety checks
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='projects' AND column_name='is_featured') THEN
        ALTER TABLE public.projects ADD COLUMN is_featured BOOLEAN DEFAULT false;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='projects' AND column_name='showcase_image_url') THEN
        ALTER TABLE public.projects ADD COLUMN showcase_image_url TEXT;
    END IF;
END $$;

-- 2. Update Showcase Public Policy
-- Ensure projects can be viewed by everyone if featured and completed
DROP POLICY IF EXISTS "Showcase completed projects publicly if featured" ON public.projects;

CREATE POLICY "Showcase completed projects publicly if featured" ON public.projects FOR SELECT USING (
  status = 'completed' AND is_featured = true
);
