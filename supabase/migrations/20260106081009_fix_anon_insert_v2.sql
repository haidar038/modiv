-- Fix RLS policies for anonymous inquiry submission v2
-- The original policies don't specify TO role, defaulting to authenticated users only
-- We need to drop existing policies and recreate with explicit anon role

-- Drop ALL existing INSERT policies on inquiries
DROP POLICY IF EXISTS "Users can create inquiries" ON public.inquiries;
DROP POLICY IF EXISTS "Anyone can submit inquiries" ON public.inquiries;
DROP POLICY IF EXISTS "Allow anonymous inquiry submission" ON public.inquiries;
DROP POLICY IF EXISTS "Public can insert inquiries (allow anon or auth)" ON public.inquiries;

-- Drop ALL existing INSERT policies on inquiry_items
DROP POLICY IF EXISTS "Users can create inquiry items" ON public.inquiry_items;
DROP POLICY IF EXISTS "Anyone can submit inquiry items" ON public.inquiry_items;
DROP POLICY IF EXISTS "Allow anonymous inquiry item submission" ON public.inquiry_items;
DROP POLICY IF EXISTS "Public can insert inquiry_items" ON public.inquiry_items;

-- Create INSERT policy for inquiries - explicitly for anon role
CREATE POLICY "Anon can insert inquiries"
ON public.inquiries
FOR INSERT
TO anon
WITH CHECK (true);

-- Create INSERT policy for inquiries - explicitly for authenticated role
CREATE POLICY "Authenticated can insert inquiries"
ON public.inquiries
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Create INSERT policy for inquiry_items - explicitly for anon role
CREATE POLICY "Anon can insert inquiry items"
ON public.inquiry_items
FOR INSERT
TO anon
WITH CHECK (true);

-- Create INSERT policy for inquiry_items - explicitly for authenticated role
CREATE POLICY "Authenticated can insert inquiry items"
ON public.inquiry_items
FOR INSERT
TO authenticated
WITH CHECK (true);
