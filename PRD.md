# Product Requirements Document (PRD) — AKSchool

> Application: **AKSchool (CommunityOS)**  
> Category: **Multi-Tenant Community, Learning & Academy Platform**  
> Status: **Production Ready (v1.0.0)**  
> Live URL: `https://school.akstack.com`

---

## 1. Executive Summary & Vision

AKSchool is a modern, AI-powered community and academy platform engineered for creators, educators, and enterprise teams to launch branded learning spaces with discussions, structured video courses, gamified member directories, paid membership tiers, and an AI knowledge copilot.

---

## 2. Personas & Access Levels

| Level | Role | Responsibilities & Capabilities |
|---|---|---|
| **Level 1** | **Public Visitor** | Explore landing page, browse public courses, inspect membership pricing, register / login. |
| **Level 2** | **Enrolled Member** | Participate in discussions, post comments, stream video/markdown lessons, earn gamified points and badges. |
| **Level 3** | **Instructor / Admin** | Create and organize spaces, author curriculum (modules/lessons), upload knowledge base documents, manage plan tiers. |
| **Platform**| **Superadmin** | Cross-tenant visibility, system health monitoring, AI token usage metrics. |

---

## 3. Functional Requirements (FR)

### Community & Engagement
- **FR-001 [Spaces & Channels]:** Admins can create and reorder category spaces (e.g. General, Announcements, Q&A). Members can filter discussions by space.
  - *Acceptance Criteria:* Creating a space immediately updates the navigation; filtering displays only posts belonging to `space_id`.
- **FR-002 [Post Authoring & Rich Content]:** Members can author rich posts with titles, markdown formatting, tags, and pin flags (admin only).
  - *Acceptance Criteria:* Post submissions validate title $\ge 3$ characters and content $\ge 10$ characters; pinned posts remain at the top.
- **FR-003 [Comments & Reactions]:** Members can like posts and submit nested threaded comments with real-time optimistic counts.
  - *Acceptance Criteria:* Liking toggles state and increments `likes_count`; empty comments are rejected.

### Classroom & Learning
- **FR-004 [Course Catalog & Tier Gating]:** Courses display cover art, title, total lessons, and required membership tier (`free`, `pro`, `vip`).
  - *Acceptance Criteria:* Locked courses show lock badges and prompt upgrade when accessed by lower-tier members.
- **FR-005 [Curriculum Hierarchy]:** Courses contain ordered modules, which contain ordered lessons.
  - *Acceptance Criteria:* Dragging or updating `sort_order` preserves sequential lesson progression.
- **FR-006 [Lesson Player & Progress Tracking]:** Lessons render rich markdown curriculum, embedded video embeds, duration estimates, and a "Mark Complete" toggle.
  - *Acceptance Criteria:* Clicking "Mark Complete" persists state in `app_school_learning_progress` and updates user progress bar.

### Members & Gamification
- **FR-007 [Member Directory & Profiles]:** Displays searchable cards with avatar, handle, role badge, points, and level.
  - *Acceptance Criteria:* Real-time client search filters by name or handle; clicking opens the profile modal with bio.
- **FR-008 [Gamification Engine]:** Points increment upon posting (+5), commenting (+2), and completing lessons (+10). Levels calculate as $\lfloor \sqrt{\text{points} / 20} \rfloor + 1$.
  - *Acceptance Criteria:* Level badge increments automatically as points cross thresholds.

### Admin & Operations
- **FR-009 [Curriculum Builder]:** Instructors can create, edit, and delete modules and lessons with live preview.
  - *Acceptance Criteria:* All mutations validate on server and reflect immediately in classroom navigation.
- **FR-010 [AI Knowledge Base Management]:** Admins can ingest FAQs, guidelines, and lesson notes into the community knowledge index.
  - *Acceptance Criteria:* Ingested items are immediately queryable by the AI Copilot.

### AI Copilot & Infrastructure
- **FR-011 [Community AI Assistant]:** Floating AI copilot grounded in community knowledge and discussion context via MiMo API.
  - *Acceptance Criteria:* Queries return contextually accurate answers; rate limits and timeouts handled gracefully.
- **FR-012 [Liveness & Health Probe]:** Continuous health monitoring at `/api/health`.
  - *Acceptance Criteria:* Returns HTTP 200 with `{ status: "ok", app: "AKSchool", version: "1.0.0" }`.

### Pillar 1: Monetization & Subscription Engine
- **FR-013 [Stripe Checkout & Billing Portal]:** Members can upgrade to Pro ($29/mo) or VIP ($99/mo) plans via hosted Stripe Checkout and manage subscriptions in the customer portal.
  - *Acceptance Criteria:* Clicking Upgrade generates an authentic checkout session URL; billing portal allows updating credit cards and cancelling.
- **FR-014 [Webhook Entitlement Automation]:** Webhook listener at `/api/v1/billing/webhook` handles `checkout.session.completed`, `customer.subscription.updated`, and `customer.subscription.deleted`.
  - *Acceptance Criteria:* Successful payments update `app_school_members.plan_tier`; cancellations downgrade to `free` at period end.
