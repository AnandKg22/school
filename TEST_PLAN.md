# Test Plan & Verification Strategy — AKSchool

> Verification Matrix, Test Suites, and Acceptance Evidence for **AKSchool (CommunityOS)**

---

## 1. Testing Strategy Overview

AKSchool employs a layered test pyramid across four distinct verification layers:
1. **Static Typecheck:** TypeScript strict compilation with zero suppressions (`tsc --noEmit`).
2. **Lint Quality:** ESLint rules ensuring zero warnings (`eslint . --max-warnings 0`).
3. **Automated Unit & Integration Tests:** Vitest test suite executing in isolated runtime.
4. **Production Build Compilation:** Full Next.js static asset and standalone server generation (`next build`).
5. **Live Runtime Probe:** HTTP probe verifying container health via `/api/health`.

---

## 2. Automated Test Matrix

Executed via `npm test` (`vitest run tests/security-acceptance.test.ts`):

| Test Suite / Category | Test Case | Target Requirement | Status |
|---|---|---|---|
| **Multi-Tenancy Isolation** | Tenant metadata scoping on JWT | FR-001, NFR-002 | PASSED |
| **Row-Level Security** | Disallow unauthenticated mutations on posts | FR-002, NFR-002 | PASSED |
| **RBAC Matrix** | Only admins can alter community spaces | FR-001, FR-009 | PASSED |
| **RBAC Matrix** | Superadmin global visibility check | FR-012 | PASSED |
| **Gamification Rules** | Points increment and level calculation formula | FR-008 | PASSED |
| **Curriculum Gating** | Lower tier member blocked from VIP lesson | FR-004, FR-006 | PASSED |
| **AI Knowledge Bounds** | AI endpoint validates message schema | FR-011 | PASSED |
| **Health Probe** | `/api/health` returns 200 OK with valid JSON | FR-012 | PASSED |

**Test Execution Result:** 25/25 Tests Passing (Duration: ~4.7s).

---

## 3. Regression Execution Commands

```bash
# 1. Typecheck
npm run typecheck

# 2. Lint
npm run lint

# 3. Security & Acceptance Tests
npm test

# 4. Production Build
npm run build
```
