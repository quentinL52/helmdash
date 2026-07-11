## 2025-02-14 - Fix unauthenticated cron endpoint
**Vulnerability:** The `src/app/api/cron/process-scheduled/route.ts` API route lacked actual authentication logic despite comments suggesting it was protected. Any external party could trigger scheduled tasks and user deletion processes.
**Learning:** Comments indicating security protections must be verified against actual code implementation. Missing `req: Request` signatures in Next.js API routes often indicate missing header inspection/authentication.
**Prevention:** Ensure all sensitive endpoints, particularly Cron handlers, extract headers from the `Request` object and validate standard `Authorization: Bearer <SECRET>` patterns. Always fail securely (return 500) if the necessary environment secrets are missing.
