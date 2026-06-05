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

- **Admin**: username `generali` + password (localStorage + HttpOnly cookie)
- **Code-User**: 8-stelliger Code (localStorage + HttpOnly cookie)

## Session Storage

- **localStorage**: `orf_auth` token (for client-side UX)
- **Cookie**: `orf_session=1` HttpOnly (for server-side middleware)

## Key Files

- `index.html`: Login form (root)
- `landing.html`: Sales page with blog
- `app.html`: Main wizard
- `src/js/auth.js`: login(), logout(), isAuthenticated()
- `middleware.js`: Edge function for `/app` protection