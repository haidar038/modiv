-- Add description column to items table
-- This must run before seed_items_data migration

ALTER TABLE public.items ADD COLUMN IF NOT EXISTS description TEXT;
