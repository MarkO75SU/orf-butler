# ORF-Butler — OpenRouter Free Butler

**Generate ready-to-use configuration files for free OpenRouter models across the AI coding tools you already use.**

ORF-Butler is a static web app that turns a curated list of free OpenRouter models into drop-in configuration files for Continue, OpenCode, Zed, Aider, Cursor, Windsurf, Claude Code, GitHub Copilot, Cline, Codeium, RooCode, LiteLLM, Cody and Tabby — packaged as a single ZIP download.

![Tests](https://github.com/MarkO75SU/orfb/actions/workflows/daily-update.yml/badge.svg)

## Features

- **Curated free models** — refreshed automatically from the OpenRouter API with tags (coding, reasoning, vision, …), context size and real descriptions.
- **Live search** — filter models by ID, tag, role or description.
- **15 tool targets** — Continue, OpenCode, Zed, Aider, Cursor, Windsurf, Claude Code, GitHub Copilot, Cline, Codeium, RooCode, LiteLLM, Cody, Tabby and Antigravity.
- **Per-tool config export** — JSON / YAML / instruction files generated per the selected tools, bundled as a ZIP.
- **Interactive auto-installer** — optional installer (Node, Windows `.bat`, macOS `.command`, Linux `.sh`) with merge logic: overwrite, comment out, merge JSON, or skip.
- **Tool-specific `INSTALL.md`** — step-by-step install guide per tool and OS.
- **Blog / changelog** — the landing page renders model changes recorded in `public/data/changelog.json`.
- **No tracking, no account required** — everything is free and runs entirely in the browser.

## Quick Start

```bash
npm install
npm start        # http://localhost:3000
npm test         # pure Node ESM test suite
```

There is no build step and no bundler. The app is plain HTML + ES modules and deploys as static files (Vercel).

## Routes

| URL | File | Purpose |
|-----|------|---------|
| `/` | `public/index.html` | Login (social OAuth or admin password) |
| `/landing` | `public/landing.html` | Features, tools, bundles and the changelog blog |
| `/app` | `public/app.html` | 4-step wizard: models → tools → bundle → ZIP download |

Authentication is handled centrally: `middleware.js` guards `/landing` and `/app` using the `orf_session` cookie set by `api/login.js` (admin) or `api/confirm-session.js` (social login).

## Tool targets

Continue · OpenCode · Zed · Aider · Cursor · Windsurf · Claude Code · GitHub Copilot · Cline · Codeium · RooCode · LiteLLM · Cody · Tabby · Antigravity

## Project structure

```
public/                          Static site (Vercel output directory)
  index.html / landing.html / app.html   Entry points (static SPA)
  favicon.svg
  js/
    app.js       Wizard UI: multi-select, bundle, ZIP download, thanks popup
    mapping.js   Auto-generated free-model database (scripts/update-models.js)
    templates.js Per-tool config generation (TOOL_TEMPLATES registry)
    docs.js      Install guides, OS paths, CLI commands
    config.js    BMC_URL (single source of truth)
    auth.js      login() / logout() / isAuthenticated() / getUser()
  data/changelog.json            Model change history (blog content)
  scripts/
    auto-install.js              Interactive Node installer
    auto-install-win.bat         Windows installer
    auto-install-mac.command     macOS installer
    auto-install-linux.sh        Linux installer
scripts/                         Dev/build tooling (not deployed)
  server.js                      Local dev server (npm start)
  update-models.js               Daily model + changelog updater
api/                             Vercel serverless functions
lib/http.js                      Shared HTTP helpers
tests/test-runner.js             Pure Node test suite
middleware.js                    Vercel edge auth guard
vercel.json                      Rewrites + output directory
```

## Model updates

`scripts/update-models.js` fetches `https://openrouter.ai/api/v1/models`, keeps every model whose ID ends with `:free`, and regenerates `public/js/mapping.js` plus new entries in `public/data/changelog.json`. It runs daily via `.github/workflows/daily-update.yml`.

## Deployment

Push to `main` — Vercel auto-deploys. Set `LOGIN_USER` and `LOGIN_PASS` in the Vercel project dashboard for the admin login. Optional Supabase env vars (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`) enable social login.

## Contributing

1. Fork the repository and create a feature branch.
2. Keep changes focused and run `npm test` before opening a pull request.
3. Do not remove the `:free` suffix from model IDs and never hardcode credentials.

## Support

ORF-Butler is free and has no paywall. If it saves you time, you can buy me a coffee — completely optional:

[☕ Buy me a coffee](https://www.buymeacoffee.com/DEIN-NAME)

The support link is configured once in `public/js/config.js` (`BMC_URL`) and used by every `a[data-bmc]` element on the site.

## License

[MIT](LICENSE)
