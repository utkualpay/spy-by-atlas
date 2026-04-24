-- Spy by Atlas — Complete Schema v3
-- Run in Supabase SQL Editor (fresh — drop old tables first if needed)

-- ═══ PROFILES ═══
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  tier TEXT DEFAULT 'observer' CHECK (tier IN ('observer','personal_pro','business','executive')),
  account_type TEXT CHECK (account_type IN ('personal','family','business')),
  is_master BOOLEAN DEFAULT TRUE,
  master_account_id UUID REFERENCES public.profiles(id),
  trial_started_at TIMESTAMPTZ,
  trial_ends_at TIMESTAMPTZ,
  subscription_status TEXT DEFAULT 'inactive' CHECK (subscription_status IN ('inactive','trial','active','cancelled','past_due')),
  card_on_file BOOLEAN DEFAULT FALSE,
  paddle_customer_id TEXT,
  paddle_subscription_id TEXT,
  onboarded BOOLEAN DEFAULT FALSE,
  tour_completed BOOLEAN DEFAULT FALSE,
  eula_accepted_at TIMESTAMPTZ,
  explicit_content_accepted_at TIMESTAMPTZ,
  email_reports_preference TEXT DEFAULT 'platform_only' CHECK (email_reports_preference IN ('platform_only','email_only','both')),
  preferred_language TEXT DEFAULT 'en' CHECK (preferred_language IN ('en','fr','de')),
  timezone TEXT DEFAULT 'UTC+3',
  language TEXT DEFAULT 'en',
  sector_focus TEXT DEFAULT 'All Sectors',
  linkedin_url TEXT, twitter_handle TEXT, instagram_handle TEXT,
  company TEXT, role TEXT, industry TEXT, interests TEXT, concerns TEXT,
  daily_routine JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ═══ SUB-USERS / SEATS ═══
