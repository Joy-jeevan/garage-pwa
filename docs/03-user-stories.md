# User Stories – Garage Services Management PWA (MVP)

**Version:** 1.0  
**Based on:** Requirements v1.1  
**Last Updated:** August 2026

User stories are grouped by epic. Each story follows the format:  
**As a [role], I want [goal], so that [benefit].**

Priority legend:  
- **Must** = Required for MVP  
- **Should** = Strongly desired in MVP  
- **Could** = Nice to have if time allows

---

## Epic 1: Authentication & User Management

### US-1.1 – Login
**As a** staff member  
**I want** to log in with my email and password  
**So that** I can access the system securely  
**Priority:** Must  

**Acceptance Criteria:**
- Valid credentials grant access
- Invalid credentials show clear error
- Session persists across browser refreshes (within reason)

### US-1.2 – Logout
**As a** logged-in user  
**I want** to log out  
**So that** no one else can use my account on a shared device  
**Priority:** Must

### US-1.3 – Password Reset
**As a** user  
**I want** to reset my password via email  
**So that** I can regain access if I forget it  
**Priority:** Must

### US-1.4 – Manage Users (Admin only)
**As an** Admin  
**I want** to create, edit, and deactivate staff accounts and assign roles  
**So that** only authorized people have the correct access  
**Priority:** Must

---

## Epic 2: Customer Management

### US-2.1 – Create Customer
**As a** Manager or Admin  
**I want** to create a new customer with name, unique mobile number, email, address, and notes  
**So that** we can link vehicles and jobs to them  
**Priority:** Must  

**Acceptance Criteria:**
- Mobile number is required and must be unique
- System prevents duplicate mobile numbers with a clear message

### US-2.2 – Search Customer by Mobile
**As a** Manager, Admin, or Mechanic  
**I want** to search by mobile number  
**So that** I can instantly find the customer and all their associated vehicles  
**Priority:** Must  

**Acceptance Criteria:**
- Exact or partial mobile search returns the customer
- Results show the customer card + list of their vehicles
- Search feels fast (< 1 second)

### US-2.3 – View & Edit Customer
**As a** Manager or Admin  
**I want** to view and edit customer details  
**So that** information stays up to date  
**Priority:** Must

### US-2.4 – View Customer History
**As a** Manager or Admin  
**I want** to see all vehicles and past job cards for a customer  
**So that** I have full context  
**Priority:** Must

---

## Epic 3: Vehicle Management

### US-3.1 – Add Vehicle to Customer
**As a** Manager or Admin  
**I want** to add a vehicle linked to a customer (make, model, year, plate, VIN, color, mileage, notes)  
**So that** we can create job cards against it  
**Priority:** Must

### US-3.2 – Search & View Vehicles
**As a** staff member  
**I want** to search vehicles by plate number or customer  
**So that** I can quickly find the right vehicle  
**Priority:** Must

### US-3.3 – Edit Vehicle Details
**As a** Manager or Admin  
**I want** to update vehicle information (especially current mileage)  
**So that** records stay accurate  
**Priority:** Must

---

## Epic 4: Job Cards / Work Orders (Core)

### US-4.1 – Create Job Card
**As a** Manager, Admin, or Mechanic  
**I want** to create a new job card linked to a customer and vehicle  
**So that** we can track the work  
**Priority:** Must  

**Acceptance Criteria:**
- Must select existing customer + vehicle (or create them inline)
- Capture: date in, estimated completion, priority, description, assigned mechanic(s)

### US-4.2 – Update Job Status
**As a** Mechanic or Manager  
**I want** to change the status of a job card (Draft → Open → In Progress → Waiting Parts → Completed → Invoiced/Closed)  
**So that** everyone knows the current state  
**Priority:** Must

### US-4.3 – Add Labor & Parts to Job
**As a** Mechanic or Manager  
**I want** to add labor lines (description, hours, rate) and parts (from inventory or free text)  
**So that** the job cost is accurate  
**Priority:** Must

### US-4.4 – Add Notes
**As a** Mechanic or Manager  
**I want** to add internal notes to a job card  
**So that** important information is recorded  
**Priority:** Must

### US-4.5 – View Job Lists & Filters
**As a** staff member  
**I want** to see lists of jobs filtered by status, date, assigned mechanic, or “My Jobs”  
**So that** I can focus on relevant work  
**Priority:** Must

