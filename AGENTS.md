# AGENTS.md — ORF-Butler (OpenRouter Free Butler)

## Quick Start

```bash
npm start          # local dev @ http://localhost:3000
npm test           # 48 tests, pure Node ESM
```

No build step, no bundler. Vercel auto-deploys from GitHub `main` branch.

## Architecture

- **Static SPA** (no framework): `index.html` + `login.html` + `landing.html` as entry points
- JS modules under `src/js/`, loaded via `<script type="module">`
- **Vercel**: serverless API at `api/login.js` for auth; `vercel.json` rewrites to `index.html` except `/landing` and `/api/*`
- **Auth**: localStorage `orf_auth` token, validated server-side via `POST /api/login`
- Credentials: env vars `LOGIN_USER` / `LOGIN_PASS` only, never hardcoded
- **Logout** redirects to `landing.html` (sales page)

## Key Modules

| File | Purpose |
|------|---------|
| `landing.html` | Sales landing page (public), links to `login.html` |
| `login.html` | Login with password show/hide toggle, autocomplete, username prefilled |
| `src/js/app.js` | Main UI: multi-select models/tools, bundle, ZIP download |
| `src/js/mapping.js` | Curated free-model database (16 models), plus `MODEL_HISTORY` (12 archived models) |
| `src/js/templates.js` | Config generation per tool, `TOOL_TEMPLATES` registry (12 tools) |
| `src/js/i18n.js` | DE/EN translations, `setLanguage()`, `getLang()`, `t()` |
| `src/js/docs.js` | Install guides, OS paths, CLI commands |
| `src/js/auth.js` | localStorage-based login state |
| `src/tests/test-runner.js` | 48 pure Node tests (no DOM) |

## Critical Conventions

- **Model IDs must end with `:free`** suffix for OpenRouter free tier
- **Bilingual**: each model in `mapping.js` has `role`/`role_de` + `desc_en`/`desc_de`
- Cards render in current language via `getLang()` check in `createModelCard()`
- Model data is stored on card elements via `data-model-id` attribute (not index-based)
- Tools sorted alphabetically by `name`, models sorted by ID
- ZIP download via JSZip CDN, generates config.json + INSTALL.md per selected tool

## Checkbox / Selection Pattern

- Each model/tool card stores its ID in a `data-model-id` / `data-tool-id` attribute
- `updateModelCards()` / `updateToolCards()` reads the attribute, not array index
- Both `onclick` on the card AND `onchange` on the checkbox trigger toggle
- Checkbox uses `stopPropagation()` to prevent double-firing
- State arrays: `state.selectedModels[]`, `state.selectedTools[]`

## Model History

- `MODEL_HISTORY` in `mapping.js` tracks 12 models that were once free
- Rendered collapsed below step 4 in `index.html`, toggled via `toggleHistory()`
- Bilingual: `reason`/`reason_de` fields

## Testing

```bash
npm test                          # all 48 tests
# Tests run in plain Node.js (no browser). DOM-dependent code is not tested.
```

## Deployment

- GitHub push → Vercel auto-deploy (no manual trigger needed)
- `vercel.json` rewrites: API routes to `/api/*`, `/landing` to `landing.html`, everything else to `index.html`
- `.env` vars set in Vercel project dashboard (LOGIN_USER, LOGIN_PASS)
- `package.json` version: `"version": "12.8.0"`
- Daily `00:01 UTC` GitHub Actions workflow auto-updates free models via `scripts/update-models.js`

## Common Pitfalls

- Do NOT remove the `:free` suffix from model IDs
- Do NOT hardcode credentials in any source file
- JSZip is loaded via CDN, not npm — available as global `JSZip`
- Tailwind CSS via CDN — cosmetic warnings are harmless
- `models-grid` and `tools-grid` use 2-column layout with max-height 400px + custom scrollbar
- OS paths in `docs.js` differentiate `win32` vs `darwin`; used for INSTALL.md generation
- Login prefills "generali" as username; password uses `type="password"` with show/hide toggle
- **Login with code**: Tab "Anonymer Code" on login page; validates via `POST /api/codes?action=redeem`; stores `orf_auth` with `user: "anon"` in localStorage
- **Codes API** (`api/codes.js`): Actions: `generate`, `redeem`, `check`, `list`, `revoke`, `reset`. Admin auth via Basic header. Storage via `lib/github-store.js` (GitHub Content API, needs `GH_TOKEN` env var)
- **Code Management**: Admin sees "🔑 Code-Verwaltung" panel on main page (modal with generate/list/revoke/reset). CLI: `npm run codes [generate|list|revoke|reset]` reads/writes `data/codes.json` directly
- **Code format**: 8-char alphanumeric (uppercase, no ambiguous chars), max 10 uses by default, stored per code with `uses` counter in `data/codes.json`
- `GH_TOKEN` env var required on Vercel for code persistence via GitHub Content API

