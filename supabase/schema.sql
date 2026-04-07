-- Run this in Supabase SQL Editor (https://supabase.com/dashboard → SQL Editor)

-- Profiles table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  tier TEXT DEFAULT 'observer' CHECK (tier IN ('observer', 'professional', 'executive', 'enterprise')),
  timezone TEXT DEFAULT 'UTC+3',
  language TEXT DEFAULT 'en',
  sector_focus TEXT DEFAULT 'All Sectors',
  report_frequency TEXT DEFAULT 'weekly',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Subscriptions table (managed by Stripe webhooks)
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  status TEXT DEFAULT 'inactive' CHECK (status IN ('active', 'cancelled', 'inactive', 'past_due')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- CPIR assessment results
CREATE TABLE IF NOT EXISTS public.cpir_results (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID REFERENCES auth.users(id),
  employee_name TEXT,
  department TEXT,
  assessment_code TEXT,
  dimensions JSONB,
  risk_score NUMERIC(5,4),
  risk_label TEXT,
  answers JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Research requests
CREATE TABLE IF NOT EXISTS public.research_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  name TEXT,
  email TEXT NOT NULL,
  type TEXT,
  subject TEXT NOT NULL,
  description TEXT NOT NULL,
  urgency TEXT DEFAULT 'standard',
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Saved scans (OSINT results, footprint results, etc.)
CREATE TABLE IF NOT EXISTS public.saved_scans (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  scan_type TEXT NOT NULL,
  query TEXT NOT NULL,
  query_type TEXT,
  results JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cpir_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.research_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_scans ENABLE ROW LEVEL SECURITY;

-- Policies: users can only read/write their own data
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can view own subscription" ON public.subscriptions FOR SELECT USING (email = auth.email());

CREATE POLICY "Users can view own CPIR results" ON public.cpir_results FOR SELECT USING (org_id = auth.uid());
CREATE POLICY "Users can insert CPIR results" ON public.cpir_results FOR INSERT WITH CHECK (org_id = auth.uid());

CREATE POLICY "Users can manage own research requests" ON public.research_requests FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Users can manage own scans" ON public.saved_scans FOR ALL USING (user_id = auth.uid());

-- Function to auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
