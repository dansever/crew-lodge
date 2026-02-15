---
description: 'CrewLodge codebase organization, layering, and file structure conventions.'
alwaysApply: true
---

# CrewLodge Codebase Structure

This rule defines how files are organized and how concerns are split across frontend, backend, and AI layers.

## Core Principle

- Keep business logic close to its domain (`bookings`, `hotels`, `disruptions`, `dashboard`), but keep framework wiring separated from UI composition.
- Prefer simple, explicit structure over abstraction-heavy patterns (v1 velocity and maintainability).

## App Router Structure

- Protected pages live under: `src/app/(protected)/<domain>/`
- Each protected domain route should follow this pattern:
  - `page.tsx`: server entry point (auth + server data preloading)
  - `ContextProvider.tsx`: client boundary that reads preloaded data and exposes typed context
  - `ClientPage.tsx`: UI composition and interaction logic

Required rules:

- `page.tsx` does authentication gating and Convex preloading/fetching.
- `ClientPage.tsx` should not fetch initial page payload directly if server preloading exists.
- `ContextProvider.tsx` should expose strongly typed data + convenience selectors.

## Shared Protected App Shell

- Shared shell code lives in `src/app/(protected)/_components` and `src/app/(protected)/_contexts`.
- `src/app/(protected)/layout.tsx` is the authenticated shell boundary.
- Cross-page context (for example market selection) belongs in `_contexts`, not per-page folders.

## UI Component Layers

- `src/components/ui/*`: low-level design system primitives (shadcn-based).
- `src/stories/*`: reusable product-facing building blocks and interaction components used across pages.
- `src/modules/*`: domain UI modules with richer behavior (example: hotel sheet/card workflows).

Guidelines:

- Prefer importing app-level building blocks from `@/stories` for consistency.
- Keep `src/components/ui` generic and presentation-focused.
- Avoid embedding domain business rules in UI primitives.

### Stories Conventions

- Components in `src/stories/` must be **generic** only. Domain-specific wrappers (e.g. AirportCombobox, MarketCombobox) belong in `src/modules/<domain>/`.
- **No `.stories` files** — stories are product UI building blocks, not Storybook story modules.
- **No demo or mock data** — components receive all data via props from the consumer.
- Keep components presentation-focused; domain logic stays in modules.

## Convex Backend Structure

- Schema:
  - `convex/schema.ts` is the schema registry.
  - Table definitions live in `convex/schema/<table>.ts`.
- Functions:
  - Domain functions live in `convex/functions/<domain>.ts`.
  - Use `query` for reads and `mutation` for writes.
  - Internal auth/org helpers stay in dedicated modules (`auth.ts`, `orgs.ts`).
- **Aggregates** (`convex/functions/aggregates/`):
  - Page-specific queries that read from **multiple tables** and return a joined/computed payload.
  - Use for `preloadQuery` in `page.tsx` so the client gets one payload instead of many domain queries.
  - Naming: `get<PageName>PageData` or `getDashboard`; file name matches the page (e.g. `crewMembersPage.ts`, `dashboard.ts`).
  - **Queries only** — no mutations; aggregates are for reads.
  - Export a typed payload (e.g. `DashboardData`, `CrewMembersPageData`) alongside the query.
- **Domain vs aggregate**: Domain functions (`crewMembers.ts`, `disruptions.ts`) handle single-table CRUD and entity-level reads/writes. Aggregates combine cross-table data for a specific route; keep domain logic in domain files and compose it in aggregates.

Data/authorization rules:

- Every tenant-facing read/write must be scoped to current org on the server side.
- Do not trust org IDs from the client for authorization.
- Keep v1 schema fields minimal; add fields only when directly required by a live workflow.

## AI Layer (Mastra + CopilotKit)

- Mastra code lives in `src/mastra/`:
  - `agents/`, `tools/`, `workflows/`, and `index.ts`.
- Copilot runtime endpoint lives at `src/app/api/copilotkit/route.ts`.
- AI output should augment workflows; core operational data remains in Convex.

## Naming and File Conventions

- Use domain-first naming (example: `functions/hotels.ts`, `modules/hotels/*`).
- Keep type exports centralized in `convex/types.ts`.
- Use explicit names for server data payloads (example: `DashboardData`, `DisruptionsPageData`).

## What to Avoid

- Mixing mock data with production page data flows once Convex endpoints exist.
- Putting page-specific business logic into global shared components.
- Adding complex schema entities early unless they unblock a current v1 requirement.
