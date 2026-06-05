---
name: bundle-test
description: Tests and validates ORF-Butler configuration bundles. Ensures ZIP content, file paths, and installations work correctly.
---

# Bundle Test Skill

Use for testing config bundle generation and ZIP download functionality.

## Test Commands

```bash
npm test           # 463 tests in Node.js (no DOM)
npm start          # Local dev server
```

## Bundle Structure

Standard (`5€`):
- `{tool}-config.json` / `{tool}-INSTALL.md` per tool

Premium (`20€`):
- All Standard files
- Plus: `auto-install.js`, `auto-install-win.bat`, `auto-install-mac.command`, `auto-install-linux.sh`
- Plus: `README-AUTOINSTALL.md`

## ZIP Content Validation

Each tool config must:
1. Have correct model ID with `:free` suffix
2. Include valid OpenRouter provider configuration
3. Have matching INSTALL.md with correct OS paths

## Auto-Installer Merge Logic

The premium installer supports:
- **Overwrite**: Replace existing config
- **Comment + New**: Keep old as comment, write new
- **Merge** (JSON only): Deep merge both structures

## Common Test Failures

- Missing tools in TOOL_TEMPLATES
- Incorrect OS_PATHS for Linux
- XSS in admin panel (escaped values)