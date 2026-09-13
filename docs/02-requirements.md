# Product Requirements Document (PRD)  
## Garage Services Management PWA – MVP

**Version:** 1.1  
**Status:** Draft  
**Last Updated:** August 2026

---

## 1. Introduction

This document defines the functional and non-functional requirements for the Minimum Viable Product (MVP) of the Garage Services Management Progressive Web Application.

### 1.1 Goals of the MVP
- Digitize the core job-card workflow
- Provide basic customer & vehicle records
- Support simple inventory tracking
- Give managers and owners visibility into operations
- Deliver a solid PWA foundation (installable + offline capable)
- Keep the codebase clean for future mobile expansion
- Capture visual condition of vehicles (before & after service)

### 1.2 Out of Scope for MVP
- Customer self-service portal / online booking
- Online payments / payment gateway
- Multi-branch / multi-location
- Advanced accounting or tax engine
- SMS / email automation (beyond basic)
- Supplier ordering integration
- Advanced analytics / BI dashboards
- Image editing / annotation tools (basic upload & view only)

---

## 2. User Roles & Permissions

| Role          | Permissions |
|---------------|-----------|
| Admin / Owner | Full access: users, settings, all data, reports |
| Manager       | Manage customers, vehicles, job cards, inventory, invoices. Cannot manage users or system settings |
| Mechanic      | View assigned (and optionally all) job cards. Update status, add labor/parts, add notes, upload photos. Limited create rights |

Authentication is required for all users. Role-based access control (RBAC) must be enforced on both frontend and backend.

---

## 3. Functional Requirements

### 3.1 Authentication & User Management
- Secure login / logout
- Password reset
- Admin can invite or create users and assign roles
- Basic profile (name, email, phone, role)

### 3.2 Customers
- Create, read, update, soft-delete customers
- **Mobile / phone number must be unique** across all customers
- Fields: name, **mobile (unique)**, email, address, notes
- **Search by mobile number** must quickly return the customer and **all associated vehicles**
- Search and filter also supported by name
- View related vehicles and full job history

### 3.3 Vehicles
- Create, read, update, soft-delete vehicles
- Link to a customer
- Key fields: make, model, year, registration/plate number, VIN (optional), color, mileage, notes
- Search by plate number or customer
- View complete service history

### 3.4 Job Cards / Work Orders (Core Feature)
- Create a new job card linked to a customer + vehicle
- Capture: date in, estimated completion, assigned mechanic(s), priority, description of work requested
- Status workflow: Draft → Open → In Progress → Waiting Parts → Completed → Invoiced / Closed
- Add line items:
  - Labor (description, hours, rate)
  - Parts (link to inventory or free-text)
  - Other charges
- Add notes and internal comments
- Update mileage at time of service
- Mark job as completed and move to invoicing
- List views: All jobs, My jobs (for mechanic), Today’s jobs, By status
- Ability to filter and search job cards

#### 3.4.1 Vehicle Condition Photos
- Support **multiple images** per job card in two categories:
  - **Entry / Pre-service photos** – vehicle condition and any existing damage on arrival
  - **Exit / Post-service photos** – completed work / final condition
- Users (especially mechanics) must be able to:
  - Upload multiple photos from camera or gallery
  - View photos in a simple gallery
  - Delete individual photos (with confirmation)
- Photos are permanently associated with the specific job card
- Basic caption or timestamp support is desirable but not mandatory for MVP

### 3.5 Inventory / Parts
- Simple parts catalog: name, SKU/code, quantity on hand, unit cost, selling price, minimum stock level
- Adjust stock (manual + / −)
- When a part is used on a job card, optionally deduct from stock
- Low-stock indicator
- Basic list + search

### 3.6 Invoicing (Basic)
- Generate an invoice from a completed job card
- Show customer, vehicle, labor, parts, totals
- Simple tax field (percentage or fixed – configurable later)
- Mark as Draft / Sent / Paid
- Basic PDF export or printable view
- Record payment (cash / card / other) – no gateway yet

### 3.7 Dashboard
- Today’s open jobs count and list
- Jobs by status (simple board or counters)
- Low stock alerts
- Recent activity
- Quick actions (New Job, New Customer, etc.)

### 3.8 General UI / UX Requirements
- Responsive design (desktop + tablet + phone)
- Mobile-first navigation (bottom nav or collapsible sidebar)
- Clear loading, empty, and error states
- Confirmation for destructive actions
- Optimistic UI where appropriate (especially offline)
- Fast search by customer mobile number that surfaces customer + vehicles

---

## 4. Non-Functional Requirements

### 4.1 PWA Requirements
- Web App Manifest with name, icons, theme color, display: standalone
- Service Worker with:
  - Cache-first for static assets
  - Network-first (with fallback) for API data
  - Background Sync or queue for offline job updates (including photo uploads when possible)
- Installable on Android and desktop (iOS limited support is acceptable)
- Offline indicator in the UI
- App works for core read operations when offline

### 4.2 Performance
- First contentful paint under 2s on average mobile connection (target)
- Smooth interactions on mid-range phones/tablets
- Image uploads should show progress and handle failures gracefully
- Search by mobile number must feel instantaneous

### 4.3 Security
- All API endpoints protected by authentication
- Role-based authorization
- HTTPS only
- Input validation on both client and server
- Unique constraint enforced on customer mobile number at database level
- Secure storage and access control for uploaded images

### 4.4 Reliability & Data
- Soft deletes preferred over hard deletes for customers, vehicles, and job cards
- Audit-friendly (created_at, updated_at, created_by where useful)
- Data model designed for future multi-tenancy if needed
- Images stored in reliable object storage (not in the database)

### 4.5 Accessibility & Internationalization
- Basic accessibility (semantic HTML, sufficient contrast, keyboard navigation)
- English first; structure code so additional languages can be added later
- Date, number, and currency formatting ready for localization

### 4.6 Future Mobile Readiness
- Clean separation of UI and business logic
- API-first mindset
- Avoid web-only APIs that would be hard to replicate in native later
- Prefer Capacitor-friendly patterns where possible
- Image capture should work well with device camera on mobile

---

## 5. Data Entities (High-Level)

- User
- Customer (mobile number unique)
- Vehicle
- JobCard
- JobCardItem (labor / part / other)
- JobCardImage (entry & exit photos linked to a job card)
- Part (Inventory)
- Invoice
- Payment (simple)

Detailed fields and relationships are defined in `05-data-model.md`.

---

## 6. Success Criteria for MVP Launch

- A mechanic can create and fully update a job card on a tablet, including uploading multiple before/after photos
- Searching by a customer’s mobile number instantly shows the customer and all their vehicles
- A manager can see all open jobs and their status at a glance
- Stock levels update when parts are used
- Basic invoice can be generated from a completed job
- App can be installed and used with limited connectivity
- All core flows work on both desktop and mobile browsers

---

## 7. Open Questions / Decisions Needed

1. Preferred authentication provider (Clerk, Supabase Auth, NextAuth, custom)?
2. Preferred database + file storage (PostgreSQL via Supabase/Neon + Supabase Storage is a strong default)?
3. Single currency and tax handling approach for the first version?
4. Should mechanics only see jobs assigned to them, or all jobs?
5. Any specific vehicle identification fields required in your country (e.g. mandatory VIN, specific plate format)?
6. Maximum number of photos per job card category (or leave unlimited for MVP)?
7. Do you want optional captions or just timestamped photos for now?

---

**Next Documents**
- 03-user-stories.md
- 04-architecture.md
- 05-data-model.md
