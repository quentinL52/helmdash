# Helmdash — Security Layer

This directory contains composable security helpers for API routes.

## Helpers

### `withAuth` — Authentication
```ts
import { withAuth } from '@/lib/security/with-auth';

export const POST = withAuth(async (req, { userId }) => {
  // userId is guaranteed to be defined (401 otherwise)
});
```
- Extracts Supabase session from request cookies
- Returns 401 JSON with `{ error: "Authentication required. Please sign in." }` if no valid session
- Injects `userId` into the handler context

### `withRateLimit` — Rate Limiting
```ts
import { withRateLimit } from '@/lib/security/with-rate-limit';

export const POST = withAuth(withRateLimit(async (req, { userId }) => {
  // Rate limited to 30 req/min
}, { rpm: 30 }));
```
- Default: 60 req/min per user
- Falls back to in-memory store when Upstash Redis is not configured
- Sets `X-RateLimit-*` response headers

### `withValidation` — Request Body Validation
```ts
import { z } from 'zod';
import { withValidation } from '@/lib/security/with-validation';

const schema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
});

export const POST = withAuth(
  withValidation(schema)(async (req, { userId, body }) => {
    // body is typed as z.infer<typeof schema>
  })
);
```
- Returns 400 with field-level error details on validation failure
- Strips unknown fields by default (`stripUnknown: true`)
- Handles malformed JSON gracefully

## Composition

All three wrappers are composable in any order:

```ts
export const POST = withAuth(
  withRateLimit(
    withValidation(schema)(async (req, { userId, body }) => {
      // Authenticated + rate limited + validated
    }),
    { rpm: 30 }
  )
);
```

## Best Practices

1. **Always use `withAuth`** on any route that accesses user data or performs mutations
2. **Rate-limit AI routes** at 30 req/min — they're expensive and prone to abuse
3. **Validate all input** — never trust the client's `userId`, `apiKey`, or raw body
4. **Never log API keys** — use `maskKey()` before output
5. **Check CRON_SECRET** in cron/webhook routes to prevent unauthorized invocation