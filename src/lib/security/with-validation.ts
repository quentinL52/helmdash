/**
 * Helmdash — Request Validation Wrapper
 *
 * Composable Zod schema validation for API routes.
 * Validates the request body against a Zod schema before the handler runs.
 * Returns 400 with field-level errors on validation failure.
 *
 * Usage:
 * ```ts
 * import { z } from 'zod';
 * import { withAuth } from '@/lib/security/with-auth';
 * import { withValidation } from '@/lib/security/with-validation';
 *
 * const schema = z.object({
 *   name: z.string().min(1),
 *   email: z.string().email(),
 * });
 *
 * export const POST = withAuth(withValidation(schema)(async (req, { userId, body }) => {
 *   // body is typed as z.infer<typeof schema>
 * }));
 * ```
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

export type ValidationContext<T> = {
  userId: string;
  params: Record<string, unknown>;
  body: T;
};

/**
 * Creates a validation wrapper for a given Zod schema.
 * Returns a higher-order function that takes a handler and returns a wrapped handler.
 *
 * The inner handler receives `body` typed as `z.infer<typeof schema>`.
 */
export function withValidation<TSchema extends z.ZodTypeAny>(
  schema: TSchema,
  options?: {
    /** Strip unknown fields from body (default: true) */
    stripUnknown?: boolean;
    /** Custom error message prefix */
    errorMessage?: string;
  },
) {
  const stripUnknown = options?.stripUnknown ?? true;

  return function <TContext extends { userId: string; params?: Record<string, unknown> }>(
    handler: (
      req: NextRequest,
      context: TContext & { body: z.infer<TSchema> },
    ) => Promise<NextResponse>,
  ) {
    return async (req: NextRequest, context: TContext) => {
      try {
        const rawBody = await req.json();
        const parseResult = schema.safeParse(rawBody);

        if (!parseResult.success) {
          const fieldErrors: Record<string, string[]> = {};
          for (const issue of parseResult.error.issues) {
            const path = issue.path.join('.');
            if (!fieldErrors[path]) fieldErrors[path] = [];
            fieldErrors[path].push(issue.message);
          }

          return NextResponse.json(
            {
              error: options?.errorMessage ?? 'Validation failed',
              fields: fieldErrors,
            },
            { status: 400 },
          );
        }

        const body = stripUnknown ? parseResult.data : (rawBody as z.infer<TSchema>);
        return handler(req, { ...context, body } as TContext & { body: z.infer<TSchema> });
      } catch (err) {
        if (err instanceof SyntaxError) {
          return NextResponse.json(
            { error: 'Invalid JSON in request body' },
            { status: 400 },
          );
        }
        throw err;
      }
    };
  };
}