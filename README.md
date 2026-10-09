# ORF-Butler — OpenRouter Free Butler

**Generate ready-to-use configuration files for free OpenRouter models across the AI coding tools you already use.**

ORF-Butler is a static web app that turns a curated list of free OpenRouter models into drop-in configuration files for Continue, OpenCode, Zed, Aider, Cursor, Windsurf, Claude Code, GitHub Copilot, Cline, Codeium, RooCode, LiteLLM, Cody and Tabby — packaged as a single ZIP download.

![Tests](https://github.com/MarkO75SU/orf-butler/actions/workflows/daily-update.yml/badge.svg)

## Features

- **Curated free models** — refreshed automatically from the OpenRouter API with tags (coding, reasoning, vision, …), context size and real descriptions.
- **Live search** — filter models by ID, tag, role or description.
- **15 tool targets** — Continue, OpenCode, Zed, Aider, Cursor, Windsurf, Claude Code, GitHub Copilot, Cline, Codeium, RooCode, LiteLLM, Cody, Tabby and Antigravity.
- **Per-tool config export** — JSON / YAML / instruction files generated per the selected tools, bundled as a ZIP.
- **Interactive auto-installer** — optional installer (Node, Windows `.bat`, macOS `.command`, Linux `.sh`) with merge logic: overwrite, comment out, merge JSON, or skip.
- **Tool-specific `INSTALL.md`** — step-by-step install guide per tool and OS.
- **Blog / changelog** — the landing page renders model changes recorded in `public/data/changelog.json`.
- **No account required** — everything is free and runs entirely in the browser (cookieless Umami analytics only).

## Quick Start

```bash
npm install
npm start              # http://localhost:3000
npm test               # pure Node ESM test suite
```

There is no build step and no bundler. The app is plain HTML + ES modules and deploys as pure static files on Vercel. No login, no account and no server-side functions.

## Routes

| URL | File | Purpose |
|-----|------|---------|
| `/` and `/landing` | `public/landing.html` | Landing page: features, tools, bundles, changelog blog |
| `/app` | `public/app.html` | 4-step wizard: models → tools → bundle → ZIP download |
| `/imprint` | `public/imprint.html` | Legal imprint (Impressum, German law) |
| `/privacy` | `public/privacy.html` | Privacy policy (Datenschutzerklärung, GDPR) |
| `/license` | `public/license.html` | MIT license text |
| `/sitemap.xml`, `/robots.txt` | `public/` | SEO files |

Every page is public — there is no login or access gate.

## Tool targets

Continue · OpenCode · Zed · Aider · Cursor · Windsurf · Claude Code · GitHub Copilot · Cline · Codeium · RooCode · LiteLLM · Cody · Tabby · Antigravity

## Project structure

```
public/                          Static site (Vercel output directory)
  landing.html / app.html        Entry points (static SPA)
  imprint.html / privacy.html / license.html   Legal pages (Impressum, Datenschutz, MIT license)
  sitemap.xml / robots.txt       SEO files
  favicon.svg
  js/
    app.js       Wizard UI: multi-select, bundle, ZIP download, thanks popup
    mapping.js   Auto-generated free-model database (scripts/update-models.js)
    templates.js Per-tool config generation (TOOL_TEMPLATES registry)
    docs.js      Install guides, OS paths, CLI commands
    config.js    BMC_URL (single source of truth)
  data/changelog.json            Model change history (blog content)
  scripts/
    auto-install.js              Interactive Node installer
    auto-install-win.bat         Windows installer
    auto-install-mac.command     macOS installer
    auto-install-linux.sh        Linux installer
scripts/                         Dev/build tooling (not deployed)
  server.js                      Local dev server (npm start)
  update-models.js               Daily model + changelog updater
tests/test-runner.js             Pure Node test suite
vercel.json                      Rewrites + output directory
```

## Model updates

`scripts/update-models.js` fetches `https://openrouter.ai/api/v1/models`, keeps every model whose ID ends with `:free`, and regenerates `public/js/mapping.js` plus new entries in `public/data/changelog.json`. It runs daily via `.github/workflows/daily-update.yml`.

## Deployment

Push to `main` — Vercel auto-deploys the static site from `public/`. No environment variables and no serverless functions are required.

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
