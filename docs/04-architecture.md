# Architecture Document – Garage Services Management PWA

**Version:** 1.1  
**Based on:** Vision, Requirements v1.1, User Stories, Data Model  
**Last Updated:** August 2026  
**Hosting Target:** Cloudflare (Pages + Workers)

---

## 1. Architecture Goals

- Simple enough for a beginner to understand and extend with AI assistance
- Strong PWA support (installable + offline-capable)
- Optimized for **Cloudflare** hosting and free-tier usage
- Clean separation of concerns so the app can later become a native mobile app
- Secure by default (Simple JWT Auth + RBAC)
- Good handling of image uploads (entry/exit photos) via Cloudflare R2
- Scalable data model without over-engineering the MVP

---

## 2. Final Tech Stack (Confirmed)

| Layer                    | Choice                              | Reason |
|--------------------------|-------------------------------------|------|
| Hosting                  | **Cloudflare Pages + Workers**      | Free tier, global edge, excellent performance |
| Frontend                 | **React 19 + Vite + TypeScript**    | Fast, modern, excellent DX |
| UI                       | **Tailwind CSS + shadcn/ui**        | Beautiful, accessible, AI-friendly |
| Backend / API            | **Hono**                            | Extremely fast, native on Cloudflare Workers |
| Database                 | **Neon (PostgreSQL)**               | Serverless Postgres, great free tier, full relational power |
| ORM                      | **Prisma**                          | Type-safe, excellent DX, works with Neon |
| Authentication           | **Simple JWT (email + password)**         | Lightweight, no external auth service, works on Workers |
| Image Storage            | **Cloudflare R2**                   | S3-compatible, **zero egress fees**, perfect with Workers |
| State / Server State     | **TanStack Query** + Zustand (light)| Caching, optimistic updates |
| Forms & Validation       | **React Hook Form + Zod**           | Industry standard |
| PWA                      | **vite-plugin-pwa**                 | Excellent offline & installable support |
| Monorepo Tooling         | **pnpm workspaces**                 | Simple and effective |

### Why this combination?
- Fully aligned with Cloudflare
- Stays mostly on free tiers (Cloudflare, Neon, Simple JWT Auth, R2)
- Avoids Next.js adapter complexity on Cloudflare
- Clean path to Capacitor mobile app later
- Beginner + AI-friendly

---

## 3. High-Level System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Client (Browser / PWA)                  │
│  React + Vite + TypeScript                                  │
│  - shadcn/ui + Tailwind                                     │
│  - TanStack Query                                           │
│  - Simple JWT Auth (frontend)                                         │
│  - Service Worker (vite-plugin-pwa)                         │
│  - Camera / Gallery for photos                              │
└─────────────────────┬───────────────────────────────────────┘
                      │ HTTPS
                      ▼
┌─────────────────────────────────────────────────────────────┐
│              Cloudflare Pages + Workers                     │
│  - Static frontend assets (Pages)                           │
│  - Hono API running on Workers                              │
│  - Simple JWT Auth middleware / JWT verification                      │
│  - R2 signed URL generation & upload handling               │
└─────────────┬──────────────────────────────┬────────────────┘
              │                              │
              ▼                              ▼
