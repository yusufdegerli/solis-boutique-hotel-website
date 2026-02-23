import createMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';

const intlMiddleware = createMiddleware({
  locales: ['tr', 'en', 'ru', 'ar', 'hu'],
  defaultLocale: 'tr'
});

export default async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Redirect root to /tr
  if (path === '/') {
    return NextResponse.redirect(new URL('/tr', request.url));
  }

  // Redirect /admin and /login without locale prefix to /tr/...
  if (path === '/admin' || path === '/login' || path.startsWith('/admin/')) {
    const url = new URL(`/tr${path}`, request.url);
    return NextResponse.redirect(url);
  }

  // Run next-intl middleware
  return intlMiddleware(request);
}

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)']
};