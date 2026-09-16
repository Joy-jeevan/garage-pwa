# Deploy & PWA Guide – Garage Manager

## PWA (already configured)

The web app uses `vite-plugin-pwa` with:

- Web App Manifest (name, icons, standalone display)
- Service worker with basic API cache strategy
- Installable on Android / desktop Chrome

### Before production

1. Add real icons under `apps/web/public/icons/`:
   - `icon-192.png`
   - `icon-512.png`
2. Test install prompt on a phone (HTTPS required)
3. Optionally improve offline: cache job/customer lists more aggressively

### Local PWA test

```bash
pnpm --filter @garage/web build
pnpm --filter @garage/web preview
```

Open the preview URL over localhost; Chrome allows install on localhost.

---

## Deploy API (Cloudflare Workers)

```bash
cd apps/api

# Login once
npx wrangler login

# Create R2 bucket if not done
# Dashboard → R2 → Create "garage-images"

# Set secrets
npx wrangler secret put DATABASE_URL
npx wrangler secret put JWT_SECRET

# Deploy
pnpm deploy
# or: npx wrangler deploy
```

Note the Worker URL, e.g. `https://garage-api.<account>.workers.dev`

Update CORS in `apps/api/src/index.ts` to include your production frontend origin.

---

## Deploy Frontend (Cloudflare Pages)

### Option A – Dashboard upload / Git integration

1. Build:
   ```bash
   pnpm --filter @garage/web build
   ```
2. Pages project → upload `apps/web/dist` **or** connect Git repo
3. Build settings if using Git:
   - Root: monorepo root or `apps/web`
   - Build command: `pnpm install && pnpm --filter @garage/web build`
   - Output: `apps/web/dist`
4. Environment variable:
   - `VITE_API_URL` = your Worker URL (no trailing slash)

For Git-connected Pages builds, set `VITE_API_URL` under the Pages project
settings for the Production environment. The frontend also defaults to the
current production Worker URL when this variable is missing.

### Option B – Wrangler Pages

```bash
cd apps/web
pnpm build
npx wrangler pages deploy dist --project-name=garage-manager
```

---

## Production checklist

- [ ] Neon production branch / connection string
- [ ] Strong `JWT_SECRET`
- [ ] R2 bucket `garage-images` + Worker binding
- [ ] CORS allows Pages domain
- [ ] `VITE_API_URL` points to Worker
- [ ] PWA icons present
- [ ] HTTPS (automatic on Cloudflare)
- [ ] First admin user registered

---

## Future phase (not in MVP)

- Inventory module
- Customer portal
- Push notifications
- Capacitor native apps
