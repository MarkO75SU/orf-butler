# AGENTS.md — ORF-Butler (OpenRouter Free Butler)

## Quick Start

```bash
npm start          # local dev @ http://localhost:3000
npm test           # 672 tests, pure Node ESM
```

No build step, no bundler. Vercel auto-deploys from GitHub `main` branch.

## Entry Points

| URL | File | Purpose |
|-----|------|---------|
| `/` (root) | `index.html` | **Reines Login** – NUR Anmeldeformular, kein Sales-Content |
| `/landing` | `landing.html` | Features/Tools/Bundles (komplett gratis) + Unterstützen-Sektion (BMC) + Blog |
| `/app` | `app.html` | 4-Schritt Wizard (Modelle → Tools → Bundle → ZIP-Download) |

**Flow:** `orfb.vercel.app` → Login → `/landing` → "Zur App" → `/app` → Logout → zurück zu `/`

## Architecture

- **Static SPA** (no framework): `index.html` + `landing.html` + `app.html` as entry points
- JS modules under `src/js/`, loaded via `<script type="module">`
- **Vercel**: serverless API at `api/login.js` for auth; `vercel.json` rewrites
- **Auth**: localStorage `orf_auth` token, validated server-side via `POST /api/login`
- Credentials: env vars `LOGIN_USER` / `LOGIN_PASS` only, never hardcoded

## Key Modules

| File | Purpose |
|------|---------|
| `index.html` | Pure login page (root route) |
| `landing.html` | Sales page + Blog/Changelog section |
| `app.html` | Main app: 4-step wizard for model/tool selection |
| `src/js/app.js` | UI logic: multi-select, bundle, ZIP download, BMC-Danke-Popup, Download-Tracking |
| `src/js/config.js` | **Einzigste Fundstelle** für `BMC_URL` (Buy-Me-a-Coffee-Platzhalter) |
| `src/js/mapping.js` | Auto-generated free-model DB (21 models + tags + descriptions) |
| `src/js/templates.js` | Config generation per tool, `TOOL_TEMPLATES` registry (12 tools) |
| `src/js/i18n.js` | DE/EN translations, `setLanguage()`, `getLang()` |
| `src/js/docs.js` | Install guides, OS paths, CLI commands |
| `src/js/auth.js` | `isAuthenticated()` / `login()` / `logout()` / `getUser()` |
| `src/tests/test-runner.js` | 672 pure Node tests (no DOM) |
| `data/changelog.json` | Auto-generated model change history (blog content) |
| `scripts/auto-install.js` | Auto-installer mit Merge-Logik (überschreiben/auskommentieren/mergen) |

## Strategie: BMC statt Paywall

- **Keine Preise, keine Paywall** – beide Bundles sind "GRATIS"; 5€/20€-Anzeigen wurden komplett entfernt
- **Buy Me a Coffee** (Platzhalter-URL in `src/js/config.js`): Links in Landing-Unterstützen-Sektion, App-Header und Download-Danke-Popup (alle `a[data-bmc]`)
- **Admin-UI komplett entfernt** (Badge, Button, Codes-Modal, i18n-Keys) – Codes-Verwaltung nur noch per `npm run codes` (CLI) oder curl gegen `/api/codes`
- **Tracking**: Umami-Platzhalter in allen 3 HTML-Dateien (auskommentiert bis Website-ID eingetragen); Events `download` (Props: models/tools/bundle/os/lang) und `bmc_click` (Prop: location) via `window.umami?.track`
- Login-Seite (`index.html`) bleibt unverändert; Supabase-Bypass für `generali` in `app.html` bleibt (nötig fürs Passwort-Login)

## Model Mapping

- **21 free models** auto-generated daily from OpenRouter API via `scripts/update-models.js`
- Each model has: `role`/`role_de`, `desc_en`/`desc_de` (aus API-Beschreibung), `tags` (coding, reasoning, vision, …), `context`, `languages`, optional `modalities`/`modality_icon`
- Model IDs **must end with `:free`** suffix
- Tags werden als farbige Badges in der Modellkarte angezeigt
- Suchfeld filtert Modelle live nach ID, Tags, Rolle, Beschreibung

## Model History / Blog

- 12 historische Modelle (GPT-3.5, Claude 3 Haiku, Gemini 1.5, etc.) als Blog-Einträge in `data/changelog.json`
- Wird auf der Landingpage unter "Blog / Änderungsprotokoll" angezeigt
- `scripts/update-models.js` schreibt automatisch neue Einträge bei Modell-Änderungen

## Auto-Installer (Premium)

Der Installer in `scripts/auto-install.js` fragt bei existierenden Configs:

1. **Überschreiben** – alte Config wird ersetzt
2. **Auskommentieren + neue** – alte bleibt als Kommentar erhalten, neue wird darunter geschrieben
3. **Mergen** (nur JSON) – beide JSON-Strukturen werden zusammengeführt
4. **Überspringen** – nichts tun

Batch/Shell-Varianten (`auto-install-win.bat`, `auto-install-mac.command`, `auto-install-linux.sh`) sichern die alte Config mit `.backup`-Suffix.

**Scope + Projektordner:** Configs sind pro Tool entweder `global` (opencode, continue, zed → Home/APPDATA) oder `project` (übrige 12 → relativ zum Projektordner). Alle 4 Installer suchen in typischen Ordnern (`~`, Desktop, Documents, Projects, dev, code) nach `.git` und lassen den Zielordner per Menü bestätigen (`[1..n]` Kandidaten, `[Enter]` aktueller Ordner, `[f]` eigener Pfad). `auto-install-win.bat` wird durch `.gitattributes` (`eol=crlf`) als CRLF getestet – nicht auf LF umschreiben.

## Testing

```bash
npm test                          # 672 tests
# Tests run in plain Node.js (no browser). DOM-dependent code is not tested.
# "App Strategy Tests" prüfen DE/EN-Key-Parität, Fehlen von Admin/Preis-Resten, BMC-Placeholder.
```

## Deployment

- GitHub push → Vercel auto-deploy (no manual trigger needed)
- `vercel.json` rewrites: `/api/*` → API functions, `/landing` → `landing.html`, `/app` → `app.html`, `/*` → `index.html`
- `.env` vars set in Vercel project dashboard (LOGIN_USER, LOGIN_PASS)
- `package.json` version: `"version": "12.8.0"`
- Daily GitHub Actions workflow auto-updates free models via `scripts/update-models.js`
- Bei Modell-Änderungen: Email-Benachrichtigung an learncode@web.de

## Common Pitfalls

- Do NOT remove the `:free` suffix from model IDs
- Do NOT hardcode credentials in any source file
- JSZip is loaded via CDN, not npm — available as global `JSZip`
- Tailwind CSS via CDN — cosmetic warnings are harmless
- `models-grid` and `tools-grid` use 2-column layout with max-height 400px + custom scrollbar
- Kein Admin-UI-Panel mehr – nicht wieder einbauen (Codes nur via CLI/curl)
- **Codes API** (`api/codes.js`): Actions: `generate`, `redeem`, `check`, `list`, `revoke`, `reset`. Admin auth via Basic header. Storage via `lib/github-store.js`
- `GH_TOKEN` env var required on Vercel for code persistence via GitHub Content API
- `OPENROUTER_API_KEY` nicht mehr in `.env` – wird nur bei Bedarf als GitHub Secret gesetzt
- Auto-installer verwendet `readline` für interaktive Merge-Abfragen (nur Node.js-Version)
