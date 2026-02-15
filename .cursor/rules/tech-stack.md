---
description: 'CrewLodge technology stack and architectural standards.'
alwaysApply: true
---

# CrewLodge Tech Stack

This file defines the canonical technology stack and architectural standards for the CrewLodge project. All implementation decisions must align with this stack.

## Frontend

- **Framework:** Next.js 16 (App Router)
- **UI:** React
- **Language:** TypeScript
- **Styling:** TailwindCSS
- **Main Component Library:** shadcn/ui

Follow established conventions for layouts, components, and styling patterns. Prefer shadcn/ui components for common UI elements.

## Authentication

- **Provider:** Clerk

Clerk is the single source of truth for user identity, session management, and authentication flows.

## Backend & Database

- **Primary Backend & Database:** Convex

Guidelines:

- Use Convex queries, mutations, and actions for backend logic
- Keep authorization checks tightly scoped to data access

## File/Document Intelligence & Retrieval

- **Retrieval Layer:** Gemini File Search for RAG

Guidelines:

- Follow evidence-first retrieval workflows
- Outputs must be grounded in retrieved documents
- Prefer citation-backed responses over free-form generation

## Agentic UI/UX

- **Framework:** CopilotKit (AG-UI protocol)

CopilotKit provides UI components and hooks for real-time agent-user interaction, handling streaming responses, tool invocations, and shared state updates.

## AI Agents & Workflows

- **Agent Framework:** Mastra

TypeScript framework for building and orchestrating AI agents with reasoning, multi-LLM support, tool integration, and durable state. Integrates with CopilotKit via AG-UI for real-time UI interactions.

---

**Stack Adherence:** All implementation decisions must use these technologies. Do not introduce alternatives without explicit approval.
