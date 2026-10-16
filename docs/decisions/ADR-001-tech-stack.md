# ADR-001: Technology Stack Selection & Architecture Rationale

## Status
**ACCEPTED** (v1.0.0) — 2026-10-16

## Context
AKSchool requires an interactive, real-time, responsive multi-tenant community and academy platform combining discussions, video curriculum, gamification, and an AI knowledge copilot. The platform must deploy smoothly to Dokploy VPS via Docker, connect to a shared self-hosted Supabase instance without data collisions, and support high-performance client transitions.

## Decisions

### 1. Framework: Next.js 15 (App Router) + React 19
- **Rationale:** Hybrid rendering model allows static pre-rendering for public landing pages and instant server-side execution for authenticated `/api/v1/*` routes. Built-in standalone output (`output: "standalone"`) generates minimal Docker production containers.
- **Alternatives Considered:** Vite SPA (rejected: lacked native SEO metadata and server route co-location), Remix (rejected: smaller integration ecosystem with Dokploy template tooling).

### 2. Database & Auth: Self-Hosted Supabase (PostgreSQL with RLS)
- **Rationale:** Native Row-Level Security (RLS) guarantees tenant and user isolation directly in PostgreSQL. Direct SQL migrations allow predictable schema versioning.
- **Namespace Protocol:** Every table uses `app_school_*` prefix with RLS policy:
  `(auth.jwt() -> 'user_metadata' ->> 'app') = 'school'`.

### 3. Styling & Icons: Tailwind CSS + Lucide React
- **Rationale:** Utility-first CSS provides maximum design control, zero runtime CSS overhead, and instant light/dark mode theming via CSS variables. `lucide-react` provides crisp, tree-shakeable icons with zero external asset dependencies.

### 4. AI Engine: Xiaomi MiMo API (`mimo-v2.6-flash`)
- **Rationale:** High-speed inference with deep reasoning capabilities for curriculum summarization, community Q&A, and onboarding guidance.

### 5. Deployment & Runtime: Dokploy + Docker Multi-Stage Alpine
- **Rationale:** Minimal attack surface, reproducible build artifacts, automated health probing via `/api/health`, and seamless domain SSL routing.
