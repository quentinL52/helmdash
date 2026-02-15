import { clerkMiddleware } from "@clerk/nextjs/server";

export default clerkMiddleware();

export const config = {
    matcher: [
        // Only run middleware on the root page and API routes
        // App pages are client-side rendered and don't need middleware on every navigation
        '/',
        '/(api|trpc)(.*)',
    ],
};
