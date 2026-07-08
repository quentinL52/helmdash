## 2026-07-08 - Unauthenticated Cron Endpoint in process-scheduled
**Vulnerability:** The `/api/cron/process-scheduled` endpoint was missing an `Authorization` header check, allowing anyone to trigger internal scheduled tasks, purge user accounts without verifying `CRON_SECRET` in production.
**Learning:** The explicit `GET(req: Request)` signature is necessary for `NextResponse` to access headers. A comment mentioning security is not enough; runtime checks are required.
**Prevention:** Always verify `Authorization: Bearer ${process.env.CRON_SECRET}` in cron jobs and enforce `req: Request` in API route signatures.
