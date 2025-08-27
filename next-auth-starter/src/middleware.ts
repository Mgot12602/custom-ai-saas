import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import createMiddleware from 'next-intl/middleware';
import { routing } from '@/i18n/routing';

// Create a route matcher for protected routes
const isDashboardRoute = createRouteMatcher(['/(dashboard|account)(.*)']);
const isSubscriptionApiRoute = createRouteMatcher(['/api/subscription(.*)']);

// Combine Clerk and next-intl middleware
export default clerkMiddleware(async (auth, request) => {
  // Protect dashboard routes
  if (isDashboardRoute(request)) await auth.protect();
  
  // Protect subscription API routes (they need authentication)
  if (isSubscriptionApiRoute(request)) await auth.protect();

  // Apply internationalization using routing config for non-API routes
  if (!request.nextUrl.pathname.startsWith('/api')) {
    return createMiddleware(routing)(request);
  }
});

export const config = {
  matcher: [
    // Match all pathnames except for
    // - … if they start with `/_next` or `/_vercel`  
    // - … the ones containing a dot (e.g. `favicon.ico`)
    // BUT include API routes (removed api from exclusion)
    '/((?!_next|_vercel|.*\\..*).*)'
  ],
};