### US-4.6 – Upload Entry (Pre-service) Photos
**As a** Mechanic or Manager  
**I want** to upload multiple photos of the vehicle on entry showing condition and any damage  
**So that** we have visual proof of the vehicle’s state when it arrived  
**Priority:** Must  

**Acceptance Criteria:**
- Can upload from camera or gallery
- Multiple images supported
- Images are clearly marked as “Entry / Pre-service”
- Can view and delete individual photos

### US-4.7 – Upload Exit (Post-service) Photos
**As a** Mechanic or Manager  
**I want** to upload multiple photos of the completed work / final condition  
**So that** we have visual proof of the work done  
**Priority:** Must  

**Acceptance Criteria:**
- Same capabilities as entry photos
- Images clearly marked as “Exit / Post-service”

### US-4.8 – View Job Photos
**As a** staff member  
**I want** to view all entry and exit photos for a job card in a simple gallery  
**So that** I can review vehicle condition  
**Priority:** Must

---

## Epic 5: Inventory

### US-5.1 – Manage Parts Catalog
**As a** Manager or Admin  
**I want** to add, edit, and view parts (name, SKU, quantity, cost, price, min stock)  
**So that** we know what we have  
**Priority:** Must

### US-5.2 – Adjust Stock
**As a** Manager or Admin  
**I want** to manually increase or decrease stock quantity  
**So that** inventory stays accurate  
**Priority:** Must

### US-5.3 – Auto-deduct Parts Used on Jobs
**As a** system (triggered by user)  
**I want** parts added to a job card to optionally reduce stock  
**So that** inventory reflects real usage  
**Priority:** Should

### US-5.4 – Low Stock Alert
**As a** Manager or Admin  
**I want** to see which parts are below minimum stock level  
**So that** I can reorder in time  
**Priority:** Should

---

## Epic 6: Invoicing

### US-6.1 – Generate Invoice from Job Card
**As a** Manager or Admin  
**I want** to create an invoice from a completed job card  
**So that** we can bill the customer  
**Priority:** Must  

**Acceptance Criteria:**
- Pulls customer, vehicle, labor, parts, and totals automatically
- Supports simple tax field
- Can mark as Draft / Sent / Paid

### US-6.2 – Record Payment
**As a** Manager or Admin  
**I want** to record a payment (cash, card, other) against an invoice  
**So that** we know what has been paid  
**Priority:** Must

### US-6.3 – Print / Export Invoice
**As a** Manager or Admin  
**I want** to print or export a simple PDF of the invoice  
**So that** I can give it to the customer  
**Priority:** Should

---

## Epic 7: Dashboard & Navigation

### US-7.1 – Dashboard Overview
**As a** Manager or Admin  
**I want** to see today’s open jobs, jobs by status, low stock alerts, and recent activity  
**So that** I have a quick operational overview  
**Priority:** Must

### US-7.2 – Quick Actions
**As a** staff member  
**I want** prominent buttons for “New Job”, “New Customer”, etc.  
**So that** common tasks are fast  
**Priority:** Must

### US-7.3 – Responsive Navigation
**As a** user on phone or tablet  
**I want** easy navigation (bottom nav or collapsible menu)  
**So that** I can use the app comfortably on the shop floor  
**Priority:** Must

---

## Epic 8: PWA & Offline

### US-8.1 – Installable App
**As a** user  
**I want** to install the app on my phone or desktop  
**So that** it feels like a native application  
**Priority:** Must

### US-8.2 – Offline Reading
**As a** Mechanic  
**I want** to view job cards, customers, and vehicles even with poor or no internet  
**So that** I can still work  
**Priority:** Must

### US-8.3 – Offline Indicator & Queue
**As a** user  
**I want** a clear indicator when I am offline and for my changes (including photo uploads) to be queued and synced later  
**So that** I don’t lose work  
**Priority:** Should

---

## Summary of Must-Have Stories for MVP

| Epic              | Must-Have Stories                  |
|-------------------|------------------------------------|
| Auth              | 1.1 – 1.4                          |
| Customers         | 2.1 – 2.4                          |
| Vehicles          | 3.1 – 3.3                          |
| Job Cards         | 4.1 – 4.8 (includes photos)        |
| Inventory         | 5.1, 5.2                           |
| Invoicing         | 6.1, 6.2                           |
| Dashboard         | 7.1 – 7.3                          |
| PWA               | 8.1, 8.2                           |

---

**Next recommended documents**
- 05-data-model.md
- 04-architecture.md
- 06-api-design.md
