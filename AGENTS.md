# AGENTS.md — ORF-Butler (OpenRouter Free Butler)

## Quick Start

```bash
npm start          # local dev @ http://localhost:3000
npm test           # pure Node ESM test suite
```

No build step, no bundler. Vercel auto-deploys from the GitHub `main` branch.

## Entry Points

| URL | File | Purpose |
|-----|------|---------|
| `/` (root) | `public/index.html` | **Website login** – social (OAuth) or admin password |
| `/landing` | `public/landing.html` | Features/tools/bundles (all free) + support section (BMC) + blog |
| `/app` | `public/app.html` | 4-step wizard (models → tools → bundle → ZIP download) |

**Flow:** `orfb.vercel.app` → login → `/landing` → "Go to app" → `/app` → logout → back to `/`

## Architecture

- **Static SPA** (no framework) served from `public/` (Vercel `outputDirectory`): `public/index.html` + `public/landing.html` + `public/app.html`
- JS modules under `public/js/`, loaded via `<script type="module">`; installer assets the browser fetches live in `public/scripts/`
- Dev/build tooling lives in `scripts/` (`server.js`, `update-models.js`) and is not deployed
- **Vercel**: serverless API (`api/login.js`, `api/logout.js`, `api/supabase-config.js`, `api/confirm-session.js`); `vercel.json` rewrites; `middleware.js` protects `/landing` + `/app` via the `orf_session` cookie
- **Auth**: the only login is the **website login** at `/` – social (Supabase OAuth) or admin (`LOGIN_USER`/`LOGIN_PASS` via `POST /api/login`); landing + app are open afterwards
- Credentials: env vars `LOGIN_USER` / `LOGIN_PASS` only, never hardcoded

## Key Modules

| File | Purpose |
|------|---------|
| `public/index.html` | Login page (root route) |
| `public/landing.html` | Marketing page + blog/changelog section |
| `public/app.html` | Main app: 4-step wizard for model/tool selection |
| `public/js/app.js` | UI logic: multi-select, bundle, ZIP download, BMC thanks popup, download tracking |
| `public/js/config.js` | **Single source of truth** for `BMC_URL` (Buy-Me-a-Coffee placeholder) |
| `public/js/mapping.js` | Auto-generated free-model DB (tags + descriptions) |
| `public/js/templates.js` | Config generation per tool, `TOOL_TEMPLATES` registry (15 tools) |
| `public/js/docs.js` | Install guides, OS paths, CLI commands |
| `public/js/auth.js` | `isAuthenticated()` / `login()` / `logout()` / `getUser()` |
| `tests/test-runner.js` | Pure Node test suite (no DOM) |
| `public/data/changelog.json` | Auto-generated model change history (blog content) |
| `public/scripts/auto-install.js` | Auto-installer with merge logic (overwrite/comment/merge) |
| `scripts/server.js` | Local dev server (`npm start`) |

## Strategy: BMC instead of a paywall

- **No prices, no paywall, no registration** – both bundles are free
- **Buy Me a Coffee** (placeholder URL in `public/js/config.js`): links in the landing support section, app header and download thanks popup (all `a[data-bmc]`)
- **No codes system** – no code login, no codes API, no paywall gate
- **Website login** at `/` (social + admin password) is the only login; `/landing` + `/app` are open afterwards
- **Tracking**: Umami placeholder in all 3 HTML files (commented out until a website ID is set); events `download` (props: models/tools/bundle/os) and `bmc_click` (prop: location) via `window.umami?.track`

## Model Mapping

- Free models are auto-generated daily from the OpenRouter API via `scripts/update-models.js`
- Each model has: `role`, `desc` (from the API description), `tags` (coding, reasoning, vision, …), `context`, `languages`, optional `modalities`/`modality_icon`
- Model IDs **must end with the `:free` suffix**
- Tags are shown as colored badges on the model card
- The search field filters models live by ID, tags, role or description

## Model History / Blog

- Historical models are stored as blog entries in `public/data/changelog.json`
- Rendered on the landing page under "Blog / Changelog"
- `scripts/update-models.js` appends new entries automatically on model changes

## Auto-Installer

The installer in `public/scripts/auto-install.js` asks about existing configs:

1. **Overwrite** – the old config is replaced
2. **Comment out + new** – the old config is kept as a comment, the new one is written below
3. **Merge** (JSON only) – both JSON structures are merged
4. **Skip** – do nothing

Batch/shell variants (`auto-install-win.bat`, `auto-install-mac.command`, `auto-install-linux.sh`) back up the old config with a `.backup` suffix.

**Scope + project folder:** configs are either `global` (opencode, continue, zed → home/APPDATA) or `project` (the other 12 → relative to the project folder). All 4 installers search common folders (`~`, Desktop, Documents, Projects, dev, code) for `.git` and let you confirm the target folder via a menu (`[1..n]` candidates, `[Enter]` current folder, `[f]` custom path). `auto-install-win.bat` is kept as CRLF via `.gitattributes` (`eol=crlf`) – do not rewrite it to LF.

## Testing

```bash
npm test
# Tests run in plain Node.js (no browser). DOM-dependent code is not tested.
# "App Strategy Tests" verify the absence of admin/price remnants and the BMC placeholder.
```

## Deployment

- GitHub push → Vercel auto-deploy (no manual trigger needed)
- `vercel.json`: `outputDirectory` is `public/`; rewrites `/api/*` → API functions, `/landing` → `/landing.html`, `/app` → `/app.html`, `/*` → `/index.html`
- `.env` vars set in the Vercel project dashboard (LOGIN_USER, LOGIN_PASS)
- `package.json` version: `"version": "12.8.0"`
- Daily GitHub Actions workflow auto-updates free models via `scripts/update-models.js`

## Common Pitfalls

- Do NOT remove the `:free` suffix from model IDs
- Do NOT hardcode credentials in any source file
- JSZip is loaded via CDN, not npm — available as the global `JSZip`
- Tailwind CSS via CDN — cosmetic warnings are harmless
- `models-grid` and `tools-grid` use a 2-column layout with max-height 400px + custom scrollbar
- **No codes/paywall system** – do not reintroduce one (no `api/codes.js`, no `lib/github-store.js`)
- **No separate app login** – access is controlled only by the website login (`middleware.js`); do not reactivate a check in `app.html`
- `GH_TOKEN` is no longer needed
- `OPENROUTER_API_KEY` is no longer in `.env` – only set as a GitHub secret when needed
- The auto-installer uses `readline` for interactive merge prompts (Node.js version only)
- The 4 `auto-install*` files live in `public/scripts/` (the browser fetches them at `./scripts/…`); `scripts/` holds dev/build tooling only and is not deployed
