-- Spy by Atlas — Complete Database Schema
-- Run in Supabase SQL Editor: https://supabase.com/dashboard → SQL Editor

-- ═══════════════════════════════════════════════════════════════════
-- PROFILES (extends auth.users)
-- ═══════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  tier TEXT DEFAULT 'observer' CHECK (tier IN ('observer','analyst','director','enterprise')),
  timezone TEXT DEFAULT 'UTC+3',
  language TEXT DEFAULT 'en',
  sector_focus TEXT DEFAULT 'All Sectors',
  report_frequency TEXT DEFAULT 'weekly',
  onboarded BOOLEAN DEFAULT FALSE,
  -- User self-disclosed profile (#11 from previous)
  linkedin_url TEXT,
  twitter_handle TEXT,
  instagram_handle TEXT,
  company TEXT,
  role TEXT,
  industry TEXT,
  interests TEXT,
  concerns TEXT,
  daily_routine JSONB, -- structured daily routine data
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ═══════════════════════════════════════════════════════════════════
-- REPORTS (all generated reports accessible to user)
-- ═══════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('osint','daily_brief','breach','social_media','threat_assessment','footprint','executive_protection','custom')),
  title TEXT NOT NULL,
  subject TEXT, -- what was searched/analyzed
  content TEXT NOT NULL, -- full report text
  classification TEXT DEFAULT 'CONFIDENTIAL',
  metadata JSONB, -- additional structured data
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_reports_user ON public.reports(user_id, created_at DESC);

-- ═══════════════════════════════════════════════════════════════════
-- BREACH DATABASE (admin-uploadable, user-searchable)
-- ═══════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.breach_entries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  source_name TEXT NOT NULL, -- e.g. "LinkedIn 2021", "Collection #1"
  breach_date TEXT,
  data_types TEXT, -- "email, password, phone"
  total_records TEXT,
  severity TEXT DEFAULT 'high',
  raw_data TEXT, -- uploaded raw data (admin only)
  searchable_emails TEXT[], -- extracted emails for search
  uploaded_by TEXT, -- admin email
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_breach_emails ON public.breach_entries USING GIN(searchable_emails);

-- ═══════════════════════════════════════════════════════════════════
-- SOCIAL MEDIA HANDLES (user-provided for monitoring)
-- ═══════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.social_handles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  platform TEXT NOT NULL CHECK (platform IN ('instagram','twitter','linkedin','facebook','tiktok','other')),
  handle TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending','monitoring','reviewed','flagged')),
  last_review TIMESTAMPTZ,
  review_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ═══════════════════════════════════════════════════════════════════
-- CPIR RESULTS
-- ═══════════════════════════════════════════════════════════════════
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

-- ═══════════════════════════════════════════════════════════════════
-- WAR ROOM SESSIONS (chat history)
-- ═══════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.warroom_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT DEFAULT 'New Session',
  messages JSONB DEFAULT '[]',
  status TEXT DEFAULT 'active' CHECK (status IN ('active','resolved','archived')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ═══════════════════════════════════════════════════════════════════
-- IMAGE SCANS (uploaded images with security analysis)
-- ═══════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.image_scans (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  filename TEXT NOT NULL,
  filesize TEXT,
  analysis TEXT,
  admin_notified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ═══════════════════════════════════════════════════════════════════
-- ADMIN AUDIT LOG
-- ═══════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.admin_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  action TEXT NOT NULL,
  details JSONB,
  performed_by TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ═══════════════════════════════════════════════════════════════════
-- ROW LEVEL SECURITY
-- ═══════════════════════════════════════════════════════════════════
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.breach_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_handles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cpir_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.warroom_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.image_scans ENABLE ROW LEVEL SECURITY;

-- Users see only their own data
CREATE POLICY "profiles_own" ON public.profiles FOR ALL USING (auth.uid() = id);
CREATE POLICY "reports_own" ON public.reports FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "social_own" ON public.social_handles FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "cpir_own" ON public.cpir_results FOR SELECT USING (org_id = auth.uid());
CREATE POLICY "cpir_insert" ON public.cpir_results FOR INSERT WITH CHECK (org_id = auth.uid());
CREATE POLICY "warroom_own" ON public.warroom_sessions FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "images_own" ON public.image_scans FOR ALL USING (auth.uid() = user_id);
-- Breach DB: all authenticated users can search, only admin can insert
CREATE POLICY "breach_read" ON public.breach_entries FOR SELECT USING (auth.role() = 'authenticated');

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
