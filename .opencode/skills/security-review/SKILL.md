---
name: security-review
description: Reviews code changes for security vulnerabilities in ORF-Butler. Triggers on login, auth, XSS, rate limiting, Supabase.
---

# Security Review Skill

Use ONLY when reviewing authentication, API endpoints, or file handling in ORF-Butler.

## Checklist for API Endpoints

- **XSS Prevention**: Any user input in innerHTML must be escaped via `escHtml()` or DOM methods
- **Error Leaking**: Server errors return generic messages, never `e.message` with stack traces
- **Method Guard**: Every handler uses `methodGuard()` from `lib/http.js`; CORS + preflight via `applyCors()`/`handlePreflight()`
- **Admin Auth**: `verifyAdmin` compares against `LOGIN_USER`/`LOGIN_PASS` with no bypass; unset env → 401

## Checklist for Auth

- Session cookies must be HttpOnly, SameSite=Lax (`orf_session`)
- `/landing` and `/app` must be protected by `middleware.js` redirect
- Admin login must validate password server-side via `POST /api/login` (never client-side)
- Supabase anon key is PUBLIC – only `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` is exposed
- **NEVER** expose `SUPABASE_DB_PASS` to client-side code
- Supabase JWT session must validate before granting access
- Social login redirects must use `redirectTo` with absolute URL

## Checklist for File Access

- Source files (`lib/`, `scripts/`, `src/tests/`) must NOT be directly downloadable (vercel.json redirect to 404)
- No hardcoded credentials in source files

## Supabase-Specific

- `api/supabase-config.js` only returns `url` and `key` – never `SUPABASE_DB_PASS`
- OAuth providers (Google/Apple/GitHub) configured in Supabase dashboard, not in code
- No public account creation: email registration/login and code login removed (`/api/register`, `/api/auto-confirm`, `api/codes.js` deleted)