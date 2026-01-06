-- Grant table-level INSERT permission to anon role
-- RLS policies only control which rows can be accessed
-- GRANT controls whether the role can perform the operation at all

-- Grant INSERT on inquiries table to anon role
GRANT INSERT ON public.inquiries TO anon;

-- Grant INSERT on inquiry_items table to anon role  
GRANT INSERT ON public.inquiry_items TO anon;

-- Also ensure authenticated role has INSERT permission (should already exist, but just in case)
GRANT INSERT ON public.inquiries TO authenticated;
GRANT INSERT ON public.inquiry_items TO authenticated;
