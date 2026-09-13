# Vision Document – Garage Services Management PWA

## 1. Product Vision Statement

To create a modern, reliable, and offline-capable Progressive Web Application that helps vehicle garage and workshop teams manage customers, vehicles, job cards, parts, and daily operations efficiently — with clear visual documentation of vehicle condition before and after service — starting as a powerful web app and evolving into a full mobile solution.

## 2. Problem Statement

Many small and medium vehicle garages still rely on paper job cards, spreadsheets, or outdated desktop software. This leads to:

- Lost or incomplete job information
- Difficulty tracking work progress across mechanics
- No reliable visual record of vehicle condition on entry or exit (damage disputes, quality proof)
- Inventory mistakes and stockouts
- Slow invoicing and poor customer communication
- Limited visibility for the owner into daily operations
- Tools that do not work well on phones/tablets on the shop floor
- Slow customer lookup when only a mobile number is known

Existing solutions are often expensive, complex, or not mobile/offline friendly.

## 3. Solution Overview

A Progressive Web App (PWA) that:

- Works reliably on desktop, tablet, and mobile browsers
- Can be installed on devices like a native app
- Supports offline use for reading data and queueing updates
- Provides clear job-card workflows for mechanics
- Captures multiple photos of the vehicle on entry (condition/damage) and on exit (completed work)
- Uses unique customer mobile numbers for fast lookup of the customer and all associated vehicles
- Gives owners and managers real-time visibility
- Is built with clean architecture so it can later become a native mobile app (via Capacitor or React Native)

## 4. Target Users (MVP)

| Role              | Primary Needs                                      |
|-------------------|----------------------------------------------------|
| Owner / Admin     | Full control, reports, settings, user management   |
| Manager           | Oversee jobs, assign work, inventory, invoicing, photo review |
| Mechanic / Tech   | View assigned jobs, update status, log parts/labor, upload before/after photos |

Customer self-service portal is planned for a later phase.

## 5. Success Metrics (MVP)

- Mechanics can create and update job cards (including photos) in under 3 minutes
- Job status and visual condition records are always visible to managers
- Searching by mobile number instantly shows the customer and their vehicles
- System remains usable with intermittent internet
- Owner can see today’s open jobs and revenue at a glance
- App can be installed and used offline for core reading tasks

## 6. Long-term Vision

- Customer booking and status tracking portal
- Push notifications and SMS updates
- Native mobile apps (iOS + Android)
- Multi-location support
- Advanced reporting, parts supplier integration, and accounting connections
- Possible white-label version for other garages
- Richer photo tools (annotation, comparison view)

## 7. Guiding Principles

1. Mobile-first and offline-aware
2. Simple enough for non-technical staff to use daily
3. Visual proof of vehicle condition is a first-class feature
4. Fast customer identification via unique mobile number
5. Clean data model and architecture for future growth
6. Prefer progressive enhancement over complex features early
7. Documentation-first development so AI tools stay consistent
