# Project Memory – Garage PWA

**Purpose:** Single source of truth for progress.  
**AI Instruction:** Update after every meaningful change. Read at session start.

**Last Updated:** September 2026 (Brand colors from Al Tabadul logo)

---

## 1. Status

| Area | Status | Notes |
|------|--------|-------|
| Docs 01–06, 08 | ✅ | + deploy/PWA guide |
| Auth + Neon | ✅ | |
| Customers | ✅ | |
| Vehicles | ✅ | |
| Job Cards + Photos | ✅ | |
| **Invoicing** | ✅ | From completed jobs, payments |
| **Dashboard** | ✅ | Live stats + recent jobs + unpaid invoices |
| **PWA / Deploy docs** | ✅ | `docs/08-deploy-pwa.md` |
| Inventory | ⏸️ Future phase | Explicitly deferred |
| Capacitor mobile | ⏸️ Future | |

---

## 2. Invoicing

- Create from **completed** job → auto `INV-2026-0001`
- Pulls labor/parts from job, tax field, totals
- Status: draft / sent / paid / cancelled
- Record payment (cash, card, upi, bank_transfer, other)
- Auto-mark paid when payments ≥ total
- Job status set to `invoiced` on generate
- Print button on detail page

**API:** `/invoices`, `/invoices/:id`, `/invoices/:id/status`, `/invoices/:id/payments`

---

## 3. Dashboard

- Counts: open, in progress, waiting parts, completed today, customers, vehicles
- Recent job cards
- Unpaid invoices
- Quick action links

**API:** `GET /dashboard`

---

## 4. Future phase

- Inventory (parts catalog, stock adjust, low stock, auto-deduct)
- Customer self-service portal
- SMS / push
- Capacitor native apps
- Multi-branch

---

## 5. Next optional work

- Real PWA icons
- Production CORS + deploy dry-run
- Polish print stylesheet for invoices
- Connect dashboard “New Job” to open create modal directly

---

## 6. AI Rules

1. Read this file first.
2. Update after changes.
3. Do not build Inventory unless user asks (future phase).

---

**End of memory.**
