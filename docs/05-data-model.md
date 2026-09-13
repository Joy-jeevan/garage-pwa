# Data Model – Garage Services Management PWA (MVP)

**Version:** 1.0  
**Based on:** Requirements v1.1 + User Stories v1.0  
**Last Updated:** August 2026

---

## 1. Design Principles

- Prefer **soft deletes** (`deleted_at`) over hard deletes for business entities
- Every important table has `created_at`, `updated_at`
- `created_by` / `updated_by` where useful for audit
- Customer **mobile number is unique**
- Photos belong to **Job Cards** (not directly to Vehicles) so each visit has its own visual record
- Keep the model simple for MVP but structured for future multi-tenancy / multi-branch
- Use UUIDs as primary keys (recommended) or bigserial – decide during implementation
- Monetary values stored as integers (smallest currency unit, e.g. cents/paise) **or** decimal – choose one and stay consistent

---

## 2. Entity Relationship Overview

```
User
  └── (creates/manages) Customer, Vehicle, JobCard, etc.

Customer 1 ──── * Vehicle
Customer 1 ──── * JobCard
Vehicle  1 ──── * JobCard

JobCard 1 ──── * JobCardItem
JobCard 1 ──── * JobCardImage
JobCard 1 ──── 0..1 Invoice

Part 1 ──── * JobCardItem (optional link)

Invoice 1 ──── * Payment
```

---

## 3. Detailed Entities

### 3.1 User
Staff members who log into the system.

| Field            | Type          | Notes |
|------------------|---------------|-------|
| id               | UUID / PK     | |
| email            | string        | Unique, required |
| password_hash    | string        | Managed by auth provider if using Clerk/Supabase/etc. |
| full_name        | string        | Required |
| phone            | string        | Optional |
| role             | enum          | `admin`, `manager`, `mechanic` |
| is_active        | boolean       | Default true |
| created_at       | timestamp     | |
| updated_at       | timestamp     | |
| deleted_at       | timestamp     | Soft delete |

**Notes:**  
If using an external auth provider (Clerk, Supabase Auth, etc.), this table may only store the external user ID + role + profile fields.

---

### 3.2 Customer

| Field            | Type          | Notes |
|------------------|---------------|-------|
| id               | UUID / PK     | |
| full_name        | string        | Required |
| mobile           | string        | **Required + Unique** |
| email            | string        | Optional |
| address          | text          | Optional |
| notes            | text          | Optional |
| created_at       | timestamp     | |
| updated_at       | timestamp     | |
| created_by       | UUID          | FK → User |
| deleted_at       | timestamp     | Soft delete |

**Indexes:**  
- Unique index on `mobile`  
- Index on `full_name` for search

---

### 3.3 Vehicle

| Field            | Type          | Notes |
|------------------|---------------|-------|
| id               | UUID / PK     | |
| customer_id      | UUID          | FK → Customer, required |
| make             | string        | Required |
| model            | string        | Required |
| year             | integer       | Optional |
| plate_number     | string        | Required (consider unique per garage later) |
| vin              | string        | Optional |
| color            | string        | Optional |
| current_mileage  | integer       | Optional |
| notes            | text          | Optional |
| created_at       | timestamp     | |
| updated_at       | timestamp     | |
| created_by       | UUID          | FK → User |
| deleted_at       | timestamp     | Soft delete |

**Indexes:**  
- Index on `plate_number`  
- Index on `customer_id`

---

### 3.4 JobCard (Work Order)

| Field                | Type          | Notes |
|----------------------|---------------|-------|
| id                   | UUID / PK     | |
| job_number           | string        | Human-friendly sequential number (e.g. JOB-2026-0001) |
| customer_id          | UUID          | FK → Customer, required |
| vehicle_id           | UUID          | FK → Vehicle, required |
| status               | enum          | `draft`, `open`, `in_progress`, `waiting_parts`, `completed`, `invoiced`, `closed` |
| priority             | enum          | `low`, `normal`, `high`, `urgent` (default normal) |
| description          | text          | Customer complaint / requested work |
| date_in              | timestamp     | When vehicle arrived |
| estimated_completion | timestamp     | Optional |
| completed_at         | timestamp     | When marked completed |
| mileage_in           | integer       | Mileage at arrival |
| mileage_out          | integer       | Mileage at exit (optional) |
| assigned_mechanic_id | UUID          | FK → User (nullable) |
| notes                | text          | Internal notes |
| created_at           | timestamp     | |
| updated_at           | timestamp     | |
| created_by           | UUID          | FK → User |
| deleted_at           | timestamp     | Soft delete |

**Indexes:**  
- Index on `status`  
- Index on `date_in`  
- Index on `assigned_mechanic_id`  
- Index on `customer_id` and `vehicle_id`

---

### 3.5 JobCardItem
Line items on a job (labor, parts, or other charges).