- **FR-015 [Invoicing & PDF Receipts]:** Automated generation and display of invoice receipts in member settings.
  - *Acceptance Criteria:* Invoice records populate in `app_school_invoices` with amount, currency, status, and PDF receipt links.

### Pillar 2: Gamification & Viral Engagement
- **FR-016 [Daily Activity Streaks]:** Daily streak counter tracking consecutive active days (login, posts, or lessons).
  - *Acceptance Criteria:* Active participation increments `current_streak_days`; missing 48 hours resets streak; displayed with fire badge (🔥).
- **FR-017 [Community Leaderboards]:** Tabular leaderboard showing Top 10 members sorted by 30-day and all-time points.
  - *Acceptance Criteria:* Points accurately reflect contributions; rank updates dynamically in `/members`.
- **FR-018 [Level-Gated Perks & Custom Badges]:** Unlockable rewards upon crossing Level 3, 5, and 10 milestones with collectible SVG badges.
  - *Acceptance Criteria:* Level 3 unlocks poll authoring; Level 5 unlocks private mastermind space; badges render in member profile modal.

### Pillar 3: Interactive Classroom & LMS Superpowers
- **FR-019 [Interactive Module Quizzes]:** Quizzes with multiple-choice questions, passing score thresholds (e.g. 80%), and immediate feedback.
  - *Acceptance Criteria:* Submissions record in `app_school_quiz_submissions`; passing score unlocks module completion.
- **FR-020 [Automated Certificates of Completion]:** Verifiable completion certificate generated upon 100% course completion.
  - *Acceptance Criteria:* Generates unique certificate ID and verification hash; opens printable/downloadable high-resolution modal.
- **FR-021 [Drip Content Scheduling]:** Instructors can schedule modules to unlock based on days since enrollment or specific calendar dates.
  - *Acceptance Criteria:* Locked drip modules display countdown timer and prevent lesson retrieval until unlock date.
- **FR-022 [Downloadable Resource Vault]:** Lesson resources (PDFs, source code, cheatsheets) attached directly below lesson videos.
  - *Acceptance Criteria:* Resources display file size, icon, and direct secure download link.

### Pillar 4: Real-Time Social & Community Features
- **FR-023 [Interactive Community Polls]:** Post authoring includes option to attach single-choice polls with live percentage bars.
  - *Acceptance Criteria:* Voting records in `app_school_poll_votes`; percentages compute accurately; duplicate votes blocked.
- **FR-024 [Events Calendar & RSVP]:** Community events (live Q&As, workshops) with date/time, Zoom/Meet links, and RSVP counters.
  - *Acceptance Criteria:* Members can toggle RSVP (Going/Interested); supports `.ics` download for Google/Apple Calendar.
- **FR-025 [Direct Messaging (DMs)]:** 1-on-1 private messaging between community members with unread count badges.
  - *Acceptance Criteria:* Messages persist in `app_school_direct_messages` with strict sender/recipient RLS.
- **FR-026 [In-App Notification Center]:** Real-time bell notification dropdown for comments, mentions, likes, and course updates.
  - *Acceptance Criteria:* Unread badge displays accurate count; clicking marks notification as read.

### Pillar 6: Creator Analytics & Funnel Insights
- **FR-027 [Course Completion Drop-off Funnel]:** Visual funnel in `/admin` showing enrollment $\rightarrow$ lesson progress $\rightarrow$ completion drop-offs.
  - *Acceptance Criteria:* Displays percentage conversion per lesson to identify student attrition points.
- **FR-028 [Revenue & Member Retention Curves]:** Telemetry tracking MRR, ARR, churn rate, and Daily/Weekly Active Members (DAM/WAM).
  - *Acceptance Criteria:* Charts render historical 30-day trends; supports one-click CSV export of members and transaction logs.

### Pillar 7: Website Integration & Embeddable Widgets
- **FR-029 [Webflow & Framer Embeddable Widgets]:** Standalone lightweight route (`/embed/community/[slug]`) designed for iframe embedding.
  - *Acceptance Criteria:* Renders without main shell navbar; communicates height auto-resizing via `window.postMessage`.
- **FR-030 [Embed Origin Security & Tokens]:** Domain allowlisting via `app_school_embed_tokens`.
  - *Acceptance Criteria:* Block unauthorized external iframe origins via Content Security Policy and origin headers.

---

## 4. Non-Functional Requirements (NFR)

- **NFR-001 [Performance]:** First Contentful Paint (FCP) $< 1.2\text{s}$, initial bundle $< 250\text{kB}$ gzip.
- **NFR-002 [Security & Multi-Tenancy]:** 100% of tables enforce Supabase RLS scoped to `app_school_*`.
- **NFR-003 [Zero Placeholders]:** Zero mock stubs, `lorem ipsum`, or unhandled promise rejections in production.
- **NFR-004 [Accessibility]:** High-contrast color palette meeting WCAG 2.1 AA with full keyboard navigability.
- **NFR-005 [Responsive Design]:** Fluid adaptability across mobile (375px), tablet (768px), and desktop (1280px+).
- **NFR-006 [Container Portability]:** Next.js standalone container image weighing $< 180\text{MB}$ compressed.
