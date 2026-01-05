-- Create enum for user roles
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'user',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

-- Create categories table
CREATE TABLE public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create items table
CREATE TABLE public.items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID REFERENCES public.categories(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  price NUMERIC NOT NULL DEFAULT 0,
  unit TEXT NOT NULL DEFAULT 'unit',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create event_templates table
CREATE TABLE public.event_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create template_items table
CREATE TABLE public.template_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID REFERENCES public.event_templates(id) ON DELETE CASCADE NOT NULL,
  item_id UUID REFERENCES public.items(id) ON DELETE CASCADE NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create inquiries table
CREATE TABLE public.inquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  customer_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  event_date DATE,
  event_type TEXT,
  notes TEXT,
  total NUMERIC NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create inquiry_items table
CREATE TABLE public.inquiry_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  inquiry_id UUID REFERENCES public.inquiries(id) ON DELETE CASCADE NOT NULL,
  item_id UUID REFERENCES public.items(id) ON DELETE SET NULL,
  item_name TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  price_at_time NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.template_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inquiry_items ENABLE ROW LEVEL SECURITY;

-- Security definer function for role checking
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Profiles policies
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

-- User roles policies
CREATE POLICY "Users can view own roles" ON public.user_roles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage roles" ON public.user_roles
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Categories policies (public read, admin write)
CREATE POLICY "Anyone can view categories" ON public.categories
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage categories" ON public.categories
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Items policies (public read, admin write)
CREATE POLICY "Anyone can view items" ON public.items
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage items" ON public.items
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Event templates policies (public read, admin write)
CREATE POLICY "Anyone can view templates" ON public.event_templates
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage templates" ON public.event_templates
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Template items policies (public read, admin write)
CREATE POLICY "Anyone can view template items" ON public.template_items
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage template items" ON public.template_items
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Inquiries policies
CREATE POLICY "Users can view own inquiries" ON public.inquiries
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create inquiries" ON public.inquiries
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update own inquiries" ON public.inquiries
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all inquiries" ON public.inquiries
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage inquiries" ON public.inquiries
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Inquiry items policies
CREATE POLICY "Users can view own inquiry items" ON public.inquiry_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.inquiries
      WHERE id = inquiry_items.inquiry_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create inquiry items" ON public.inquiry_items
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can view all inquiry items" ON public.inquiry_items
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage inquiry items" ON public.inquiry_items
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (NEW.id, NEW.raw_user_meta_data ->> 'full_name');
  
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  
  RETURN NEW;
END;
$$;

-- Trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON public.categories
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_items_updated_at BEFORE UPDATE ON public.items
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_event_templates_updated_at BEFORE UPDATE ON public.event_templates
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_inquiries_updated_at BEFORE UPDATE ON public.inquiries
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();