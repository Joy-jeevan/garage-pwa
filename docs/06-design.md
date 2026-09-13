# Design System – Garage Services Management PWA

**Version:** 1.0  
**Last Updated:** August 2026  
**Theme:** Dark (shop-floor friendly)

---

## 1. Design Goals

- Mobile-first and tablet-friendly (mechanics often use phones/tablets)
- Fast, low-distraction UI for busy garage environments
- Clear visual hierarchy and status indicators
- Consistent spacing, typography, and component patterns
- Accessible enough for daily professional use
- Easy for AI tools to generate consistent UI

---

## 2. Color Palette

### Base (Slate)
| Token            | Hex       | Usage                          |
|------------------|-----------|--------------------------------|
| `bg-app`         | `#020617` | App background (slate-950)     |
| `bg-surface`     | `#0f172a` | Cards, panels (slate-900)      |
| `bg-elevated`    | `#1e293b` | Elevated surfaces (slate-800)  |
| `border`         | `#1e293b` | Borders (slate-800)            |
| `border-subtle`  | `#334155` | Subtle borders (slate-700)     |
| `text-primary`   | `#f8fafc` | Main text (slate-50)           |
| `text-secondary` | `#94a3b8` | Secondary text (slate-400)     |
| `text-muted`     | `#64748b` | Muted text (slate-500)         |

### Brand
| Token         | Hex       | Usage                    |
|---------------|-----------|--------------------------|
| `brand-500`   | `#0ea5e9` | Primary actions (sky-500)|
| `brand-600`   | `#0284c7` | Hover / active           |
| `brand-400`   | `#38bdf8` | Links, highlights        |

### Semantic / Status
| Status           | Color     | Tailwind example      |
|------------------|-----------|------------------------|
| Draft            | slate     | `bg-slate-700`         |
| Open             | sky       | `bg-sky-600`           |
| In Progress      | amber     | `bg-amber-500`         |
| Waiting Parts    | orange    | `bg-orange-500`        |
| Completed        | emerald   | `bg-emerald-500`       |
| Invoiced / Paid  | violet    | `bg-violet-500`        |
| Closed           | slate     | `bg-slate-600`         |
| Error / Danger   | red       | `bg-red-500`           |
| Success          | emerald   | `bg-emerald-500`       |
| Warning          | amber     | `bg-amber-500`         |

### Priority
| Priority | Color  |
|----------|--------|
| Low      | slate  |
| Normal   | sky    |
| High     | amber  |
| Urgent   | red    |

---

## 3. Typography

- **Font family:** Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif
- **Base size:** 14–16 px
- **Scale:**
  - Page title: `text-2xl` / `text-3xl` font-bold
  - Section title: `text-lg` / `text-xl` font-semibold
  - Body: `text-sm` / `text-base`
  - Labels: `text-sm` font-medium
  - Helper / muted: `text-xs` / `text-sm` text-slate-400

---

## 4. Spacing & Layout

- Base unit: 4px (Tailwind default)
- Page padding: `px-4 py-6` (mobile), `px-6 py-8` (desktop)
- Card padding: `p-4` or `p-6`
- Stack gap: `space-y-4` or `gap-4`
- Max content width: `max-w-7xl` centered

### Layout Patterns

**Desktop**
- Left sidebar (collapsible) + main content
- Top header with user info and quick actions

**Mobile / Tablet**
- Bottom navigation (Dashboard, Jobs, Customers, More)
- Full-width content
- Sticky action buttons where useful

---

## 5. Core Components

### Buttons
- Primary: `bg-sky-600 hover:bg-sky-500 text-white`
- Secondary: `border border-slate-700 hover:bg-slate-800`
- Danger: `bg-red-600 hover:bg-red-500`
- Sizes: `px-3 py-1.5 text-sm` (default), `px-4 py-2` (larger)
- Disabled: `opacity-50 cursor-not-allowed`

### Inputs
- Background: `bg-slate-950`
- Border: `border-slate-700`
- Focus: `focus:border-sky-500 focus:ring-1 focus:ring-sky-500`
- Height: comfortable touch targets (`py-2`)

### Cards
- `rounded-xl border border-slate-800 bg-slate-900/60`
- Optional hover: `hover:border-slate-700`

### Badges / Status Pills
- Small rounded pills with semantic colors
- Example: `rounded-full px-2.5 py-0.5 text-xs font-medium`

### Tables / Lists
- Prefer card-based lists on mobile
- Compact tables on desktop
- Clear empty states

### Photo Gallery
- Grid of thumbnails (2–3 columns on mobile)
- Clear “Entry” vs “Exit” sections
- Upload button with camera icon support

---

## 6. Navigation Structure

### Primary (Desktop Sidebar)
- Dashboard
- Job Cards
- Customers
- Vehicles
- Inventory
- Invoices
- Settings (Admin)

### Mobile Bottom Nav
- Home / Dashboard
- Jobs
- Customers
- More (Vehicles, Inventory, Invoices, Settings)

---

## 7. Key Screens (Design Notes)

| Screen              | Notes |
|---------------------|-------|
| Login / Register    | Centered card, minimal distraction |
| Dashboard           | Counters + today’s jobs + low stock |
| Customers list      | Search by mobile prominently |
| Customer detail     | Vehicles + job history |
| Job Card detail     | Status, items, notes, photo sections |
| Photo upload        | Clear Entry / Exit tabs or sections |
| Inventory           | List + low-stock highlighting |

---

## 8. Iconography

- Prefer simple, consistent icons (Lucide React recommended)
- Keep icons small and paired with labels on mobile where space allows

---

## 9. Motion & Feedback

- Subtle transitions (`transition` on buttons and cards)
- Loading spinners or skeletons for data fetching
- Toast notifications for success/error (to be added)
- Optimistic UI where safe (status changes)

---

## 10. Accessibility Basics

- Sufficient contrast (dark theme already helps)
- Focus rings on interactive elements
- Labels on all form fields
- Touch targets ≥ 44px where possible
- Do not rely on color alone for status

---

## 11. AI Generation Guidelines (Design)

When generating UI:

1. Always use the dark slate palette above
2. Prefer `rounded-xl` cards and `text-sm` body text
3. Use semantic status colors for job states
4. Mobile-first: design for phone, then enhance for desktop
5. Keep forms simple and stacked on mobile
6. Match existing patterns in `App.tsx` and page components
7. Reference this file (`docs/06-design.md`) before creating new screens

---

## 12. Future Design Additions

- Light theme toggle (optional)
- shadcn/ui component adoption
- Print-friendly invoice styles
- Photo comparison (before/after side-by-side)
