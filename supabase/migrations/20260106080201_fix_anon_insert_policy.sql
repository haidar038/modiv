-- Fix RLS policy for anonymous inquiry submission
-- Previous migration used "TO public" which doesn't properly include the anon role in Supabase
-- We need to explicitly grant to "anon" and "authenticated" roles

-- Drop the previous policies that don't work correctly
DROP POLICY IF EXISTS "Anyone can submit inquiries" ON public.inquiries;
DROP POLICY IF EXISTS "Anyone can submit inquiry items" ON public.inquiry_items;
DROP POLICY IF EXISTS "Public can insert inquiries (allow anon or auth)" ON public.inquiries;

-- Create INSERT policy for inquiries - explicitly targeting anon and authenticated roles
CREATE POLICY "Allow anonymous inquiry submission"
ON public.inquiries
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Create INSERT policy for inquiry_items - explicitly targeting anon and authenticated roles
CREATE POLICY "Allow anonymous inquiry item submission"
ON public.inquiry_items
FOR INSERT
TO anon, authenticated
WITH CHECK (true);
