# Garage Services Management PWA

A Progressive Web Application for vehicle garage / workshop management.

**Hosting target:** Cloudflare (Pages + Workers)  
**Stack:** Hono + React + Vite + Neon + Cloudflare R2 + Simple JWT Auth

---

## Documentation

| File | Description |
|------|-------------|
| [01-vision.md](docs/01-vision.md) | Product vision and long-term goals |
| [02-requirements.md](docs/02-requirements.md) | Full Product Requirements Document (PRD) |
| [03-user-stories.md](docs/03-user-stories.md) | Detailed user stories by epic |
| [04-architecture.md](docs/04-architecture.md) | System architecture, tech stack, monorepo structure |
| [05-data-model.md](docs/05-data-model.md) | Database entities, fields, and relationships |
| [06-design.md](docs/06-design.md) | Design system, colors, layout, UI patterns |
| [07-memory.md](docs/07-memory.md) | Project memory & progress tracker (AI must keep updated) |
| [08-deploy-pwa.md](docs/08-deploy-pwa.md) | PWA hardening & Cloudflare deploy guide |

---

## Confirmed Tech Stack

| Layer        | Technology                        |
|--------------|-----------------------------------|
| Frontend     | React 19 + Vite + TypeScript      |
| UI           | Tailwind CSS                      |
| Backend      | Hono on Cloudflare Workers        |
| Database     | Neon (PostgreSQL) + Prisma        |
| Auth         | Simple JWT (email + password)     |
| Images       | Cloudflare R2                     |
| PWA          | vite-plugin-pwa                   |
| Monorepo     | pnpm workspaces                   |

---

## Getting Started

### 1. Prerequisites
- Node.js 20+
- pnpm (`npm install -g pnpm`)
- [Neon](https://neon.tech) account
- Cloudflare account (for later deployment)

### 2. Create Neon database
1. Go to https://console.neon.tech and create a project
2. Copy the connection string (`DATABASE_URL`)

### 3. Install & configure
```bash
pnpm install
cp .env.example .env
# Edit .env → set DATABASE_URL and JWT_SECRET

# For local API (Wrangler)
cp apps/api/.dev.vars.example apps/api/.dev.vars
# Edit apps/api/.dev.vars with the same DATABASE_URL and JWT_SECRET
```

### 4. Database setup
```bash
pnpm db:generate   # Generate Prisma client
pnpm db:push       # Push schema to Neon
pnpm db:seed       # Optional: create default admin user
```

Default seed admin (if used):
- Email: `admin@garage.local`
- Password: `admin12345`

Or just register via the UI — the **first registered user becomes admin** automatically.

### 5. Run locally
```bash
# Terminal 1 – API
pnpm dev:api

# Terminal 2 – Frontend
pnpm dev:web
```

- Frontend: http://localhost:5173  
- API: http://localhost:8787  

### 6. Test auth
1. Open http://localhost:5173/register  
2. Create an account  
3. You should land on the protected home page  
4. Sign out and sign in again to verify login  

---

## Project Structure

```
garage-pwa/
├── apps/
│   ├── web/          # React + Vite frontend (PWA)
│   └── api/          # Hono backend (Cloudflare Worker)
├── packages/
│   ├── database/     # Prisma schema + Neon client + seed
│   └── shared/       # Shared types, Zod schemas, constants
├── docs/             # Planning documents
├── package.json
├── pnpm-workspace.yaml
└── .env.example
```

---

## Photo uploads (R2)

1. Cloudflare Dashboard → **R2** → Create bucket named **`garage-images`**
2. Deploy or run API with Wrangler so the `IMAGES_BUCKET` binding is active
3. On a Job Card detail page → **Entry** or **Exit** → **+ Add photos**

Without the R2 binding (local), uploads still save DB records but images will show as unavailable.

## Status

- [x] Planning docs + design + memory
- [x] Auth (JWT) + Prisma/Neon
- [x] Customers, Vehicles, Job Cards, Photos (R2)
- [x] Invoicing + Dashboard
- [x] PWA config + deploy guide (`docs/08-deploy-pwa.md`)
- [ ] Inventory → **future phase**
- [ ] Production deploy (follow deploy guide)

See `docs/07-memory.md` for the live progress tracker.
