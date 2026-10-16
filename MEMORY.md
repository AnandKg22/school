# MEMORY.md — AKSchool Curated Project Memory

## Project Overview
- **Project Name:** `school` (AKSchool / CommunityOS)
- **Slug:** `school`
- **Domain:** `https://school.akstack.com`
- **Category:** Modern AI-Native Community, Learning and Academy Platform (Skool/Circle paradigm).
- **Core Stack:** Next.js 15 (App Router, React 19), Tailwind CSS, Lucide Icons, Supabase (PostgreSQL with RLS), Dokploy VPS.

## Key Architectural Decisions
1. **Multi-Tenant Isolation Protocol:**
   - All tables are namespaced: `app_school_*`.
   - Every table enforces Row-Level Security (RLS) linked to user metadata:
     `(auth.jwt() -> 'user_metadata' ->> 'app') = 'school'`.
   - Dedicated service role / user-scoped authenticated client via `lib/supabase.ts`.
2. **3-Tier Access Hierarchy:**
   - **Level 1 (Public):** `/` (Landing), `/login`, `/explore`, `/pricing`.
   - **Level 2 (Members):** `/community` (Spaces, Posts, Comments), `/classroom` (Modules, Lessons, Markdown player), `/members` (Member Directory, Badges, Points).
   - **Level 3 (Operations):** `/admin` (Branding, Curriculum, AI Knowledge Base, Plans) and `/platform` (Superadmin cross-tenant telemetry).
3. **AI Copilot & Knowledge Retrieval:**
   - Powered by MiMo token plan endpoint (`mimo-v2.6-flash`).
   - Context-grounded retrieval from community posts, lesson guides, and community FAQs.
4. **Standalone Containerization:**
   - Configured with `output: "standalone"` in `next.config.mjs` and multi-stage Alpine Dockerfile.
   - Built-in `/api/health` probe reporting 200 OK for zero-downtime Dokploy orchestration.

## Operational Preferences
- Standard Superadmin: `admin@akstack.com` with role `superadmin`.
- Free/Pro/VIP plan gating across classroom courses.
