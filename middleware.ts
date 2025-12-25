import createMiddleware from 'next-intl/middleware';
import { updateSession } from '@/lib/supabase/middleware';
import { NextRequest, NextResponse } from 'next/server';

const intlMiddleware = createMiddleware({
  // A list of all locales that are supported
  locales: ['tr', 'en', 'ru', 'ar', 'ro', 'hu'],
 
  // Used when no locale matches
  defaultLocale: 'tr'
});

export default async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const LOCALES = ['tr', 'en', 'ru', 'ar', 'ro', 'hu'];

  // 1. Force locale prefix for known routes if missing
  const firstSegment = path.split('/')[1];
  if (!LOCALES.includes(firstSegment) && (path === '/admin' || path === '/login' || path.startsWith('/admin/'))) {
    const url = new URL(`/tr${path}`, request.url);
    return NextResponse.redirect(url);
  }

  // 2. Supabase session update and check
  const { response, user, supabase } = await updateSession(request);

  // 3. Protected Route Logic
  const isProtectedRoute = path.includes('/admin');

  // Helper to get valid locale from path or default to 'tr'
  const getLocale = () => {
    return LOCALES.includes(firstSegment) ? firstSegment : 'tr';
  };

  if (isProtectedRoute && !user) {
    // Redirect to login if accessing admin without user
    const locale = getLocale();
    const loginUrl = new URL(`/${locale}/login`, request.url);
    return NextResponse.redirect(loginUrl);
  }

  if (isProtectedRoute && user) {
     const { data: roleData } = await supabase
       .from('user_roles')
       .select('role')
       .eq('user_id', user.id)
       .single();
     
     const role = roleData?.role;

     if (role !== 'admin') {
       const locale = getLocale();
       const homeUrl = new URL(`/${locale}`, request.url);
       return NextResponse.redirect(homeUrl);
    }
  }
  // --------------------------------

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