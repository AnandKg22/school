# API Specification — AKSchool

> REST API Endpoints, Request/Response Schemas, and Error Contracts for **AKSchool (CommunityOS)**

---

## 1. Authentication & Common Headers

- **Content-Type:** `application/json`
- **Authorization:** `Bearer <JWT_TOKEN>` (issued by Supabase Auth upon login)
- **Standard Error Format:**
  ```json
  {
    "error": "Error description message",
    "code": "UNAUTHORIZED | BAD_REQUEST | FORBIDDEN | NOT_FOUND | SERVER_ERROR",
    "timestamp": "2026-10-16T10:00:00.000Z"
  }
  ```

---

## 2. API Endpoints Catalog

### Health & Liveness
- `GET /api/health`
  - **Auth:** None (Public)
  - **Response 200:**
    ```json
    { "status": "ok", "app": "AKSchool", "version": "1.0.0", "cluster": "production", "timestamp": "..." }
    ```

### Community Discussions
- `GET /api/v1/posts?space_id=<uuid>`
  - Returns paginated list of posts with author profiles, reaction counts, and comment summaries.
- `POST /api/v1/posts`
  - **Auth:** Authenticated Member
  - **Body:** `{ "space_id": "uuid", "title": "string", "content": "string" }`
  - **Response 201:** Created post object.
- `POST /api/v1/posts/[id]/comments`
  - **Auth:** Authenticated Member
  - **Body:** `{ "content": "string" }`
  - **Response 201:** Created comment object.

### Courses & Curriculum
- `GET /api/v1/courses`
  - Returns list of courses with module counts and tier gating metadata (`free`\|`pro`\|`vip`).
- `GET /api/v1/courses/modules?course_id=<uuid>`
  - Returns modules and lessons for specified course.
- `POST /api/v1/learning/progress`
  - **Auth:** Authenticated Member
  - **Body:** `{ "lesson_id": "uuid", "is_completed": true }`
  - **Response 200:** `{ "success": true, "points_awarded": 10 }`

### Members & Profiles
- `GET /api/v1/members?search=<query>`
  - Returns filtered member cards with points, level badges, and roles.
- `GET /api/v1/me/profile`
  - Returns current member's personal enrollment, progress, and role permissions.

### Admin & Operations
- `POST /api/v1/admin/settings`
  - **Auth:** Owner / Admin
  - **Body:** Updated community brand colors, tagline, or privacy toggles.
- `POST /api/v1/admin/knowledge`
  - **Auth:** Owner / Admin
  - **Body:** Ingests document snippets for AI copilot retrieval.

### AI Copilot
- `POST /api/ai/chat`
  - **Auth:** Authenticated Member
  - **Body:** `{ "messages": [{ "role": "user", "content": "string" }] }`
  - **Response 200:** `{ "content": "Grounded AI answer string...", "sources": [...] }`

### Advanced Feature Endpoints

#### Pillar 1: Billing & Subscriptions
- `POST /api/v1/billing/checkout`
  - **Body:** `{ "plan_id": "uuid", "frequency": "monthly" | "yearly" }`
  - **Response 200:** `{ "checkout_url": "https://checkout.stripe.com/..." }`
- `POST /api/v1/billing/portal`
  - **Response 200:** `{ "portal_url": "https://billing.stripe.com/..." }`
- `POST /api/v1/billing/webhook`
  - **Headers:** `stripe-signature`
  - **Response 200:** `{ "received": true }`

#### Pillar 2: Gamification
- `GET /api/v1/gamification/leaderboard?scope=30days|alltime`
  - **Response 200:** `[{ "rank": 1, "member": {...}, "points": 1420 }]`
- `GET /api/v1/gamification/streaks`
  - **Response 200:** `{ "current_streak": 5, "longest_streak": 14, "fire_active": true }`

#### Pillar 3: Quizzes & Certificates
- `GET /api/v1/courses/quizzes?module_id=<uuid>`
  - **Response 200:** `{ "quiz": { "id": "...", "questions": [...] } }`
- `POST /api/v1/courses/quizzes/submit`
  - **Body:** `{ "quiz_id": "uuid", "answers": { "q1": 2, "q2": 0 } }`
  - **Response 200:** `{ "score": 90, "passed": true, "points_awarded": 25 }`
- `GET /api/v1/certificates/[id]`
  - **Response 200:** Verifiable certificate payload with student name, course, and verification hash.

#### Pillar 4: Social, Events & Messaging
- `POST /api/v1/posts/polls/vote`
  - **Body:** `{ "poll_id": "uuid", "option_index": 1 }`
  - **Response 200:** Updated vote tally with live percentages.
- `GET /api/v1/events`
  - **Response 200:** Upcoming workshops and Q&A events with RSVP counts.
- `POST /api/v1/events/[id]/rsvp`
  - **Body:** `{ "status": "going" | "interested" }`
  - **Response 200:** Updated RSVP status.
- `GET /api/v1/messages?with=<member_id>`
  - **Response 200:** Threaded 1-on-1 direct messages.
- `POST /api/v1/messages`
  - **Body:** `{ "recipient_id": "uuid", "content": "string" }`
  - **Response 201:** Created message record.

#### Pillar 6: Creator Analytics
- `GET /api/v1/admin/analytics/funnel?course_id=<uuid>`
  - **Response 200:** Sequential drop-off rates across all lessons.
- `GET /api/v1/admin/analytics/revenue`
  - **Response 200:** `{ "mrr": 4820, "arr": 57840, "churn_rate": 2.1, "active_subscribers": 142 }`

#### Pillar 7: Embed Distribution
- `GET /api/v1/embed/validate?origin=<domain>`
  - **Response 200:** Validates cross-origin allowlist for Webflow/Framer embed widgets.
