-- Create System Config table
CREATE TABLE public.system_config (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  description TEXT,
  updated_at TIMESTAMPTZ DEFAULT now(),
  updated_by UUID REFERENCES public.profiles(id)
);

-- Enable RLS
ALTER TABLE public.system_config ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Anyone can read system config" 
  ON public.system_config FOR SELECT 
  USING (true);

CREATE POLICY "Only superadmins can manage system config" 
  ON public.system_config FOR ALL 
  USING (public.get_user_role() = 'superadmin');

-- Initial Data
INSERT INTO public.system_config (key, value, description)
VALUES 
  ('payment_methods', '{"bkash": "017XXXXXXXX", "nagad": "017XXXXXXXX", "bank": "Bank Name: XXXX, Account: XXXX"}', 'Payment account details for students'),
  ('platform_settings', '{"maintenance_mode": false, "allow_new_projects": true}', 'Global platform status toggles');
