---
name: blog-changelog
description: Manages the ORF-Butler blog and model changelog on the landing page.
---

# Blog / Changelog Skill

## Structure

- **Source**: `data/changelog.json` (API-generated)
- **Display**: `landing.html` lines 137-187
- **Format**: Chronological entries with added/removed models

## Entry Format

```json
{
  "date": "YYYY-MM",
  "added": [{ "id": "model/id", "tags": [...], "available": "..." }],
  "removed": [{ "id": "model/id", "reason": "...", "reason_de": "...", "available": "..." }]
}
```

## Features

- Newest entries appear first (reverse sorted)
- Model tags shown as colored badges
- Removed models shown with gray text (no strikethrough)
- Links to `/#blog` from navbar and footer

## Adding Historical Models

Historical models (2024-2026) are pre-populated in changelog.json. New entries are added automatically by `scripts/update-models.js` when models change.