-- Migration: Storage Bucket RLS Policies for 'images' Bucket
-- This migration sets up Row Level Security for the images storage bucket.
-- Admin users get full CRUD access, public users get read-only access.

-- First, ensure the storage schema policies are properly set up
-- Note: The bucket itself is created via Supabase Dashboard or API, not SQL migration.
-- This migration only sets up the RLS policies.

-- Enable RLS on storage.objects (if not already enabled)
-- This is typically already enabled by Supabase

-- Drop existing policies for clean setup (if any)
DROP POLICY IF EXISTS "Admin users can upload images" ON storage.objects;
DROP POLICY IF EXISTS "Admin users can update images" ON storage.objects;
DROP POLICY IF EXISTS "Admin users can delete images" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view images" ON storage.objects;

-- Policy: Allow public read access to images bucket
CREATE POLICY "Anyone can view images"
ON storage.objects
FOR SELECT
USING (bucket_id = 'images');

-- Policy: Allow admin users to upload/insert images
CREATE POLICY "Admin users can upload images"
ON storage.objects
FOR INSERT
WITH CHECK (
    bucket_id = 'images'
    AND EXISTS (
        SELECT 1 FROM public.user_roles
        WHERE user_id = auth.uid()
        AND role = 'admin'
    )
);

-- Policy: Allow admin users to update images
CREATE POLICY "Admin users can update images"
ON storage.objects
FOR UPDATE
USING (
    bucket_id = 'images'
    AND EXISTS (
        SELECT 1 FROM public.user_roles
        WHERE user_id = auth.uid()
        AND role = 'admin'
    )
);

-- Policy: Allow admin users to delete images
CREATE POLICY "Admin users can delete images"
ON storage.objects
FOR DELETE
USING (
    bucket_id = 'images'
    AND EXISTS (
        SELECT 1 FROM public.user_roles
        WHERE user_id = auth.uid()
        AND role = 'admin'
    )
);