| Field            | Type          | Notes |
|------------------|---------------|-------|
| id               | UUID / PK     | |
| job_card_id      | UUID          | FK → JobCard, required |
| type             | enum          | `labor`, `part`, `other` |
| description      | string        | Required |
| quantity         | decimal       | Default 1 |
| unit_price       | decimal/int   | Required |
| part_id          | UUID          | FK → Part (nullable – only when type = part) |
| hours            | decimal       | Used when type = labor |
| sort_order       | integer       | For display ordering |
| created_at       | timestamp     | |
| updated_at       | timestamp     | |

**Notes:**  
- When a `part` item is added, the application can optionally decrease `Part.quantity_on_hand`.

---

### 3.6 JobCardImage (Entry & Exit Photos)

| Field            | Type          | Notes |
|------------------|---------------|-------|
| id               | UUID / PK     | |
| job_card_id      | UUID          | FK → JobCard, required |
| category         | enum          | `entry` (pre-service / damage), `exit` (post-service) |
| storage_path     | string        | Path/URL in object storage (S3, Supabase Storage, etc.) |
| file_name        | string        | Original file name |
| mime_type        | string        | e.g. image/jpeg |
| size_bytes       | integer       | Optional |
| caption          | string        | Optional |
| taken_at         | timestamp     | Optional (device time or upload time) |
| uploaded_by      | UUID          | FK → User |
| created_at       | timestamp     | |
| deleted_at       | timestamp     | Soft delete (optional) |

**Notes:**  
- Multiple images allowed per category per job card.  
- Actual image files live in object storage, **not** in the database.  
- Consider generating thumbnails later.

---

### 3.7 Part (Inventory)

| Field              | Type          | Notes |
|--------------------|---------------|-------|
| id                 | UUID / PK     | |
| name               | string        | Required |
| sku                | string        | Optional, unique if used |
| quantity_on_hand   | decimal/int   | Default 0 |
| unit_cost          | decimal/int   | Purchase cost |
| selling_price      | decimal/int   | Default selling price |
| min_stock_level    | decimal/int   | For low-stock alerts |
| notes              | text          | Optional |
| created_at         | timestamp     | |
| updated_at         | timestamp     | |
| deleted_at         | timestamp     | Soft delete |

---

### 3.8 Invoice

| Field            | Type          | Notes |
|------------------|---------------|-------|
| id               | UUID / PK     | |
| invoice_number   | string        | Human-friendly sequential |
| job_card_id      | UUID          | FK → JobCard (unique – one invoice per job for MVP) |
| customer_id      | UUID          | FK → Customer (denormalized for convenience) |
| status           | enum          | `draft`, `sent`, `paid`, `cancelled` |
| subtotal         | decimal/int   | |
| tax_amount       | decimal/int   | Simple tax for MVP |
| total            | decimal/int   | |
| notes            | text          | Optional |
| issued_at        | timestamp     | |
| due_at           | timestamp     | Optional |
| created_at       | timestamp     | |
| updated_at       | timestamp     | |
| created_by       | UUID          | FK → User |

---

### 3.9 Payment

| Field            | Type          | Notes |
|------------------|---------------|-------|
| id               | UUID / PK     | |
| invoice_id       | UUID          | FK → Invoice |
| amount           | decimal/int   | Required |
| method           | enum          | `cash`, `card`, `upi`, `bank_transfer`, `other` |
| paid_at          | timestamp     | |
| reference        | string        | Optional (transaction ID, etc.) |
| notes            | text          | Optional |
| created_at       | timestamp     | |
| created_by       | UUID          | FK → User |

---

## 4. Enums Summary

```text
User.role               → admin | manager | mechanic
JobCard.status          → draft | open | in_progress | waiting_parts | completed | invoiced | closed
JobCard.priority        → low | normal | high | urgent
JobCardItem.type        → labor | part | other
JobCardImage.category   → entry | exit
Invoice.status          → draft | sent | paid | cancelled
Payment.method          → cash | card | upi | bank_transfer | other
```

---

## 5. Key Business Rules (Enforced in App + DB where possible)

1. Customer `mobile` must be unique.
2. A JobCard must belong to both a Customer and a Vehicle.
3. JobCardImages belong only to a JobCard and are categorized as `entry` or `exit`.
4. Only one Invoice per JobCard in MVP (can be relaxed later).
5. Soft-deleted records should be hidden from normal lists but recoverable by Admin if needed.
6. When a Part is linked to a JobCardItem, stock can be decremented (application logic).

---

## 6. Future Considerations (Not in MVP)

- `organization_id` / `branch_id` on major tables for multi-tenancy
- Photo annotation / damage markup
- Multiple mechanics assigned to one job (join table)
- Vehicle service reminders based on mileage or time
- Full audit log table

---

## 7. Recommended Next Steps

1. Decide primary key strategy (UUID vs auto-increment).
2. Decide money storage (integer cents vs decimal).
3. Choose object storage for images (Supabase Storage is simplest if using Supabase).
4. Create the actual Prisma / Drizzle / SQL schema from this document.
5. Move to Architecture (`04-architecture.md`) or API design.
