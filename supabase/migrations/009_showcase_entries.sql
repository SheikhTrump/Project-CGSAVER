-- ============================================
-- NEW TABLE: Showcase Entries (Manual Management)
-- ============================================

CREATE TABLE public.showcase_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    tech_stack TEXT,
    live_link TEXT,
    image_url TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.showcase_entries ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Showcase entries are viewable by everyone" 
ON public.showcase_entries FOR SELECT USING (true);

CREATE POLICY "Admins can manage showcase entries" 
ON public.showcase_entries FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'superadmin'))
);
