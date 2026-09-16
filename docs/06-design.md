# Design System – Al Tabadul Auto Maintenance Workshop PWA

**Version:** 2.0  
**Last Updated:** September 2026  
**Brand source:** Official workshop logo (Al Tabadul Auto. Maint W. Shop)  
**Theme:** Dark charcoal + orange accent (shop-floor friendly)

---

## 1. Brand Identity

| Item | Value |
|------|--------|
| **Arabic name** | ورشة التبادل لصيانة السيارات |
| **English name** | AL TABADUL AUTO. MAINT W. SHOP |
| **Short name (UI)** | Al Tabadul |
| **Logo file** | `/brand/logo.jpeg` |
| **Logo layout** | Orange left panel (gear + wrench) · charcoal banner · white + orange typography |

---

## 2. Design Goals

- Reflect official Al Tabadul branding (orange + charcoal)
- Mobile-first and tablet-friendly for the shop floor
- Fast, low-distraction UI
- Clear status indicators
- Consistent components for AI-assisted development

---

## 3. Color Palette (from logo)

### Extracted logo colors
| Role | RGB (approx) | Hex |
|------|----------------|-----|
| Brand orange (left panel / accents) | 243, 131, 33 | **`#F38321`** |
| Brand orange deep | 224, 112, 16 | **`#E07010`** |
| Brand orange light | 255, 154, 64 | **`#FF9A40`** |
| Charcoal banner | 54, 55, 59 | **`#36373B`** |
| Icon grey (on orange) | 72, 87, 90 | **`#48575A`** |
| White | 255, 255, 255 | **`#FFFFFF`** |

### App tokens
| Token | Hex | Usage |
|-------|-----|--------|
| `bg-app` | `#121314` | App background |
| `bg-surface` | `#1C1D20` | Header / elevated chrome |
| `bg-card` | `#2A2B2F` | Cards, panels |
| `bg-elevated` | `#36373B` | Inputs, elevated surfaces (logo charcoal) |
| `border` | `#3F4045` | Default borders |
| `border-subtle` | `#4A4B50` | Subtle dividers |
| `text-primary` | `#F8FAFC` | Main text |
| `text-secondary` | `#A1A1AA` | Secondary text |
| `text-muted` | `#71717A` | Muted / helper |

### Brand (primary actions & highlights)
| Token | Hex | Tailwind | Usage |
|-------|-----|----------|--------|
| `brand-400` | `#FF9A40` | `brand-400` | Links, highlights, mono accents |
| `brand-500` | `#F38321` | `brand-500` | Hover state, strong accent |
| `brand-600` | `#E07010` | `brand-600` | Primary buttons |
| `brand-700` | `#C45F0C` | `brand-700` | Active / pressed |

### Semantic / Status
| Status | Color approach |
|--------|----------------|
| Draft | slate / charcoal |
| Open | **brand orange** (`bg-brand-600`) |
| In Progress | amber |
| Waiting Parts | orange-600 |
| Completed | emerald |
| Invoiced / Paid | violet |
| Closed | charcoal |
| Error | red |
| Success | emerald |

### Priority
| Priority | Color |
|----------|--------|
| Low | slate |
| Normal | brand orange |
| High | amber |
| Urgent | red |

---

## 4. Typography

- **Font family:** Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif
- Arabic UI may later use a Noto Naskh / Tajawal stack if localized
- **Scale:** page title `text-2xl`/`text-3xl` bold · section `text-lg` semibold · body `text-sm` · labels `text-sm` medium · muted `text-xs`/`text-sm`

---

## 5. Spacing & Layout

- Base unit: 4px (Tailwind)
- Page padding: `px-4 py-6` (mobile), wider on desktop
- Cards: `rounded-xl border border-slate-700/80 bg-[#2A2B2F]/80`
- Max width: `max-w-7xl`

### Layout
- **Desktop:** top header with logo + nav
- **Mobile:** logo + bottom/top compact nav
- Primary CTA buttons always **brand orange**

---

## 6. Core Components

### Buttons
- **Primary:** `bg-brand-600 hover:bg-brand-500 text-white`
- **Secondary:** `border border-slate-600 hover:bg-slate-800`
- **Danger:** `border border-red-900/50 text-red-400`

### Inputs
- `bg-slate-950 border-slate-700 focus:border-brand-500 focus:ring-brand-500`

### Cards
- Dark charcoal surfaces, subtle border, `rounded-xl`

### Status pills
- Use semantic colors; **Open** uses brand orange

### Logo usage
- Header: logo image (height ~32–40px) + short name “Al Tabadul”
- Login/Register: full logo banner where space allows
- Favicon / PWA icons: derive from gear+wrench mark (future)

---

## 7. Navigation Structure

- Dashboard · Jobs · Customers · Vehicles · Invoices
- Brand mark always visible in header

---

## 8. AI Generation Guidelines

When generating UI:

1. Prefer **brand orange** (`brand-500` / `brand-600`) over sky/blue for primary actions and links
2. Backgrounds stay **charcoal / near-black**, not pure black only
3. Mobile numbers and plates use `font-mono text-brand-400`
4. Reference this file and the logo at `/brand/logo.jpeg`
5. Do not reintroduce sky-blue as the primary brand color

---

## 9. Future Design Additions

- Light theme (optional)
- Arabic RTL layout
- Official PWA icons cropped from logo mark
- Print invoice letterhead with logo
