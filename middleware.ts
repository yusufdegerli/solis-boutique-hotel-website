import createMiddleware from 'next-intl/middleware';
import { updateSession } from '@/lib/supabase/middleware';
import { NextRequest, NextResponse } from 'next/server';

const intlMiddleware = createMiddleware({
  // A list of all locales that are supported
  locales: ['en', 'tr', 'ar', 'hu', 'ro'],
 
  // Used when no locale matches
  defaultLocale: 'tr'
});

export default async function middleware(request: NextRequest) {
  // 1. Supabase session update and check
  // This updates the session cookie if needed
  const { response, user } = await updateSession(request);

  // 2. Protected Route Logic
  // Check if the path includes /admin
  const path = request.nextUrl.pathname;
  const isProtectedRoute = path.includes('/admin');

  if (isProtectedRoute && !user) {
    // Redirect to login if accessing admin without user
    // We try to keep the locale if present, or default to tr
    const locale = request.nextUrl.pathname.split('/')[1] || 'tr';
    const loginUrl = new URL(`/${locale}/login`, request.url);
    return NextResponse.redirect(loginUrl);
  }

  // 3. Run next-intl middleware
  // This handles redirects, locale detection etc.
  // We pass the request that might have updated cookies from Supabase
  const intlResponse = intlMiddleware(request);

  // 4. Merge responses
  // We need to ensure any cookies set by Supabase (in step 1) are passed to the final response
  // and any headers set by next-intl are preserved.
  
  // Copy cookies from Supabase response to intlResponse
  response.cookies.getAll().forEach((cookie) => {
    intlResponse.cookies.set(cookie.name, cookie.value, cookie);
  });

  return intlResponse;
}
 
export const config = {
  // Match all pathnames except for
  // - … if they start with `/api`, `/_next` or `/_vercel`
  // - … the ones containing a dot (e.g. `favicon.ico`)
  matcher: ['/((?!api|_next|_vercel|.*\..*).*)']
};