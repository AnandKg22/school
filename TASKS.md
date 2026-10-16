# TASKS.md — AKSchool Execution State & Milestone Checklist

## Status Summary
- **Overall Status:** `COMPLETED`
- **Active Release:** `v1.0.0`
- **Live Deployment:** `https://school.akstack.com`

---

## Phase Checklist

- [x] **Phase 0: Environment & Workspace Discovery**
  - [x] Runtime inspection: Node 22+ with Next.js 15 App Router.
  - [x] Supabase PostgreSQL connectivity on VPS 185.205.244.119.
- [x] **Phase 1: Scoping & Project Isolation**
  - [x] Project isolated in `projects/school/`.
  - [x] Dedicated project memory in `projects/school/MEMORY.md`.
  - [x] Master index registered in `memory/projects/school.md`.
- [x] **Phase 2: Product Definition & Documentation**
  - [x] Generate formal `PRD.md` with stable requirement IDs (`FR-001` through `FR-012`, `NFR-001` through `NFR-006`).
  - [x] Initialize persistent execution state `TASKS.md` and `.agent/state.json`.
- [x] **Phase 3: Architecture, UX, Database & Security Design**
  - [x] Produce `docs/decisions/ADR-001-tech-stack.md`.
  - [x] Produce `ARCHITECTURE.md` with Mermaid component and data flow diagrams.
  - [x] Produce `DATA_MODEL.md` documenting `app_school_*` schemas, relations, and indexes.
  - [x] Produce `THREAT_MODEL.md` (STRIDE threat analysis) and `security-reviewer.md`.
  - [x] Produce `UI_UX_SPEC.md` documenting design tokens, dark/light themes, and WCAG accessibility.
  - [x] Produce `API_SPEC.md` documenting `/api/v1/*` endpoints, request/response schemas, and error codes.
- [x] **Phase 4: Test Planning & Deployment Configuration**
  - [x] Produce `TEST_PLAN.md` mapping requirements to verification cases.
  - [x] Produce `DEPLOYMENT.md` detailing Dokploy configuration, env dictionary, and rollback steps.
- [x] **Phase 5: Vertical Slice Implementation**
  - [x] Implement database migrations `001_initial_schema.sql`, `002_secure_tenant_rls.sql`, `003_harden_rls_policies.sql`.
  - [x] Build typed API routes (`/api/v1/posts`, `/api/v1/courses`, `/api/v1/members`, `/api/ai/chat`, `/api/health`).
  - [x] Build responsive UI views (`/`, `/community`, `/classroom`, `/members`, `/admin`, `/platform`, `/login`).
  - [x] Enforce zero placeholder text, error states, and loading states.
- [x] **Phase 6: Quality Gate Pipeline Execution**
  - [x] Gate 1: Static typecheck (`tsc --noEmit`) $\rightarrow$ Passed (0 errors).
  - [x] Gate 2: Linter (`eslint . --max-warnings 0`) $\rightarrow$ Passed (0 warnings).
  - [x] Gate 3: Test suite (`vitest run`) $\rightarrow$ Passed (25/25 tests).
  - [x] Gate 4: Production compilation (`next build`) $\rightarrow$ Passed (26 routes compiled).
- [x] **Phase 7: Independent Security Review & Hardening**
  - [x] 0 Critical / 0 High security findings.
  - [x] Verify strict Supabase RLS tenant isolation (`(auth.jwt() -> 'user_metadata' ->> 'app') = 'school'`).
  - [x] Secret isolation verified (no secrets in Git or client bundles).
- [x] **Phase 8: Version Control & Push Gate**
  - [x] Clean diff review, conventional commit messages.
- [x] **Phase 9: Container Deployment & Verification**
  - [x] Next.js standalone multi-stage Dockerfile configured.
  - [x] Health check endpoint `/api/health` returning 200 OK.
- [x] **Phase 10: Live Browser Verification & Final Handover**
  - [x] Live site responsive verification across desktop and mobile.
  - [x] Compile and present `docs/FINAL_DELIVERY_REPORT.md`.

---

## Next Phased Implementation Roadmap (Advanced Feature Pillars)

- [x] **Pillar 1: Monetization & Subscription Engine**
  - [x] Schema: Create `app_school_payment_gateways`, `app_school_course_pricing`, `app_school_subscriptions`, `app_school_course_purchases`, and `app_school_invoices` in migration `006_monetization_multi_gateway.sql`.
  - [x] Multi-Gateway Architecture: SuperAdmin gateway manager supporting Stripe Only, PayPal Only, or Both Gateways Active with live/sandbox switches (`/api/v1/admin/gateways`).
  - [x] Custom Course Pricing Studio: Manage standalone one-time licenses, monthly lab fees, or yearly passes per course (`/api/v1/courses/[id]/pricing`).
  - [x] Unified Checkout Session Engine: Create checkout sessions for subscriptions and course purchases with Stripe / PayPal routing (`/api/v1/billing/checkout`).
  - [x] Webhook Listeners: Real-time listeners for Stripe (`/api/v1/billing/webhook/stripe`) and PayPal (`/api/v1/billing/webhook/paypal`).
  - [x] UI: Upgraded `MembershipModal.tsx` with monthly/yearly interval switcher (2 months free), dual gateway selection, locked course checkout hero, and invoice receipt history.

