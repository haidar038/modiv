-- Fix RLS policies for public inquiry submission
-- Error 42501 indicates RLS policy violation for anon role
-- The issue is that existing policies target 'public' role instead of 'anon'

-- Drop the conflicting policies that might block anon users
DROP POLICY IF EXISTS "Users can create inquiries" ON public.inquiries;
DROP POLICY IF EXISTS "Users can create inquiry items" ON public.inquiry_items;
DROP POLICY IF EXISTS "Allow public to insert inquiries" ON public.inquiries;
DROP POLICY IF EXISTS "Allow public to insert inquiry_items" ON public.inquiry_items;

-- Recreate INSERT policies that work for ALL roles (including anon)
-- Using TO public means it applies to all roles including anon
CREATE POLICY "Anyone can submit inquiries"
ON public.inquiries
FOR INSERT
TO public
WITH CHECK (true);

CREATE POLICY "Anyone can submit inquiry items"
ON public.inquiry_items
FOR INSERT
TO public
WITH CHECK (true);
