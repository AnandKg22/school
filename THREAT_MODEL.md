# STRIDE Threat Model — AKSchool

> Security Analysis, Boundary Definitions, and Mitigations for **AKSchool (CommunityOS)**

---

## 1. STRIDE Analysis Matrix

| Threat Category | Potential Attack Vector | Impact | Mitigations Implemented |
|---|---|---|---|
| **Spoofing Identity** | Attacker crafts forged JWT or impersonates another member's `author_id`. | High | Supabase JWT signature validation on every `/api/v1/*` route; user ID pulled strictly from `auth.uid()`, never trusted from client request body. |
| **Tampering with Data** | Unprivileged member modifies community settings or deletes others' posts. | High | PostgreSQL Row-Level Security (RLS) policies enforce author-only mutations on posts/comments; admin-only checks on settings and curriculum. |
| **Repudiation** | Malicious moderator deletes user accounts without audit trail. | Medium | Timestamps on all mutations; platform-level logging in `app_school_events`. |
| **Information Disclosure** | Cross-tenant data leakage where another project reads community posts. | Critical | Strict table namespacing (`app_school_*`) and RLS tenant enforcement `(auth.jwt() -> 'user_metadata' ->> 'app') = 'school'`. |
| **Denial of Service** | Flooding post creation endpoint with unbounded payloads or spamming AI chat. | Medium | Content length validation ($\le 10,000$ chars), server rate-limiting on `/api/ai/chat`, and Next.js request body constraints. |
| **Elevation of Privilege** | Member self-promotes their role to `superadmin` via client profile edit. | Critical | Role field immutable by standard users; only verified superadmin accounts can alter member RBAC roles. |

---

## 2. Secrets & Environment Isolation Checklist

- [x] No database passwords, JWT secrets, or API keys committed to Git (enforced by `.gitignore`).
- [x] Only `NEXT_PUBLIC_*` variables exposed to browser client (Supabase URL and Anon Key only).
- [x] `SUPABASE_SERVICE_ROLE_KEY` and `MIMO_API_KEY` restricted strictly to server-side Node runtime.
- [x] Dockerfile runs as unprivileged user (`nextjs`, uid 1001), preventing host container breakouts.
