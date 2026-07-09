## 2024-05-18 - Missing Authentication in Cron Endpoints
**Vulnerability:** The `/api/cron/process-scheduled` endpoint in `src/app/api/cron/process-scheduled/route.ts` did not check the `Authorization` header against the `CRON_SECRET`, allowing unauthorized access.
**Learning:** Even though comments may say an endpoint is protected by a secret (or assumes Vercel handles it via a custom header or internal mechanisms), relying on an implicit environmental setup without explicit authentication checks in the route handler itself allows execution from anywhere.
**Prevention:** All automated endpoints (cron jobs, webhooks, etc.) must explicitly accept a `req: Request` parameter in Next.js App Router and perform a direct check on the relevant authorization or signature headers before proceeding.
