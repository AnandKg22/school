# Deployment & Operations Runbook — AKSchool

> Infrastructure Topology, Environment Variables, and Rollback Procedures for **AKSchool (CommunityOS)**

---

## 1. Hosting & Container Architecture

- **Hosting Platform:** Dokploy VPS (`https://dokploy.akstack.com`)
- **VPS Host:** `185.205.244.119`
- **Target Project:** `Agent-Supabase`
- **Environment:** `production`
- **Live URL:** `https://school.akstack.com`
- **Container Strategy:** Multi-Stage Next.js Standalone (`node:22-alpine`)

---

## 2. Environment Variables Dictionary

| Variable Name | Required | Target Runtime | Purpose |
|---|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Client & Server | Public Supabase API Gateway endpoint |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Client & Server | Supabase anonymous public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Server Only | Supabase admin key for background maintenance |
| `MIMO_API_BASE_URL` | Yes | Server Only | Regional MiMo AI endpoint (`token-plan-sgp.xiaomimimo.com`) |
| `MIMO_API_KEY` | Yes | Server Only | MiMo token plan authentication key |
| `MIMO_DEFAULT_MODEL` | Yes | Server Only | Default reasoning model (`mimo-v2.6-flash`) |
| `PORT` | Yes | Container | Container listen port (`3000`) |
| `NODE_ENV` | Yes | Container | Production flag (`production`) |

---

## 3. Deployment Procedure via Dokploy CLI

```bash
# 1. Update application build type to use Dockerfile
node scripts/dokploy-manager.js update-build-type <appId> dockerfile Dockerfile

# 2. Inject environment variables
node scripts/dokploy-manager.js set-env <appId> projects/school/.env.production

# 3. Add custom domain
node scripts/dokploy-manager.js add-domain <appId> school.akstack.com 3000

# 4. Trigger deployment
node scripts/dokploy-manager.js deploy <appId>

# 5. Read deployment build logs
node scripts/dokploy-manager.js read-logs <deploymentId>
```

---

## 4. Operational Health Checks & Rollback Runbook

1. **Liveness Probe:**
   ```bash
   curl -I https://school.akstack.com/api/health
   # Expected: HTTP/2 200 OK
   ```
2. **Rollback Procedure:**
   - In Dokploy dashboard (`https://dokploy.akstack.com`), select previous healthy deployment artifact and click **Redeploy**.
   - Database migrations are purely additive; rollbacks do not require schema downgrades.
