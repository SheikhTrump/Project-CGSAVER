-- Add sender_number column to payments table
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS sender_number TEXT;