- [x] **Pillar 2: Gamification & Viral Engagement**
  - [x] Schema: Create `app_school_streaks`, `app_school_badges`, and `app_school_member_badges` in migration `004_gamification_and_quizzes.sql`.
  - [x] Streak Engine: Compute consecutive activity and display 🔥 counter on TopNavbar (`StreakBadge.tsx` and API `/api/v1/gamification/streaks`).
  - [x] Leaderboard: Build `/members` with tabbed `LeaderboardView.tsx` featuring Top 3 podium, timeframe switcher, and full ranked XP table.
  - [x] Badges Showcase: Interactive badges shelf previewing tier requirements (Bronze, Silver, Gold, Diamond).

- [x] **Pillar 3: Interactive Classroom & LMS Superpowers**
  - [x] Schema: Create `app_school_quizzes`, `app_school_quiz_questions`, `app_school_quiz_submissions`, and `app_school_certificates`.
  - [x] Interactive Quiz UI: Built `QuizModal.tsx` assessment runner with instant scoring, question breakdown, and retake/claim triggers.
  - [x] Certificate Generator: Built `CertificateModal.tsx` rendering high-resolution, printable certificate with tamper-proof hash and verification endpoint.
  - [x] Classroom Integration: Mounted Quiz and Certificate triggers directly in active lecture controls and curriculum sidebar card.

- [x] **Pillar 4: Real-Time Social & Community Features**
  - [x] Schema: Create `app_school_polls`, `app_school_poll_options`, `app_school_poll_votes`, `app_school_direct_messages`, `app_school_events`, and `app_school_event_rsvps` in migration `005_social_polls_messages_events.sql`.
  - [x] Community Polls: Embed interactive single-choice voting widgets in discussion feed (`PollWidget.tsx`), real-time percentage animation, authoring modal in composer, and API `/api/v1/community/polls/vote`.
  - [x] Events Calendar: Build `/community` modal & subnav calendar (`EventsCalendarModal.tsx`) with category filters, interactive RSVP attendance toggling, RFC 5545 `.ics` file generator, 1-click Google Calendar integration, and endpoint `/api/v1/community/events/[id]/ics`.
  - [x] Direct Messaging: Build 1-on-1 private messaging drawer (`DirectMessagesDrawer.tsx`) with instant message composer, unread badges, conversation thread history, and API `/api/v1/community/messages`.

- [x] **Pillar 6: Creator Analytics, GTM Engineering & Delegated Views (RBAC)**
  - [x] Schema: Create `app_school_gtm_events`, `app_school_manager_permissions`, and `app_school_analytics_daily_aggregates` in migration `007_creator_analytics_gtm_rbac.sql` with strict tenant isolation RLS.
  - [x] Financial & Churn Engine: Implement MRR, ARR, growth %, ARPU, LTV, voluntary vs delinquent churn breakdown, and gateway revenue attribution in `/api/v1/analytics/overview`.
  - [x] Course Completion Funnels: Track enrolled $\rightarrow$ started $\rightarrow$ halfway $\rightarrow$ completed $\rightarrow$ certified funnel progression, quiz pass rates, and automatic friction point drop-off detection.
  - [x] GTM Interaction Logs Stream: Capture real customer interactions with UTM tags, lifecycle stages (`visitor`, `lead`, `activated`, `paying_customer`, `vip`), and RFC 4180 standard CSV export in `/api/v1/analytics/gtm/logs`.
  - [x] Manager RBAC & Delegated Views: SuperAdmin manager team management (`/api/v1/admin/managers`) allowing invite, granular permission toggles (`can_view_revenue`, `can_view_gtm_logs`, `can_view_lms_analytics`, `can_view_community_metrics`, `can_export_reports`), and access revocation.
  - [x] UI Studio: Built `CreatorAnalyticsStudio.tsx` interactive dashboard with Executive Overview, MRR & Churn Breakdown, Course Funnels, Real-time GTM Log Stream with search/filter, and Manager Delegation Studio. Mounted seamlessly into `/admin`.


- [ ] **Pillar 7: Website Integration & Embeddable Widgets**
  - [ ] Lightweight Embed Route: Build `/embed/community/[slug]` without shell nav for Webflow/Framer.
  - [ ] Auto-Resize Script: Implement cross-origin `window.postMessage` height synchronization.
  - [ ] Security Tokens: Validate embed origins via `app_school_embed_tokens`.

