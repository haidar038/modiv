-- MVP Enhancement Migration
-- Adds price history tracking, status history tracking, and image support

-- Add image_url to items table
ALTER TABLE public.items ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Add image_url to event_templates table  
ALTER TABLE public.event_templates ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Create price_history table for tracking price changes
CREATE TABLE public.price_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id UUID REFERENCES public.items(id) ON DELETE CASCADE NOT NULL,
  old_price NUMERIC NOT NULL,
  new_price NUMERIC NOT NULL,
  changed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  changed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create inquiry_status_history table for audit trail
CREATE TABLE public.inquiry_status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  inquiry_id UUID REFERENCES public.inquiries(id) ON DELETE CASCADE NOT NULL,
  old_status TEXT NOT NULL,
  new_status TEXT NOT NULL,
  changed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  changed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  notes TEXT
);

-- Enable RLS on new tables
ALTER TABLE public.price_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inquiry_status_history ENABLE ROW LEVEL SECURITY;

-- Price history policies (admin only)
CREATE POLICY "Admins can view price history" ON public.price_history
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert price history" ON public.price_history
  FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Inquiry status history policies (admin only)
CREATE POLICY "Admins can view status history" ON public.inquiry_status_history
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert status history" ON public.inquiry_status_history
  FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'));
