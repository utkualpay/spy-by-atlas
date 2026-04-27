-- supabase/schema-additions.sql
-- ATLAS INTELLIGENCE — Phase 11 schema additions
-- Run AFTER the existing schema.sql. Idempotent (safe to re-run).
-- These tables power the public intelligence portal and the social-media autopilot.

-- ═══════════════════════════════════════════════════════════════════
-- ARTICLES — daily Atlas-format briefings (publicly readable)
-- ═══════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.articles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  headline TEXT NOT NULL,
  dek TEXT,
  body_markdown TEXT NOT NULL,
  implications JSONB DEFAULT '[]',
  category TEXT DEFAULT 'cyber',
  sectors TEXT[] DEFAULT '{}',
  severity TEXT DEFAULT 'medium' CHECK (severity IN ('critical','high','medium','low','info')),
  tags TEXT[] DEFAULT '{}',
  source_name TEXT NOT NULL,
  source_url TEXT NOT NULL,
  source_published_at TIMESTAMPTZ,
  social_post_x TEXT,
  social_caption_instagram TEXT,
  selection_reason TEXT,
  view_count INTEGER DEFAULT 0,
  published BOOLEAN DEFAULT TRUE,
  published_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_articles_published ON public.articles(published, published_at DESC);
CREATE INDEX IF NOT EXISTS idx_articles_category ON public.articles(category, published_at DESC);
CREATE INDEX IF NOT EXISTS idx_articles_tags ON public.articles USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_articles_sectors ON public.articles USING GIN(sectors);

-- ═══════════════════════════════════════════════════════════════════
-- SOCIAL POSTS — record of every X / Instagram publish attempt
-- ═══════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.social_posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  article_id UUID REFERENCES public.articles(id) ON DELETE CASCADE,
  platform TEXT NOT NULL CHECK (platform IN ('x','instagram')),
  status TEXT NOT NULL CHECK (status IN ('queued','posted','failed','skipped')),
  external_id TEXT,
  external_url TEXT,
  error_message TEXT,
  posted_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_social_posts_article ON public.social_posts(article_id);
CREATE INDEX IF NOT EXISTS idx_social_posts_platform ON public.social_posts(platform, posted_at DESC);

-- ═══════════════════════════════════════════════════════════════════
-- ATLAS INDEX HISTORY — daily snapshot of the global threat score
-- ═══════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.atlas_index_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  score INTEGER NOT NULL,
  label TEXT NOT NULL,
  components JSONB NOT NULL,
  recorded_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_atlas_index_recent ON public.atlas_index_history(recorded_at DESC);

-- ═══════════════════════════════════════════════════════════════════
-- SAVED ARTICLES — logged-in users bookmark briefs
-- ═══════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.saved_articles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  article_id UUID REFERENCES public.articles(id) ON DELETE CASCADE NOT NULL,
  saved_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, article_id)
);
CREATE INDEX IF NOT EXISTS idx_saved_articles_user ON public.saved_articles(user_id, saved_at DESC);

-- ═══════════════════════════════════════════════════════════════════
-- NEWSLETTER SUBSCRIBERS — anonymous email captures from the public site
-- ═══════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.newsletter_subscribers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  source TEXT DEFAULT 'website',
  sector_focus TEXT DEFAULT 'All Sectors',
  confirmed BOOLEAN DEFAULT FALSE,
  unsubscribed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ═══════════════════════════════════════════════════════════════════
-- CO-ANALYST SESSIONS — Q&A turns against published articles
-- ═══════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.coanalyst_turns (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  article_id UUID REFERENCES public.articles(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_coanalyst_article ON public.coanalyst_turns(article_id, created_at DESC);

-- ═══════════════════════════════════════════════════════════════════
-- RLS — articles are public read; everything else owner-scoped
-- ═══════════════════════════════════════════════════════════════════
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.atlas_index_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coanalyst_turns ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_articles" ON public.articles;
CREATE POLICY "public_read_articles" ON public.articles FOR SELECT USING (published = TRUE);

DROP POLICY IF EXISTS "public_read_atlas_index" ON public.atlas_index_history;
CREATE POLICY "public_read_atlas_index" ON public.atlas_index_history FOR SELECT USING (TRUE);

DROP POLICY IF EXISTS "own_saved" ON public.saved_articles;
CREATE POLICY "own_saved" ON public.saved_articles FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_newsletter" ON public.newsletter_subscribers;
CREATE POLICY "insert_newsletter" ON public.newsletter_subscribers FOR INSERT WITH CHECK (TRUE);

DROP POLICY IF EXISTS "public_read_coanalyst" ON public.coanalyst_turns;
CREATE POLICY "public_read_coanalyst" ON public.coanalyst_turns FOR SELECT USING (TRUE);

-- view_count increment (atomic, server-side)
CREATE OR REPLACE FUNCTION public.bump_article_view(p_slug TEXT)
RETURNS VOID AS $$
BEGIN
  UPDATE public.articles SET view_count = view_count + 1 WHERE slug = p_slug AND published = TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
