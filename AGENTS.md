# AGENTS.md — ORF-Butler (OpenRouter Free Butler)

## Quick Start

```bash
npm start          # local dev @ http://localhost:3000
npm test           # 42 tests, pure Node ESM
```

No build step, no bundler. Vercel auto-deploys from GitHub `main` branch.

## Architecture

- **Static SPA** (no framework): `index.html` + `login.html` as entry points
- JS modules under `src/js/`, loaded via `<script type="module">`
- **Vercel**: serverless API at `api/login.js` for auth; `vercel.json` rewrites all paths to `index.html`
- **Auth**: localStorage `orf_auth` token, validated server-side via `POST /api/login`
- Credentials: env vars `LOGIN_USER` / `LOGIN_PASS` only, never hardcoded

## Key Modules

| File | Purpose |
|------|---------|
| `src/js/app.js` | Main UI: multi-select models/tools, bundle, ZIP download |
| `src/js/mapping.js` | Curated free-model database (16 models), bilingual DE/EN |
| `src/js/templates.js` | Config generation per tool, `TOOL_TEMPLATES` registry |
| `src/js/i18n.js` | DE/EN translations, `setLanguage()`, `getLang()`, `t()` |
| `src/js/docs.js` | English install guides, OS paths, CLI commands |
| `src/js/auth.js` | localStorage-based login state |
| `src/tests/test-runner.js` | 42 pure Node tests (no DOM) |

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
- State arrays: `state.selectedModels[]`, `state.selectedTools[]`

## Testing

```bash
npm test                          # all 42 tests
# Tests run in plain Node.js (no browser). DOM-dependent code is not tested.
```

## Deployment

- GitHub push → Vercel auto-deploy (no manual trigger needed)
- `vercel.json` rewrites: API routes to `/api/*`, everything else to `index.html`
- `.env` vars set in Vercel project dashboard (LOGIN_USER, LOGIN_PASS)
- `package.json` version: `"version": "12.8.0"`

## Common Pitfalls

- Do NOT remove the `:free` suffix from model IDs
- Do NOT hardcode credentials in any source file
- JSZip is loaded via CDN, not npm — available as global `JSZip`
- Tailwind CSS via CDN — cosmetic warnings are harmless
- `models-grid` and `tools-grid` use 2-column layout with max-height 400px + custom scrollbar
- OS paths in `docs.js` differentiate `win32` vs `darwin`; used for INSTALL.md generation
