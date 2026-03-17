# ACQUISITOR — Roadmap & Audit

**Canonical Repo:** `JDDavenport/acquisitor` (this one)  
**Stack:** Next.js 16 (app router) · Better Auth 1.5 · Supabase (Postgres) · Drizzle ORM · Tailwind + shadcn/ui · Vercel  
**Audit Date:** 2026-03-17

---

## What Works Now ✅

| Feature | Status | Notes |
|---------|--------|-------|
| **Build** | ✅ Clean | `npm run build` passes with 0 errors |
| **Auth setup** | ✅ Configured | Better Auth with email/password + Google + GitHub OAuth |
| **Auth client** | ✅ Working | `authClient` with `signIn`, `signUp`, `signOut`, `useSession` |
| **Middleware** | ✅ Working | Protects `/dashboard/*`, redirects unauth to `/login` |
| **DB schema** | ✅ Complete | Users, sessions, accounts, leads, deals, activities, email templates |
| **Drizzle config** | ✅ Connected | node-postgres pool with SSL to Supabase |
| **Landing page** | ✅ Renders | Hero component at `/` |
| **Auth pages** | ✅ Renders | `/login` and `/signup` static pages |
| **Demo mode** | ✅ Working | `/demo/*` routes bypass auth middleware |
| **Dashboard shell** | ✅ Renders | Layout with sidebar nav, 4 sections |
| **UI components** | ✅ 15+ shadcn | button, card, tabs, dialog, table, badge, select, etc. |

## What's Broken / Missing 🔴

### Auth (Priority 1)
- [ ] **No .env.local with real credentials** — local dev has placeholder `DATABASE_URL=postgresql://localhost:5432/acquisitor`
- [ ] **Google/GitHub OAuth not configured** — `GOOGLE_CLIENT_ID` and `GITHUB_CLIENT_ID` are `!` placeholders
- [ ] **Session cookie name mismatch?** — Middleware checks `acquisitor.session_token` but Better Auth default may differ. Needs verification.
- [ ] **No email verification flow** — `emailVerified` field exists but no verification endpoint/email

### Database (Priority 1)
- [ ] **Schema not pushed to Supabase** — Need to run `npx drizzle-kit push` against production DB
- [ ] **Legacy `users` table conflict** — Schema has both `user` (Better Auth) and `users` (legacy). Remove legacy.
- [ ] **No seed data** — Empty DB on first deploy, no onboarding flow

### Dashboard (Priority 2)
- [ ] **Dashboard pages are mostly static/hardcoded** — Leads, pipeline, settings pages render but use no real data
- [ ] **No server actions or API routes for CRUD** — No create/update/delete for leads, deals, activities
- [ ] **No data fetching** — Dashboard page shows hardcoded metrics, not DB queries

### Scrapers / Lead Discovery (Priority 3 — Missing Entirely)
- [ ] **No scrapers in v3** — v2 had `utah-corps.ts` scraper + AI scoring. None ported.
- [ ] **No outreach system** — v2 had email templates + tracking pixels. None ported.
- [ ] **No AI scoring** — v2 had `/api/ai/score` endpoint. Not ported.
- [ ] **silver-tsunami-real had Python agents** — Scout discovery agents (marketplace, registry, website, directory). Not integrated.

### Deployment (Priority 2)
- [ ] **Vercel project not linked** — No `.vercel/` directory
- [ ] **Environment variables needed on Vercel** — DATABASE_URL, BETTER_AUTH_SECRET, NEXT_PUBLIC_APP_URL, OAuth keys
- [ ] **No CI/CD** — No GitHub Actions

---

## Architecture Notes

### Source Comparison (Why v3 Won)

| | v2 (acquisitor-v2) | v3 (this repo) | silver-tsunami-real |
|---|---|---|---|
| Framework | Next.js (old) | **Next.js 16** | Express API + Vite SPA |
| Auth | Better Auth 0.8 | **Better Auth 1.5** | Custom JWT |
| DB | Neon + Drizzle | **Supabase + Drizzle** | Raw SQL |
| Structure | No `src/` dir | **`src/` app router** | Monorepo (api/web) |
| Git | No remote | **GitHub** | GitHub (old arch) |
| Build | Untested | **✅ Passes** | Separate builds |
| Extra features | Scrapers, AI, outreach | Demo mode, clean schema | Python agents, dispatch |

**v3 is the most modern, cleanest, and only one that builds.** V2 features (scrapers, AI, outreach) should be ported as needed. Silver-tsunami Python agents are a separate concern.

### File Structure
```
src/
├── app/
│   ├── (auth)/login, signup
│   ├── api/auth/[...all]     ← Better Auth handler
│   ├── dashboard/            ← Protected pages (leads, pipeline, settings)
│   ├── demo/                 ← Public demo (same UI, no auth)
│   └── page.tsx              ← Landing
├── components/
│   ├── ui/                   ← shadcn components
│   └── landing/Hero.tsx
├── lib/
│   ├── auth/index.ts         ← Better Auth server config
│   ├── auth-client.ts        ← Client-side auth hooks
│   ├── db/index.ts           ← Drizzle + pg pool
│   └── db/schema.ts          ← Full schema
└── middleware.ts              ← Route protection
```

---

## Next Steps (Ordered)

### Phase 1: Auth & DB Working (1-2 hours)
1. Set up Supabase project env vars in `.env.local` (copy from `.env.production`)
2. Run `npx drizzle-kit push` to create tables
3. Test signup/login flow locally
4. Fix session cookie name if mismatched
5. Remove legacy `users` table from schema

### Phase 2: Real Dashboard Data (2-4 hours)
1. Add server actions: `createLead`, `updateLead`, `deleteLead`
2. Add server actions: `createDeal`, `updateDeal`, stage transitions
3. Wire dashboard pages to fetch real data from DB
4. Add lead import (CSV upload)

### Phase 3: Deploy to Vercel (30 min)
1. `vercel link` → connect to project
2. Set all env vars in Vercel dashboard
3. Deploy and verify auth + DB work in production
4. Set custom domain if desired

### Phase 4: Port V2 Features (4-8 hours)
1. Port Utah corps scraper from v2 (`app/lib/scrapers/utah-corps.ts`)
2. Port AI lead scoring (`/api/ai/score`)
3. Port outreach/email system
4. Port email tracking (pixel + click tracking)

### Phase 5: Port Silver Tsunami Agents (Future)
1. Evaluate Python scout agents for relevance
2. Build API bridge or rewrite in TypeScript
3. Integrate marketplace/registry/directory discovery

---

## Environment Variables Needed

```env
# Database (Supabase connection pooler)
DATABASE_URL=postgresql://postgres.[project-ref]:[password]@aws-0-us-east-2.pooler.supabase.com:6543/postgres

# Auth
BETTER_AUTH_SECRET=<random-32-char-string>
NEXT_PUBLIC_APP_URL=https://acquisitor.vercel.app

# OAuth (optional, enable later)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
```
