---
name: model-update
description: Updates the OpenRouter free model database. Runs hourly via GitHub Actions or manually via npm run update-models.
---

# Model Update Skill

Use for updating `src/js/mapping.js` with current free models from OpenRouter API.

## Manual Update

```bash
npm run update-models
```

## GitHub Actions Workflow

- **Schedule**: `0 * * * *` (hourly)
- **Script**: `scripts/update-models.js`
- **Output**: Updates `src/js/mapping.js` and `data/changelog.json`

## Model Data Structure

Each model gets:
- `id`: Full model ID (must end with `:free`)
- `role` / `role_de`: Categorized role (coding, reasoning, assistant, etc.)
- `desc_en` / `desc_de`: Description from OpenRouter API
- `tags`: Array of tags (coding, vision, multimodal, etc.)
- `context`: Context window size
- `languages`: Array of supported programming languages
- `new`: Boolean for NEU badge (true if added in last update)

## After Update

1. Tests run automatically (`npm test`)
2. If tests pass, changes are committed and pushed
3. Vercel auto-deploys on push to main