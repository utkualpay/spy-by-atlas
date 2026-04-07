# Spy by Atlas — Deployment Guide

## Prerequisites

- GitHub account
- Vercel account (free tier works)
- Supabase account (free tier works)
- Anthropic API key
- Domain: atlasspy.com (already owned)

---

## Step 1: Supabase Setup (Database + Auth)

1. Go to [supabase.com/dashboard](https://supabase.com/dashboard)
2. Click **New Project**
   - Name: `spy-by-atlas`
   - Database password: generate and save securely
   - Region: **EU West (Frankfurt)** (closest to Istanbul)
3. Once created, go to **Settings → API**:
   - Copy **Project URL** → this is `NEXT_PUBLIC_SUPABASE_URL`
   - Copy **anon/public key** → this is `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - Copy **service_role key** → this is `SUPABASE_SERVICE_ROLE_KEY`
4. Go to **SQL Editor**, paste the contents of `supabase/schema.sql`, click **Run**
5. Go to **Authentication → URL Configuration**:
   - Set Site URL to `https://atlasspy.com`
   - Add `https://atlasspy.com/auth/callback` to Redirect URLs
6. Go to **Authentication → Email Templates**:
   - Customize the confirmation email with Atlas branding (optional but recommended)

## Step 2: Push to GitHub

```bash
cd spy-by-atlas
git init
git add .
git commit -m "Initial commit — Spy by Atlas v5"
git remote add origin git@github.com:YOUR_USERNAME/spy-by-atlas.git
git push -u origin main
```

## Step 3: Vercel Deployment

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import the GitHub repository
3. Framework Preset: **Next.js** (auto-detected)
4. Open **Environment Variables** and add:

| Variable | Value | Notes |
|----------|-------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://xxx.supabase.co` | From Step 1 |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJhbG...` | From Step 1 |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJhbG...` | From Step 1 |
| `ANTHROPIC_API_KEY` | `sk-ant-...` | From console.anthropic.com |
| `NEXT_PUBLIC_FORMSPREE_ID` | `mvzvdjrq` | Already configured |
| `NEXT_PUBLIC_APP_URL` | `https://atlasspy.com` | Your domain |

5. Click **Deploy**

## Step 4: Connect Domain

1. In Vercel dashboard → your project → **Settings → Domains**
2. Add `atlasspy.com`
3. Vercel will show DNS records to add:
   - If using Namecheap/Cloudflare/etc: add the A record and CNAME as instructed
   - If transferring nameservers: point to Vercel's nameservers
4. Wait for DNS propagation (5 min to 48 hours, usually ~15 min)
5. SSL certificate is automatic

## Step 5: iyzico Setup (When Ready for Payments)

1. Log in to [merchant.iyzipay.com](https://merchant.iyzipay.com)
2. Go to **Payment Links** (Ödeme Linkleri)
3. Create two recurring payment links:
   - **Professional** — $9.99/month (or TRY equivalent)
   - **Executive** — $29.99/month (or TRY equivalent)
4. Copy the generated links (format: `https://iyzi.link/XXXXX`)
5. Add to Vercel environment variables:
   - `IYZICO_LINK_PROFESSIONAL` → your Professional link
   - `IYZICO_LINK_EXECUTIVE` → your Executive link
6. Redeploy

That's it. iyzico payment links handle card collection, 3D Secure, receipts, and recurring billing. No server-side API integration needed.

## Step 6: Post-Deployment Verification

Test this sequence:

1. Visit `atlasspy.com` — marketing page loads
2. Click "Demo" — dashboard loads in demo mode
3. Click "Sign Up" — create account, receive confirmation email
4. Confirm email → sign in
5. Test OSINT search, Intelligence Feed, Breach Monitor
6. Test CPIR assessment flow including Manager Panel
7. Test Decoy Deployment (steganography)
8. Test Research Request submission (check Formspree inbox)

---

## Ongoing Costs

| Service | Cost | Notes |
|---------|------|-------|
| Vercel | Free | Pro ($20/mo) if you exceed limits |
| Supabase | Free | Free tier: 500MB DB, 50K auth users |
| Anthropic API | ~$0.003/search | Usage-based, ~$5-15/mo for moderate use |
| atlasspy.com | ~$9/year | Domain renewal |
| iyzico | ~2.49% + commission | Only on actual revenue |
| **Total at launch** | **~$10-20/month** | Scales with usage |

## Troubleshooting

**Build fails on Vercel:**
- Check all env vars are set (missing vars cause build errors)
- Ensure `NEXT_PUBLIC_` prefix on client-side vars

**Auth not working:**
- Verify Supabase URL and keys are correct
- Check redirect URLs in Supabase Auth settings
- Ensure `schema.sql` was run successfully

**OSINT/Intel returning errors:**
- Verify `ANTHROPIC_API_KEY` is set and valid
- Check Vercel function logs for specific errors

**iyzico payments not working:**
- Verify payment links are set in env vars (IYZICO_LINK_PROFESSIONAL, IYZICO_LINK_EXECUTIVE)
- Test links directly in browser to confirm they're active
- Check iyzico merchant dashboard for transaction status
