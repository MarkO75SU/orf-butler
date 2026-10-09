---
name: login-flow
description: Manages the complete ORF-Butler login flow from entry to app. Use when modifying auth, routes, or session handling.
---

# Login Flow Skill

## User Journey

```
orfb.vercel.app/    → Login-Formular (NUR Login)
     ↓ Erfolgreich
/landing             → Sales + Features + Blog
     ↓ "Zur App"
/app                → 4-Step Wizard (geschützt via Middleware)
     ↓ Logout
zurück zu /
```

## Auth Types

- **Admin**: username + password (localStorage `orf_auth` + HttpOnly cookie `orf_session`)
- **Social**: Google/Apple/GitHub via Supabase OAuth (JWT session + `orf_session` cookie)
- Kein Code-Login, keine E-Mail-Registrierung / kein E-Mail-Login
- Keine Paywall: nur freiwillige BMC-Unterstützung

## Session Storage

- **localStorage**: `orf_auth` token (for client-side UX)
- **Cookie**: `orf_session=1` HttpOnly (for server-side middleware)

## Key Files

- `index.html`: Website login (root)
- `landing.html`: Sales page with blog
- `app.html`: Main wizard (no own login – gated by middleware)
- `src/js/auth.js`: login(), logout(), isAuthenticated()
- `middleware.js`: Edge function protecting `/landing` + `/app`