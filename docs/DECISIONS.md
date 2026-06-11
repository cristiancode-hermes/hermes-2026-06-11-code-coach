# Decision Log (ADRs)

This document records every non-obvious architectural decision, the alternatives considered, and the rationale.

---

## ADR-001: Angular → NestJS Monorepo Structure

**Date:** 2026-06-11

**Context:** Need to organize a full-stack application with separate Angular frontend and NestJS backend in a single repository.

**Decision:** Use a `/apps/api` + `/apps/web` monorepo structure with independent `package.json` files in each app.

**Alternatives Considered:**
- **NX monorepo:** Overkill for a two-app project; adds tooling complexity.
- **Single `package.json` with workspaces:** NestJS and Angular have conflicting dependency requirements (e.g., different TypeScript versions).
- **Separate repositories:** Adds overhead for coordinated changes.

**Rationale:** Independent builds mean each team (or person working on either end) can focus on their toolchain without cross-contamination. The folder convention is clear and scalable.

---

## ADR-002: SQLite for Local Development, Neon for Production

**Date:** 2026-06-11

**Context:** Need a database that works locally without external services while allowing future migration to Neon Postgres.

**Decision:** Use SQLite via TypeORM's `better-sqlite3` driver for development. All SQL is written in Postgres-compatible syntax.

**Alternatives Considered:**
- **Neon from day one:** Requires Neon API key and internet connectivity for development.
- **Docker PostgreSQL:** More consistent with production but adds infrastructure overhead.
- **In-memory SQLite:** Faster but data doesn't persist across restarts.

**Rationale:** SQLite gives zero-config local development. TypeORM's abstraction layer means switching to Postgres is one config change (`type: 'postgres'` instead of `type: 'better-sqlite3'`). The migration SQL uses standard syntax compatible with both.

**Trade-off:** Some Postgres features (pgvector, JSONB deep queries) aren't available in dev mode. Feature branches requiring these must use a real Postgres instance.

---

## ADR-003: Rule-Based Analysis Strategy (Pluggable)

**Date:** 2026-06-11

**Context:** Need an AI capability (per mission prompt) but no LLM API key is available.

**Decision:** Implement a Strategy Pattern with a `RuleBasedAnalysisStrategy` that computes code metrics locally. Design the interface so swapping to an LLM is a single method call.

**Alternatives Considered:**
- **Direct LLM integration:** Requires API key not available in environment.
- **Local LLM (ollama):** Would add ~5GB download and GPU requirements not available.
- **Mock AI responses:** Wouldn't demonstrate real analysis logic.

**Rationale:** The Strategy Pattern provides real, valuable analysis while keeping the door open for LLM integration. The analysis results (quality score, suggestions) are genuinely useful for a coding coach.

---

## ADR-004: Synchronous Submission Processing

**Date:** 2026-06-11

**Context:** When a user submits code, the system must analyze it and return results.

**Decision:** Process analysis synchronously within the HTTP request lifecycle.

**Alternatives Considered:**
- **Async with polling:** POST returns `202 Accepted` with a location header, client polls for results.
- **Async with WebSocket:** Push results when ready.
- **Background job queue:** Bull/Redis for processing.

**Rationale:** For rule-based analysis (~5ms), synchronous is simpler, faster, and provides immediate feedback. If LLM analysis is added (1-3s), the architecture can be changed to async without affecting the frontend contract by wrapping in a Promise.

---

## ADR-005: Angular Without Material UI

**Date:** 2026-06-11

**Context:** Need a consistent, professional-looking UI.

**Decision:** Use Tailwind CSS only, building a custom design system. No Angular Material or component library.

**Alternatives Considered:**
- **Angular Material:** Standard for enterprise Angular apps but adds weight (tree-shaking helps, but conventions are Material-specific).
- **PrimeNG:** Feature-rich but opinionated styling.
- **Tailwind UI / Headless UI:** Headless components with custom styling; not used to keep dependency count minimal.

**Rationale:** Tailwind alone can produce professional, responsive designs. The app has 4 pages with simple UI patterns (cards, forms, lists) — no complex widgets (date pickers, data tables, steppers) that would benefit from a library. Keeping zero CSS dependencies means smaller bundles and full control.

---

## ADR-006: Signal-First State Management

**Date:** 2026-06-11

**Context:** Angular 22 supports zoneless change detection and signals. Need to choose state management approach.

**Decision:** Use `signal()` for all component-level state, `computed()` for derived state, and RxJS `HttpClient` bridged via `toSignal()` at service boundaries.

**Alternatives Considered:**
- **NgRx:** Too heavy for this app's state complexity.
- **Component store:** Good but adds dependency; signals cover the same use case natively.
- **Full RxJS in components:** Creates complexity with `.subscribe()` and manual cleanup.

**Rationale:** Signals provide fine-grained reactivity, work without Zone.js, and integrate with Angular's new control flow (`@if`/`@for`). HttpClient observables are bridged at the service layer, keeping components signal-clean.

---

## ADR-007: No Authentication in v1

**Date:** 2026-06-11

**Context:** The app needs to be useful immediately. Auth adds significant complexity.

**Decision:** Skip authentication for the initial version. All CRUD operations are unauthenticated.

**Alternatives Considered:**
- **JWT auth with Neon Auth:** Would require Neon Auth setup and frontend login flow.
- **Simple API key:** Static key in env var.
- **No auth (chosen):** Simplest path to a working demo.

**Rationale:** The app is a learning tool and code coach — there's no sensitive user data. Auth can be added as a natural next step (Auth guard, user entity, JWT tokens). The README roadmap calls this out explicitly.

**Trade-off:** Anyone with the API URL can create/delete challenges and submissions. Acceptable for dev/demo mode. Production deployment should add auth before going public.
