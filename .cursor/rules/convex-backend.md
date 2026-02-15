---
description: 'Convex backend conventions: atomic vs aggregate functions, schema, and tenant scoping.'
alwaysApply: true
---

# Convex Backend Conventions

This rule defines how to structure Convex functions and where to place different types of operations. Follow these conventions for all Convex backend work.

## Atomic vs Aggregate Separation

| Location | Purpose | Examples |
|----------|---------|----------|
| `convex/functions/<entity>.ts` | Single-table CRUD, get-by-id, list-by-org | `listMyHotels`, `getHotelById`, `createHotel` |
| `convex/functions/aggregates/<page>.ts` | Cross-table, page-specific composite data | `getDashboard`, `getDisruptionsPageData`, `getCrewMembersPageData` |

**Rule of thumb:** Entity modules = one table, one responsibility. Aggregates = cross-table, page-specific views.

## Entity Modules (`convex/functions/<entity>.ts`)

- One table per file. No joins, no cross-table queries.
- Expose atomic operations only:
  - `getXById` — single document by ID, org-scoped
  - `listMyX` or `listXByOrg` — list for current org, optionally filtered
  - `createX`, `updateX`, `deleteX` — org-scoped mutations
- Use `convex-helpers/server/crud` for schema-backed CRUD when the schema supports it.
- All reads and writes must scope to current org via `internal.functions.orgs.getMyOrgId`.
- Do not trust org IDs from the client for authorization.

## Aggregates (`convex/functions/aggregates/<page>.ts`)

- Multi-table reads assembled for a specific page.
- Use `ctx.db` directly; do not call other Convex functions from aggregates.
- Named after the page they serve: `getCrewMembersPageData`, `getDisruptionsPageData`.
- Return typed composite payloads (e.g. `CrewMembersPageData`, `DashboardData`).
- Page preloading must use aggregates for composite views, not entity modules.

## Schema and Validators

- `convex/schema.ts` is the schema registry. Table definitions live in `convex/schema/<table>.ts`.
- Use validators from `convex/validators.ts` for mutation args.
- Keep entity types in `convex/types.ts`. Page-specific composite types live in the aggregate file.

## What to Avoid

- Putting cross-table or join logic in entity modules.
- Putting atomic CRUD in aggregate files.
- Trusting client-supplied org IDs.
- Exposing internal functions as public API.
