---
name: auth-system
description: Manages the ORF-Butler authentication system with multiple login methods. Use when working with login flow, Supabase auth, or social login.
---

# Auth System Skill

## Login Methods

1. **Code Login** – Anonymous 8-char code (localStorage token)
2. **Social Login** – Google, Apple, GitHub via Supabase OAuth
3. **Admin** – Username "generali" + password (serverless API)

> Email registration/login was removed: the app has no email sign-up or email password login. Only code + social + admin.

## Key Files

| File | Purpose |
|------|---------|
| `index.html` | Login page with tabs: Code / Social |
| `src/js/auth.js` | Unified auth layer (code + legacy admin) |
| `src/js/auth-supabase.js` | Supabase client (social login, session) |
| `api/supabase-config.js` | Returns Supabase URL + anon key from env |
| `api/login.js` | Admin password login API |
| `middleware.js` | Vercel Edge Middleware for `/app` protection |

## Supabase Auth Flow

- `socialLogin(provider)` → Supabase `signInWithOAuth` → OAuth redirect
- `getSession()` → Validates Supabase JWT
- `isAuthenticated()` → Checks localStorage token OR Supabase session

## Env Vars Required (Vercel)

- `NEXT_PUBLIC_SUPABASE_URL` – Supabase project URL
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` – Supabase anon key
- `SUPABASE_DB_PASS` – Database password (NOT exposed to client)

## Session Persistence

- Code users: localStorage `orf_auth` (with expiration)
- Supabase users: JWT in `localStorage` (managed by supabase-js)
- Admin: localStorage `orf_auth` + HttpOnly cookie for middleware