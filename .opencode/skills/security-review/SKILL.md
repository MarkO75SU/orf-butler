---
name: security-review
description: Reviews code changes for security vulnerabilities in ORF-Butler. Triggers on login, auth, codes API, XSS, rate limiting, Supabase.
---

# Security Review Skill

Use ONLY when reviewing authentication, API endpoints, or file handling in ORF-Butler.

## Checklist for API Endpoints

- **XSS Prevention**: Any user input in innerHTML must be escaped via `escHtml()` or DOM methods
- **Error Leaking**: Server errors return generic messages, never `e.message` with stack traces
- **Rate Limiting**: Public endpoints (redeem, check) must have rate limiting (30 req/min)
- **Oracle Attack**: Invalid/deactivated/exhausted codes return identical errors

## Checklist for Auth

- Code login must NOT require password field (disabled for non-admins)
- Session cookies must be HttpOnly, SameSite=Lax
- `/app` must be protected by middleware redirect
- Admin UI must verify password via prompt() before API calls
- Supabase anon key is PUBLIC – only `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` is exposed
- **NEVER** expose `SUPABASE_DB_PASS` to client-side code
- Supabase JWT session must validate before granting /app access
- Social login redirects must use `redirectTo` with absolute URL

## Checklist for File Access

- `/data/codes.json` must NOT be directly downloadable (vercel.json redirect to 404)
- Source files (`lib/`, `scripts/`) in `.vercelignore`
- No hardcoded credentials in source files

## Supabase-Specific

- `api/supabase-config.js` only returns `url` and `key` – never `SUPABASE_DB_PASS`
- OAuth providers (Google/Apple/GitHub) configured in Supabase dashboard, not in code
- User email verification handled by Supabase (Double-Opt-In)
- Password reset via `supabase.auth.resetPasswordForEmail()`