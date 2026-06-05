---
name: deploy
description: Handles ORF-Butler deployment to Vercel. Runs on push to main branch.
---

# Deploy Skill

## Deployment Flow

1. Push to GitHub `main` branch
2. Vercel detects change → auto-deploy
3. Middleware checks are applied server-side
4. `/` redirects authenticated users to `/landing`
5. `/app` requires session cookie or redirects to `/`

## Vercel Configuration

- **vercel.json**: Rewrites `/app`, `/landing` to HTML files; catch-all to index.html
- **middleware.js**: Protects `/app` route with session check
- **.vercelignore**: Excludes `scripts/`, `docs/`, `.github/`, test files

## Post-Deploy Verification

```bash
curl -I https://orfb.vercel.app/app
# Should return 302 without cookie, 200 with cookie
```

## Rollback

Use GitHub UI to revert commit, Vercel auto-redeploys. Or use Vercel dashboard rollback.