---
name: auth-system
description: Manages the ORF-Butler authentication system with multiple login methods. Use when working with login flow, registration, Supabase auth, or social login.
---

# Auth System Skill

## Login Methods

1. **Code Login** – Anonymous 8-char code (localStorage token)
2. **Email + Password** – Supabase Auth (JWT session)
3. **Social Login** – Google, Apple, GitHub via Supabase OAuth
4. **Admin** – Username "generali" + password (serverless API)

## Key Files

| File | Purpose |
|------|---------|
| `index.html` | Login page with 3 tabs: Code / E-Mail / Social |
| `src/js/auth.js` | Unified auth layer (code + legacy admin) |
| `src/js/auth-supabase.js` | Supabase client (register, login, social, session) |
| `api/supabase-config.js` | Returns Supabase URL + anon key from env |
| `api/login.js` | Admin password login API |
| `middleware.js` | Vercel Edge Middleware for `/app` protection |

## Supabase Auth Flow

- `register(email, password)` → Supabase `signUp` → Double-Opt-In email
- `loginEmail(email, password)` → Supabase `signInWithPassword` → JWT session
- `socialLogin(provider)` → Supabase `signInWithOAuth` → OAuth redirect
- `getSession()` → Validates Supabase JWT
- `isAuthenticated()` → Checks localStorage token OR Supabase session

## Env Vars Required (Vercel)

- `NEXT_PUBLIC_SUPABASE_URL` – Supabase project URL
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` – Supabase anon key
- `SUPABASE_DB_PASS` – Database password (NOT exposed to client)

## Double Opt-In

Supabase handles email confirmation automatically. After `signUp`, user receives a confirmation email with a link. Account is inactive until confirmed.

## Session Persistence

- Code users: localStorage `orf_auth` (with expiration)
- Supabase users: JWT in `localStorage` (managed by supabase-js)
- Admin: localStorage `orf_auth` + HttpOnly cookie for middleware