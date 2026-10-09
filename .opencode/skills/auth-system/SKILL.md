---
name: auth-system
description: Manages the ORF-Butler authentication system with multiple login methods. Use when working with login flow, Supabase auth, or social login.
---

# Auth System Skill

## Login Methods

1. **Social Login** – Google, Apple, GitHub via Supabase OAuth
2. **Admin** – Username + password (serverless `POST /api/login`, validated against `LOGIN_USER`/`LOGIN_PASS`)

> Code login and email registration/login were both removed: the only login is the website login at `/` (Social + Admin). No paywall, no codes, no self-service accounts.

## Key Files

| File | Purpose |
|------|---------|
| `index.html` | Website login page with tabs: Social / Admin |
| `src/js/auth.js` | Auth layer (admin login, session check, logout) |
| `src/js/auth-supabase.js` | Supabase client (social login, session) |
| `api/supabase-config.js` | Returns Supabase URL + anon key from env |
| `api/login.js` | Admin password login API (sets `orf_session` cookie) |
| `middleware.js` | Vercel Edge Middleware protecting `/landing` + `/app` |

## Supabase Auth Flow

- `socialLogin(provider)` → Supabase `signInWithOAuth` → OAuth redirect
- `getSession()` → Validates Supabase JWT
- `isAuthenticated()` → Checks localStorage token OR Supabase session

## Env Vars Required (Vercel)

- `NEXT_PUBLIC_SUPABASE_URL` – Supabase project URL
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` – Supabase anon key
- `SUPABASE_DB_PASS` – Database password (NOT exposed to client)

## Session Persistence

- Admin: localStorage `orf_auth` + `orf_session` HttpOnly cookie (via `/api/login`)
- Supabase users: JWT in `localStorage` (managed by supabase-js) + `orf_session` cookie (via `/api/confirm-session`)