┌──────────────────────────┐    ┌────────────────────────────┐
│     Neon (PostgreSQL)    │    │     Cloudflare R2          │
│  - Users (synced),       │    │  - Job card entry photos   │
│    Customers, Vehicles,  │    │  - Job card exit photos    │
│    JobCards, Parts, etc. │    │                            │
└──────────────────────────┘    └────────────────────────────┘
```

---

## 4. Monorepo Structure

```
garage-pwa/
├── docs/                          # Planning documents
├── apps/
│   ├── web/                       # React + Vite frontend (PWA)
│   │   ├── public/
│   │   ├── src/
│   │   │   ├── components/
│   │   │   ├── features/
│   │   │   ├── hooks/
│   │   │   ├── lib/
│   │   │   ├── pages/ or routes/
│   │   │   ├── stores/
│   │   │   └── types/
│   │   ├── index.html
│   │   ├── vite.config.ts
│   │   └── package.json
│   └── api/                       # Hono backend (Cloudflare Worker)
│       ├── src/
│       │   ├── routes/
│       │   ├── middleware/
│       │   ├── lib/
│       │   └── index.ts
│       ├── wrangler.toml
│       └── package.json
├── packages/
│   ├── database/                  # Prisma schema + client
│   │   ├── prisma/
│   │   │   └── schema.prisma
│   │   └── package.json
│   └── shared/                    # Shared types, zod schemas, constants
│       └── package.json
├── package.json                   # Root workspace
├── pnpm-workspace.yaml
└── README.md
```

**Tooling recommendation:** `pnpm` workspaces (lightweight and fast).

---

## 5. Frontend Architecture (`apps/web`)

- **React + Vite** for speed and simplicity
- **React Router** (or TanStack Router) for routing
- **Simple JWT Auth** React components + hooks for auth
- **TanStack Query** for all server data
- **Zustand** only for pure UI state (sidebar, filters, offline banner)
- **shadcn/ui** + Tailwind for consistent design system
- Mobile-first responsive layout (bottom navigation on small screens)

### Key Frontend Modules
- Auth (Simple JWT Auth)
- Customers (with fast mobile number search)
- Vehicles
- Job Cards (core + photo gallery + uploader)
- Inventory
- Invoicing
- Dashboard
- PWA utilities (online/offline detection, install prompt)

---

## 6. Backend Architecture (`apps/api`)

- **Hono** running on Cloudflare Workers
- JWT verification using Simple JWT Auth
- Role-based middleware (`admin`, `manager`, `mechanic`)
- Prisma Client connected to Neon
- Routes grouped by domain (`/customers`, `/vehicles`, `/job-cards`, etc.)
- Special routes for:
  - Generating R2 pre-signed upload URLs
  - Confirming image uploads and creating `JobCardImage` records

### Example Route Structure
```
/api/customers
/api/vehicles
/api/job-cards
/api/job-cards/:id/images
/api/parts
/api/invoices
/api/dashboard
```

---

## 7. Authentication & Authorization (Simple JWT)

- Email + password registration and login
- Passwords hashed with bcrypt
- JWT (HS256) issued on successful login/register (7-day expiry)
- Frontend stores token in localStorage and sends `Authorization: Bearer <token>`
- Hono middleware verifies the JWT on protected routes
- Roles: `admin`, `manager`, `mechanic`

**Roles:**
- `admin` → full access
- `manager` → customers, vehicles, jobs, inventory, invoices
- `mechanic` → view/update assigned jobs + upload photos


## 8. Image Upload Architecture (Cloudflare R2)

### Recommended Flow (Secure & Efficient)
1. Frontend requests a **pre-signed upload URL** from the Hono API
2. API generates a signed URL for a specific path in R2:
   ```
   job-cards/{job_card_id}/entry/{uuid}.jpg
   job-cards/{job_card_id}/exit/{uuid}.jpg
   ```
3. Frontend uploads the image **directly to R2** (no Worker bandwidth used for the file)
4. Frontend notifies the API that upload succeeded
5. API creates a `JobCardImage` record in Neon with the R2 object key
6. When displaying, API can return public URLs or short-lived signed download URLs

### Rules
- Validate file type (jpeg, png, webp) and size on both client and server
- Multiple images allowed per category (`entry` / `exit`)
- Soft-delete support for image records
- Never store binary image data in the database

---

## 9. Database (Neon + Prisma)

- Neon serverless PostgreSQL (free tier is generous for MVP)
- Prisma as the ORM
- Schema lives in `packages/database`
- Connection via Neon’s serverless driver or standard connection string (Prisma supports both)
- Soft deletes (`deleted_at`) on major entities
- Unique constraint on `Customer.mobile`

---

## 10. PWA Strategy

- `vite-plugin-pwa` in the web app
- Web App Manifest + icons
- Service Worker with:
  - Cache-first for static assets
  - Network-first (with cache fallback) for API data
- Offline indicator in the UI
- Install prompt
- MVP offline goal: read existing job cards, customers, and vehicles offline
- Photo uploads require network in MVP (can add background sync later)

---

## 11. Security Considerations

- All API routes protected by Simple JWT Auth JWT verification
- Role-based authorization in Hono middleware
- Unique constraint on customer mobile number
- Zod validation on every input
- Pre-signed URLs for R2 (short expiry)
- Environment secrets stored in Cloudflare (wrangler secrets) and Neon
- HTTPS only

---

## 12. Free Tier Strategy

| Service       | Free Tier Notes                                      | Monitoring Tip |
|---------------|------------------------------------------------------|----------------|
| Cloudflare    | Very generous (Workers, Pages, R2)                   | Watch R2 storage & Worker requests |
| Neon          | Good free compute + storage                          | Watch compute hours |
| Simple JWT Auth         | Generous free MAUs                                   | Watch monthly active users |
| R2            | 10 GB storage + no egress fees                       | Watch storage growth (photos) |

This combination can comfortably support a small-to-medium garage on free tiers for a long time.

---

## 13. Future Mobile Path

1. **Current** → PWA (installable on phones)
2. **Phase 2** → Wrap with **Capacitor** (reuse the React web app)
3. **Phase 3** (optional) → React Native / Expo if native performance is required

Because the API is clean (Hono) and the frontend is React, both paths remain open.

---

## 14. AI-Assisted Development Guidelines

When using AI tools:

1. Always reference the relevant docs (especially this architecture + data model)
2. Generate one vertical feature at a time (Customers → Vehicles → Job Cards, etc.)
3. Keep shared types in `packages/shared`
4. Keep Prisma schema as the single source of truth for the database
5. Prefer small, focused components and route handlers
6. After generation, ask the AI to review against the requirements and data model

---

## 15. Implementation Order (Recommended)

1. Initialize monorepo (pnpm workspaces)
2. Set up `packages/database` with Prisma + Neon
3. Set up `apps/api` (Hono + Simple JWT Auth JWT + basic health route)
4. Set up `apps/web` (Vite + React + Simple JWT Auth + Tailwind + shadcn)
5. Implement Auth + basic protected layout
6. Build features in order:
   - Customers (unique mobile search)
   - Vehicles
   - Job Cards + Photo upload (R2)
   - Inventory
   - Invoicing
   - Dashboard
7. Add PWA hardening
8. Deploy to Cloudflare Pages + Workers

---

## 16. Open Items / Next Actions

- Create Cloudflare account + R2 bucket
- Create Neon project
- Create Simple JWT Auth application
- Initialize the monorepo and base packages
- Write environment variable documentation

---

**This architecture is now fully aligned with Cloudflare + Neon + R2 + Simple JWT Auth + Hono + React.**
