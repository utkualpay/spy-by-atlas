# Deployment Guide

## 1. Supabase Setup
1. Create project at supabase.com → Region: EU West (Frankfurt)
2. Go to Settings → API → copy URL, anon key, service role key
3. Go to SQL Editor → paste contents of `supabase/schema.sql` → Run
4. Go to Authentication → URL Configuration:
   - Site URL: `https://atlasspy.com`
   - Redirect URLs: add `https://atlasspy.com/auth/callback`

## 2. Push to GitHub
```bash
git init && git add . && git commit -m "Spy by Atlas v2"
git remote add origin git@github.com:YOUR/spy-by-atlas.git
git push -u origin main
```

## 3. Vercel Deployment
1. Import GitHub repo at vercel.com/new
2. Add environment variables:

| Variable | Value |
|----------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | from Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | from Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | from Supabase |
| `GEMINI_API_KEY` | your Gemini key |
| `ADMIN_EMAIL` | atlasalpaytr@gmail.com |
| `NEXT_PUBLIC_FORMSPREE_ID` | mvzvdjrq |
| `NEXT_PUBLIC_APP_URL` | https://atlasspy.com |

3. Deploy

## 4. Connect Domain
Add in Vercel → Settings → Domains:
- `atlasspy.com` → A record: `76.76.21.21`
- `www.atlasspy.com` → CNAME: `cname.vercel-dns.com`

## 5. iyzico (when ready)
Add `IYZICO_LINK_ANALYST` and `IYZICO_LINK_DIRECTOR` env vars → Redeploy

## Important: Vercel Pro
Gemini calls take 15-45 seconds. Vercel Hobby limits functions to 10s.
You need **Vercel Pro ($20/mo)** for the 60-second `maxDuration` to work.