CREATE TABLE IF NOT EXISTS public.seats (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  master_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role TEXT DEFAULT 'member' CHECK (role IN ('member','child','admin')),
  status TEXT DEFAULT 'invited' CHECK (status IN ('invited','active','removed')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ═══ REPORTS ═══
CREATE TABLE IF NOT EXISTS public.reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  subject TEXT,
  content TEXT NOT NULL,
  classification TEXT DEFAULT 'CONFIDENTIAL',
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_reports_user ON public.reports(user_id, created_at DESC);

-- ═══ BREACH DATABASE ═══
CREATE TABLE IF NOT EXISTS public.breach_entries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  source_name TEXT NOT NULL,
  breach_date TEXT,
  data_types TEXT,
  total_records TEXT,
  severity TEXT DEFAULT 'high',
  raw_data TEXT,
  searchable_emails TEXT[],
  uploaded_by TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_breach_emails ON public.breach_entries USING GIN(searchable_emails);

-- ═══ SOCIAL HANDLES ═══
CREATE TABLE IF NOT EXISTS public.social_handles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  platform TEXT NOT NULL,
  handle TEXT NOT NULL,
  owner_type TEXT DEFAULT 'self' CHECK (owner_type IN ('self','child','employee')),
  owner_name TEXT,
  status TEXT DEFAULT 'pending',
  last_review TIMESTAMPTZ,
  review_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ═══ WAR ROOM SESSIONS ═══
CREATE TABLE IF NOT EXISTS public.warroom_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT DEFAULT 'New Session',
  messages JSONB DEFAULT '[]',
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ═══ CPIR RESULTS ═══
CREATE TABLE IF NOT EXISTS public.cpir_results (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID REFERENCES auth.users(id),
  employee_name TEXT, department TEXT, assessment_code TEXT,
  dimensions JSONB, risk_score NUMERIC(5,4), risk_label TEXT, answers JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ═══ IMAGE SCANS ═══
CREATE TABLE IF NOT EXISTS public.image_scans (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  filename TEXT NOT NULL, filesize TEXT, analysis TEXT,
  admin_notified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ═══ HONEYTOKENS ═══
CREATE TABLE IF NOT EXISTS public.honeytokens (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  token_id TEXT UNIQUE NOT NULL,
  document_name TEXT NOT NULL,
  recipient TEXT NOT NULL,
  token_type TEXT DEFAULT 'document' CHECK (token_type IN ('document','credential','url','canary')),
  triggered BOOLEAN DEFAULT FALSE,
  triggered_at TIMESTAMPTZ,
  triggered_details TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ═══ SUPPRESSION REQUESTS ═══
CREATE TABLE IF NOT EXISTS public.suppression_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  type TEXT DEFAULT 'mass_optout' CHECK (type IN ('mass_optout','specific','custom')),
  target_name TEXT,
  target_email TEXT,
  brokers_targeted TEXT[],
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending','processing','completed','partial')),
  results JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ═══ SUPPLY CHAIN ENTRIES ═══
CREATE TABLE IF NOT EXISTS public.supply_chain (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  vendor_name TEXT NOT NULL,
  vendor_domain TEXT NOT NULL,
  risk_score NUMERIC(5,2),
  last_scan TIMESTAMPTZ,
  scan_results JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ═══ NOTES ═══
CREATE TABLE IF NOT EXISTS public.notes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT DEFAULT 'Untitled',
  content TEXT DEFAULT '',
  color TEXT DEFAULT 'default',
  pinned BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ═══ STRATEGIC RESEARCH REPORTS (published by admin, readable by all authenticated users) ═══
CREATE TABLE IF NOT EXISTS public.strategic_reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  subtitle TEXT,
  category TEXT DEFAULT 'analysis',
  classification TEXT DEFAULT 'UNCLASSIFIED',
  content TEXT NOT NULL,
  summary TEXT,
  tags TEXT[],
  published BOOLEAN DEFAULT FALSE,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_strategic_reports_published ON public.strategic_reports(published, published_at DESC);

-- ═══ ISSUE REPORTS (user-submitted complaints/bugs) ═══
CREATE TABLE IF NOT EXISTS public.issue_reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  user_email TEXT,
  issue_type TEXT CHECK (issue_type IN ('bug','feature','billing','account','other')),
  details TEXT NOT NULL,
  status TEXT DEFAULT 'open' CHECK (status IN ('open','reviewing','resolved','closed')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ═══ ADMIN LOG ═══
CREATE TABLE IF NOT EXISTS public.admin_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  action TEXT NOT NULL, details JSONB, performed_by TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ═══ RLS ═══
-- Backfill columns on existing profiles table (safe if columns already exist)
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS account_type TEXT CHECK (account_type IN ('personal','family','business'));
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_master BOOLEAN DEFAULT TRUE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS master_account_id UUID REFERENCES public.profiles(id);
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS trial_started_at TIMESTAMPTZ;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS trial_ends_at TIMESTAMPTZ;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'inactive';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS card_on_file BOOLEAN DEFAULT FALSE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS paddle_customer_id TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS paddle_subscription_id TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS onboarded BOOLEAN DEFAULT FALSE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS tour_completed BOOLEAN DEFAULT FALSE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS eula_accepted_at TIMESTAMPTZ;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS explicit_content_accepted_at TIMESTAMPTZ;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email_reports_preference TEXT DEFAULT 'platform_only';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS preferred_language TEXT DEFAULT 'en';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS timezone TEXT DEFAULT 'UTC+3';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS language TEXT DEFAULT 'en';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS sector_focus TEXT DEFAULT 'All Sectors';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS linkedin_url TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS twitter_handle TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS instagram_handle TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS company TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS role TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS industry TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS interests TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS concerns TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS daily_routine JSONB;

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.breach_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_handles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.warroom_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cpir_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.image_scans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.honeytokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.suppression_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.supply_chain ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.strategic_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.issue_reports ENABLE ROW LEVEL SECURITY;

-- Drop existing policies first so the script is safe to re-run
DROP POLICY IF EXISTS "own" ON public.profiles;
DROP POLICY IF EXISTS "own" ON public.seats;
DROP POLICY IF EXISTS "own" ON public.reports;
DROP POLICY IF EXISTS "own" ON public.social_handles;
DROP POLICY IF EXISTS "own" ON public.warroom_sessions;
DROP POLICY IF EXISTS "own" ON public.cpir_results;
DROP POLICY IF EXISTS "ins" ON public.cpir_results;
DROP POLICY IF EXISTS "own" ON public.image_scans;
DROP POLICY IF EXISTS "own" ON public.honeytokens;
DROP POLICY IF EXISTS "own" ON public.suppression_requests;
DROP POLICY IF EXISTS "own" ON public.supply_chain;
DROP POLICY IF EXISTS "own" ON public.notes;
DROP POLICY IF EXISTS "read" ON public.breach_entries;
DROP POLICY IF EXISTS "read_strategic" ON public.strategic_reports;
DROP POLICY IF EXISTS "own_issue" ON public.issue_reports;
DROP POLICY IF EXISTS "insert_issue" ON public.issue_reports;

CREATE POLICY "own" ON public.profiles FOR ALL USING (auth.uid() = id);
CREATE POLICY "own" ON public.seats FOR ALL USING (master_id = auth.uid() OR user_id = auth.uid());
CREATE POLICY "own" ON public.reports FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "own" ON public.social_handles FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "own" ON public.warroom_sessions FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "own" ON public.cpir_results FOR SELECT USING (org_id = auth.uid());
CREATE POLICY "ins" ON public.cpir_results FOR INSERT WITH CHECK (org_id = auth.uid());
CREATE POLICY "own" ON public.image_scans FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "own" ON public.honeytokens FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "own" ON public.suppression_requests FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "own" ON public.supply_chain FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "own" ON public.notes FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "read" ON public.breach_entries FOR SELECT USING (auth.role() = 'authenticated');

-- Auto-create profile
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
